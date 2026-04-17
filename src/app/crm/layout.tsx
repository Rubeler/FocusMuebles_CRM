"use client";

import { useState, useCallback, useEffect } from "react";
import StoreUserProvider from "@/lib/store-user";
import CRMSidebar from "@/components/crm/CRMSidebar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

function CRMLayoutInner({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <CRMSidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main content */}
      <main className="flex-1 md:ml-64">
        {/* Mobile header */}
        <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/5 px-4 py-3 glass-strong md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileSidebarOpen(true)}
            className="text-white hover:bg-white/10"
          >
            <Menu size={20} />
          </Button>
          <span className="text-lg font-bold text-gradient-violet">
            FocusMuebles
          </span>
        </div>

        {/* Tab content */}
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  return (
    <StoreUserProvider>
      <CRMLayoutInner>{children}</CRMLayoutInner>
    </StoreUserProvider>
  );
}
