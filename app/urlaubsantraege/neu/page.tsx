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
                <li>
                  Wochenenden und Feiertage können später berücksichtigt werden.
                </li>
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