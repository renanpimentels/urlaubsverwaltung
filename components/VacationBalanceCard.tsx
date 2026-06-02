type VacationBalanceCardProps = {
  total: number;
  used: number;
  pending: number;
  available: number;
  requestedDays?: number;
  title?: string;
  description?: string;
};

export function VacationBalanceCard({
  total,
  used,
  pending,
  available,
  requestedDays,
  title = "Urlaubssaldo",
  description = "Übersicht über den aktuellen Urlaubssaldo.",
}: VacationBalanceCardProps) {
  const availableAfterApproval =
    requestedDays !== undefined ? available - requestedDays : undefined;

  return (
    <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{description}</p>

      <div className="mt-6 grid gap-4">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-500">
            Urlaubstage gesamt
          </p>
          <p className="mt-1 text-2xl font-bold">{total}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-500">
              Bereits genommen
            </p>
            <p className="mt-1 text-2xl font-bold">{used}</p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-500">Ausstehend</p>
            <p className="mt-1 text-2xl font-bold text-amber-600">{pending}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-teal-50 p-4">
          <p className="text-sm font-semibold text-teal-700">
            Aktuell verfügbar
          </p>
          <p className="mt-1 text-3xl font-bold text-teal-800">{available}</p>
        </div>

        {requestedDays !== undefined ? (
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-500">
              Beantragte Tage
            </p>
            <p className="mt-1 text-2xl font-bold">{requestedDays}</p>

            <div className="mt-4 rounded-xl bg-slate-50 p-3">
              <p className="text-sm font-semibold text-slate-500">
                Verfügbar nach Genehmigung
              </p>
              <p
                className={
                  availableAfterApproval !== undefined &&
                  availableAfterApproval < 0
                    ? "mt-1 text-2xl font-bold text-red-700"
                    : "mt-1 text-2xl font-bold text-teal-800"
                }
              >
                {availableAfterApproval}
              </p>
            </div>
          </div>
        ) : null}

        <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-800">
            Hinweis zur Berechnung
          </p>
          <p className="mt-1">
            Diese Werte sind aktuell Mock-Daten. Später werden sie automatisch
            aus genehmigten und ausstehenden Anträgen berechnet.
          </p>
        </div>

        <div className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-semibold">Sonderurlaub</p>
          <p className="mt-1">
            Sonderurlaub wird im MVP separat behandelt und reduziert den
            regulären Urlaubssaldo nicht automatisch.
          </p>
        </div>
      </div>
    </aside>
  );
}