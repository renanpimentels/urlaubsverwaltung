import { PageHeader } from "@/components/PageHeader";

export default function NewVacationRequestPage() {
  return (
    <>
      <PageHeader
        eyebrow="Neuer Antrag"
        title="Urlaubsantrag erstellen"
        description="Erfasse einen neuen Urlaubsantrag. In dieser Mockup-Version werden die Daten noch nicht gespeichert."
      />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <form className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold">Antragsdaten</h2>
            <p className="mt-1 text-sm text-slate-500">
              Wähle Zeitraum, Abwesenheitsart und füge optional eine Bemerkung
              hinzu.
            </p>
          </div>

          <div className="grid gap-5">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">
                Mitarbeiter
              </span>
              <select className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-teal-600">
                <option>Max Müller</option>
                <option>Anna Becker</option>
                <option>Jonas Weber</option>
                <option>Lisa Schneider</option>
              </select>
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  Startdatum
                </span>
                <input
                  type="date"
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-teal-600"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  Enddatum
                </span>
                <input
                  type="date"
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-teal-600"
                />
              </label>
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">
                Abwesenheitsart
              </span>
              <select className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-teal-600">
                <option>Urlaub</option>
                <option>Sonderurlaub</option>
                <option>Gleitzeit</option>
                <option>Homeoffice</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">
                Bemerkung
              </span>
              <textarea
                rows={5}
                placeholder="Optionale Bemerkung zum Antrag..."
                className="resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-teal-600"
              />
            </label>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <button
                type="button"
                className="rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white shadow-sm hover:bg-teal-800"
              >
                Antrag erstellen
              </button>

              <a
                href="/urlaubsantraege"
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center font-semibold text-slate-700 hover:bg-slate-50"
              >
                Abbrechen
              </a>
            </div>
          </div>
        </form>

        <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Hinweise</h2>

          <div className="mt-5 grid gap-4 text-sm text-slate-600">
            <p>
              Diese Seite ist aktuell ein Mockup. Die eingegebenen Daten werden
              noch nicht gespeichert.
            </p>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-800">Geplante Regeln</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Enddatum darf nicht vor dem Startdatum liegen.</li>
                <li>Der Mitarbeiter muss genug verfügbare Urlaubstage haben.</li>
                <li>Wochenenden und Feiertage können später berücksichtigt werden.</li>
                <li>Ein Antrag startet immer im Status Ausstehend.</li>
              </ul>
            </div>

            <div className="rounded-2xl bg-amber-50 p-4 text-amber-800">
              <p className="font-semibold">Nächster technischer Schritt</p>
              <p className="mt-1">
                Später wird dieses Formular mit Validierung und echten Daten
                verbunden.
              </p>
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}