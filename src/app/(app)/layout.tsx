import type { ReactNode } from "react";
import { BottomNav } from "@/components/ui/bottom-nav";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto min-h-dvh max-w-[480px] bg-cream pb-28">
      {children}
      <BottomNav />
    </div>
  );
}
