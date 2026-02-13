# InteliJob Major Issues Audit

## Goal (as implemented)
InteliJob scans live job postings and ranks certifications by demand so users can prioritize what to pursue next.

## Status Update
All major issues originally identified in this audit have now been addressed in code:

1. ✅ Backend startup script crash resolved.
2. ✅ History/stats endpoints now require admin API key authorization.
3. ✅ Frontend/backend contract aligned for `target_path` and `owned_certs`.
4. ✅ Certification extraction tightened to avoid substring-only false positives.
5. ✅ SQLite persistence now applies retention controls (age + max rows).

## New configuration required
- `ADMIN_API_KEY` (backend): required to access `/history` and `/stats`.
- `VITE_ADMIN_API_KEY` (frontend): optional; when set, frontend includes `X-Admin-Key` for history/stats requests.
- `SCAN_RETENTION_DAYS` (backend, default `90`).
- `MAX_SCAN_ROWS` (backend, default `2000`).
