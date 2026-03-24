export function normalizeDeg(deg: number) {
  return ((deg % 360) + 360) % 360;
}

export function getDisplayAngle(angle?: number, reverse = false) {
  if (angle === undefined) return undefined;
  return normalizeDeg(angle + (reverse ? 180 : 0));
}

export function createAngleIndicator(
  angle?: number,
  suffix = '풍',
  reverse = false
) {
  const displayAngle = getDisplayAngle(angle, reverse);
  if (displayAngle === undefined) return '';

  const dirs = [
    "북", "북동", "동", "남동", "남", "남서", "서", "북서",];

  const idx = Math.floor((displayAngle + 22.5) / 45) % 8;
  return dirs[idx] + suffix;
}
