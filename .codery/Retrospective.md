# Codery Retrospective

This file contains learnings from Codery sessions to improve the system over time. The introspection subagent appends new findings here after each session.

## Session Learnings

| Date | Category | Finding | Root Cause | Recommendation | Ticket |
|------|----------|---------|------------|----------------|--------|
| 2025-01-28 | System Init | Created retrospective system | Need for persistent learning | Use this file for knowledge retention | COD-14 |
| 2026-01-12 | Architecture | localStorage QuotaExceededError on 7000-row CSV upload | localStorage has ~5MB limit; PRD didn't account for large file sizes | When PRD specifies "store entire CSV", always evaluate storage limits upfront; default to IndexedDB for datasets >1000 rows | - |
| 2026-01-12 | Architecture | IndexedDB migration successful with `idb` library | Native IndexedDB API is verbose and callback-based | Use `idb` library for Promise-based IndexedDB access; simplifies async/await patterns | - |
| 2026-01-12 | Documentation | application-docs.md contains duplicate PRD copy that gets out of sync | File aggregates docs from multiple sources including old PRD version | Consider removing embedded PRD from application-docs.md or automating sync; duplicated docs create maintenance burden | - |
| 2026-01-12 | Security | Next.js critical vulnerabilities found via npm audit | Dependencies age and accumulate vulnerabilities | Run `npm audit` as part of regular workflow; consider adding to PR checklist | - |
| 2026-01-12 | Process | Systematic AC verification (17 criteria) before merge caught potential gaps | Ad-hoc testing may miss edge cases | Always verify acceptance criteria line-by-line before declaring story complete | - |
| 2026-01-12 | User Guidance | User wanted to discuss IndexedDB vs server-side before implementation | Technical decisions benefit from collaborative discussion | When hitting technical constraints, explain options clearly and let user decide rather than assuming solution | - |