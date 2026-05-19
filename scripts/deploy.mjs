// deploy.mjs - 현재 디렉터리를 SSH 서버에 업로드하고 설치/시작한다.
//
// 사용법:
//   node scripts/deploy.mjs            실제 배포
//   node scripts/deploy.mjs --dry-run  실행할 명령만 출력 (전송/실행 안 함)
//
// 동작:
//   1. .env.ci 에서 배포 설정을 로드한다.
//   2. .gitignore 기준으로 파일 목록을 뽑아 tar 로 묶고 scp 로 전송한다.
//   3. 서버에서 압축 해제 후 설치 + 빌드 + 시작 명령을 실행한다.
//
// .env.ci 에 정의해야 하는 값:
//   DEPLOY_HOST          (필수) 대상 서버 호스트/IP
//   DEPLOY_USER          (필수) SSH 사용자
//   DEPLOY_PATH          (필수) 서버상의 배포 디렉터리 (없으면 생성됨)
//   DEPLOY_PORT          (선택) SSH 포트, 기본 22
//
// 설치/빌드 명령과 서버 node 경로는 아래 상수
// (INSTALL_CMD / BUILD_CMD / REMOTE_NODE_BIN) 로 고정되어 있다.
// 시작 단계는 pm2 로 wors-admin / wors 두 앱을 띄운다.

import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { globby } from 'globby';

const DRY_RUN = process.argv.includes('--dry-run');

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(SCRIPT_DIR, '..');
const ENV_FILE = join(PROJECT_ROOT, '.env.ci');
const ARCHIVE = join(tmpdir(), 'wors-deploy.tar.gz');

// 서버에서 실행할 설치/빌드 명령.
const INSTALL_CMD = 'pnpm install --frozen-lockfile';
const BUILD_CMD = 'pnpm build';

// 서버의 node 설치 경로(nvm). ssh 비대화형 셸은 .bashrc 를 읽지 않아
// node/pnpm/pm2 가 PATH 에 없으므로 이 디렉터리를 PATH 앞에 직접 추가한다.
const REMOTE_NODE_BIN = '/home/i-heart/.nvm/versions/node/v24.13.0/bin';

// .gitignore 에 무시되지만 서버 런타임에 필요해 강제로 업로드할 파일 (glob).
// '**/.env' 는 루트뿐 아니라 apps/web/.env, apps/admin/.env 까지 모두 잡는다.
const FORCE_INCLUDE = ['**/.env'];

// --- 로그 헬퍼 ------------------------------------------------------------
function step(msg) {
  console.log(`\n==> ${msg}`);
}

// 명령 1개 실행. dry-run 이면 출력만 한다.
// display 를 주면 로그에 args 대신 그 문자열을 보여준다(인자가 많을 때 사용).
function run(cmd, args, display) {
  console.log(`   $ ${cmd} ${display ?? args.join(' ')}`);
  if (DRY_RUN) return;
  execFileSync(cmd, args, { stdio: 'inherit', cwd: PROJECT_ROOT });
}

// --- .env.ci 로드 ---------------------------------------------------------
function loadEnvCi() {
  if (!existsSync(ENV_FILE)) {
    throw new Error(`${ENV_FILE} 가 없습니다.`);
  }
  const cfg = {};
  for (const raw of readFileSync(ENV_FILE, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    const val = line.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
    cfg[key] = val;
  }
  return cfg;
}

function required(cfg, name) {
  if (!cfg[name]) throw new Error(`.env.ci 에 ${name} 가 필요합니다.`);
  return cfg[name];
}

// .gitignore 기준으로 업로드할 파일 목록을 뽑는다.
// gitignore 옵션이 node_modules / .env* / settings.json / *.sqlite3* / .next 등을
// 자동으로 제외하므로 별도 목록을 손으로 관리할 필요가 없다.
async function listFiles() {
  const files = await globby(['**/*'], {
    cwd: PROJECT_ROOT,
    gitignore: true,
    dot: true,
    onlyFiles: true,
    ignore: ['**/.git/**'],
  });
  // .gitignore 에 무시됐더라도 FORCE_INCLUDE 패턴에 맞으면 업로드 목록에 추가한다.
  const forced = await globby(FORCE_INCLUDE, {
    cwd: PROJECT_ROOT,
    dot: true,
    onlyFiles: true,
    ignore: ['**/node_modules/**'],
  });
  for (const f of forced) {
    if (!files.includes(f)) files.push(f);
  }
  return files;
}

// --- 메인 -----------------------------------------------------------------
async function main() {
  if (DRY_RUN) console.log('[dry-run] 명령만 출력하고 실제로는 실행하지 않습니다.');

  step('.env.ci 로드');
  const cfg = loadEnvCi();
  const host = required(cfg, 'DEPLOY_HOST');
  const user = required(cfg, 'DEPLOY_USER');
  const path = required(cfg, 'DEPLOY_PATH');
  const port = cfg.DEPLOY_PORT || '22';
  const remote = `${user}@${host}`;

  // 1. 파일 목록 + 아카이브 생성
  step('파일 목록 수집 (.gitignore 기준)');
  const files = await listFiles();
  console.log(`   ${files.length}개 파일`);
  // dry-run 에서는 실제로 업로드될 파일을 모두 보여준다.
  if (DRY_RUN) {
    console.log(`     ${files.join(', ')}`);
  }
  step('아카이브 생성');
  // 파일 목록을 -T(목록 파일) 대신 인자로 직접 넘긴다. Windows tar 는 -T 파일을
  // 시스템 코드페이지로 읽어 한글 경로에서 변환 오류가 나지만, 인자는 UTF-16 으로
  // 전달돼 안전하다.
  run(
    'tar',
    ['-czf', ARCHIVE, '-C', PROJECT_ROOT, ...files],
    `-czf ${ARCHIVE} -C ${PROJECT_ROOT} (${files.length}개 파일)`,
  );

  try {
    // 2. 원격 디렉터리 준비
    step(`원격 디렉터리 준비: ${remote}:${path}`);
    run('ssh', ['-p', port, remote, `mkdir -p '${path}'`]);

    // 3. 아카이브 전송
    step('아카이브 전송 (scp)');
    run('scp', ['-P', port, ARCHIVE, `${remote}:${path}/wors-deploy.tar.gz`]);

    // 4. 서버에서 압축 해제 + 설치 + 빌드 + 시작
    step('원격 설치/빌드/시작');
    const remoteScript = [
      'set -e',
      `export PATH="${REMOTE_NODE_BIN}:$PATH"`,
      // CI=true 로 pnpm install 등이 대화형 프롬프트 없이 진행되게 한다.
      'export CI=true',
      `cd '${path}'`,
      'tar -xzf wors-deploy.tar.gz',
      'rm -f wors-deploy.tar.gz',
      `echo '[remote] install'`,
      INSTALL_CMD,
      `echo '[remote] build'`,
      BUILD_CMD,
      // pm2 로 두 앱을 띄운다. 재배포 시 같은 이름이 떠 있을 수 있어 먼저 정리한다.
      `echo '[remote] start (pm2)'`,
      'pm2 delete wors-admin wors || true',
      'pm2 start pnpm --name wors-admin -- start:admin',
      'pm2 start pnpm --name wors -- start',
      'pm2 save',
    ].join('\n');
    run('ssh', ['-p', port, remote, remoteScript]);

    step(`배포 완료: ${remote}:${path}`);
  } finally {
    // 임시 아카이브 정리. rmSync 는 force 옵션이라 파일이 없어도 에러가 안 난다.
    rmSync(ARCHIVE, { force: true });
  }
}

main().catch((err) => {
  console.error(`\n오류: ${err.message}`);
  process.exit(1);
});
