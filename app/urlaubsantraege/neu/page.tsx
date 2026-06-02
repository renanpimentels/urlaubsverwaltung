import { PageHeader } from "@/components/PageHeader";
import { VacationRequestForm } from "@/components/VacationRequestForm";

export default function NewVacationRequestPage() {
  return (
    <>
      <PageHeader
        eyebrow="Neuer Antrag"
        title="Urlaubsantrag erstellen"
        description="Erfasse einen neuen Urlaubsantrag. In dieser Mockup-Version werden die Daten noch nicht gespeichert."
      />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <VacationRequestForm />

        <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Urlaubssaldo</h2>
          <p className="mt-1 text-sm text-slate-500">
            Mockup-Übersicht für den aktuell ausgewählten Mitarbeiter.
          </p>

          <div className="mt-6 grid gap-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">
                Urlaubstage gesamt
              </p>
              <p className="mt-1 text-2xl font-bold">30</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-500">
                  Bereits genommen
                </p>
                <p className="mt-1 text-2xl font-bold">8</p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-500">
                  Ausstehend
                </p>
                <p className="mt-1 text-2xl font-bold text-amber-600">10</p>
              </div>
            </div>

            <div className="rounded-2xl bg-teal-50 p-4">
              <p className="text-sm font-semibold text-teal-700">
                Aktuell verfügbar
              </p>
              <p className="mt-1 text-3xl font-bold text-teal-800">12</p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-800">
                Hinweis zur Berechnung
              </p>
              <p className="mt-1">
                Diese Werte sind aktuell Mock-Daten. Später werden sie
                automatisch aus den genehmigten und ausstehenden Anträgen
                berechnet.
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
      </section>
    </>
  );
}