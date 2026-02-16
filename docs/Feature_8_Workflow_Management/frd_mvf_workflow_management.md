# Minimum Viable Feature (MVF) Specification
## Feature 8: Workflow Management

**Document Version:** 1.0  
**Date:** February 2026  
**Author:** Senior Product Manager  
**Related FRD Version:** 1.0  
**Status:** Draft  
**Last Updated Date:** February 2026

---

## 1. Document Header

**Document Title:** Minimum Viable Feature Specification  
**Feature/Product Name:** Workflow Management  
**Version:** 1.0  
**Author:** Senior Product Manager  
**Related FRD Version:** Feature 8 Workflow Management FRD v1.0  
**Status:** Draft  
**Last Updated Date:** February 2026

---

## 2. Scope & Feature Context

### Feature Name
Workflow Management

### MVF Description
The MVF delivers the core workflow enforcement engine that ensures CTRs and STRs follow their mandatory sequential workflows, prevents stage skipping, displays current workflow stage, and maintains immutable audit logs for compliance.

### Core Value Proposition
Enable FIA to enforce regulatory-compliant report processing by ensuring all CTRs and STRs follow defined sequential workflows with complete audit trail - the foundational requirement for AML/CFT compliance.

### In MVF Scope
- Enforcement of two mandatory sequential workflows (CTR path and STR/Escalated CTR path)
- Prevention of stage skipping within designated workflows
- Display of current workflow stage and workflow type on report views
- Recording of timestamps and responsible officers for each stage transition
- Immutable audit trail for all stage transitions

### Deferred to Future Iterations

| FRD ID | Requirement | Reason for Deferral |
|--------|-------------|---------------------|
| FR-8.3 | Return to Previous Stage | Nice-to-have - workaround via reassignment exists |
| FR-8.6 | Time-in-Stage Calculation | Enhancement - can calculate manually from timestamps |
| FR-8.7 | Compliance Officer Supervisor CTR Dashboard | Secondary dashboard - not needed for core workflow |
| FR-8.8 | Head of Analysis STR Dashboard | Secondary dashboard - not needed for core workflow |
| FR-8.9 | Automated Reminders | Enhancement - manual monitoring sufficient initially |
| FR-8.10 | Workflow Audit Reports | Enhancement - raw audit logs sufficient initially |
| FR-8.12 | Workflow Stage Visual Distinction | Polish - basic labels sufficient for MVP |
| FR-8.13 | Director of Operations Executive Dashboard | Secondary dashboard - executive oversight can use existing views |
| BR-8.5 | Return to Previous Stage Requirements | Supports deferred FR-8.3 |
| BR-8.8 | Time-in-Stage Calculation | Supports deferred FR-8.6 |
| BR-8.9 | Compliance Officer Supervisor Dashboard Access | Supports deferred FR-8.7 |
| BR-8.10 | Head of Analysis Dashboard Access | Supports deferred FR-8.8 |
| BR-8.11 | Automated Reminder Thresholds | Supports deferred FR-8.9 |
| BR-8.12 | Workflow Audit Report Content | Supports deferred FR-8.10 |
| BR-8.14 | Workflow Stage Visual Distinction | Supports deferred FR-8.12 |
| BR-8.15 | Executive Dashboard Metrics | Supports deferred FR-8.13 |
| ERR-WF-002 | Return Without Reason | Supports deferred FR-8.3 |
| ERR-WF-003 | Concurrent Stage Transition Conflict | Edge case - basic locking sufficient |
| ERR-WF-005 | Reminder Delivery Failure | Supports deferred FR-8.9 |
| ERR-WF-006 | Unauthorized Dashboard Access | Supports deferred dashboards |
| ERR-WF-009 | Assigned Officer Unavailable | Edge case - manual handling sufficient |
| ERR-WF-010 | Time Threshold Configuration Error | Supports deferred FR-8.9 |
| NFR-WF-PERF-2 | Dashboard Load Time | Supports deferred dashboards |
| NFR-WF-PERF-3 | Audit Report Generation Time | Supports deferred FR-8.10 |
| NFR-WF-PERF-4 | Time-in-Stage Calculation | Supports deferred FR-8.6 |
| NFR-WF-PERF-5 | Concurrent User Support | Scalability optimization |
| NFR-WF-SEC-1 | Role-Based Dashboard Access | Supports deferred dashboards |
| NFR-WF-SEC-4 | Audit Log Access Control | Enhancement - basic access sufficient |
| NFR-WF-REL-3 | Reminder Delivery Reliability | Supports deferred FR-8.9 |
| NFR-WF-REL-4 | Dashboard Data Consistency | Supports deferred dashboards |
| NFR-WF-USAB-1 through USAB-4 | Usability Requirements | Polish - basic usability sufficient |
| NFR-WF-COMPLY-2 | Audit Trail Retention | Can implement basic retention initially |
| NFR-WF-COMPLY-3 | Audit Support | Supports deferred FR-8.10 |
| NFR-WF-SCALE-1 through SCALE-3 | Scalability Requirements | Optimization for future growth |

### Purpose
Ensure regulatory compliance and operational consistency by enforcing structured report lifecycles and maintaining complete audit trails for all workflow transitions - the minimum required for FIA to process reports in compliance with AML/CFT regulations.

---

## 3. Essential Actors / Roles

### Actor 1: System Process
**Role Name:** Workflow Engine  
**Description:** Automated system processes that enforce workflow rules and maintain audit logs.  
**Core Capabilities (MVF):**
- Enforce sequential stage transitions within designated workflows
- Block invalid stage transitions (skipping stages)
- Record timestamps and responsible officers for each transition
- Route reports to appropriate workflow paths based on type
- Maintain immutable audit logs of all transitions

### Actor 2: Compliance Officer
**Role Name:** Compliance Officer  
**Description:** FIA compliance officer responsible for reviewing CTRs during the Compliance Review stage.  
**Core Capabilities (MVF):**
- View CTRs in Compliance Review stage with current workflow stage displayed
- Make CTR decisions (Archive, Monitor, Flag for Escalation)
- Progress CTRs through workflow stages

### Actor 3: Analyst
**Role Name:** Analyst  
**Description:** FIA analyst responsible for analyzing STRs and escalated CTRs through Analysis workflow stages.  
**Core Capabilities (MVF):**
- View assigned STRs and escalated CTRs with current workflow stage displayed
- Progress reports through Analysis workflow stages

---

## 4. Core Functional Requirements

### 4.1 Workflow Enforcement

**FR-8.1: Mandatory Sequential Workflow Enforcement**  
**Description:** The system shall enforce two mandatory sequential workflows:
- **CTR Workflow:** Submit → Automated Validation → Manual Validation (Compliance Officer) → Compliance Review → [Decision: Archive / Monitor / Escalate to Analysis]
  - If escalated, proceeds to Analysis workflow as "Escalated CTR"
- **STR/Escalated CTR Workflow:** Submit → Automated Validation → Manual Validation (Analyst) → Analyze → Approve → Case → Intelligence → Dissemination  
**Actor:** System Process  
**Traceability:** FRD FR-8.1, PRD FR-9.1  
**Business Rules:** BR-8.1, BR-8.2, BR-8.3  
**MVF Rationale:** Core functionality - the feature cannot exist without workflow enforcement. This is the primary value proposition.

**FR-8.2: Stage Skipping Prevention**  
**Description:** The system shall prevent reports from skipping stages within their designated workflow (e.g., cannot go from Validate directly to Analyze for STRs, cannot go from Compliance Review directly to Case for CTRs).  
**Actor:** System Process  
**Traceability:** FRD FR-8.2, PRD FR-9.2  
**Business Rules:** BR-8.4  
**MVF Rationale:** Prevents invalid states - without this, workflow enforcement is meaningless. Critical for regulatory compliance.

### 4.2 Stage Display and Tracking

**FR-8.4: Current Stage Display**  
**Description:** The system shall display the current workflow stage and workflow type (CTR path or STR path) for each report on all report views.  
**Actor:** System Process  
**Traceability:** FRD FR-8.4, PRD FR-9.4  
**Business Rules:** BR-8.6  
**MVF Rationale:** Users must know the current stage to take appropriate action. Feature is unusable without basic stage visibility.

**FR-8.5: Stage Transition Recording**  
**Description:** The system shall record timestamp and responsible officer for each stage transition in both workflows, creating an immutable audit record.  
**Actor:** System Process  
**Traceability:** FRD FR-8.5, PRD FR-9.5  
**Business Rules:** BR-8.7  
**MVF Rationale:** Compliance requirement - FATF Recommendation 29 mandates complete audit trails. Cannot be deferred.

### 4.3 Audit Trail

**FR-8.11: Audit Log Immutability**  
**Description:** The system shall prevent deletion or modification of stage transition logs, ensuring complete audit trail integrity.  
**Actor:** System Process  
**Traceability:** FRD FR-8.11, PRD FR-9.11  
**Business Rules:** BR-8.13  
**MVF Rationale:** Compliance requirement - audit logs must be tamper-proof for regulatory compliance. Legally mandatory.

---

## 5. Essential Business Rules

### BR-8.1: CTR Workflow Stages
**Rule Statement:** CTRs must follow the sequential workflow: Submit → Automated Validation → Manual Validation (Compliance Officer) → Compliance Review → [Archive / Monitor / Escalate]. No stages may be skipped, and CTRs cannot enter the Analysis workflow unless explicitly escalated.  
**Examples:**
- CTR submitted → must complete Automated Validation before Manual Validation
- CTR in Compliance Review → can only transition to Archive, Monitor, or Escalate to Analysis
- CTR cannot go directly from Manual Validation to Analyze stage  
**Traceability:** FRD BR-8.1  
**MVF Rationale:** Defines the core CTR workflow path - foundational requirement.

### BR-8.2: STR Workflow Stages
**Rule Statement:** STRs must follow the sequential workflow: Submit → Automated Validation → Manual Validation (Analyst) → Analyze → Approve → Case → Intelligence → Dissemination. No stages may be skipped.  
**Examples:**
- STR at Analyze stage → must complete Analyze before Approve
- STR cannot skip from Approve directly to Intelligence
- STR must complete all 8 stages to reach Dissemination  
**Traceability:** FRD BR-8.2  
**MVF Rationale:** Defines the core STR workflow path - foundational requirement.

### BR-8.3: Escalated CTR Workflow Transition
**Rule Statement:** When a CTR is escalated from Compliance Review, it transitions to "Escalated CTR" status and enters the Analysis workflow at the Analyze stage. The escalation point is permanently recorded in the audit trail.  
**Examples:**
- CTR escalated → becomes "Escalated CTR" → enters Analyze stage
- Escalated CTR follows Analysis workflow: Analyze → Approve → Case → Intelligence → Dissemination
- Audit trail shows: "Escalated by [Officer Name] on [Date]"  
**Traceability:** FRD BR-8.3  
**MVF Rationale:** Defines escalation behavior - critical business rule for CTR-to-Analysis transition.

### BR-8.4: Stage Skipping Prevention
**Rule Statement:** The system shall reject any attempt to transition a report to a non-adjacent stage in its workflow. Stage transitions are only valid between consecutive stages.  
**Examples:**
- Attempt to move STR from Validate to Case → REJECTED with error message
- Attempt to move CTR from Compliance Review to Approve → REJECTED  
**Traceability:** FRD BR-8.4  
**MVF Rationale:** Critical constraint that enforces workflow integrity.

### BR-8.6: Workflow Type Display
**Rule Statement:** Every report displayed must show its current workflow stage and workflow type label (CTR, STR, or Escalated CTR) in a consistent format.  
**Examples:**
- Report displays: "CTR-2026-001234 - Compliance Review"
- Report displays: "STR-2026-005678 - Analyze"
- Report displays: "ECTR-2026-001234 - Approve"  
**Traceability:** FRD BR-8.6  
**MVF Rationale:** Supports FR-8.4 - basic display requirement.

### BR-8.7: Stage Transition Recording
**Rule Statement:** Every stage transition must be recorded with: previous stage, new stage, timestamp (server time), responsible officer identity, and report reference number. Records are append-only and immutable.  
**Examples:**
- Log entry: `Report: FIA-2026-001234, From: Manual Validation, To: Compliance Review, Officer: Jane Doe, Timestamp: 2026-02-03T10:30:00Z`  
**Traceability:** FRD BR-8.7  
**MVF Rationale:** Critical for audit trail - compliance requirement.

### BR-8.13: Audit Log Immutability Enforcement
**Rule Statement:** Stage transition logs are append-only and cannot be modified, deleted, or overwritten by any user or system process.  
**Examples:**
- Attempt to delete transition log entry → DENIED, security event logged
- Attempt to modify timestamp in log entry → DENIED, security event logged  
**Traceability:** FRD BR-8.13  
**MVF Rationale:** Critical for compliance - tamper-proof audit trail required.

---

## 6. Critical Error & Exception Handling

### ERR-WF-001: Invalid Stage Transition Attempt
**Error Condition:** User or system attempts to transition a report to a stage that is not the valid next stage in the workflow sequence.  
**System Behavior:** System rejects the transition, maintains report in current stage, and logs the invalid transition attempt.  
**User Message:** "Invalid workflow transition. [Report Type] must complete [Current Stage] before proceeding to [Next Valid Stage]. Cannot skip to [Attempted Stage]."  
**Recovery Action:** User must complete the current stage requirements before attempting transition to the next valid stage.  
**Traceability:** FRD ERR-WF-001  
**MVF Rationale:** Prevents blocking errors - users must understand why transitions fail.

### ERR-WF-004: Audit Log Write Failure
**Error Condition:** System fails to write stage transition to audit log due to storage error or database failure.  
**System Behavior:** System rolls back the stage transition (transition does not occur if audit log cannot be written). Alert is sent to system administrators.  
**User Message:** "Unable to complete workflow transition due to system error. Please try again in a few moments."  
**Recovery Action:** User should retry the transition. If failure persists, system administrator must resolve the issue.  
**Traceability:** FRD ERR-WF-004  
**MVF Rationale:** Critical for data integrity - prevents transitions without audit trail.

### ERR-WF-007: Escalation of Non-CTR Report
**Error Condition:** User attempts to escalate a report that is not a CTR.  
**System Behavior:** System rejects the escalation action.  
**User Message:** "Only CTRs in Compliance Review stage can be escalated. This report is already in the Analysis workflow."  
**Recovery Action:** User should proceed with appropriate Analysis workflow actions.  
**Traceability:** FRD ERR-WF-007  
**MVF Rationale:** Prevents invalid workflow state - STRs cannot be escalated.

### ERR-WF-008: Un-escalation Attempt
**Error Condition:** User attempts to reverse an escalation decision.  
**System Behavior:** System blocks the action. Escalation is one-way and cannot be reversed.  
**User Message:** "Escalation cannot be reversed. Once escalated, CTRs must proceed through the Analysis workflow."  
**Recovery Action:** User must proceed with Analysis workflow.  
**Traceability:** FRD ERR-WF-008  
**MVF Rationale:** Critical business rule - escalation is permanent.

---

## 7. Minimal Non-Functional Requirements

### 7.1 Security Requirements

**NFR-WF-SEC-2: Stage Transition Authorization**  
**Description:** The system shall verify that users making stage transitions have appropriate permissions for the transition type and report type.  
**Measurement Criteria:** All stage transitions are authorized against user role. Unauthorized transition attempts are blocked and logged.  
**Traceability:** FRD NFR-WF-SEC-2  
**MVF Rationale:** Basic security - prevents unauthorized workflow modifications.

**NFR-WF-SEC-3: Audit Log Integrity**  
**Description:** The system shall maintain audit log integrity through append-only storage, preventing modification or deletion.  
**Measurement Criteria:** Audit logs cannot be modified or deleted. Tampering attempts are logged.  
**Traceability:** FRD NFR-WF-SEC-3  
**MVF Rationale:** Compliance requirement - audit trail must be tamper-proof.

### 7.2 Reliability Requirements

**NFR-WF-REL-1: Stage Transition Atomicity**  
**Description:** The system shall ensure stage transitions are atomic - either the complete transition succeeds (including audit log write) or the entire transition is rolled back.  
**Measurement Criteria:** No partial transitions occur. Failed transitions do not leave reports in inconsistent states.  
**Traceability:** FRD NFR-WF-REL-1  
**MVF Rationale:** Data integrity - prevents inconsistent workflow states.

**NFR-WF-REL-2: Audit Log Durability**  
**Description:** The system shall ensure audit log entries are durably persisted with zero data loss.  
**Measurement Criteria:** 100% of audit log entries are persisted to durable storage.  
**Traceability:** FRD NFR-WF-REL-2  
**MVF Rationale:** Compliance requirement - audit logs cannot be lost.

### 7.3 Compliance Requirements

**NFR-WF-COMPLY-1: FATF Audit Trail Compliance**  
**Description:** The system shall maintain audit trails that comply with FATF Recommendation 29 requirements for workflow tracking.  
**Measurement Criteria:** Audit trails capture all required fields per FATF guidelines.  
**Traceability:** FRD NFR-WF-COMPLY-1  
**MVF Rationale:** Legally mandatory - FIA must comply with FATF standards.

---

## 8. Acceptance Criteria (MVF)

**AC-MVF-1: STR Stage Skipping Prevention**  
Given a validated STR at Manual Validation (Analyst) stage, when a user attempts to move it directly to Case stage, then the system prevents the action and displays an error message.

**AC-MVF-2: CTR Routing to Compliance Review**  
Given a validated CTR that passes Manual Validation (Compliance Officer), when it enters the workflow, then the system routes it to Compliance Review stage (not directly to Analysis).

**AC-MVF-3: CTR Escalation Transition**  
Given a CTR at Compliance Review stage, when compliance officer selects "Escalate" and supervisor approves, then the CTR transitions to "Escalated CTR" status and enters the Analysis workflow at the Analyze stage.

**AC-MVF-4: Stage Transition Audit Logging**  
Given any stage transition, when the transition completes, then the system creates an immutable audit log entry with timestamp, officer identity, previous stage, and new stage.

**AC-MVF-5: Audit Log Immutability**  
Given any user including administrators, when attempting to modify or delete a stage transition log entry, then the system blocks the action.

**AC-MVF-6: Current Stage Display**  
Given any report in the system, when viewed by a user, then the system displays the current workflow stage and workflow type (CTR/STR/Escalated CTR).

---

## 9. What's Deferred

### Deferred Functional Requirements

| FR ID | Title | Reason |
|-------|-------|--------|
| FR-8.3 | Return to Previous Stage | Nice-to-have - workaround via reassignment |
| FR-8.6 | Time-in-Stage Calculation | Enhancement - can calculate manually |
| FR-8.7 | Compliance Officer Supervisor CTR Dashboard | Secondary dashboard |
| FR-8.8 | Head of Analysis STR Dashboard | Secondary dashboard |
| FR-8.9 | Automated Reminders | Enhancement - manual monitoring initially |
| FR-8.10 | Workflow Audit Reports | Enhancement - raw logs sufficient |
| FR-8.12 | Workflow Stage Visual Distinction | Polish/UX enhancement |
| FR-8.13 | Director of Operations Executive Dashboard | Secondary dashboard |

### Deferred Business Rules

| BR ID | Title | Reason |
|-------|-------|--------|
| BR-8.5 | Return to Previous Stage Requirements | Supports deferred FR-8.3 |
| BR-8.8 | Time-in-Stage Calculation | Supports deferred FR-8.6 |
| BR-8.9 | Compliance Officer Supervisor Dashboard Access | Supports deferred FR-8.7 |
| BR-8.10 | Head of Analysis Dashboard Access | Supports deferred FR-8.8 |
| BR-8.11 | Automated Reminder Thresholds | Supports deferred FR-8.9 |
| BR-8.12 | Workflow Audit Report Content | Supports deferred FR-8.10 |
| BR-8.14 | Workflow Stage Visual Distinction | Supports deferred FR-8.12 |
| BR-8.15 | Executive Dashboard Metrics | Supports deferred FR-8.13 |

### Deferred Error Handling

| ERR ID | Title | Reason |
|--------|-------|--------|
| ERR-WF-002 | Return Without Reason | Supports deferred FR-8.3 |
| ERR-WF-003 | Concurrent Stage Transition Conflict | Edge case - basic handling sufficient |
| ERR-WF-005 | Reminder Delivery Failure | Supports deferred FR-8.9 |
| ERR-WF-006 | Unauthorized Dashboard Access | Supports deferred dashboards |
| ERR-WF-009 | Assigned Officer Unavailable | Edge case - manual handling |
| ERR-WF-010 | Time Threshold Configuration Error | Supports deferred FR-8.9 |

### Deferred Non-Functional Requirements

| NFR ID | Title | Reason |
|--------|-------|--------|
| NFR-WF-PERF-1 | Stage Transition Processing Time | Performance optimization |
| NFR-WF-PERF-2 | Dashboard Load Time | Supports deferred dashboards |
| NFR-WF-PERF-3 | Audit Report Generation Time | Supports deferred FR-8.10 |
| NFR-WF-PERF-4 | Time-in-Stage Calculation | Supports deferred FR-8.6 |
| NFR-WF-PERF-5 | Concurrent User Support | Scalability optimization |
| NFR-WF-SEC-1 | Role-Based Dashboard Access | Supports deferred dashboards |
| NFR-WF-SEC-4 | Audit Log Access Control | Enhancement |
| NFR-WF-REL-3 | Reminder Delivery Reliability | Supports deferred FR-8.9 |
| NFR-WF-REL-4 | Dashboard Data Consistency | Supports deferred dashboards |
| NFR-WF-USAB-1 | Workflow Stage Clarity | Polish/UX enhancement |
| NFR-WF-USAB-2 | Transition Feedback | Polish/UX enhancement |
| NFR-WF-USAB-3 | Time-in-Stage Visibility | Supports deferred FR-8.6 |
| NFR-WF-USAB-4 | Error Message Clarity | Polish/UX enhancement |
| NFR-WF-COMPLY-2 | Audit Trail Retention | Can implement basic retention |
| NFR-WF-COMPLY-3 | Audit Support | Supports deferred FR-8.10 |
| NFR-WF-SCALE-1 | Report Volume Growth | Scalability optimization |
| NFR-WF-SCALE-2 | Audit Log Volume | Scalability optimization |
| NFR-WF-SCALE-3 | Dashboard Data Volume | Scalability optimization |

### Future Iteration Notes

**Iteration 2 Candidates:**
- FR-8.3 (Return to Previous Stage) - Adds flexibility for workflow corrections
- FR-8.6 (Time-in-Stage Calculation) - Enables performance monitoring

**Iteration 3 Candidates:**
- FR-8.7, FR-8.8 (Supervisor Dashboards) - Enables supervisory oversight
- FR-8.9 (Automated Reminders) - Reduces manual monitoring burden

**Iteration 4 Candidates:**
- FR-8.10 (Workflow Audit Reports) - Formatted reports for audits
- FR-8.12 (Visual Distinction) - Enhanced UX
- FR-8.13 (Executive Dashboard) - Executive visibility

**Dependencies:**
- Dashboards (FR-8.7, FR-8.8, FR-8.13) depend on FR-8.6 for time-in-stage metrics
- Automated reminders (FR-8.9) depends on FR-8.6 for threshold calculations
- Audit reports (FR-8.10) can be built on top of core audit logging (FR-8.5, FR-8.11)

**Risks of Deferral:**
- No automated reminders may lead to reports "falling through cracks" - mitigate with manual daily review process
- No supervisor dashboards requires supervisors to use individual report views - mitigate with training
- No time-in-stage calculation makes performance monitoring manual - acceptable for initial deployment

---

## 10. Glossary

**Workflow Stage:** A defined step in the report lifecycle that must be completed before proceeding to the next stage.

**CTR (Currency Transaction Report):** A report filed for large cash transactions. CTRs follow the Compliance workflow path.

**STR (Suspicious Transaction Report):** A report filed for suspicious transactions. STRs follow the Analysis workflow path.

**Escalated CTR:** A CTR promoted from Compliance workflow to Analysis workflow due to suspicious patterns.

**Stage Transition:** The movement of a report from one workflow stage to the next, recorded in the audit log.

**Audit Trail:** The immutable log of all workflow actions including stage transitions and escalations.

---

## 11. Traceability Matrix

| MVF Requirement | FRD Source | PRD Source | Acceptance Criteria |
|-----------------|------------|------------|---------------------|
| FR-8.1 | FRD FR-8.1 | PRD FR-9.1 | AC-MVF-2, AC-MVF-3 |
| FR-8.2 | FRD FR-8.2 | PRD FR-9.2 | AC-MVF-1 |
| FR-8.4 | FRD FR-8.4 | PRD FR-9.4 | AC-MVF-6 |
| FR-8.5 | FRD FR-8.5 | PRD FR-9.5 | AC-MVF-4 |
| FR-8.11 | FRD FR-8.11 | PRD FR-9.11 | AC-MVF-5 |
| BR-8.1 | FRD BR-8.1 | - | AC-MVF-2 |
| BR-8.2 | FRD BR-8.2 | - | AC-MVF-1 |
| BR-8.3 | FRD BR-8.3 | - | AC-MVF-3 |
| BR-8.4 | FRD BR-8.4 | - | AC-MVF-1 |
| BR-8.6 | FRD BR-8.6 | - | AC-MVF-6 |
| BR-8.7 | FRD BR-8.7 | - | AC-MVF-4 |
| BR-8.13 | FRD BR-8.13 | - | AC-MVF-5 |

---

## 12. Approval

**Prepared by:** Senior Product Manager  
**Reviewed by:** [To be filled]  
**Approved by:** [To be filled]  
**Date:** [To be filled]

---

## 13. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | February 2026 | Senior Product Manager | Initial MVF created based on FRD v1.0 |

---

**Document End**
