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
| 2026-01-13 | Scout Mode | User corrected shallow scout with "scout properly... do it yourself" | Initial scout was too brief; attempted subagent delegation | Scout Mode should be thorough and direct; read all relevant files yourself; don't delegate initial investigation | - |
| 2026-01-13 | Process | AC verification requested by user AFTER PR creation | Verification not done proactively before PR | Always perform systematic AC audit BEFORE creating PR, not after user asks; present verification table to user | - |
| 2026-01-13 | UX Design | User confused whether saved snapshots were immutable or dynamic | Read-only view UI looks similar to edit view; no visual indicator of "frozen" state | Consider adding visual indicators (badge, different color, info alert) to clearly distinguish read-only snapshots from live data | - |