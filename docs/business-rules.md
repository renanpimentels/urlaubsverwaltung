# Business Rules - Urlaubsverwaltung

Dieses Dokument beschreibt die fachlichen Regeln der Urlaubsverwaltung.

Das Projekt wird zunächst als eigenständige Anwendung geplant. Eine spätere Integration mit bestehenden Firmensystemen, Datenbanken, Microsoft 365, Outlook, Teams oder anderen Tools ist möglich, aber nicht Teil der ersten Umsetzung.

---

## Ziel des Systems

Die Urlaubsverwaltung soll nicht nur Papierprozesse digitalisieren, sondern zusätzliche fachliche Vorteile bieten:

- automatische Berechnung von Urlaubsansprüchen
- transparente Urlaubssalden
- dokumentierte Genehmigungsprozesse
- Benachrichtigungen per E-Mail
- Nachvollziehbarkeit von manuellen Anpassungen
- Unterstützung bei Resturlaub und Ablaufdaten
- weniger manuelle Fehler bei Berechnung und Verwaltung

---

## Rollen

Das System unterscheidet perspektivisch folgende Rollen:

| Rolle | Beschreibung |
|---|---|
| employee | Normaler Mitarbeiter |
| hr | HR/RH-Benutzer |
| admin | Administrator |
| manager | Optional für spätere Erweiterung |

Für das MVP werden zunächst vor allem diese Rollen berücksichtigt:

- employee
- hr
- admin

Die Rolle `manager` kann später ergänzt werden, falls Genehmigungen über direkte Vorgesetzte laufen sollen.

---

## Berechtigungen

### Employee

Ein normaler Mitarbeiter darf:

- eigene Urlaubsanträge erstellen
- eigene Urlaubsanträge ansehen
- eigenen Urlaubssaldo ansehen
- Status eigener Anträge verfolgen

Ein normaler Mitarbeiter darf nicht:

- Anträge für andere Mitarbeiter erstellen
- andere Mitarbeiter verwalten
- alle Mitarbeiter sehen
- Anträge anderer Mitarbeiter genehmigen oder ablehnen
- Urlaubssalden anderer Mitarbeiter ändern

---

### HR

Ein HR-Benutzer darf:

- Mitarbeiter verwalten
- Mitarbeiter anlegen
- Urlaubstage und Vertragsdaten pflegen
- Urlaubsanträge für Mitarbeiter erstellen
- Urlaubsanträge genehmigen oder ablehnen
- Urlaubssalden korrigieren
- Resturlaub prüfen
- manuelle Anpassungen dokumentieren

---

### Admin

Ein Admin darf:

- alle Funktionen von HR ausführen
- Systemeinstellungen verwalten
- Rollen und Berechtigungen verwalten
- Stammdaten pflegen
- technische oder fachliche Korrekturen durchführen

---

### Manager

Die Manager-Rolle ist für eine spätere Erweiterung vorgesehen.

Ein Manager könnte später:

- Anträge der eigenen Mitarbeiter sehen
- Anträge der eigenen Mitarbeiter genehmigen oder ablehnen
- Team-Abwesenheiten sehen

Diese Rolle wird im MVP noch nicht vollständig umgesetzt.

---

## Urlaubsantrag erstellen

### Grundregel

Ein Urlaubsantrag beschreibt eine beantragte Abwesenheit eines Mitarbeiters.

Im MVP gibt es zunächst folgende Abwesenheitsarten:

| Abwesenheitsart | Verbraucht Urlaubstage? | Genehmigung nötig? |
|---|---:|---:|
| Urlaub | ja | ja |
| Sonderurlaub | nein / abhängig von Regel | ja |

Nicht im MVP enthalten:

- Homeoffice
- Gleitzeit

Begründung:

Homeoffice ist ein normaler Arbeitstag und gehört fachlich nicht in eine Urlaubsverwaltung.  
Gleitzeit gehört eher in ein Arbeitszeit- oder Zeiterfassungssystem.

---

## Antragsteller

Wenn ein normaler Mitarbeiter angemeldet ist:

- der Mitarbeiter darf nur einen Antrag für sich selbst erstellen
- das Feld `Mitarbeiter` wird automatisch mit dem eingeloggten Mitarbeiter befüllt
- der Mitarbeiter kann keinen anderen Mitarbeiter auswählen

Wenn HR oder Admin angemeldet ist:

- HR/Admin darf einen Antrag für andere Mitarbeiter erstellen
- das Feld `Mitarbeiter` zeigt eine Auswahl verfügbarer Mitarbeiter

---

## Pflichtfelder für einen Urlaubsantrag

Ein Urlaubsantrag benötigt mindestens:

- Mitarbeiter
- Abwesenheitsart
- Startdatum
- Enddatum

Optional:

- Bemerkung des Mitarbeiters

---

## Validierung eines Urlaubsantrags

Beim Erstellen eines Antrags gelten folgende Regeln:

- Startdatum ist Pflicht
- Enddatum ist Pflicht
- Enddatum darf nicht vor dem Startdatum liegen
- Mitarbeiter ist Pflicht
- Abwesenheitsart ist Pflicht
- ein neuer Antrag startet im Status `pending`
- ein neuer Antrag erhält automatisch ein Erstellungsdatum

---

## Status eines Urlaubsantrags

Ein Antrag kann folgende Status haben:

| Status | Anzeige | Beschreibung |
|---|---|---|
| pending | Ausstehend | Antrag wartet auf Entscheidung |
| approved | Genehmigt | Antrag wurde genehmigt |
| rejected | Abgelehnt | Antrag wurde abgelehnt |
| cancelled | Storniert | Antrag wurde storniert |

---

## Titel eines Urlaubsantrags

Der Benutzer soll keinen freien Titel wie `Familienurlaub` eingeben.

Der sichtbare Titel eines Antrags ergibt sich aus der Abwesenheitsart.

Beispiele:

- Urlaub
- Sonderurlaub

Zusätzliche Informationen gehören in das Feld `Bemerkung`.

---

## Genehmigungen

### Wer darf genehmigen?

Im MVP dürfen folgende Rollen Anträge genehmigen oder ablehnen:

- HR
- Admin

Die Manager-Rolle kann später ergänzt werden.

---

### Genehmigungsregeln

- Nur Anträge mit Status `pending` können genehmigt oder abgelehnt werden.
- Genehmigte Anträge sollen nicht erneut genehmigt werden.
- Abgelehnte Anträge sollen nicht erneut abgelehnt werden.
- Eine Entscheidung sollte dokumentiert werden.
- Bei Ablehnung sollte perspektivisch ein Kommentar/Motiv angegeben werden können.

---

## Urlaubstage und Vertragsdaten

Wenn ein Mitarbeiter erstellt wird, muss HR/Admin die vertraglichen Urlaubstage pro Jahr erfassen.

Beispiel:

```text
30 Urlaubstage pro Jahr

