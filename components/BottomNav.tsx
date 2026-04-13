"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/underwriting", label: "Applications", icon: "description" },
  { href: "/clients", label: "Clients", icon: "group" },
  { href: "/settings", label: "Settings", icon: "settings" },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 h-16 bg-white/90 backdrop-blur-md z-50 border-t border-slate-100 shadow-[0_-4px_20px_rgba(15,23,42,0.05)]">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center pt-2 transition-all active:scale-90 duration-200 ease-out ${
              isActive
                ? "text-teal-600 border-t-2 border-teal-600"
                : "text-slate-400"
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">
              {item.icon}
            </span>
            <span className="font-sans text-[11px] font-medium tracking-wide uppercase mt-0.5">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
