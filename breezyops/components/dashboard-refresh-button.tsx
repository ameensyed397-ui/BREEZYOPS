"use client";

import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardRefreshButton() {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => router.refresh()}
      aria-label="Refresh dashboard"
      className="h-9 w-9"
    >
      <RefreshCw className="h-4 w-4" />
    </Button>
  );
}
