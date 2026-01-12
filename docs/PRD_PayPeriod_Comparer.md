
# PRD — Pay Period Compare & Payroll Audit Module (v1.0)

**Owner:** Product Manager (Aziz)  
**Date:** 2025‑11‑10 (America/Chicago)  
**Status:** Draft for build  
**Target Users:** Payroll Clerks, HR/Payroll Analysts, CFO/Business Office, Auditors

> Sample file scan (uploaded): primary sheet **Sheet1** with key columns detected — `tblPRPayPeriodsID` (pay period id), `EmployeeID` (employee identifier), `Amount` (paycheck detail amount), `PositionDescription`, `DAC`. (We did not detect a TRC column in the sample.)

---

## 1) Problem & Goals

**Problem.** District payroll teams need a fast way to compare two pay periods for every employee, catch anomalies, and document explanations, without wrestling with messy ERP exports that change headers and formats.

**Primary Goals**
1. Upload any ERP “paycheck detail” dump and map column captions once; reuse mappings on future uploads.
2. Compare any two pay periods side‑by‑side per employee with a running **cumulative** column.
3. Require **Notes** when deltas exist; persist notes for audit history and pre‑populate on revisit.
4. Self‑serve **Summaries** (group by any column, multiple measure columns) and **Dashboards** (pie/scorecards).
5. Flexible **Filters** (employee, position type, pay period, DAC, etc.) with a dynamic filter builder.
6. Export (CSV) and printable views for reporting.
7. Role‑aware access and immutable audit logs.

**Non‑Goals (v1)**
- Direct write-back to ERP.  
- Complex SSO/HRIS integrations (beyond file upload & simple webhooks).  
- Time entry editing or payroll calculation engine.  

---

## 2) Personas & Use Cases
- **Payroll Clerk (Primary):** Uploads files, maps headers, runs comparisons, enters notes, exports lists for supervisors.
- **HR/Payroll Analyst:** Creates summary views by DAC/Position, checks overtime/gross splits, builds dashboards.
- **CFO/Business Office:** Reviews KPIs, spot-checks exceptions, requests documentation, prints audit packet.
- **Auditor (Read-only):** Reviews change log, notes, exports evidence.

---

## 3) Key Concepts & Data Model (Logical)

**Entities**
- **Organization**(id, name, fiscalYearStart, payrollFrequency: 24/26/52, createdAt)
- **Dataset**(id, orgId, uploadAt, uploaderId, fileMeta, rowCount, status)
- **HeaderMap**(id, orgId, systemHeader, caption, firstSeenAt, lastSeenAt)
- **ColumnRole**(id, datasetId, role: `payPeriod`|`employeeName`|`employeeId`|`amount`|`positionType`|`dac`|custom, mappedHeader)
- **Record**(datasetId, rowId, jsonPayload)  ← raw row storage
- **ComparisonSession**(id, orgId, datasetId, ppLeft, ppRight, amountRole, createdBy, createdAt)
- **ComparisonRow**(sessionId, employeeKey, leftAmount, rightAmount, cumulativeToRight, status, deltaAbs, deltaPct)
- **Note**(sessionId, employeeKey, required:boolean, text, authorId, timestamp, lastEditedAt)
- **SummaryView**(id, orgId, datasetId, groupBy:[columns], measures:[columns], savedBy, savedAt)
- **DashboardConfig**(id, orgId, cards:[{type:scorecard|pie|bar, groupBy, measure}], createdBy)
- **AuditLog**(id, orgId, actorId, action, payload, ts)

**Derived keys**
- `employeeKey` default = chosen **employeeId** or concatenation (e.g., EmployeeID|EmployeeName) based on mapping.
- `payPeriod` is read from mapped column (e.g., `tblPRPayPeriodsID`). A **pay period format** setting describes scheme (e.g., 10/20/30 … vs 1…26).

---

## 4) Functional Requirements

### 4.1 Upload & Caption Mapping
- **FR‑U1:** User uploads .xlsx/.csv pay detail; system parses and lists all **source headers**.
- **FR‑U2:** First-time mapping: for each header, user enters a **Caption** (friendly label). Save as **HeaderMap** for the org.
- **FR‑U3:** On future uploads, auto-apply known captions; prompt only for **new headers**.
- **FR‑U4:** User assigns **Column Roles** (payPeriod, employeeId/Name, amount, optional: positionType, DAC, TRC, department, location, etc.).
- **FR‑U5:** Validate roles (must have payPeriod, an employee key (id or name), and an **amount**).
- **FR‑U6:** Persist **payroll frequency** (24/26/52) and **pay period scheme** (sequential 1..N, or tens: 10/20/30…).

### 4.2 Pay‑Period Comparison Worksheet
- **FR‑C1:** Top controls: choose **Left PP** and **Right PP** from distinct values in the mapped payPeriod column.
- **FR‑C2:** Grid lists **one row per employeeKey** with columns: Employee, Left Amount, Right Amount, **Cumulative to Right**, **Notes**.
- **FR‑C3:** **Cumulative to Right** sums chosen **Amount** from period 1..Right PP (respecting the org’s numbering scheme).
- **FR‑C4 (Highlight Rule):** If Left Amount ≠ Right Amount, **highlight Right Amount** (current).  
- **FR‑C5 (Notes Required):** When highlight is triggered, **Notes becomes required**; cannot mark session complete without notes.
- **FR‑C6:** Notes are **persisted** and **pre‑populate** when revisiting the same employee+Right PP combination.
- **FR‑C7:** Save/Resume comparison sessions; show status (e.g., “78% of required notes complete”).
- **FR‑C8:** Export grid (CSV) and print‑friendly PDF.

### 4.3 Summaries (Self‑Serve Group‑By)
- **FR‑S1:** User selects **Group By** column(s) from mapped headers (e.g., DAC, PositionDescription).
- **FR‑S2:** User selects one or more **Measures** (e.g., `Amount`, `GrossOvertime`) to **sum**.
- **FR‑S3:** Results render instantly as a table (Group(s), Measure1 Sum, Measure2 Sum, …).
- **FR‑S4:** Allow adding/removing measures and reordering columns.
- **FR‑S5:** Export summary table to CSV.
- **FR‑S6:** Save named **SummaryViews** for reuse.

### 4.4 Dashboards
- **FR‑D1:** **Dashboard Settings**: choose cards (Scorecards, Pie, Bar) and configure each with **groupBy** + **measure**.
- **FR‑D2 Scorecards** (examples):  
  - Total amount paid to date (sum of Amount)  
  - Distinct employees paid  
  - Count of pay periods present  
  - Distinct position types / DACs
- **FR‑D3 Pies/Bars** (examples): Amount by DAC; Amount by PositionDescription; Overtime share if a second measure exists.
- **FR‑D4:** Dashboard responds to **global filters**.

### 4.5 Filters
- **FR‑F1:** **Dynamic Filter Builder**: Step 1 choose a column; Step 2 pick value(s) from unique list; Step 3 (optional) add more filters (AND).  
- **FR‑F2:** Provide quick presets: by Employee, by Position Type, by Pay Period, by DAC.  
- **FR‑F3:** Filters apply across **Comparison**, **Summaries**, and **Dashboards**.

### 4.6 Roles, Permissions & Audit
- **FR‑R1:** Roles: Admin (all), Editor (create sessions, notes), Viewer (read/export), Auditor (read-only + audit log).  
- **FR‑R2:** Immutable **AuditLog**: uploads, mappings, setting changes, note create/edit, exports.

### 4.7 Exports & Printing
- **FR‑E1:** CSV export for Comparison, Summaries.  
- **FR‑E2:** Print‑friendly PDF for Comparison session with Notes.

---

## 5) UX Requirements (Key Screens)

1) **Upload & Map**  
- List of source headers → text inputs for Captions → dropdowns to assign Column Roles.  
- Unknown headers on future uploads appear inline with a **“New: add caption”** chip.

2) **Compare**  
- Header bar: Left PP, Right PP (dropdowns sourced from dataset).  
- Table: Employee | Left Amount | Right Amount (highlight if different) | Cumulative to Right | Notes (required if highlighted).  
- Sticky footer showing: “Notes required: 23 remaining” + Save.

3) **Summaries**  
- Builder left rail: Group By (multi-select), Measures (multi-select).  
- Table updates live; CSV button top-right.

4) **Dashboard**  
- Config button → modal to add Scorecard/Pie/Bar cards; choose groupBy/measure.  
- Global filter pill bar at top.

5) **Filters**  
- Dynamic stepper: Choose Column → Pick Value(s) → Add Filter.  
- Saved filter presets section.

Accessibility: WCAG AA contrast, keyboard navigation, sticky targets ≥ 44px.

---

## 6) Settings & Pay Period Schemes

- **Payroll Frequency**: 24 / 26 / 52.  
- **Scheme Type**:  
  - **Sequential**: 1..N (e.g., 1..26)  
  - **Tens**: 10,20,30… (map to sequence index internally).  
- **Mapping**: User can provide a table to map raw `tblPRPayPeriodsID` to a normalized index (1..N).  
- **Cumulative Calculation** uses the normalized index.

---

## 7) Validations & Edge Cases
- Missing required roles → block Comparison.  
- Duplicate employee keys → show warning and how key is formed (prefer EmployeeID if present).  
- Multiple rows per employee per PP (e.g., multiple TRCs) → **aggregate by employeeKey+PP** before display.  
- Amount sign handling (credits/adjustments) → store numeric; show minus with parentheses.  
- Large files (200k+ rows) → stream ingest; index distincts; lazy pagination.  
- Headers change between uploads → prompt for new captions only.  
- No TRC column in dataset → features still work; TRC-specific summaries are just unavailable.

---

## 8) Performance & Security
- Handle 1–2M rows at parse time (chunked read, columnar storage).  
- PII minimization: only store uploaded fields; mask SSNs by default; encryption at rest/in transit.  
- FERPA-aligned access; org‑scoped tenancy.  
- 99.9% monthly availability target.

---

## 9) Analytics & Success Metrics
- Time to first comparison session < 10 minutes.  
- % sessions with 100% notes completeness.  
- Weekly active Editors, saved SummaryViews, dashboard card usage.  
- Mean export/downloads per user.

---

## 10) Release Plan
- **MVP (4–6 weeks):** Upload+Map, Comparison (diff highlight, required notes), one Summary table, CSV export.  
- **v1.1:** Dashboard settings + scorecards/pie; saved summaries; dynamic filter builder.  
- **v1.2:** Audit log UI, print‑to‑PDF packet, role management.

---

## 11) Acceptance Criteria (Samples)

### Upload & Mapping
- Given an upload with unseen headers, when I proceed, then I am prompted to create captions for just those new headers and the upload completes without requiring re‑captioning known headers.

### Comparison
- Given Left PP=10 and Right PP=20, when an employee’s amounts differ, then the Right Amount cell renders highlighted and the Notes field is required to save the row.  
- Given I reopen the same session, when I navigate to an employee previously annotated, then the Notes field pre‑populates with the last saved note.

### Summaries
- Given I group by DAC and select measures Amount & GrossOvertime, then the table displays one row per DAC with two summed columns and supports CSV export.

### Filters
- Given I add a filter “PositionDescription = Teacher” and “PayPeriod = 20”, then the comparison and summaries show only matching records.

---

## 12) Jira Backlog — Epics & User Stories

### EPIC A — Data Ingestion & Caption Mapping
- **A‑1** As an **Editor**, I can upload a payroll file and see all source headers so that I can map captions.  
  - *AC:* Unknown headers require captions; known headers auto‑fill.  
- **A‑2** As an **Editor**, I can assign **Column Roles** (payPeriod, employeeId/Name, amount, …) so that features know which columns to use.  
  - *AC:* Validation blocks progress unless payPeriod, employee key, and amount are set.  
- **A‑3** As an **Admin**, I can configure payroll frequency and scheme (sequential or tens) so cumulative math is correct.  
  - *AC:* Mapping table normalizes raw pay period ids to 1..N.

### EPIC B — Pay‑Period Comparison
- **B‑1** As an **Editor**, I pick two pay periods and see Employee | Left Amount | Right Amount | Cumulative | Notes.  
  - *AC:* Aggregate multiple rows per employee per PP before display.  
- **B‑2** As an **Editor**, I see Right Amount highlighted when it differs from Left Amount.  
  - *AC:* Styled cell; tooltip shows delta.  
- **B‑3** As an **Editor**, I must enter a **Note** when there is a difference.  
  - *AC:* Cannot mark session complete until all required notes saved.  
- **B‑4** As an **Editor**, saved notes **pre‑populate** in future sessions for the same employee+Right PP.  
  - *AC:* Editing notes updates lastEdited timestamp.  
- **B‑5** As an **Editor**, I can export the comparison table to CSV and print a packet.  
  - *AC:* Export respects active filters.

### EPIC C — Summaries Builder
- **C‑1** As an **Analyst**, I can choose **Group By** columns and **Measure** columns to sum.  
  - *AC:* Table updates instantly; supports multiple measures.  
- **C‑2** As an **Analyst**, I can **save** and **reopen** named summary views.  
  - *AC:* Saved views store selected columns and filters.

### EPIC D — Dashboard & KPIs
- **D‑1** As a **Manager**, I can configure scorecards and pies/bars from groupBy+measure.  
  - *AC:* Cards render and respond to global filters.  
- **D‑2** As a **Manager**, I can view KPIs: total paid to date, distinct employees, periods present, distinct DACs.  
  - *AC:* Definitions documented in tooltips.

### EPIC E — Filters & Views
- **E‑1** As a **User**, I can build dynamic filters by picking columns and values.  
  - *AC:* Unique value list is computed from dataset; multi‑select supported.  
- **E‑2** As a **User**, I can save filter presets.  
  - *AC:* Presets appear as quick chips.

### EPIC F — Admin, Roles & Audit
- **F‑1** As an **Admin**, I can assign roles (Admin/Editor/Viewer/Auditor).  
  - *AC:* Permissions enforced on upload, edit, export.  
- **F‑2** As an **Auditor**, I can view a chronological **Audit Log**.  
  - *AC:* Each log shows actor, action, timestamp, and payload summary.

### EPIC G — Exports & Printing
- **G‑1** As a **User**, I can export current table (comparison or summary) to **CSV**.  
  - *AC:* Column order preserved; filter‑aware.  
- **G‑2** As a **User**, I can print a **comparison packet** with notes.  
  - *AC:* Header shows PP range and filter set.

*(Add Story Points, Priority, and Dependencies in Jira.)*

---

## 13) Suggested Defaults (Based on Sample Columns)
- **Pay Period Column (default):** `tblPRPayPeriodsID`  
- **Employee Key:** prefer `EmployeeID` (map to Name when available)  
- **Amount Measure:** `Amount`  
- **Useful Group‑Bys:** `DAC`, `PositionDescription`  
- **Additional Measures (if present):** `GrossOvertime`, `Gross`

---

## 14) Open Questions (Track in Jira)
1. Should required Notes be per **employee+Right PP** or **employee+Right PP+delta type**?  
2. Do we allow **multi‑dataset** comparisons (e.g., compare PP20 from one upload vs PP20 from a later corrected upload)?  
3. Do we need **per‑row TRC** rollups (regular vs overtime) in Comparison, or is that for Summaries only?  
4. Any PII columns that must be masked/redacted in UI/exports?

---

## 15) Definition of Done (Engineering)
- Unit tests for mapping, normalization, diff/notes, summaries.  
- Deterministic CSV exports; pagination and filtering tested at 200k+ rows.  
- ADA keyboard traversal and screen reader labels.  
- Security review (encryption, role enforcement, audit trail).

