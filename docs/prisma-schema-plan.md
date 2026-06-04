# Prisma Schema Plan

Dieses Dokument beschreibt den geplanten Prisma-Datenbankaufbau für das Projekt **Urlaubsverwaltungssystem**.

Ziel dieses Dokuments ist es, das aktuelle Mock-Datenmodell sauber in ein zukünftiges Datenbankschema zu übertragen, bevor Prisma, PostgreSQL und echte Persistenz eingerichtet werden.

---

## Ziel

Das Prisma-Schema soll folgende Bereiche abbilden:

```text
Benutzer und Berechtigungen
Mitarbeiter und Abteilungen
Urlaubsanträge
Urlaubssalden pro Jahr
Genehmigungen und Freigabehistorie
Globale Unternehmenseinstellungen
```

Aktuell liegen die Daten noch in:

```text
lib/mock-data.ts
```

Später sollen diese Daten über Prisma aus PostgreSQL gelesen und geschrieben werden.

---

## Grundsatzentscheidungen

### 1. User und Employee werden getrennt

`User` und `Employee` sind unterschiedliche Konzepte.

```text
User = Konto für Login, E-Mail, Rolle und Berechtigungen
Employee = Mitarbeiter mit Vertragsdaten, Abteilung und Urlaubssaldo
```

Beispiel:

```text
User:
- email
- role
- isActive
- employeeId optional

Employee:
- name
- departmentId
- position
- employmentStartDate
- contractVacationDaysPerYear
- isActive
```

Ein User kann optional mit einem Employee verbunden sein.

Das deckt auch externe administrative Benutzer ab, zum Beispiel externe HR- oder IT-Benutzer, die Zugriff auf Einstellungen oder Verwaltungsfunktionen haben, aber selbst kein Mitarbeiter der Firma sind.

Im normalen Mitarbeiter-Erstellungsprozess gilt jedoch:

```text
Wenn ein neuer Mitarbeiter angelegt wird, erstellt das System Employee und User gemeinsam.
```

Das bedeutet fachlich:

```text
Jeder reguläre Employee soll einen zugeordneten User haben.
Nicht jeder User muss ein Employee sein.
```

---

### 2. Employee.position statt Employee.role

Im Mockup gibt es aktuell teilweise:

```ts
employee.role
```

Dabei meint `role` aber den beruflichen Titel, zum Beispiel:

```text
Sales Representative
Regional Manager
Accountant
```

Im Datenbankmodell soll dieses Feld klarer heißen:

```text
position
```

Der Begriff `role` wird im Prisma-Schema nur für Systemrollen genutzt:

```text
employee
manager
hr
admin
```

Dadurch vermeiden wir Verwechslung zwischen:

```text
beruflicher Position
```

und:

```text
Berechtigung im System
```

---

### 3. Approval bleibt zunächst einfach

Für den MVP wird kein komplexes Workflow-System gebaut.

Der Genehmigungsweg wird zunächst über die Abteilung gesteuert:

```text
Department.managerId
Department.finalApproverId
```

Ablauf:

```text
Ausstehend 0/2 → Manager muss genehmigen
Ausstehend 1/2 → Final Approver muss genehmigen
Genehmigt 2/2 → Antrag ist vollständig genehmigt
```

Die tatsächlichen Entscheidungen werden in `ApprovalDecision` gespeichert.

Ein späteres Workflow-System wäre möglich, wird aber jetzt nicht umgesetzt.

---

### 4. Bearbeitung und Stornierung von Anträgen

Ein Mitarbeiter darf einen eigenen Antrag bearbeiten oder stornieren, solange noch keine Freigabe erfolgt ist.

Regel:

```text
request.employeeId === currentUser.employeeId
request.status === Ausstehend
request.approvalStepsCompleted === 0
```

Wenn der Antrag bereits bei:

```text
Ausstehend 1/2
```

steht, darf der Mitarbeiter ihn nicht mehr direkt bearbeiten.

Stornierung bedeutet:

```text
Der Antrag wird nicht gelöscht.
Der Status wird auf Storniert gesetzt.
```

Bearbeitung bedeutet im MVP:

```text
Der bestehende Antrag wird aktualisiert.
Es wird kein neuer Antrag erstellt.
```

Ein späteres Versionierungssystem für Anträge ist möglich, aber nicht Teil des ersten Datenbankmodells.

---

### 5. Urlaubssaldo wird gespeichert

`VacationBalance` wird als eigene Tabelle gespeichert.

Der Saldo wird nicht direkt am Employee gespeichert.

Grund:

```text
Ein Mitarbeiter hat pro Jahr einen eigenen Urlaubssaldo.
Resturlaub und Ablaufdatum müssen pro Jahr nachvollziehbar sein.
```

Für den MVP werden folgende Werte gespeichert:

```text
total
used
pending
available
carriedOver
expiresAt
```

Ein Teil dieser Werte könnte später berechnet werden, aber für den Einstieg ist gespeicherter Saldo einfacher und transparenter.

---

### 6. IDs

Für Prisma wird zunächst empfohlen:

```prisma
String @id @default(cuid())
```

Grund:

```text
gut für URLs
gut für Seed-Daten
keine sichtbare laufende Nummer
einfacher bei späteren Imports oder verteilten Systemen
```

Alternativ wäre möglich:

```prisma
Int @id @default(autoincrement())
```

Für dieses Projekt wird zunächst `String cuid` bevorzugt.

---

## Geplante Models

```text
User
Employee
Department
CompanySettings
VacationRequest
VacationBalance
ApprovalDecision
```

---

## Geplante Enums

```text
UserRole
AbsenceType
RequestStatus
ApprovalDecisionType
```

---

## Prisma Schema Entwurf

```prisma
model User {
  id         String   @id @default(cuid())
  employeeId String?  @unique
  email      String   @unique
  role       UserRole
  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  employee   Employee? @relation(fields: [employeeId], references: [id])
}

model Employee {
  id                          String   @id @default(cuid())
  name                        String
  departmentId                String
  position                    String
  employmentStartDate         DateTime
  contractVacationDaysPerYear Int
  isActive                    Boolean  @default(true)
  createdAt                   DateTime @default(now())
  updatedAt                   DateTime @updatedAt

  department                  Department @relation(fields: [departmentId], references: [id])
  user                        User?
  vacationRequests            VacationRequest[]
  vacationBalances            VacationBalance[]
  approvalDecisions           ApprovalDecision[]

  managedDepartments          Department[] @relation("DepartmentManager")
  finalApprovalDepartments    Department[] @relation("DepartmentFinalApprover")
}

model Department {
  id              String   @id @default(cuid())
  name            String
  managerId       String
  finalApproverId String?
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  manager         Employee  @relation("DepartmentManager", fields: [managerId], references: [id])
  finalApprover   Employee? @relation("DepartmentFinalApprover", fields: [finalApproverId], references: [id])
  employees       Employee[]
}

model CompanySettings {
  id                         String   @id @default(cuid())
  defaultVacationDaysPerYear Int
  createdAt                  DateTime @default(now())
  updatedAt                  DateTime @updatedAt
}

model VacationRequest {
  id                     String        @id @default(cuid())
  employeeId             String
  createdByUserId        String?
  absenceType            AbsenceType
  startDate              DateTime
  endDate                DateTime
  days                   Int
  status                 RequestStatus
  createdAt              DateTime      @default(now())
  updatedAt              DateTime      @updatedAt
  approvalStepsCompleted Int
  approvalStepsRequired  Int
  comment                String?

  employee               Employee      @relation(fields: [employeeId], references: [id])
  createdByUser          User?         @relation(fields: [createdByUserId], references: [id])
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
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  employee    Employee  @relation(fields: [employeeId], references: [id])

  @@unique([employeeId, year])
}

model ApprovalDecision {
  id                 String               @id @default(cuid())
  vacationRequestId  String
  approverEmployeeId String
  decidedByUserId    String?
  stepOrder          Int
  decision           ApprovalDecisionType
  decidedAt          DateTime
  comment            String?

  vacationRequest    VacationRequest      @relation(fields: [vacationRequestId], references: [id])
  approver           Employee             @relation(fields: [approverEmployeeId], references: [id])
  decidedByUser      User?                @relation(fields: [decidedByUserId], references: [id])
}

enum UserRole {
  employee
  manager
  hr
  admin
}

enum AbsenceType {
  Urlaub
  Sonderurlaub
}

enum RequestStatus {
  Genehmigt
  Ausstehend
  Abgelehnt
  Storniert
}

enum ApprovalDecisionType {
  approved
  rejected
}
```

---

## Beschreibung der Models

## User

`User` repräsentiert ein Konto im System.

Ein User kann ein Employee sein, muss es aber nicht.

### Wichtige Felder

```text
employeeId
email
role
isActive
```

### Regeln

`email` ist eindeutig.

`role` steuert die Berechtigung im System.

`employeeId` ist optional, damit externe administrative Benutzer möglich sind.

Wenn `employeeId` leer ist, hat der User keine persönliche Urlaubsansicht.

---

## Employee

`Employee` repräsentiert einen Mitarbeiter.

### Wichtige Felder

```text
name
departmentId
position
employmentStartDate
contractVacationDaysPerYear
isActive
```

### Regeln

Der Employee gehört zu genau einer Department.

Der Employee kann einen zugeordneten User haben.

Im normalen Erstellungsprozess soll Employee gemeinsam mit User erstellt werden.

---

## Department

`Department` repräsentiert eine Abteilung.

### Wichtige Felder

```text
name
managerId
finalApproverId
isActive
```

### Regeln

`managerId` definiert den ersten Genehmiger.

`finalApproverId` definiert die zweite/finale Genehmigung.

Ein Manager kann mehrere Departments verwalten.

Ein Final Approver kann ebenfalls mehreren Departments zugeordnet sein.

---

## CompanySettings

`CompanySettings` repräsentiert globale Unternehmenseinstellungen.

### Wichtige Felder

```text
defaultVacationDaysPerYear
```

### Regeln

Der Wert dient als Standard beim Erstellen neuer Mitarbeiter.

Der individuelle Vertragswert eines Mitarbeiters wird weiterhin in `Employee.contractVacationDaysPerYear` gespeichert.

Für den MVP wird nur ein Datensatz erwartet.

---

## VacationRequest

`VacationRequest` repräsentiert einen Urlaubs- oder Abwesenheitsantrag.

### Wichtige Felder

```text
employeeId
createdByUserId
absenceType
startDate
endDate
days
status
approvalStepsCompleted
approvalStepsRequired
comment
```

### Regeln

`employeeId` definiert, für welchen Mitarbeiter der Antrag gilt.

`createdByUserId` definiert, welcher User den Antrag erstellt hat.

Das ist wichtig, wenn HR/Admin einen Antrag für einen anderen Mitarbeiter erstellt.

`Urlaub` reduziert den regulären Urlaubssaldo.

`Sonderurlaub` reduziert den regulären Urlaubssaldo nicht automatisch.

---

## VacationBalance

`VacationBalance` repräsentiert den Urlaubssaldo eines Mitarbeiters pro Jahr.

### Wichtige Felder

```text
employeeId
year
total
used
pending
available
carriedOver
expiresAt
```

### Regeln

Ein Mitarbeiter darf pro Jahr nur einen Urlaubssaldo haben.

Das wird durch diese Prisma-Regel abgebildet:

```prisma
@@unique([employeeId, year])
```

`carriedOver` steht für Resturlaub aus Vorjahren.

`expiresAt` steht für das Ablaufdatum des Resturlaubs.

---

## ApprovalDecision

`ApprovalDecision` repräsentiert eine konkrete Entscheidung innerhalb des Genehmigungsprozesses.

### Wichtige Felder

```text
vacationRequestId
approverEmployeeId
decidedByUserId
stepOrder
decision
decidedAt
comment
```

### Regeln

`approverEmployeeId` beschreibt fachlich, wer genehmigt hat.

`decidedByUserId` beschreibt technisch, welches Benutzerkonto die Aktion ausgeführt hat.

In den meisten Fällen zeigen beide auf dieselbe Person.

Bei administrativen Sonderfällen kann das aber unterschiedlich sein.

Beispiel:

```text
Michael ist fachlicher Genehmiger.
Admin führt nachträglich die Entscheidung im System ein.
```

---

## Sichtbarkeit und Berechtigungen

### Employee

```text
Sieht eigene Daten.
Kann eigene Anträge erstellen.
Kann eigene Anträge bearbeiten/stornieren, solange noch keine Freigabe erfolgt ist.
```

### Manager

```text
Sieht eigene Daten.
Sieht Mitarbeiter und Anträge der Departments, in denen er managerId ist.
Genehmigt Anträge, bei denen er der nächste Genehmiger ist.
```

### HR

```text
Sieht alle Mitarbeiter.
Sieht alle Anträge.
Kann Mitarbeiter erstellen.
Kann Einstellungen öffnen.
Kann Anträge für andere Mitarbeiter erstellen.
```

### Admin

```text
Sieht alle Daten.
Kann Einstellungen öffnen.
Kann Mitarbeiter erstellen.
Kann administrative Funktionen nutzen.
```

### Externer HR/Admin ohne Employee

```text
Hat User, aber keinen Employee.
Hat keine persönliche Urlaubsansicht.
Hat kein eigenes Mitarbeiterprofil.
Kann administrative Bereiche nutzen, wenn die Rolle es erlaubt.
```

---

## Offene Entscheidungen

### 1. CompanySettings als einzelne Zeile oder Company-Tabelle

Für den MVP reicht eine einzelne `CompanySettings`-Zeile.

Wenn das System später mehrere Kunden/Firmen unterstützt, wird wahrscheinlich zusätzlich benötigt:

```text
Company
CompanySettings
```

Dann würden viele Tabellen eine `companyId` bekommen.

---

### 2. Approval Workflow

Für den MVP bleibt der Workflow einfach:

```text
Department.managerId
Department.finalApproverId
```

Später könnte ein flexibles Modell entstehen:

```text
ApprovalWorkflow
ApprovalStep
ApprovalDecision
```

Das ist aktuell nicht Teil der ersten Prisma-Umsetzung.

---

### 3. VacationBalance berechnen oder speichern

Für den MVP wird `VacationBalance` gespeichert.

Später könnte geprüft werden, ob Werte wie `used`, `pending` und `available` teilweise aus `VacationRequest` berechnet werden sollten.

---

### 4. Feiertage

Aktuell werden nur Wochenenden ausgeschlossen.

Später muss entschieden werden:

```text
Bundesland
Feiertagskalender
Firmenstandort
Mitarbeiterstandort
```

---

### 5. Halbe Urlaubstage

Aktuell werden halbe Urlaubstage nicht unterstützt.

Später könnte entschieden werden, ob `days` statt `Int` als Dezimalwert gespeichert werden soll.

Beispiel:

```prisma
days Decimal
```

Für den MVP bleibt:

```prisma
days Int
```

---

### 6. Historie bei Bearbeitung von Anträgen

Aktuell gilt:

```text
Ausstehend 0/2 → Antrag wird direkt bearbeitet
```

Es wird kein neuer Antrag erstellt.

Später könnte eine Versionierung eingeführt werden:

```text
VacationRequestVersion
```

Das ist aktuell nicht Teil des ersten Datenbankmodells.

---

## Reihenfolge der nächsten technischen Schritte

Nach diesem Plan wäre die empfohlene Reihenfolge:

```text
1. Docker/PostgreSQL vorbereiten
2. Prisma installieren
3. schema.prisma erstellen
4. Migration erzeugen
5. Prisma Client einrichten
6. Seed-Datei mit aktuellen Mock-Daten erstellen
7. Erste Seiten von mock-data auf Prisma-Queries umstellen
```

---

## Mapping vom Mock zu Prisma

Aktuelle Mock-Daten:

```text
companySettings → CompanySettings
users → User
employees → Employee
departments → Department
vacationRequests → VacationRequest
vacationBalances → VacationBalance
approvalDecisions → ApprovalDecision
```

Beim späteren Seed sollen die aktuellen The-Office-Mockdaten als Startdaten übernommen werden.