# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Homepage dashboard with payroll overview charts and statistics (PA-9)
- Line chart showing total payroll trend across pay periods (PA-9)
- Pie chart showing payroll distribution by department (PA-9)
- Summary stat cards for total payroll, employee count, pay periods, and departments (PA-9)
- Empty dashboard state with upload prompt when no data exists (PA-9)
- Dashboard link in navigation bar (PA-9)

### Fixed

- Save Snapshot and Export CSV now correctly capture notes being actively edited (PA-11)

## [0.5.0] - 2026-01-13

### Added

- DAC/Department as 4th required column in column mapping (PA-7)
- Auto-select columns based on previous mapping preferences (PA-7)

### Changed

- Worksheet now defaults to last two pay periods instead of first two (PA-8)
- Saved comparisons page redesigned with side-by-side master-detail layout (PA-6)
- Notes editing now activates with single-click instead of double-click (PA-5)
- Arrow keys (↑↓) navigate between note cells while editing (PA-5)

### Fixed

- Save Snapshot and Export CSV now capture notes being actively edited (PA-11)

### Removed

- Standalone snapshot view page replaced by inline panel (PA-6)

## [0.4.0] - 2026-01-13

### Added

- Saved comparisons list page to view and manage snapshots (PA-4)
- Read-only snapshot viewing with preserved comparison data (PA-4)
- Delete saved snapshots with confirmation dialog (PA-4)
- CSV export functionality for comparison data (PA-4)
- Empty state UI for saved comparisons page (PA-4)

## [0.3.0] - 2026-01-13

### Added

- Worksheet page for pay period comparison (PA-3)
- Pay period selector dropdowns to choose prior and current periods (PA-3)
- Comparison table with MUI X DataGrid including sorting, filtering, and pagination (PA-3)
- Visual highlighting for rows where amounts differ between pay periods (PA-3)
- Inline note editing directly in the data grid (PA-3)
- Year-to-date calculation for each employee through current period (PA-3)
- Delta and delta percentage columns showing changes between periods (PA-3)
- Snapshot saving to preserve comparison state with notes (PA-3)
- Quick filter toolbar for searching across all columns (PA-3)
- Column visibility toggle to show/hide columns (PA-3)

## [0.2.0] - 2026-01-12

### Added

- CSV file upload with drag-and-drop support (PA-2)
- Column mapping UI for Employee Name, Amount, and Pay Period columns (PA-2)
- IndexedDB persistence for large CSV files (supports 7000+ rows) (PA-2)
- AppBar navigation with Upload, Worksheet, and Saved Comparisons links (PA-2)
- Data survives browser refresh via IndexedDB storage (PA-2)

## [0.1.0] - 2025-01-10

### Added

- Initial project setup with Next.js 16, TypeScript, and MUI 7
- Basic project structure with App Router
- ESLint and Prettier configuration
- Vercel deployment configuration
