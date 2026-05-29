import {Sidebar} from "@/components/Sidebar";


const vacationRequests = [
  {
    title: "Sommerurlaub",
    period: "03.06.2026 - 07.06.2026",
    days: 5,
    status: "Genehmigt",
  },
  {
    title: "Familienurlaub",
    period: "15.07.2026 - 26.07.2026",
    days: 10,
    status: "Ausstehend",
  },
  {
    title: "Kurzurlaub",
    period: "12.08.2026 - 14.08.2026",
    days: 3,
    status: "Abgelehnt",
  },
];

const upcomingAbsences = [
  {
    name: "Anna Becker",
    department: "Entwicklung",
    period: "10.06.2026 - 14.06.2026",
  },
  {
    name: "Jonas Weber",
    department: "Support",
    period: "18.06.2026 - 21.06.2026",
  },
  {
    name: "Lisa Schneider",
    department: "Vertrieb",
    period: "01.07.2026 - 05.07.2026",
  },
];

function getStatusClass(status: string) {
  if (status === "Genehmigt") {
    return "bg-green-100 text-green-700";
  }

  if (status === "Ausstehend") {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-red-100 text-red-700";
}

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_1fr]">
        <Sidebar />

        <section className="px-6 py-8 sm:px-10">
          <header className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <p className="mb-2 text-sm font-bold uppercase tracking-wide text-teal-700">
                Willkommen zurück
              </p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Hallo, Max Müller
              </h2>
              <p className="mt-2 text-slate-600">
                Hier ist deine aktuelle Urlaubsübersicht.
              </p>
            </div>

            <button className="rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white shadow-sm hover:bg-teal-800">
              Neuen Antrag erstellen
            </button>
          </header>

          <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Urlaubstage gesamt</p>
              <strong className="mt-3 block text-4xl">30</strong>
              <span className="text-sm text-slate-500">Tage pro Jahr</span>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Genommen</p>
              <strong className="mt-3 block text-4xl">12</strong>
              <span className="text-sm text-slate-500">bereits genehmigt</span>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Verfügbar</p>
              <strong className="mt-3 block text-4xl">18</strong>
              <span className="text-sm text-slate-500">noch offen</span>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Ausstehend</p>
              <strong className="mt-3 block text-4xl text-amber-600">2</strong>
              <span className="text-sm text-slate-500">Anträge in Prüfung</span>
            </article>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold">Aktuelle Urlaubsanträge</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Deine letzten Anträge und deren Status.
                  </p>
                </div>

                <a className="text-sm font-semibold text-teal-700" href="#">
                  Alle anzeigen
                </a>
              </div>

              <div className="grid gap-3">
                {vacationRequests.map((request) => (
                  <div
                    key={request.title}
                    className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center"
                  >
                    <div>
                      <h4 className="font-semibold">{request.title}</h4>
                      <p className="mt-1 text-sm text-slate-500">
                        {request.period} · {request.days} Tage
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ${getStatusClass(
                        request.status
                      )}`}
                    >
                      {request.status}
                    </span>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h3 className="text-xl font-bold">Nächste Abwesenheiten</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Wer demnächst nicht im Büro ist.
                </p>
              </div>

              <div className="grid gap-3">
                {upcomingAbsences.map((absence) => (
                  <div
                    key={absence.name}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <h4 className="font-semibold">{absence.name}</h4>
                    <p className="mt-1 text-sm text-slate-500">
                      {absence.department} · {absence.period}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          </section>
        </section>
      </div>
    </main>
  );
}