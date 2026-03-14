"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { Bell, ChartArea, ClipboardList, Factory, LogOut, Menu, Settings, UserCog, Wrench, X, type LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { logoutAction } from "@/app/actions/auth";
import type { UserRole } from "@/types/domain";

const rank: Record<UserRole, number> = {
  operator: 1,
  technician: 2,
  manager: 3,
  admin: 4
};

const nav: Array<{ href: Route; label: string; icon: LucideIcon; minRole: UserRole }> = [
  { href: "/dashboard", label: "Dashboard", icon: ChartArea, minRole: "operator" },
  { href: "/equipment", label: "Equipment", icon: Factory, minRole: "operator" },
  { href: "/alerts", label: "Alerts", icon: Bell, minRole: "operator" },
  { href: "/maintenance", label: "Maintenance", icon: Wrench, minRole: "technician" },
  { href: "/analytics", label: "Analytics", icon: ClipboardList, minRole: "manager" },
  { href: "/admin/users", label: "Manage Users", icon: UserCog, minRole: "admin" },
  { href: "/admin/facility", label: "Manage Facility", icon: Settings, minRole: "admin" }
];

export function AppShell({ children, role }: { children: ReactNode; role: UserRole }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const visibleNav = nav.filter((item) => rank[role] >= rank[item.minRole]);

  function isActive(href: Route) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <div className="grid min-h-screen w-full grid-cols-1 md:grid-cols-[260px_1fr]">
      <button
        type="button"
        onClick={() => setMenuOpen(true)}
        className="fixed left-4 top-4 z-40 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-slate-100 shadow-lg md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {menuOpen ? <div className="fixed inset-0 z-30 bg-slate-950/40 md:hidden" onClick={closeMenu} aria-hidden="true" /> : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 -translate-x-full flex-col bg-slate-900 px-4 py-5 text-slate-100 transition-transform md:sticky md:top-0 md:h-screen md:w-auto md:translate-x-0 ${menuOpen ? "translate-x-0" : ""}`}
      >
        <button
          type="button"
          onClick={closeMenu}
          className="mb-3 inline-flex h-8 w-8 items-center justify-center self-end rounded bg-slate-800 text-slate-200 md:hidden"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-6">
          <h1 className="text-lg font-semibold">IIoT Maintenance</h1>
          <p className="mt-2 inline-flex rounded-full bg-slate-800 px-2 py-1 text-xs uppercase tracking-wide text-slate-300">{role}</p>
        </div>

        <nav className="space-y-2">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className={`flex items-center gap-2 rounded px-3 py-2 ${isActive(item.href) ? "bg-slate-800 text-white" : "text-slate-100 hover:bg-slate-800"}`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <form action={logoutAction} className="mt-auto pt-4">
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded bg-slate-100 px-3 py-2 text-sm font-medium text-slate-900 hover:bg-white"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </form>
      </aside>

      <section className="min-w-0 space-y-5 bg-slate-50 px-4 py-16 md:px-6 md:py-6">{children}</section>
    </div>
  );
}
