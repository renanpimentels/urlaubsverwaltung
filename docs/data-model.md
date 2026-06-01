# Datenmodell - Urlaubsverwaltung

Dieses Dokument beschreibt das geplante Datenmodell für die Urlaubsverwaltung.

Das Projekt wird zunächst als eigenständige Anwendung mit eigener Datenbank geplant. Eine spätere Integration mit bestehenden Firmensystemen oder Datenbanken ist möglich, aber nicht Teil der ersten Umsetzung.

## Ziel des Datenmodells

Das Datenmodell soll folgende Kernfunktionen unterstützen:

- Mitarbeiter verwalten
- Abteilungen verwalten
- Urlaubsanträge erstellen
- Urlaubsanträge anzeigen
- Urlaubsanträge genehmigen oder ablehnen
- Urlaubssalden verwalten
- Rollen und Berechtigungen vorbereiten
- spätere Erweiterungen wie Kalender, Berichte oder Benachrichtigungen ermöglichen

---

## Hauptentitäten

Die erste Version des Systems benötigt folgende Entitäten:

- User
- Employee
- Department
- VacationRequest
- AbsenceType
- Approval

---

## User

Ein `User` repräsentiert einen Benutzer, der sich im System anmelden kann.

Ein User ist nicht automatisch dasselbe wie ein Employee. Ein Employee beschreibt die Person im Unternehmen. Ein User beschreibt den Login und die Berechtigungen.

### Felder

| Feld | Typ | Beschreibung |
|---|---|---|
| id | string | Eindeutige ID |
| email | string | Login-E-Mail |
| passwordHash | string | Gehashtes Passwort |
| role | enum | Rolle im System |
| employeeId | string | Verbindung zum Mitarbeiter |
| createdAt | datetime | Erstellungsdatum |
| updatedAt | datetime | Letzte Änderung |

### Rollen

| Rolle | Beschreibung |
|---|---|
| employee | Normaler Mitarbeiter |
| manager | Kann Anträge prüfen und entscheiden |
| admin | Kann Stammdaten und Einstellungen verwalten |

---

## Employee

Ein `Employee` repräsentiert einen Mitarbeiter im Unternehmen.

### Felder

| Feld | Typ | Beschreibung |
|---|---|---|
| id | string | Eindeutige ID |
| firstName | string | Vorname |
| lastName | string | Nachname |
| email | string | Geschäftliche E-Mail |
| roleTitle | string | Stellenbezeichnung |
| departmentId | string | Zugehörige Abteilung |
| vacationDaysTotal | number | Urlaubstage pro Jahr |
| isActive | boolean | Gibt an, ob der Mitarbeiter aktiv ist |
| createdAt | datetime | Erstellungsdatum |
| updatedAt | datetime | Letzte Änderung |

### Beziehungen

```text
Department 1 --- n Employee
Employee 1 --- n VacationRequest
Employee 1 --- 0..1 User

