# Frontend Feature Design Document (FDD) Audit

This document cross-references the six feature design documents with the current SupTech365 frontend implementation. It identifies what is implemented, partially implemented, or missing.

**Audit date:** February 2026  
**Codebase:** `src/` (React + TypeScript + Vite)

---

## Feature 3: API Credentials Management (Reporting Entity Portal)

**FDD:** `Feature_3_API_Report_Submission/fdd_fe_api_credentials.md`

| Requirement | Status | Notes |
|-------------|--------|--------|
| **Route** `/reporting-entity/api-credentials` or `/api-credentials` | ❌ Missing | No dedicated route; API keys are shown under My Entity tab only |
| **Sidebar** "API Credentials" (Key icon) for Reporting Entity | ❌ Missing | Not in reporting_entity sidebar |
| **Credentials table** (Key masked, Show/Copy, Status, Created, Expires, Last Used) | ⚠️ Partial | My Entity > API Keys tab shows name, prefix, status, created, expires; no Show/Copy per key |
| **Re-Authentication modal** (password re-entry for reveal/regenerate) | ❌ Missing | Not implemented |
| **Reveal key** `POST /api/v1/reporting-entity/credentials/reveal` | ❌ Missing | No API or UI |
| **Regenerate key** (confirmation + re-auth + `POST .../credentials/regenerate`) | ❌ Missing | No API or UI |
| **Empty state** (no credentials) | ⚠️ Partial | My Entity shows "No API keys" in tab; no dedicated empty state copy |
| **Info note** (API keys usage) | ⚠️ Partial | Could be added to dedicated page |

**Recommendation:** Add dedicated **API Credentials** page at `/api-credentials` for reporting entity, with sidebar item. Reuse `entityApi.getEntityApiKeys(entityId, includeRevoked)` for the table. Add placeholder/disabled actions for Reveal and Regenerate until backend exposes `GET/POST .../reporting-entity/credentials` and reveal/regenerate endpoints.

---

## Feature 4: Automated Validation Engine

**FDD:** `Feature_4_Automated_Validation_Engine/fdd_fe_automated_validation_engine.md`

| Requirement | Status | Notes |
|-------------|--------|--------|
| **Validation Result** (pass/fail, reference, type, submitted, View Details / Submit Another / View Errors) | ✅ Implemented | `ValidationResult.tsx` at `/submissions/:id/result`; uses static `passed`; buttons present |
| **Validation Error Report** (errors table: #, Field, Error, Row; Download, Resubmit) | ✅ Implemented | `ValidationErrorReport.tsx` at `/submissions/:id/errors`; mock errors; table + actions |
| **Validation Queue** (FIA staff – list of validated reports pending manual review) | ✅ Implemented | `ValidationQueue.tsx` at `/compliance/validation` |
| **API integration** (fetch result/errors by submission id) | ⚠️ Partial | Pages use mock/static data; should be wired to submission/validation API when available |

**Recommendation:** Wire ValidationResult and ValidationErrorReport to real submission/validation APIs so `passed` and error list come from backend. Ensure error report supports backend field/message/row shape.

---

## Feature 5: Manual Validation Workflow (MVF)

**FDD:** `Feature_5_Manual_Validation_Workflow/fdd_fe_manual_validation_workflow.md`

| Requirement | Status | Notes |
|-------------|--------|--------|
| **Route** `/compliance/validation-queue` | ✅ Implemented | `ManualValidationQueue.tsx` |
| **Route** `/compliance/validation-queue/:submissionId` | ✅ Implemented | `ReportReview.tsx` |
| **Queue** (filters: report type, date range, search; table; pagination) | ⚠️ Partial | UI present; **mock data** (`mockQueue`); no API integration |
| **Report Review** (metadata, transactions table, Back to Queue) | ✅ Implemented | ReportReview uses `mockReport` |
| **Validation decision** Accept / Return for Correction / Reject | ✅ Implemented | Modals with reason (min 10 chars for return/reject) |
| **Decision submit** (API call to submit decision) | ❌ Mock only | `handleSubmitDecision` uses `setTimeout`; no API call |
| **Validation Audit Logs** | ✅ Implemented | `ValidationAuditLogs.tsx` at `/compliance/validation-audit-logs` |

**Recommendation:** Replace mock queue with API (e.g. list submissions pending manual validation). Replace mock report in ReportReview with fetch by `submissionId`. Implement submit decision API (e.g. `POST /api/v1/compliance/validation-queue/:id/decision` with action + reason) and call it from `handleSubmitDecision`.

---

## Feature 6: Task Assignment and Workload Distribution

**FDD:** `Feature_6_Task_Assignment_and_Workload_Distribution/fdd_fe_task_assignment_workload_distribution.md`

| Requirement | Status | Notes |
|-------------|--------|--------|
| **Route** `/supervisor/assignment-queue` | ✅ Implemented | `AssignmentQueuePage.tsx`; protected for head_of_compliance, head_of_analysis, super_admin |
| **Route** `/supervisor/workload` | ✅ Implemented | `TeamWorkloadPage.tsx` |
| **Route** `/my-assignments` | ✅ Implemented | `MyAssignmentsPage.tsx`; protected for compliance_officer, analyst |
| **Assignment Queue** (filters, table, select, Assign Selected → modal) | ✅ Implemented | Uses `useAssignmentQueue` hook; `CreateAssignmentModal` |
| **Team Workload** (workload counts per member) | ✅ Implemented | TeamWorkloadPage |
| **My Assignments** (officer/analyst view) | ✅ Implemented | MyAssignmentsPage |
| **Notifications** | ✅ Implemented | `NotificationsPage` at `/notifications`; sidebar bell |

**Recommendation:** Feature is well covered. Verify hooks/API align with backend (pagination, filters, assign payload). Add any missing notification payload fields if backend supports them.

---

## Feature 7: Subject Profiling Tool (MVF)

**FDD:** `Feature_7_Subject_Profiling_Tool/fdd_fe_subject_profiling_tool_mvf.md`

| Requirement | Status | Notes |
|-------------|--------|--------|
| **Route** `/subjects` (Subject Search) | ❌ Missing | **No route in App.tsx**; sidebar links to `/subjects` → 404 |
| **Route** `/subjects/:uuid` (Subject Profile Detail) | ❌ Missing | No route |
| **Route** `/subjects/:uuid/reports` (Subject Reports) | ❌ Missing | No route |
| **Sidebar** "Subject Profiles" | ✅ Present | Analyst/head_of_analysis; href `/subjects` |
| **Subject Search** (search by name/ID/account, type filter, result cards, pagination) | ❌ Missing | No page |
| **Subject Profile** (identifiers, attributes, statistics, recent reports) | ❌ Missing | No page |
| **Subject Reports** (filter STR/CTR, access summary, restricted badge) | ❌ Missing | No page |

**Recommendation:** Add routes `/subjects` and `/subjects/:uuid` (and optionally `/subjects/:uuid/reports`). Implement Subject Search and Subject Profile pages (and reports list when backend is ready). Until then, add **placeholder pages** so the sidebar link does not 404.

---

## Feature 8: Rule-Based Analysis & Alert Generation

**FDD:** `Feature_8_Rule_Based_Analysis_Alert_Generation/fdd_fe_rule_based_analysis_alert_generation.md`

| Requirement | Status | Notes |
|-------------|--------|--------|
| **Route** `/rules` (Rule List) | ❌ Missing | No route in App.tsx |
| **Route** `/rules/create` | ❌ Missing | No route |
| **Route** `/rules/:uuid` (Rule Detail) | ❌ Missing | No route |
| **Route** `/rules/:uuid/edit` | ❌ Missing | No route |
| **Alerts** (compliance/analysis dashboards) | ⚠️ Partial | `ComplianceAlerts` at `/compliance/alerts/active`; `AlertPerformanceMetrics` at `/compliance/alerts/performance`; `AlertRuleType` exists |
| **Rule list** (domain, filters, table, Create Rule, row → detail, actions) | ❌ Missing | No rule list page |
| **Rule create/edit** (name, description, risk level, conditions, justification) | ❌ Missing | No rule form pages |
| **Rule detail** (conditions, statistics, View Generated Alerts) | ❌ Missing | No rule detail page |
| **Alert detail** (rule logic, disposition form) | ⚠️ Partial | Depends on existing alert pages; disposition/rule logic per FDD to be confirmed |

**Recommendation:** Add routes `/rules`, `/rules/create`, `/rules/:uuid`, `/rules/:uuid/edit`. Implement Rule List, Rule Create/Edit, and Rule Detail pages when backend rule APIs are available. Ensure alert views (ComplianceAlerts, etc.) support disposition and showing triggering rule logic per FDD.

---

## Summary Table

| Feature | FDD | Routes | Pages | API Integration | Priority |
|---------|-----|--------|--------|-----------------|----------|
| **3. API Credentials** | fdd_fe_api_credentials.md | Missing | Missing (keys only in My Entity tab) | Partial (entity API keys only) | High |
| **4. Automated Validation** | fdd_fe_automated_validation_engine.md | OK | OK | Mock/static | Medium |
| **5. Manual Validation** | fdd_fe_manual_validation_workflow.md | OK | OK | Queue & decision mock | Medium |
| **6. Task Assignment** | fdd_fe_task_assignment_workload_distribution.md | OK | OK | Yes (hooks) | Low |
| **7. Subject Profiling** | fdd_fe_subject_profiling_tool_mvf.md | **Missing** | **Missing** | N/A | High |
| **8. Rule-Based Alerts** | fdd_fe_rule_based_analysis_alert_generation.md | **Missing** (rules) | **Missing** (rules) | Alerts partial | Medium |

---

## Implemented This Audit

1. **Subject Profiling:** Added `/subjects` and `/subjects/:uuid` routes with placeholder pages so "Subject Profiles" in the sidebar no longer 404s.
2. **API Credentials:** Added `/api-credentials` route and API Credentials page for reporting entity (table from entity API keys, info note). Added "API Credentials" to reporting entity sidebar. Reveal/Regenerate left as future work when backend exposes endpoints.

These changes ensure navigation is consistent with the FDDs and provide a base to complete Features 3, 7, and 8 when backend and product priorities allow.
