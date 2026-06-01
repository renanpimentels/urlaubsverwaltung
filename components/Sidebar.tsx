"use client";

import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "Urlaubsanträge", href: "/urlaubsantraege" },
  { label: "Mitarbeiter", href: "/mitarbeiter" },
  { label: "Genehmigungen", href: "/genehmigungen" },
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
    <aside className="bg-slate-950 px-6 py-8 text-white">
      <div className="mb-10 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-600 text-lg font-bold">
          U
        </div>

        <div>
          <h1 className="text-lg font-semibold">Urlaubsverwaltung</h1>
          <p className="text-sm text-slate-300">Internes Portal</p>
        </div>
      </div>

      <nav className="grid gap-2">
        {navItems.map((item) => {
          const isActive = item.href !== "#" && isActiveLink(pathname, item.href);

          return (
            <a
              key={item.label}
              className={
                isActive
                  ? "rounded-xl bg-white/10 px-4 py-3 text-white"
                  : "rounded-xl px-4 py-3 text-slate-300 hover:bg-white/10 hover:text-white"
              }
              href={item.href}
            >
              {item.label}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}