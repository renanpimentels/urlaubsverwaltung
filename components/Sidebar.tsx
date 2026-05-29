const navItems = [
  { label: "Dashboard", href: "/", active: true },
  { label: "Urlaubsanträge", href: "/urlaubsantraege", active: false },
  { label: "Mitarbeiter", href: "#", active: false },
  { label: "Genehmigungen", href: "#", active: false },
  { label: "Kalender", href: "#", active: false },
];

export function Sidebar() {
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
        {navItems.map((item) => (
          <a
            key={item.label}
            className={
              item.active
                ? "rounded-xl bg-white/10 px-4 py-3 text-white"
                : "rounded-xl px-4 py-3 text-slate-300 hover:bg-white/10 hover:text-white"
            }
            href={item.href}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}