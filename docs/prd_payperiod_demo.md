# PRD — Pay Period Compare (Demo Version)

**Owner:** Tural Novruzov
**Date:** 2026-01-12
**Status:** Ready for Build
**Target Users:** Payroll Clerks, CFOs, HR Analysts (Demo Audience)

---

## 1. Objective

Build a **simplified demo prototype** of the Pay Period Comparison tool for live customer demonstrations. The demo showcases the core workflow: **upload payroll data → compare two pay periods → save snapshots with notes → export**.

This is **not** a full MVP. It prioritizes visual clarity, basic interactivity, and reliability during demos using IndexedDB persistence.

---

## 2. Features Overview

### 2.1 Upload & Data Storage
- Upload a CSV file (~7,000 rows, 10-20 columns)
- **Store the entire CSV** in IndexedDB (users may need other columns for filtering)
- User maps 3 required columns: **Employee Name**, **Amount**, **Pay Period**
- New upload **overwrites** existing data (single data source)

### 2.2 Navigation
- **Top AppBar** with navigation links:
  - **Upload** — upload/replace CSV data
  - **Worksheet** — create new comparison
  - **Saved Comparisons** — browse saved snapshots

### 2.3 Worksheet (Comparison Table)
- Two dropdowns: **Prior Pay Period** and **Current Pay Period**
- **MUI X DataGrid** with columns:
  - Employee Name
  - Prior Amount
  - Current Amount (highlighted when ≠ Prior)
  - Year-to-Date (cumulative from earliest PP through Current PP)
  - Notes (editable via cell editing)
- **Save Snapshot** button to save current comparison + notes

### 2.4 Saved Comparisons
- **List page** displaying all saved snapshots (cards or table)
- Auto-generated name: `"PP{prior} vs PP{current} - {date/time}"`
- Click snapshot → view in **read-only Worksheet mode**
- **Delete** option for each snapshot

### 2.5 Export
- Export current comparison view to **CSV file**

---

## 3. Functional Requirements

### Upload & Map
- **FR-U1:** User uploads a `.csv` file via file input
- **FR-U2:** System parses CSV and stores **all columns** in IndexedDB
- **FR-U3:** User assigns 3 column roles via dropdowns: Employee Name, Amount, Pay Period
- **FR-U4:** Validation blocks navigation until all 3 roles assigned
- **FR-U5:** New upload overwrites any existing data

### Worksheet
- **FR-W1:** Prior/Current PP dropdowns populated from unique pay periods in data
- **FR-W2:** Rows aggregated per employee per pay period (sum if multiple rows)
- **FR-W3:** Year-to-Date = sum of employee's amounts from earliest PP through Current PP
- **FR-W4:** Pay periods sorted numerically (or alphabetically if non-numeric)
- **FR-W5:** Current Amount cell **highlighted** when Prior ≠ Current
- **FR-W6:** Notes column editable via MUI X DataGrid cell editing
- **FR-W7:** DataGrid provides sorting, filtering, column visibility out-of-the-box
- **FR-W8:** "Save Snapshot" button saves comparison + notes to IndexedDB

### Saved Comparisons
- **FR-S1:** List page shows all saved snapshots
- **FR-S2:** Snapshot name auto-generated: `"PP{prior} vs PP{current} - {timestamp}"`
- **FR-S3:** Click snapshot opens **read-only** Worksheet view (no editing, no save)
- **FR-S4:** Delete button removes snapshot from IndexedDB
- **FR-S5:** Snapshots are **immutable** — source data changes don't affect saved snapshots

### Export
- **FR-E1:** Export button downloads current comparison as CSV
- **FR-E2:** CSV includes: Employee, Prior Amount, Current Amount, Delta, Delta%, YTD, Notes

### Persistence
- **FR-P1:** Store in IndexedDB: CSV data, column mapping, saved snapshots
- **FR-P2:** Data survives browser refresh

---

## 4. Technical Architecture

### Stack
- **Framework:** Next.js 16 (App Router)
- **UI Library:** MUI 7 + MUI X DataGrid
- **Language:** TypeScript
- **Storage:** IndexedDB (client-side, via `idb` library)
- **Deployment:** Vercel

### Directory Structure
```
app/
  ├─ layout.tsx              # Root layout with AppBar
  ├─ page.tsx                # Redirect or landing
  ├─ upload/page.tsx         # Upload & column mapping
  ├─ worksheet/page.tsx      # Comparison table (create mode)
  ├─ worksheet/[id]/page.tsx # Comparison table (read-only mode)
  ├─ saved/page.tsx          # Saved comparisons list
components/
  ├─ AppBar.tsx              # Navigation header
  ├─ CsvUpload.tsx           # File upload component
  ├─ ColumnMapper.tsx        # Column role assignment
  ├─ ComparisonGrid.tsx      # MUI X DataGrid wrapper
  ├─ SnapshotList.tsx        # Saved snapshots display
utils/
  ├─ csvParser.ts            # CSV parsing logic
  ├─ storage.ts              # localStorage helpers
  ├─ calculations.ts         # Aggregation, YTD, delta calculations
  ├─ formatters.ts           # Currency, percentage formatting
types/
  ├─ index.ts                # TypeScript interfaces
```

---

## 5. UI/UX Specifications

### AppBar
- Logo/Title: "Payroll Audit"
- Navigation links: Upload | Worksheet | Saved Comparisons
- Persistent across all pages

### Upload Page
- File input (drag-drop optional)
- After upload: display column list with 3 dropdown selectors
- "Continue" button (disabled until all mapped)

### Worksheet Page
- Header: Prior PP dropdown | Current PP dropdown | Save Snapshot button | Export button
- Body: MUI X DataGrid with comparison data
- Highlighted cells for differences
- Editable notes column

### Saved Comparisons Page
- List/cards of saved snapshots
- Each shows: name, date saved, delete button
- Click to view in read-only mode

### Read-Only Worksheet
- Same layout as Worksheet
- No Save button
- Notes not editable
- "Back to Saved Comparisons" link

---

## 6. Demo Script

1. Open app, navigate to **Upload**
2. Upload payroll CSV file
3. Map Employee Name, Amount, Pay Period columns
4. Navigate to **Worksheet**
5. Select Prior = PP10, Current = PP20
6. Point out highlighted differences
7. Add notes to a few rows
8. Click **Save Snapshot**
9. Navigate to **Saved Comparisons** — show snapshot in list
10. Click snapshot — show read-only view
11. Go back, create another comparison, save
12. **Export** to CSV, open file to show data
13. Refresh browser — show data persists

---

## 7. Out of Scope

- XLSX parsing (CSV only)
- Multiple datasets (single data source)
- Authentication, roles, audit logs
- Print/PDF export
- Dashboards, charts, summaries
- Reset Demo button
- Saved column mappings across sessions

---

## 8. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Large CSV slow to parse | Recommend <10k rows for demo |
| Browser refresh during demo | Data persisted in IndexedDB |
| Pay period sort edge cases | Sort numerically; fall back to alphabetical |

---

## 9. Definition of Done

- [ ] Upload → Map → Worksheet flow works end-to-end
- [ ] DataGrid displays with sorting, filtering, highlighting
- [ ] Notes editable and saved with snapshot
- [ ] Snapshots save, list, view (read-only), delete
- [ ] Export produces valid CSV with all columns
- [ ] IndexedDB persistence verified across refresh
- [ ] No runtime errors during demo script
- [ ] Responsive on standard laptop screens

---

## 10. Future Extensions (Post-Demo)

- XLSX file support
- Saved column mappings per organization
- Server-side storage (database)
- Multiple datasets / multi-file comparison
- Summary views and dashboards
- Role-based access and audit logging
- Print-friendly PDF export
