"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReloadButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      className="flex items-center gap-2 disabled:opacity-50 cursor-pointer"
      variant="secondary"
      disabled={isPending}
      onClick={() => {
        startTransition(() => {
          router.refresh();
        });
      }}
    >
      <RotateCcw
        className="stroke-slate-700 w-4 h-4"
      />
    </Button>
  );
}
