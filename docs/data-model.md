# Datenmodell

Dieses Dokument beschreibt das aktuelle Datenmodell des Projekts **Urlaubsverwaltungssystem**.

Ziel ist es, eine klare Übersicht über die wichtigsten Entitäten zu behalten, bevor das Projekt später auf eine echte Datenbank mit Prisma und PostgreSQL umgestellt wird.

Aktuell liegen die Daten noch in `lib/mock-data.ts`, sind aber bereits so strukturiert, dass sie dem späteren Datenbankmodell möglichst nahekommen.

---

## Überblick

Das System basiert aktuell auf diesen Hauptentitäten:

```text
CompanySettings
Department
Employee
VacationRequest
VacationBalance
ApprovalDecision
```

Wichtige Beziehungen:

```text
Department 1 ---- n Employee
Employee 1 ---- n VacationRequest
Employee 1 ---- n VacationBalance
VacationRequest 1 ---- n ApprovalDecision
Department definiert managerId und finalApproverId
```

---

## CompanySettings

Repräsentiert globale Einstellungen der Firma.

Aktuell wird diese Entität genutzt, um den Standardwert für jährliche Urlaubstage zu definieren.

### Felder

```ts
type CompanySettings = {
  defaultVacationDaysPerYear: number;
};
```

### Beispiel

```ts
export const companySettings = {
  defaultVacationDaysPerYear: 30,
};
```

### Geschäftsregel

`defaultVacationDaysPerYear` wird als Standardwert verwendet, wenn ein neuer Mitarbeiter angelegt wird.

Dieser Wert ersetzt nicht den individuellen Vertragswert eines Mitarbeiters. Jeder Mitarbeiter behält weiterhin sein eigenes Feld:

```ts
contractVacationDaysPerYear
```

Beispiel:

```text
Firma definiert Standard: 30 Tage
Neuer Mitarbeiter erhält zunächst: 30 Tage
HR/Admin kann den Wert individuell auf 28, 26 usw. ändern
```

---

## Department

Repräsentiert eine Abteilung der Firma.

Jede Abteilung definiert, wer der erste Genehmiger und wer der finale Genehmiger für Urlaubsanträge ist.

### Felder

```ts
type Department = {
  id: string;
  name: string;
  managerId: string;
  finalApproverId?: string;
};
```

### Beispiel

```ts
{
  id: "dep-001",
  name: "Verkauf",
  managerId: "emp-001",
  finalApproverId: "emp-003",
}
```

### Geschäftsregeln

`managerId` steht für den ersten Genehmiger der Abteilung.

`finalApproverId` steht für die zweite und finale Freigabe.

Ablauf:

```text
Mitarbeiter erstellt Antrag
↓
managerId genehmigt
↓
finalApproverId genehmigt
↓
Antrag ist Genehmigt
```

Solange nicht alle Schritte genehmigt wurden, bleibt der Hauptstatus:

```text
Ausstehend
```

Der Fortschritt wird separat dargestellt:

```text
Ausstehend 0/2
Ausstehend 1/2
Genehmigt 2/2
```

---

## Employee

Repräsentiert einen Mitarbeiter.

Der Mitarbeiter enthält Stammdaten, Vertragsdaten und die organisatorische Zuordnung.

Der Urlaubssaldo wird nicht direkt im Employee gespeichert. Der Saldo gehört zu `VacationBalance`.

### Felder

```ts
type Employee = {
  id: string;
  name: string;
  departmentId: string;
  role: string;
  employmentStartDate: string;
  contractVacationDaysPerYear: number;
  isActive: boolean;
};
```

### Beispiel

```ts
{
  id: "emp-006",
  name: "Jim Halpert",
  departmentId: "dep-001",
  role: "Sales Representative",
  employmentStartDate: "2001-05-01",
  contractVacationDaysPerYear: 30,
  isActive: true,
}
```

### Geschäftsregeln

`departmentId` definiert die Abteilung des Mitarbeiters.

`employmentStartDate` wird später für die anteilige Berechnung des Urlaubsanspruchs im Eintrittsjahr genutzt.

`contractVacationDaysPerYear` ist der jährliche Urlaubsanspruch laut individuellem Arbeitsvertrag.

`isActive` definiert, ob der Mitarbeiter aktuell aktiv im System geführt wird.

---

## VacationRequest

Repräsentiert eine Abwesenheits- oder Urlaubsanfrage.

Aktuell gibt es zwei Abwesenheitsarten:

```text
Urlaub
Sonderurlaub
```

### Felder

```ts
type VacationRequest = {
  id: string;
  employeeId: string;
  absenceType: AbsenceType;
  startDate: string;
  endDate: string;
  days: number;
  status: RequestStatus;
  createdAt: string;
  approvalStepsCompleted: number;
  approvalStepsRequired: number;
  comment?: string;
};
```

### Verwandte Typen

```ts
type AbsenceType = "Urlaub" | "Sonderurlaub";

type RequestStatus = "Genehmigt" | "Ausstehend" | "Abgelehnt";
```

### Beispiel

```ts
{
  id: "req-003",
  employeeId: "emp-002",
  absenceType: "Urlaub",
  startDate: "2026-07-06",
  endDate: "2026-07-10",
  days: 5,
  status: "Ausstehend",
  createdAt: "2026-06-01",
  approvalStepsCompleted: 1,
  approvalStepsRequired: 2,
  comment: "Sommerurlaub",
}
```

### Geschäftsregeln

`employeeId` definiert, für welchen Mitarbeiter der Antrag erstellt wurde.

`startDate` und `endDate` werden als ISO-Datum gespeichert:

```text
YYYY-MM-DD
```

`days` steht für die berechneten Arbeitstage im Zeitraum.

Wochenenden zählen nicht als Urlaubstage.

Feiertage werden im Mockup noch nicht berücksichtigt.

`Urlaub` reduziert den regulären Urlaubssaldo.

`Sonderurlaub` wird als Abwesenheit gezählt, reduziert aber nicht automatisch den regulären Urlaubssaldo.

---

## VacationBalance

Repräsentiert den jährlichen Urlaubssaldo eines Mitarbeiters.

Der Saldo ist vom Employee getrennt, damit mehrere Jahre, Resturlaub und spätere Historien sauber abgebildet werden können.

### Felder

```ts
type VacationBalance = {
  id: string;
  employeeId: string;
  year: number;
  total: number;
  used: number;
  pending: number;
  available: number;
  carriedOver: number;
  expiresAt?: string;
};
```

### Beispiel

```ts
{
  id: "balance-2026-emp-006",
  employeeId: "emp-006",
  year: 2026,
  total: 30,
  used: 5,
  pending: 0,
  available: 25,
  carriedOver: 0,
}
```

### Beispiel mit Resturlaub

```ts
{
  id: "balance-2025-emp-006",
  employeeId: "emp-006",
  year: 2025,
  total: 30,
  used: 27,
  pending: 0,
  available: 0,
  carriedOver: 3,
  expiresAt: "2026-03-31",
}
```

### Geschäftsregeln

`total` steht für den gesamten Urlaubsanspruch in diesem Jahr.

`used` steht für bereits genehmigte und verbrauchte Urlaubstage.

`pending` steht für Urlaubstage in noch offenen Anträgen.

`available` steht für aktuell verfügbare Urlaubstage.

`carriedOver` steht für übertragene Urlaubstage aus Vorjahren.

`expiresAt` steht für das Ablaufdatum des Resturlaubs.

---

## ApprovalDecision

Repräsentiert eine dokumentierte Entscheidung innerhalb eines Genehmigungsschrittes.

Diese Entität ist wichtig für Historie, Nachvollziehbarkeit und Transparenz.

### Felder

```ts
type ApprovalDecisionType = "approved" | "rejected";

type ApprovalDecision = {
  id: string;
  vacationRequestId: string;
  approverEmployeeId: string;
  stepOrder: number;
  decision: ApprovalDecisionType;
  decidedAt: string;
  comment?: string;
};
```

### Beispiel

```ts
{
  id: "approval-001",
  vacationRequestId: "req-001",
  approverEmployeeId: "emp-001",
  stepOrder: 1,
  decision: "approved",
  decidedAt: "2026-05-21",
  comment: "Freigegeben durch Abteilungsleitung.",
}
```

### Geschäftsregeln

Ein `VacationRequest` kann mehrere Entscheidungen haben.

Jede Entscheidung gehört zu einem Genehmigungsschritt.

Beispiel:

```text
Schritt 1: Manager genehmigt
Schritt 2: Final Approver genehmigt
```

Wenn ein Schritt abgelehnt wird, wird der Hauptstatus des Antrags:

```text
Abgelehnt
```

Wenn alle Schritte genehmigt wurden, wird der Hauptstatus:

```text
Genehmigt
```

---

## UserRole

Repräsentiert die Rolle des aktuellen Benutzers.

Aktuell wird der Benutzer in folgendem File simuliert:

```text
lib/current-user.ts
```

### Typ

```ts
type UserRole = "employee" | "manager" | "hr" | "admin";
```

### Sichtbarkeitsregeln

| Rolle | Berechtigung |
|---|---|
| `employee` | sieht nur eigene Daten |
| `manager` | sieht eigene Daten und Daten der Abteilungen, die er verwaltet |
| `hr` | sieht funktionale Daten aller Mitarbeiter |
| `admin` | sieht alle Daten und Einstellungen |

---

## Sichtbarkeitsregeln

### Dashboard

| Rolle | Sichtbarkeit |
|---|---|
| employee | eigene Daten |
| manager | eigene Daten und Daten der verwalteten Abteilungen |
| hr | alle Daten |
| admin | alle Daten |

### Urlaubsanträge

| Rolle | Sichtbarkeit |
|---|---|
| employee | eigene Anträge |
| manager | eigene Anträge und Anträge der verwalteten Abteilungen |
| hr | alle Anträge |
| admin | alle Anträge |

### Mitarbeiter

| Rolle | Sichtbarkeit |
|---|---|
| employee | eigenes Profil |
| manager | eigenes Profil und Mitarbeiter der verwalteten Abteilungen |
| hr | alle Mitarbeiter |
| admin | alle Mitarbeiter |

### Genehmigungen

| Rolle | Sichtbarkeit |
|---|---|
| employee | keine Anträge zur Genehmigung |
| manager | Anträge, bei denen er der nächste Genehmiger ist |
| hr | alle ausstehenden Anträge |
| admin | alle ausstehenden Anträge |

### Einstellungen

| Rolle | Zugriff |
|---|---|
| employee | nein |
| manager | nein |
| hr | ja |
| admin | ja |

### Mitarbeiter erstellen

| Rolle | Zugriff |
|---|---|
| employee | nein |
| manager | nein |
| hr | ja |
| admin | ja |

---

## Zukünftiges Prisma-Modell

Dies ist ein erster konzeptioneller Entwurf für das spätere Prisma-Schema.

```prisma
model CompanySettings {
  id                         String   @id @default(cuid())
  defaultVacationDaysPerYear Int
  createdAt                  DateTime @default(now())
  updatedAt                  DateTime @updatedAt
}

model Department {
  id              String    @id @default(cuid())
  name            String
  managerId       String
  finalApproverId String?
  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  manager         Employee  @relation("DepartmentManager", fields: [managerId], references: [id])
  finalApprover   Employee? @relation("DepartmentFinalApprover", fields: [finalApproverId], references: [id])
  employees       Employee[]
}

model Employee {
  id                          String             @id @default(cuid())
  name                        String
  departmentId                String
  role                        String
  employmentStartDate         DateTime
  contractVacationDaysPerYear Int
  isActive                    Boolean            @default(true)
  createdAt                   DateTime           @default(now())
  updatedAt                   DateTime           @updatedAt

  department                  Department         @relation(fields: [departmentId], references: [id])
  vacationRequests            VacationRequest[]
  vacationBalances            VacationBalance[]
  approvalDecisions           ApprovalDecision[]
}

model VacationRequest {
  id                     String             @id @default(cuid())
  employeeId             String
  absenceType            AbsenceType
  startDate              DateTime
  endDate                DateTime
  days                   Int
  status                 RequestStatus
  createdAt              DateTime           @default(now())
  approvalStepsCompleted Int
  approvalStepsRequired  Int
  comment                String?

  employee               Employee           @relation(fields: [employeeId], references: [id])
  approvalDecisions      ApprovalDecision[]
}

model VacationBalance {
  id          String    @id @default(cuid())
  employeeId  String
  year        Int
  total       Int
  used        Int
  pending     Int
  available   Int
  carriedOver Int
  expiresAt   DateTime?

  employee    Employee  @relation(fields: [employeeId], references: [id])

  @@unique([employeeId, year])
}

model ApprovalDecision {
  id                 String               @id @default(cuid())
  vacationRequestId  String
  approverEmployeeId String
  stepOrder          Int
  decision           ApprovalDecisionType
  decidedAt          DateTime
  comment            String?

  vacationRequest    VacationRequest      @relation(fields: [vacationRequestId], references: [id])
  approver           Employee             @relation(fields: [approverEmployeeId], references: [id])
}

enum AbsenceType {
  Urlaub
  Sonderurlaub
}

enum RequestStatus {
  Genehmigt
  Ausstehend
  Abgelehnt
}

enum ApprovalDecisionType {
  approved
  rejected
}
```

---

## Offene Punkte

Diese Punkte müssen vor der echten Datenbankumsetzung noch entschieden werden:

```text
1. Ob IDs als String mit cuid/uuid oder als Int autoincrement gespeichert werden
2. Ob HR/Admin Rollen direkt am Employee hängen oder über eine separate User-Tabelle abgebildet werden
3. Ob Login über eigenes System, Microsoft Entra ID, Google oder eine andere Lösung laufen soll
4. Wie Feiertage je Bundesland berechnet werden
5. Ob halbe Urlaubstage unterstützt werden sollen
6. Wie Resturlaub und Ablaufdatum final behandelt werden
7. Wie E-Mail-Benachrichtigungen umgesetzt werden
8. Ob Genehmigungen immer zwei Schritte haben oder als konfigurierbarer Workflow modelliert werden
9. Ob Sonderurlaub später eigene Kategorien bekommt
10. Ob es eine Historie für manuelle Anpassungen am Urlaubssaldo geben soll
```