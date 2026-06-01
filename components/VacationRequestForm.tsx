export function VacationRequestForm() {
  return (
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
  );
}