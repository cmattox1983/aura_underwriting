import Link from "next/link";

interface AppHeaderProps {
  showNotification?: boolean;
  activeNav?: "dashboard" | "applications" | "clients" | "settings";
}

// ✅ Add explicit type so TS knows "disabled" can exist
type NavLink = {
  key: "dashboard" | "applications" | "clients" | "settings";
  label: string;
  href: string;
  disabled?: boolean;
};

const NAV_LINKS: NavLink[] = [
  { key: "dashboard", label: "Dashboard", href: "/dashboard" },
  { key: "applications", label: "Applications", href: "/" },
  { key: "clients", label: "Clients", href: "/clients", disabled: true },
  { key: "settings", label: "Settings", href: "/settings", disabled: true },
];

export default function AppHeader({
  showNotification = false,
  activeNav,
}: AppHeaderProps) {
  return (
    <header className="bg-slate-50/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
      <div className="flex justify-between items-center px-8 py-4 max-w-screen-2xl mx-auto w-full">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-3">
          <span className="material-symbols-outlined text-teal-600 text-[22px]">
            shield_with_heart
          </span>
          <span className="font-headline text-2xl font-bold text-slate-900 tracking-tighter">
            Aura Underwriting
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-8 items-center">
          {NAV_LINKS.map((link) => {
            const isActive = activeNav === link.key;
            const isDisabled = link.disabled === true;

            return (
              <Link
                key={link.key}
                href={isDisabled ? "#" : link.href}
                onClick={(e) => {
                  if (isDisabled) e.preventDefault();
                }}
                className={`font-medium transition-colors ${
                  isDisabled
                    ? "cursor-not-allowed text-slate-400"
                    : isActive
                      ? "text-secondary font-semibold"
                      : "text-slate-500 hover:text-teal-700"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          {showNotification && (
            <button className="p-2 text-slate-500 hover:text-secondary transition-colors">
              <span className="material-symbols-outlined text-[22px]">
                notifications
              </span>
            </button>
          )}
          <div className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden ring-2 ring-white shadow-sm">
            {/* Placeholder avatar */}
            <div className="w-full h-full bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary-container text-[20px]">
                person
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
