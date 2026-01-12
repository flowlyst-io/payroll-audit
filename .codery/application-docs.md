# Application Documentation

_This file contains project-specific documentation aggregated from user-defined sources._

---

## docs/ENGINEERING_GUIDE.md

# Engineering Reference Guide - Payroll Audit Application

## Project Overview

**Application Name**: Payroll Audit
**Purpose**: Web application for school districts to upload payroll data and generate audit reports
**Target Users**: School district administrators and auditors
**Current Phase**: Proof of Concept (POC) - Epic 1

---

## Tech Stack

### Core Framework
- **Next.js**: `16.0.1` (App Router)
- **React**: `19.2.0`
- **TypeScript**: `^5.x`
- **Node.js**: `v22.18.0+` (LTS recommended)

### UI Library
- **MUI (Material-UI)**: `^7.3.5` (Core Components)
  - `@emotion/react`: `^11.14.0`
  - `@emotion/styled`: `^11.14.1`
- **MUI X**: To be installed when advanced features are needed
  - `@mui/x-data-grid`: For complex tables and data grids
  - `@mui/x-charts`: For data visualization
  - `@mui/x-date-pickers`: For date/time selection

### Code Quality
- **ESLint**: `^9.x` (Next.js config + TypeScript)
- **Prettier**: `^3.6.2` (Code formatting)
- **eslint-config-prettier**: `^10.1.8` (ESLint/Prettier integration)

### Deployment
- **Platform**: Vercel
- **Environment**: Production, Preview, Development

---

## Architecture Decisions

### Next.js App Router
- **Rationale**: Modern approach with React Server Components, improved performance, better data fetching
- **Structure**: File-system based routing in `/app` directory
- **No `/src` directory**: Simpler structure for smaller team

### TypeScript Strict Mode
- All code must be TypeScript
- Type safety enforced across the application
- Use proper interfaces and types (no `any` unless absolutely necessary)

### MUI Theming Strategy
- **Global theme**: Defined in `app/theme.ts`
- **Provider setup**: Client-side theme provider in `app/providers.tsx`
- **Customization**: All theme modifications should be application-wide via theme configuration
- **Import pattern**: Use `@mui/material` for component imports

### Server vs Client Components
- **Default**: Use React Server Components (RSC) unless client interactivity is needed
- **Client components**: Mark with `'use client'` directive when using hooks, event handlers, or browser APIs
- **MUI components**: Require `'use client'` since they use React context

---

## Development Standards

### File Naming Conventions
- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Utilities**: camelCase (e.g., `formatCurrency.ts`)
- **Pages/Routes**: lowercase (e.g., `page.tsx`, `layout.tsx`)
- **Styles**: Component name + `.module.css` (e.g., `UserProfile.module.css`)

### Component Patterns
```typescript
// Server Component (default)
export default function ServerComponent() {
  return <div>Server-rendered content</div>;
}

// Client Component (interactive)
'use client';

import { useState } from 'react';

export default function ClientComponent() {
  const [state, setState] = useState(false);
  return <button onClick={() => setState(!state)}>Toggle</button>;
}
```

### Import Alias
- Use `@/*` for absolute imports (e.g., `import { Button } from '@/components/Button'`)
- Configured in `tsconfig.json`

### TypeScript Conventions
- Prefer `interface` over `type` for object shapes
- Use explicit return types for functions
- Leverage TypeScript inference where appropriate
- Export types/interfaces when shared across files

---

## Styling & Theming

### MUI Theme Customization
Theme configuration is centralized in `app/theme.ts`:

```typescript
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
  typography: {
    fontFamily: [/* system fonts */].join(','),
  },
  components: {
    // Component-level customizations
  },
});
```

### Using MUI Components
```typescript
'use client';

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

export default function Example() {
  return (
    <Stack spacing={2}>
      <Button variant="contained">Primary Action</Button>
      <Button variant="outlined">Secondary Action</Button>
    </Stack>
  );
}
```

### CSS Approach
- **Primary**: MUI's `sx` prop and theme-based styling
- **Secondary**: CSS Modules for custom styles (`.module.css`)
- **Avoid**: Inline styles unless absolutely necessary

---

## Code Quality Tools

### Running Linting
```bash
npm run lint        # Check for linting errors
```

### Running Prettier
```bash
npm run format         # Format all files
npm run format:check   # Check formatting without changes
```

### Pre-commit Best Practices
- Run `npm run lint` before committing
- Run `npm run format` to auto-fix formatting issues
- Ensure TypeScript compiles without errors: `npm run build`

---

## Git Workflow

### Branch Strategy (GitFlow)
- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/PA-XXX-description**: Feature development
- **bugfix/PA-XXX-description**: Bug fixes
- **hotfix/PA-XXX-description**: Emergency production fixes
- **release/X.Y.Z**: Release preparation

### Commit Messages
- Include JIRA ticket number: `PA-123: Add user authentication`
- Use conventional commits when appropriate
- Keep messages concise and descriptive

### Before ANY Work
1. **ALWAYS** create a branch first
2. **NEVER** work directly on `main` or `develop`
3. Verify your branch: `git branch`

### Example Workflow
```bash
git checkout develop
git pull origin develop
git checkout -b feature/PA-123-payroll-upload
# ... make changes ...
git add .
git commit -m "PA-123: Add payroll file upload component"
git push origin feature/PA-123-payroll-upload
# Create pull request to develop
```

---

## Project Structure

```
payroll-audit/
├── .codery/              # Codery configuration
├── app/                  # Next.js App Router
│   ├── layout.tsx       # Root layout with MUI provider
│   ├── page.tsx         # Home page
│   ├── theme.ts         # MUI theme configuration
│   ├── providers.tsx    # Client-side providers
│   └── globals.css      # Global styles
├── components/          # Shared React components (create as needed)
├── lib/                 # Utility functions, helpers (create as needed)
├── public/              # Static assets
├── docs/                # Engineering documentation
├── .prettierrc          # Prettier configuration
├── .prettierignore      # Prettier ignore rules
├── eslint.config.mjs    # ESLint configuration
├── package.json         # Project dependencies
├── tsconfig.json        # TypeScript configuration
└── next.config.ts       # Next.js configuration
```

---

## Development Commands

```bash
npm run dev            # Start development server (http://localhost:3000)
npm run build          # Production build
npm run start          # Start production server
npm run lint           # Run ESLint
npm run format         # Format code with Prettier
npm run format:check   # Check formatting
```

---

## Future Considerations

### Authentication (Planned)
- **Firebase Authentication**: Will be implemented in a future phase
- **Not in POC**: Authentication is deferred until post-POC
- When implementing: Use Firebase SDK with Next.js App Router patterns

### Client-Side Storage
- **Current**: IndexedDB (via `idb` library) for demo/POC phase
- **Rationale**: localStorage has 5MB limit; IndexedDB supports large datasets (7000+ rows)
- **Future**: Server-side database for production (NoSQL vs SQL TBD)

### File Upload (TBD)
- **Formats**: To be determined (likely CSV, Excel)
- **Storage**: Cloud storage solution TBD
- **Processing**: Server-side validation and parsing

### Advanced UI Components
When advanced features are needed, install MUI X packages:

```bash
# Data Grid
npm install @mui/x-data-grid

# Charts
npm install @mui/x-charts

# Date Pickers
npm install @mui/x-date-pickers dayjs
```

Refer to [MUI X Documentation](https://mui.com/x/introduction/) for usage patterns.

---

## Team Collaboration

### For Developers
1. Read this guide before starting work
2. Follow established patterns in existing code
3. Ask questions if standards are unclear
4. Update this guide when new patterns emerge

### For AI Agents
1. This document is the single source of truth for technical decisions
2. Follow all conventions exactly as specified
3. When in doubt, reference MUI and Next.js official documentation
4. Do not introduce new libraries without discussion

---

## External Documentation

- **Next.js**: https://nextjs.org/docs
- **React**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org/docs
- **MUI**: https://mui.com/material-ui/getting-started/
- **MUI X**: https://mui.com/x/introduction/

---

**Last Updated**: 2025-11-10
**Version**: 1.0.0
**Maintainer**: Engineering Team

---

## docs/prd_payperiod_demo.md

# PRD — Pay Period Compare (Demo Version)

**Owner:** Tural Novruzov  
**Date:** 2025‑11‑11  
**Status:** Demo Scope (2‑Day Build)  
**Target Users:** Payroll Clerks, CFOs, HR Analysts (Demo View Only)

---

## 1. Objective
This demo is a **simplified, non‑persistent prototype** of the Pay Period Comparison tool. It is designed for **live customer demonstrations** to showcase the core concept — **upload payroll data → select two pay periods → view differences and cumulative totals**.  

This version is **not** a full MVP. It prioritizes visual clarity, basic interactivity, and reliability during demos (refresh‑safe via IndexedDB).

---

## 2. Scope Summary

### Included (Core Demo)
1. **File Upload (CSV only)**
   - Upload a real payroll CSV file.
   - Select three column roles: **Pay Period**, **Employee**, and **Amount**.
   - Data stored in IndexedDB (supports large files).

2. **Pay Period Comparison Table**
   - Choose **Left** and **Right** pay periods from dropdowns.
   - Table shows: `Employee | Left Amount | Right Amount | Cumulative to Right | Notes`.
   - Highlights differences where Left ≠ Right.
   - Notes are editable text fields; changes persist locally.
   - Cumulative calculated in‑memory using ordered pay periods.

3. **Export CSV**
   - Export current comparison view with columns:
     - Employee, LeftAmount, RightAmount, Delta, Delta%, CumulativeToRight, IsDifferent, Note.

4. **Basic Persistence**
   - Implemented via IndexedDB for resilience during demo.
   - Includes dataset, mapping, and notes.

5. **Simple UI**
   - Built with **React + Next.js (App Router) + MUI** per engineering guide.
   - Currency formatting and delta % shown in‑app.
   - Exported CSV contains raw numeric values.

### Excluded (Out of Scope)
- XLSX parsing.
- Saved header mappings or saved sessions.
- Dashboards, summaries, or charts.
- Dynamic filters or saved views.
- Roles, audit logs, authentication.
- Print/PDF export.

---

## 3. Key Requirements

### Upload & Map
- **FR‑U1:** User uploads a `.csv` file.
- **FR‑U2:** System displays all headers; user assigns the 3 required roles.
- **FR‑U3:** Normalizes rows to `{ payPeriod, employee, amount }`.
- **FR‑U4:** Data cached to IndexedDB to survive refresh.

### Compare View
- **FR‑C1:** Select Left and Right pay periods from available values.
- **FR‑C2:** Aggregate rows per employee per pay period.
- **FR‑C3:** Compute `CumulativeToRight` as sum of amounts up to chosen Right PP.
- **FR‑C4:** Highlight Right amount where values differ.
- **FR‑C5:** Notes required only for highlighted rows; persisted locally.
- **FR‑C6:** Currency and delta % formatting for readability.

### Export
- **FR‑E1:** Export current comparison view to CSV.
- **FR‑E2:** Include all columns + note text.

### Persistence
- **FR‑P1:** Store dataset, mapping, and notes in IndexedDB.

---

## 4. Architecture
- **Frontend:** Next.js (React, TypeScript, App Router)
- **UI Library:** MUI (Table, Select, TextField)
- **Data Handling:** CSV parsed client‑side, stored in IndexedDB via `idb` library.
- **Deployment:** Vercel (static hosting)

### Directory Sketch
```
app/
 ├─ page.tsx              # Upload & Map screen
 ├─ compare/page.tsx      # Comparison table screen
components/
 ├─ CsvUpload.tsx
 ├─ ColumnMapper.tsx
 ├─ CompareTable.tsx
utils/
 ├─ csvParser.ts
 ├─ localStorage.ts
 ├─ formatters.ts
```

---

## 5. Demo Script
1. Upload a real payroll CSV.
2. Map Pay Period / Employee / Amount.
3. Choose Left PP = X, Right PP = Y.
4. View table with differences highlighted.
5. Enter notes; refresh to show persistence.
6. Export CSV and open to show diff and notes.

---

## 6. Risks / Mitigations
| Risk | Mitigation |
|------|-------------|
| Large CSVs slow parse | Recommend small demo dataset (<5k rows). |
| Accidental refresh | Data persisted in IndexedDB. |
| Data mismatch | Demo files pre‑tested for consistent columns. |

---

## 7. Definition of Done
- Upload → Compare → Export flow works end‑to‑end.
- IndexedDB persistence verified.
- Table highlighting and formatting functional.
- Demo reset works reliably.
- No runtime errors during upload or refresh.

---

## 8. Future Extensions (Post‑Demo)
- Saved caption mappings.
- Saved comparison sessions.
- Summary & Dashboard builders.
- Multi‑dataset comparisons.
- Role management and audit logging.
