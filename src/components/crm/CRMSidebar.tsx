"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Kanban,
  Users,
  CalendarDays,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getWorkshopName, getWorkshopLogo } from "@/lib/store";

export type CRMTab = "dashboard" | "pipeline" | "clientes" | "calendario" | "config";

const menuItems: { id: CRMTab; label: string; icon: typeof LayoutDashboard; path: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/crm" },
  { id: "pipeline", label: "Pipeline", icon: Kanban, path: "/crm/pipeline" },
  { id: "clientes", label: "Clientes", icon: Users, path: "/crm/clientes" },
  { id: "calendario", label: "Calendario", icon: CalendarDays, path: "/crm/calendario" },
  { id: "config", label: "Configuración", icon: Settings, path: "/crm/config" },
];

interface CRMSidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function CRMSidebar({
  mobileOpen,
  onCloseMobile,
}: CRMSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout } = useAuth();

  const [workshopName, setWorkshopName] = useState(() => {
    if (typeof window === "undefined") return "Muebles y Diseño";
    return getWorkshopName();
  });
  const [workshopLogo, setWorkshopLogo] = useState(() => {
    if (typeof window === "undefined") return "";
    return getWorkshopLogo();
  });

  // Poll for storage changes from config tab
  useEffect(() => {
    const id = setInterval(() => {
      const name = getWorkshopName();
      const logo = getWorkshopLogo();
      setWorkshopName((prev) => (prev !== name ? name : prev));
      setWorkshopLogo((prev) => (prev !== logo ? logo : prev));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const getActiveTab = (): CRMTab => {
    if (pathname === "/crm") return "dashboard";
    const tab = pathname.replace("/crm/", "") as CRMTab;
    if (menuItems.some((m) => m.id === tab)) return tab;
    return "dashboard";
  };

  const activeTab = getActiveTab();

  const handleTabClick = (path: string) => {
    router.push(path);
    onCloseMobile();
  };

  const handleLogout = () => {
    logout();
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-64 flex-col glass-strong transition-transform duration-300 md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo + Name */}
        <div className="flex items-center gap-2.5 px-5 py-5">
          {workshopLogo ? (
            <img
              src={workshopLogo}
              alt="Logo"
              className="h-9 w-9 rounded-lg object-cover border border-white/10"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-violet text-lg">
              🪑
            </div>
          )}
          <span className="text-lg font-bold text-gradient-violet truncate">
            {workshopName}
          </span>
        </div>

        {/* User info */}
        <div className="mx-3 mb-2 flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet/20 text-xs font-bold text-violet-light">
            {currentUser?.name?.charAt(0) || "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-white">
              {currentUser?.name || "Usuario"}
            </p>
            <p className="truncate text-[10px] text-zinc-500">
              {currentUser?.role === "admin" ? "Administrador" : "Usuario"}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-2 flex-1 space-y-1 px-3">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.path)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-violet/15 text-violet-light"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-white/5 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-zinc-500 transition-colors hover:bg-white/5 hover:text-red-400"
          >
            <LogOut size={16} />
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
}
