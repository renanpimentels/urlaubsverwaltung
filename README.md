# Urlaubsverwaltung

Eine interne Webanwendung zur Verwaltung von Urlaubsanträgen, Mitarbeitern und Genehmigungen.

Dieses Projekt ist aktuell ein Frontend-Mockup und dient zum Lernen und Üben von professioneller Softwareentwicklung mit Next.js, TypeScript, Git und GitHub.

## Ziel des Projekts

Das Ziel ist, eine einfache Urlaubsverwaltung für eine kleine IT-Firma zu entwickeln.

Die Anwendung soll später ermöglichen:

- Mitarbeiter zu verwalten
- Urlaubsanträge zu erstellen
- Urlaubsanträge anzuzeigen
- offene Anträge zu genehmigen oder abzulehnen
- Urlaubssalden zu verwalten
- Abwesenheiten übersichtlich darzustellen

Aktuell gibt es noch kein Backend, keine Datenbank und kein Login. Die Daten sind vorerst als Mock-Daten im Projekt hinterlegt.

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- Git
- GitHub

## Aktueller Status

Aktuell umgesetzt:

- Dashboard-Seite
- Seite für Urlaubsanträge
- Seite für Mitarbeiter
- Seite für Genehmigungen
- Seite für neuen Urlaubsantrag als Mockup
- globale Sidebar-Navigation
- aktiver Navigationspunkt in der Sidebar
- wiederverwendbare Komponenten
- Mock-Daten und TypeScript-Typen

## Seiten

| Route | Beschreibung |
|---|---|
| `/` | Dashboard mit Übersicht über Urlaubstage, Anträge und Abwesenheiten |
| `/urlaubsantraege` | Liste der aktuellen Urlaubsanträge |
| `/urlaubsantraege/neu` | Mockup-Formular zum Erstellen eines neuen Urlaubsantrags |
| `/mitarbeiter` | Übersicht der Mitarbeiter und Urlaubssalden |
| `/genehmigungen` | Manager-Ansicht für offene Genehmigungen |

## Projektstruktur

```text
urlaubsverwaltung/
  app/
    page.tsx
    layout.tsx
    globals.css
    urlaubsantraege/
      page.tsx
      neu/
        page.tsx
    mitarbeiter/
      page.tsx
    genehmigungen/
      page.tsx

  components/
    Sidebar.tsx
    PageHeader.tsx
    StatCard.tsx
    StatusBadge.tsx
    VacationRequestCard.tsx
    EmployeeCard.tsx

  lib/
    types.ts
    mock-data.ts