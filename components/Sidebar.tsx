"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "Urlaubsanträge", href: "/urlaubsantraege" },
  { label: "Mitarbeiter", href: "/mitarbeiter" },
  { label: "Genehmigungen", href: "/genehmigungen" },
  { label: "Einstellungen", href: "/einstellungen" },
  { label: "Kalender", href: "#" },
];

function isActiveLink(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname.startsWith(href);
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 z-30 border-b border-slate-200 bg-white lg:h-screen lg:border-b-0 lg:border-r">
      <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:h-full lg:px-5 lg:py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
            U
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-sm font-bold text-slate-950">
              Urlaubsverwaltung
            </h1>
            <p className="truncate text-xs text-slate-500">Internes Portal</p>
          </div>
        </div>

        <nav className="-mx-1 flex gap-1 overflow-x-auto pb-1 lg:mx-0 lg:grid lg:gap-1 lg:overflow-visible lg:pb-0">
          {navItems.map((item) => {
            const isDisabled = item.href === "#";
            const isActive = !isDisabled && isActiveLink(pathname, item.href);

            const className = [
              "shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition",
              "lg:w-full",
              isActive
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
              isDisabled
                ? "cursor-not-allowed opacity-40 hover:bg-transparent hover:text-slate-600"
                : "",
            ].join(" ");

            if (isDisabled) {
              return (
                <span key={item.label} className={className}>
                  {item.label}
                </span>
              );
            }

            return (
              <Link key={item.label} href={item.href} className={className}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto hidden border-t border-slate-200 pt-4 text-xs leading-5 text-slate-500 lg:block">
          Urlaub, Freigaben und Abteilungen verwalten.
        </div>
      </div>
    </aside>
  );
}