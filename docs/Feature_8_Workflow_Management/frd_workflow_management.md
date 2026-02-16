# Feature Requirements Document (FRD)
## Feature 8: Workflow Management

**Document Version:** 1.0  
**Date:** February 2026  
**Source:** PRD v1.0  
**Feature ID:** FR-8  
**Phase:** Phase 1 - Foundation  
**Status:** Draft  
**Related PRD Version:** 1.0

---

## 1. Document Header

**Document Title:** Feature Requirements Document  
**Feature/Product Name:** Workflow Management  
**Version:** 1.0  
**Author:** Senior Business Analyst  
**Related PRD Version:** 1.0  
**Status:** Draft  
**Last Updated Date:** February 2026

---

## 2. Scope & Feature Context

### Feature Name
Workflow Management

### Description
The Workflow Management feature enforces structured lifecycles for Currency Transaction Reports (CTRs) and Suspicious Transaction Reports (STRs) from submission to completion. It ensures regulatory processes are followed consistently by enforcing sequential stage transitions, maintaining complete audit trails, providing workflow visibility across dashboards, and enabling performance monitoring through time-in-stage tracking.

### In Scope
- Enforcement of two mandatory sequential workflows (CTR path and STR/Escalated CTR path)
- Prevention of stage skipping within designated workflows
- Support for returning reports to previous stages with documented reasoning
- Display of current workflow stage and workflow type on all dashboards
- Recording of timestamps and responsible officers for each stage transition
- Calculation and display of time spent in each workflow stage
- Stage-specific dashboards for Compliance Officer Supervisors and Head of Analysis
- Automated reminders for reports exceeding time thresholds
- Immutable audit trail for all stage transitions
- Workflow audit reports showing complete lifecycle history
- Executive dashboard for Director of Operations showing unified workflow metrics
- Clear visual distinction between CTR and STR workflow stages

### Out of Scope
- Report submission functionality (covered in Feature 2: Digital Report Submission Portal and Feature 3: API Report Submission)
- Automated validation logic (covered in Feature 4: Automated Validation Engine)
- Manual validation decisions (covered in Feature 5: Manual Validation Workflow)
- Task assignment and workload distribution (covered in Feature 6: Task Assignment & Workload Distribution)
- Alert generation and rule-based analysis (covered in Feature 7: Rule-Based Analysis & Alert Generation)
- Case management and intelligence report creation (covered in Phase 2 features)
- Workflow configuration or customization by end users

### Purpose
Ensure regulatory compliance and operational consistency by enforcing structured report lifecycles, maintaining complete audit trails for all workflow transitions, and providing visibility into workflow progress for supervisors and executives to monitor performance and identify bottlenecks.

---

## 3. Actors / Roles

### Actor 1: System Process
**Role Name:** Workflow Engine  
**Description:** Automated system processes that enforce workflow rules, manage stage transitions, send reminders, and maintain audit logs. The workflow engine is the primary actor responsible for enforcing sequential workflow requirements.  
**Capabilities:**
- Enforce sequential stage transitions within designated workflows
- Block invalid stage transitions (skipping stages)
- Record timestamps and responsible officers for each transition
- Calculate time spent in each workflow stage
- Send automated reminders for overdue reports
- Maintain immutable audit logs of all transitions
- Route reports to appropriate workflow paths based on type

### Actor 2: Compliance Officer
**Role Name:** Compliance Officer  
**Description:** FIA compliance officer responsible for reviewing CTRs during the Compliance Review stage. Compliance officers make decisions on CTRs (Archive, Monitor, or recommend Escalation).  
**Capabilities:**
- View CTRs in Compliance Review stage
- Make CTR decisions (Archive, Monitor, Flag for Escalation)
- View workflow stage and time-in-stage for assigned CTRs
- Receive automated reminders for overdue CTRs

### Actor 3: Compliance Officer Supervisor
**Role Name:** Compliance Officer Supervisor  
**Description:** FIA supervisor responsible for overseeing CTR workflow, reviewing escalation recommendations, and monitoring compliance team performance.  
**Capabilities:**
- View all CTRs at each CTR workflow stage simultaneously
- Review and approve/reject escalation recommendations
- View CTR workflow performance metrics
- Monitor time-in-stage for all CTRs in compliance workflow

### Actor 4: Analyst
**Role Name:** Analyst  
**Description:** FIA analyst responsible for analyzing STRs and escalated CTRs through the Analysis workflow stages (Analyze, Approve, Case, Intelligence, Dissemination).  
**Capabilities:**
- View assigned STRs and escalated CTRs
- Progress reports through Analysis workflow stages
- Return reports to previous stages with documented reasoning
- View workflow stage and time-in-stage for assigned reports

### Actor 5: Head of Analysis
**Role Name:** Head of Analysis  
**Description:** FIA supervisor responsible for overseeing the Analysis workflow, managing analyst assignments, and monitoring analysis team performance.  
**Capabilities:**
- View all STRs and escalated CTRs at each Analysis workflow stage simultaneously
- Monitor time-in-stage for all reports in Analysis workflow
- View Analysis workflow performance metrics
- Receive escalated CTRs from Compliance workflow

### Actor 6: Director of Operations
**Role Name:** Director of Operations  
**Description:** FIA executive responsible for overall operational oversight of both CTR and STR workflows, requiring unified visibility across all workflow paths.  
**Capabilities:**
- View reports across both CTR and STR workflows in unified executive dashboard
- Access combined workflow metrics (CTR compliance + STR analysis)
- View escalation rates, processing times, and case opening rates
- Monitor overall workflow health and identify bottlenecks

### Actor 7: Manual Validation Reviewers
**Role Name:** Compliance Officer (for CTRs), Analyst (for STRs)  
**Description:** FIA staff members who perform manual validation. Compliance Officers validate CTRs; Analysts validate STRs.  
**Capabilities:**
- View reports in Manual Validation stage (Compliance Officers see CTRs, Analysts see STRs)
- Complete validation and progress reports to next workflow stage
- Reports progress to Compliance Review (CTRs) or Analyze (STRs) based on type

---

## 4. Functional Requirements

### 4.1 Workflow Enforcement

**FR-8.1: Mandatory Sequential Workflow Enforcement**  
**Description:** The system shall enforce two mandatory sequential workflows:
- **CTR Workflow:** Submit → Automated Validation → Manual Validation (Compliance Officer) → Compliance Review → [Decision: Archive / Monitor / Escalate to Analysis]
  - If escalated, proceeds to Analysis workflow as "Escalated CTR"
- **STR/Escalated CTR Workflow:** Submit → Automated Validation → Manual Validation (Analyst) → Analyze → Approve → Case → Intelligence → Dissemination  
**Actor:** System Process  
**Traceability:** PRD FR-9.1  
**Business Rules:** BR-8.1, BR-8.2, BR-8.3

**FR-8.2: Stage Skipping Prevention**  
**Description:** The system shall prevent reports from skipping stages within their designated workflow (e.g., cannot go from Validate directly to Analyze for STRs, cannot go from Compliance Review directly to Case for CTRs).  
**Actor:** System Process  
**Traceability:** PRD FR-9.2  
**Business Rules:** BR-8.4

**FR-8.3: Return to Previous Stage**  
**Description:** The system shall allow reports to return to previous stages when returned for additional work (e.g., Approve stage returns to Analyze), with mandatory documented reasoning for the return.  
**Actor:** Analyst, Compliance Officer Supervisor, Head of Analysis  
**Traceability:** PRD FR-9.3  
**Business Rules:** BR-8.5

### 4.2 Stage Display and Tracking

**FR-8.4: Current Stage Display**  
**Description:** The system shall display the current workflow stage and workflow type (CTR path or STR path) for each report on all dashboards and report views.  
**Actor:** System Process  
**Traceability:** PRD FR-9.4  
**Business Rules:** BR-8.6

**FR-8.5: Stage Transition Recording**  
**Description:** The system shall record timestamp and responsible officer for each stage transition in both workflows, creating an immutable audit record.  
**Actor:** System Process  
**Traceability:** PRD FR-9.5  
**Business Rules:** BR-8.7

**FR-8.6: Time-in-Stage Calculation**  
**Description:** The system shall calculate and display time spent in each workflow stage for performance monitoring, separated by workflow type (CTR vs STR/Escalated CTR).  
**Actor:** System Process  
**Traceability:** PRD FR-9.6  
**Business Rules:** BR-8.8

### 4.3 Dashboard and Visibility

**FR-8.7: Compliance Officer Supervisor CTR Dashboard**  
**Description:** The system shall allow Compliance Officer Supervisors to view all CTRs at each CTR workflow stage simultaneously, providing complete visibility into the compliance workflow pipeline.  
**Actor:** Compliance Officer Supervisor  
**Traceability:** PRD FR-9.7  
**Business Rules:** BR-8.9

**FR-8.8: Head of Analysis STR Dashboard**  
**Description:** The system shall allow Head of Analysis to view all STRs and escalated CTRs at each Analysis workflow stage simultaneously, providing complete visibility into the analysis workflow pipeline.  
**Actor:** Head of Analysis  
**Traceability:** PRD FR-9.8  
**Business Rules:** BR-8.10

**FR-8.9: Automated Reminders**  
**Description:** The system shall send automated reminders when reports remain in a stage beyond defined time thresholds (e.g., >5 days in Compliance Review for CTRs, >7 days in Analyze for STRs).  
**Actor:** System Process  
**Traceability:** PRD FR-9.9  
**Business Rules:** BR-8.11

### 4.4 Audit and Reporting

**FR-8.10: Workflow Audit Reports**  
**Description:** The system shall generate workflow audit reports showing complete lifecycle history for any report, including workflow transitions between CTR and STR paths (for escalated CTRs).  
**Actor:** System Process  
**Traceability:** PRD FR-9.10  
**Business Rules:** BR-8.12

**FR-8.11: Audit Log Immutability**  
**Description:** The system shall prevent deletion or modification of stage transition logs, ensuring complete audit trail integrity.  
**Actor:** System Process  
**Traceability:** PRD FR-9.11  
**Business Rules:** BR-8.13

**FR-8.12: Workflow Stage Visual Distinction**  
**Description:** The system shall clearly distinguish CTR workflow stages (Compliance Review, Archive/Monitor/Escalate Decision) from STR/Analysis workflow stages (Analyze, Approve, Case, Intelligence, Dissemination) in all interfaces using visual indicators, labels, and color coding.  
**Actor:** System Process  
**Traceability:** PRD FR-9.12  
**Business Rules:** BR-8.14

### 4.5 Executive Dashboard

**FR-8.13: Director of Operations Executive Dashboard**  
**Description:** The system shall allow Director of Operations to view reports across both CTR and STR workflows in a unified executive dashboard, displaying combined metrics including:
- CTR processing metrics (escalation rate, average compliance review time)
- STR processing metrics (case opening rate, average analysis time)
- Overall processing time and total intelligence disseminated  
**Actor:** Director of Operations  
**Traceability:** PRD FR-9.13  
**Business Rules:** BR-8.15

---

## 5. Business Rules

### BR-8.1: CTR Workflow Stages
**Rule Statement:** CTRs must follow the sequential workflow: Submit → Automated Validation → Manual Validation (Compliance Officer) → Compliance Review → [Archive / Monitor / Escalate]. No stages may be skipped, and CTRs cannot enter the Analysis workflow unless explicitly escalated.  
**Examples:**
- CTR submitted → must complete Automated Validation before Manual Validation (Compliance Officer)
- CTR in Compliance Review → can only transition to Archive, Monitor, or Escalate to Analysis
- CTR cannot go directly from Manual Validation to Analyze stage

### BR-8.2: STR Workflow Stages
**Rule Statement:** STRs must follow the sequential workflow: Submit → Automated Validation → Manual Validation (Analyst) → Analyze → Approve → Case → Intelligence → Dissemination. No stages may be skipped.  
**Examples:**
- STR at Analyze stage → must complete Analyze before Approve
- STR cannot skip from Approve directly to Intelligence
- STR must complete all 8 stages to reach Dissemination

### BR-8.3: Escalated CTR Workflow Transition
**Rule Statement:** When a CTR is escalated from Compliance Review, it transitions to "Escalated CTR" status and enters the Analysis workflow at the Analyze stage. The escalation point is permanently recorded in the audit trail with the escalating officer's identity and timestamp.  
**Examples:**
- CTR escalated on 2026-02-15 by Compliance Officer Supervisor → becomes "Escalated CTR" → enters Analyze stage
- Escalated CTR follows remaining Analysis workflow stages: Analyze → Approve → Case → Intelligence → Dissemination
- Audit trail shows: "Escalated by [Officer Name] on [Date], Reason: [Justification]"

### BR-8.4: Stage Skipping Prevention
**Rule Statement:** The system shall reject any attempt to transition a report to a non-adjacent stage in its workflow. Stage transitions are only valid between consecutive stages or when returning to a previous stage with documented reasoning.  
**Examples:**
- Attempt to move STR from Validate to Case → REJECTED with error message
- Attempt to move CTR from Compliance Review to Approve → REJECTED (CTR cannot enter Analysis stages without escalation)
- Return from Approve to Analyze → ALLOWED with mandatory reason

### BR-8.5: Return to Previous Stage Requirements
**Rule Statement:** When a report is returned to a previous stage, the system shall require documented reasoning, notify the originally assigned officer, preserve time-in-stage calculations for both the current and returned-to stages, and create an audit log entry for the return action.  
**Examples:**
- Supervisor returns STR from Approve to Analyze with reason "Need additional bank records" → Analyst notified → Return logged
- Time spent in Approve stage is calculated and recorded before return
- Return action appears in workflow history with timestamp, officer, and reason

### BR-8.6: Workflow Type Display
**Rule Statement:** Every report displayed in any dashboard or view must show its current workflow stage and workflow type label (CTR, STR, or Escalated CTR) in a consistent format.  
**Examples:**
- Report list displays: "CTR-2026-001234 - Compliance Review"
- Report list displays: "STR-2026-005678 - Analyze"
- Report list displays: "ECTR-2026-001234 - Approve" (Escalated CTR)

### BR-8.7: Stage Transition Recording
**Rule Statement:** Every stage transition must be recorded with: previous stage, new stage, timestamp (server time), responsible officer identity, transition reason (if applicable), and report reference number. Records are append-only and immutable.  
**Examples:**
- Log entry: `Report: FIA-2026-001234, From: Manual Validation, To: Compliance Review, Officer: Jane Doe, Timestamp: 2026-02-03T10:30:00Z`
- Log entry: `Report: FIA-2026-005678, From: Approve, To: Analyze (Return), Officer: John Smith, Reason: "Missing documentation", Timestamp: 2026-02-03T14:15:00Z`

### BR-8.8: Time-in-Stage Calculation
**Rule Statement:** Time-in-stage is calculated from the moment a report enters a stage until it exits (either forward or return). Time is calculated and stored in minutes. Reports that return to a stage accumulate additional time separately (Iteration 1, Iteration 2, etc.).  
**Examples:**
- CTR enters Compliance Review at 10:00 AM, exits at 2:00 PM same day → 240 minutes in stage
- STR returned from Approve to Analyze → Time in Approve (Iteration 1): 180 minutes
- STR later returns again from Approve to Analyze → Time in Approve (Iteration 2) tracked separately

### BR-8.9: Compliance Officer Supervisor Dashboard Access
**Rule Statement:** Compliance Officer Supervisors shall have read access to all CTRs in the CTR workflow pipeline. Dashboard displays CTRs grouped by stage with counts and time-in-stage indicators.  
**Examples:**
- Dashboard shows: "Manual Validation: 5 CTRs, Compliance Review: 12 CTRs, Pending Escalation Decision: 3 CTRs"
- Each CTR shows time-in-current-stage with color coding (green < 3 days, yellow 3-5 days, red > 5 days)

### BR-8.10: Head of Analysis Dashboard Access
**Rule Statement:** Head of Analysis shall have read access to all STRs and escalated CTRs in the Analysis workflow pipeline. Dashboard displays reports grouped by stage with counts and time-in-stage indicators.  
**Examples:**
- Dashboard shows: "Analyze: 8 reports, Approve: 4 reports, Case: 6 reports, Intelligence: 2 reports, Dissemination: 1 report"
- Reports are labeled as either "STR" or "Escalated CTR" with distinct visual indicators

### BR-8.11: Automated Reminder Thresholds
**Rule Statement:** The system shall send automated reminder notifications when reports exceed configured time thresholds in a stage. Default thresholds: CTR Compliance Review > 5 days, STR/Escalated CTR Analyze > 7 days, all other stages > 3 days. Reminders are sent to the assigned officer and their supervisor.  
**Examples:**
- CTR in Compliance Review for 6 days → Compliance Officer receives reminder notification
- STR in Analyze for 8 days → Analyst and Head of Analysis receive reminder notifications
- Reminders include report reference, current stage, and time-in-stage

### BR-8.12: Workflow Audit Report Content
**Rule Statement:** Workflow audit reports must include complete lifecycle history showing: all stage transitions with timestamps, responsible officers at each stage, time spent in each stage, any return actions with reasons, and for escalated CTRs, a clear marker showing the transition from CTR workflow to Analysis workflow.  
**Examples:**
- Audit report for archived CTR shows: Submit (Entity A, 2026-02-01) → Auto-Validate (System, 2026-02-01) → Manual Validate (Compliance Officer B, 2026-02-02) → Compliance Review (Officer C, 2026-02-05) → Archived (Officer C, 2026-02-05)
- Audit report for escalated CTR shows CTR workflow stages, then "=== ESCALATED ON 2026-02-10 ===" marker, then Analysis workflow stages

### BR-8.13: Audit Log Immutability Enforcement
**Rule Statement:** Stage transition logs are append-only and cannot be modified, deleted, or overwritten by any user or system process. Logs are stored with cryptographic integrity verification.  
**Examples:**
- Attempt to delete transition log entry → DENIED, security event logged
- Attempt to modify timestamp in log entry → DENIED, security event logged
- Log integrity can be verified through checksums at any time

### BR-8.14: Workflow Stage Visual Distinction
**Rule Statement:** CTR workflow stages and STR/Analysis workflow stages must be visually distinguished in all interfaces using: different color schemes (CTR = blue tones, STR/Analysis = green tones), distinct stage labels, and workflow type badges.  
**Examples:**
- CTR in Compliance Review shows blue badge "CTR - Compliance Review"
- STR in Analyze shows green badge "STR - Analyze"
- Escalated CTR in Approve shows combined badge "Escalated CTR - Approve" with distinct styling

### BR-8.15: Executive Dashboard Metrics
**Rule Statement:** The Director of Operations executive dashboard must display real-time metrics for both workflows including: total reports in each workflow, percentage distribution across stages, average time-in-stage by workflow type, escalation rate (CTRs escalated / total CTRs), case opening rate (reports reaching Case stage / total STRs), and total intelligence disseminated.  
**Examples:**
- CTR Metrics: 100 total, 45% Compliance Review, 40% Archived, 10% Monitored, 5% Escalated
- STR Metrics: 50 total + 5 Escalated CTRs, avg. Analyze time: 4.2 days, case opening rate: 60%
- Combined: 150 total reports processed, 10 intelligence reports disseminated this month

---

## 6. Error & Exception Handling

### ERR-WF-001: Invalid Stage Transition Attempt
**Error Condition:** User or system attempts to transition a report to a stage that is not the valid next stage in the workflow sequence.  
**System Behavior:** System rejects the transition, maintains report in current stage, and logs the invalid transition attempt including user identity, attempted transition, and timestamp.  
**User Message:** "Invalid workflow transition. [Report Type] must complete [Current Stage] before proceeding to [Next Valid Stage]. Cannot skip to [Attempted Stage]."  
**Recovery Action:** User must complete the current stage requirements before attempting transition to the next valid stage.

### ERR-WF-002: Return Without Reason
**Error Condition:** User attempts to return a report to a previous stage without providing mandatory documented reasoning.  
**System Behavior:** System rejects the return action and displays error requiring reason. Report remains in current stage.  
**User Message:** "Return reason is mandatory. Please provide detailed justification for returning this report to [Previous Stage]."  
**Recovery Action:** User must enter a meaningful reason (minimum 20 characters) before the return can be processed.

### ERR-WF-003: Concurrent Stage Transition Conflict
**Error Condition:** Multiple users attempt to transition the same report simultaneously, or a user attempts to transition a report that is currently being modified by another user.  
**System Behavior:** System implements optimistic locking. First transition to complete succeeds; subsequent attempts receive conflict error. All attempts are logged.  
**User Message:** "This report has been modified by another user. Please refresh and review the current status before proceeding."  
**Recovery Action:** User must refresh the report view to see current state and re-evaluate action if still appropriate.

### ERR-WF-004: Audit Log Write Failure
**Error Condition:** System fails to write stage transition to audit log due to storage error, database failure, or other technical issue.  
**System Behavior:** System rolls back the stage transition (transition does not occur if audit log cannot be written). Alert is sent to system administrators. Retry mechanism attempts write up to 3 times.  
**User Message:** "Unable to complete workflow transition due to system error. Please try again in a few moments. If the issue persists, contact system support."  
**Recovery Action:** User should retry the transition. If failure persists, system administrator must resolve storage/database issue.

### ERR-WF-005: Reminder Delivery Failure
**Error Condition:** System fails to deliver automated reminder notification to user due to notification system failure or invalid user contact information.  
**System Behavior:** System logs the delivery failure and retries according to retry policy (3 retries with exponential backoff). Failed reminders are flagged for administrator review.  
**User Message:** (No user message - system-side error)  
**Recovery Action:** System retries automatically. System administrator reviews failed notifications and manually notifies users if necessary.

### ERR-WF-006: Unauthorized Dashboard Access
**Error Condition:** User attempts to access a workflow dashboard for which they do not have appropriate role permissions (e.g., Analyst attempts to access Compliance Officer Supervisor dashboard).  
**System Behavior:** System denies access and logs the unauthorized access attempt with user identity, attempted resource, and timestamp.  
**User Message:** "You do not have permission to access this dashboard. Please contact your supervisor if you believe this is an error."  
**Recovery Action:** User must contact system administrator to verify role permissions.

### ERR-WF-007: Escalation of Non-CTR Report
**Error Condition:** System or user attempts to escalate a report that is not a CTR (e.g., attempting to escalate an STR).  
**System Behavior:** System rejects the escalation action. STRs are already in the Analysis workflow and cannot be "escalated."  
**User Message:** "Only CTRs in Compliance Review stage can be escalated. This report is already in the Analysis workflow."  
**Recovery Action:** No action required. User should proceed with appropriate Analysis workflow actions for STRs.

### ERR-WF-008: Un-escalation Attempt
**Error Condition:** User attempts to reverse an escalation decision and return an Escalated CTR back to CTR status or Compliance Review stage.  
**System Behavior:** System blocks the action. Escalation is a one-way workflow transition that cannot be reversed. Attempt is logged in security audit log.  
**User Message:** "Escalation cannot be reversed. Once escalated, CTRs must proceed through the Analysis workflow. Please contact Head of Analysis for assistance."  
**Recovery Action:** User must proceed with Analysis workflow. If escalation was made in error, formal exception handling process must be followed with documented justification and executive approval.

### ERR-WF-009: Assigned Officer Unavailable
**Error Condition:** Report is assigned to an officer who is no longer active in the system (terminated, transferred, or account disabled).  
**System Behavior:** System flags the report as requiring reassignment and notifies the appropriate supervisor (Compliance Officer Supervisor for CTRs, Head of Analysis for STRs).  
**User Message:** (Supervisor notification) "Report [Reference] requires reassignment. Previously assigned officer [Name] is no longer active."  
**Recovery Action:** Supervisor must reassign the report to an active officer.

### ERR-WF-010: Time Threshold Configuration Error
**Error Condition:** Automated reminder system encounters invalid or missing time threshold configuration for a workflow stage.  
**System Behavior:** System uses default threshold (3 days) and logs configuration error for administrator review.  
**User Message:** (No user message - system-side error)  
**Recovery Action:** System administrator must review and correct time threshold configuration.

---

## 7. Non-Functional Requirements

### 7.1 Performance Requirements

**NFR-WF-PERF-1: Stage Transition Processing Time**  
**Description:** The system shall process stage transitions (including audit log write and notification triggers) within 2 seconds for 95% of transitions.  
**Measurement Criteria:** Time from transition request submission to confirmation display. 95th percentile processing time must be ≤ 2 seconds.  
**Traceability:** FR-8.1, FR-8.2, FR-8.5

**NFR-WF-PERF-2: Dashboard Load Time**  
**Description:** The system shall load workflow dashboards (Compliance Officer Supervisor, Head of Analysis, Director of Operations) within 3 seconds for 95% of requests.  
**Measurement Criteria:** Time from dashboard access request to full display with all report data and metrics. 95th percentile load time must be ≤ 3 seconds.  
**Traceability:** FR-8.7, FR-8.8, FR-8.13

**NFR-WF-PERF-3: Audit Report Generation Time**  
**Description:** The system shall generate workflow audit reports for individual reports within 5 seconds for 95% of requests.  
**Measurement Criteria:** Time from audit report request to complete report display. 95th percentile generation time must be ≤ 5 seconds.  
**Traceability:** FR-8.10

**NFR-WF-PERF-4: Time-in-Stage Calculation**  
**Description:** The system shall calculate and display time-in-stage metrics in real-time with accuracy within 1 minute of actual elapsed time.  
**Measurement Criteria:** Time-in-stage displays are updated within 1 minute of real elapsed time. Calculations are accurate to the minute.  
**Traceability:** FR-8.6

**NFR-WF-PERF-5: Concurrent User Support**  
**Description:** The system shall support up to 50 concurrent users accessing workflow dashboards and performing stage transitions without performance degradation.  
**Measurement Criteria:** System maintains performance targets (NFR-WF-PERF-1, NFR-WF-PERF-2) when 50 users access system simultaneously.  
**Traceability:** FR-8.7, FR-8.8, FR-8.13

### 7.2 Security Requirements

**NFR-WF-SEC-1: Role-Based Dashboard Access**  
**Description:** The system shall enforce role-based access control for workflow dashboards, ensuring users can only access dashboards appropriate to their role.  
**Measurement Criteria:** 100% of dashboard access attempts are validated against role permissions. Unauthorized access attempts are blocked and logged.  
**Traceability:** FR-8.7, FR-8.8, FR-8.13, ERR-WF-006

**NFR-WF-SEC-2: Stage Transition Authorization**  
**Description:** The system shall verify that users making stage transitions have appropriate permissions for the transition type and report type.  
**Measurement Criteria:** All stage transitions are authorized against user role and report ownership. Unauthorized transition attempts are blocked and logged.  
**Traceability:** FR-8.1, FR-8.2, FR-8.3

**NFR-WF-SEC-3: Audit Log Integrity**  
**Description:** The system shall maintain audit log integrity through cryptographic checksums or equivalent mechanisms, enabling verification that logs have not been tampered with.  
**Measurement Criteria:** Audit logs are cryptographically signed. Integrity can be verified at any time. Tampering attempts are detectable.  
**Traceability:** FR-8.11, BR-8.13

**NFR-WF-SEC-4: Audit Log Access Control**  
**Description:** The system shall restrict audit log access to authorized users only (supervisors, administrators, auditors). Audit logs cannot be modified or deleted by any user.  
**Measurement Criteria:** Audit log read access is role-restricted. Write operations (modification, deletion) are blocked for all users.  
**Traceability:** FR-8.11

### 7.3 Reliability Requirements

**NFR-WF-REL-1: Stage Transition Atomicity**  
**Description:** The system shall ensure stage transitions are atomic - either the complete transition succeeds (including audit log write and notifications) or the entire transition is rolled back.  
**Measurement Criteria:** No partial transitions occur. Failed transitions do not leave reports in inconsistent states.  
**Traceability:** FR-8.1, FR-8.5, ERR-WF-004

**NFR-WF-REL-2: Audit Log Durability**  
**Description:** The system shall ensure audit log entries are durably persisted with zero data loss. Audit logs must survive system failures and restarts.  
**Measurement Criteria:** 100% of audit log entries are persisted to durable storage. No log entries are lost during system failures or restarts.  
**Traceability:** FR-8.11, BR-8.13

**NFR-WF-REL-3: Reminder Delivery Reliability**  
**Description:** The system shall deliver automated reminder notifications with 99% success rate. Failed reminders shall be retried and escalated.  
**Measurement Criteria:** 99% of reminders are delivered within 5 minutes of trigger. Failed reminders are retried up to 3 times with exponential backoff.  
**Traceability:** FR-8.9, ERR-WF-005

**NFR-WF-REL-4: Dashboard Data Consistency**  
**Description:** The system shall ensure dashboard data is consistent with actual workflow state within 30 seconds of any stage transition.  
**Measurement Criteria:** Dashboard refreshes reflect stage transitions within 30 seconds. No stale data is displayed beyond 30-second threshold.  
**Traceability:** FR-8.7, FR-8.8, FR-8.13

### 7.4 Usability Requirements

**NFR-WF-USAB-1: Workflow Stage Clarity**  
**Description:** The system interface shall clearly display the current workflow stage, workflow type, and valid next actions for each report, enabling users to understand report status at a glance.  
**Measurement Criteria:** Users can identify report workflow stage and type within 2 seconds of viewing. Valid actions are clearly presented.  
**Traceability:** FR-8.4, FR-8.12

**NFR-WF-USAB-2: Transition Feedback**  
**Description:** The system shall provide immediate visual feedback when stage transitions are initiated, processing, completed, or failed.  
**Measurement Criteria:** Users receive feedback within 500ms of transition action. Success/failure status is clearly communicated.  
**Traceability:** FR-8.1, FR-8.2, FR-8.3

**NFR-WF-USAB-3: Time-in-Stage Visibility**  
**Description:** The system shall display time-in-stage using intuitive visual indicators (color coding, progress bars) that enable quick identification of overdue reports.  
**Measurement Criteria:** Overdue reports are visually distinguishable within 1 second of viewing. Color coding follows consistent scheme (green/yellow/red).  
**Traceability:** FR-8.6, BR-8.11

**NFR-WF-USAB-4: Error Message Clarity**  
**Description:** The system shall display workflow error messages in clear, non-technical language with specific guidance on resolution.  
**Measurement Criteria:** Error messages explain the issue and required action. Users can resolve most errors without support assistance.  
**Traceability:** Section 6 (Error & Exception Handling)

### 7.5 Compliance Requirements

**NFR-WF-COMPLY-1: FATF Audit Trail Compliance**  
**Description:** The system shall maintain audit trails that comply with FATF Recommendation 29 (Financial Intelligence Units) requirements for workflow tracking and reporting.  
**Measurement Criteria:** Audit trails capture all required fields per FATF guidelines. Compliance reports can be generated on demand.  
**Traceability:** FR-8.5, FR-8.10, FR-8.11

**NFR-WF-COMPLY-2: Audit Trail Retention**  
**Description:** The system shall retain workflow audit trails for minimum 10 years per Liberian AML/CFT regulations.  
**Measurement Criteria:** Audit logs are retained for 10 years minimum. Retention policies are enforced automatically. Logs remain accessible and queryable throughout retention period.  
**Traceability:** FR-8.11

**NFR-WF-COMPLY-3: Audit Support**  
**Description:** The system shall support internal and external audits with complete workflow reconstruction capability for any report.  
**Measurement Criteria:** Full workflow history can be reconstructed for any report. Audit reports include all transitions, timestamps, officers, and reasons.  
**Traceability:** FR-8.10

### 7.6 Scalability Requirements

**NFR-WF-SCALE-1: Report Volume Growth**  
**Description:** The system shall handle growth in report volume (up to 10x increase from baseline) without performance degradation.  
**Measurement Criteria:** System maintains performance targets when report volume increases 10x from baseline.  
**Traceability:** FR-8.1, FR-8.7, FR-8.8

**NFR-WF-SCALE-2: Audit Log Volume**  
**Description:** The system shall handle growth in audit log volume (estimated 10+ entries per report over lifecycle) without performance degradation in audit report generation or log querying.  
**Measurement Criteria:** Audit report generation and log queries maintain performance targets with 500,000+ audit log entries.  
**Traceability:** FR-8.10, FR-8.11

**NFR-WF-SCALE-3: Dashboard Data Volume**  
**Description:** The system shall display dashboards with up to 1,000 reports across all stages without performance degradation.  
**Measurement Criteria:** Dashboard load time targets are maintained with 1,000 reports displayed across workflow stages.  
**Traceability:** FR-8.7, FR-8.8, FR-8.13

---

## 8. Acceptance Criteria

**AC-8.1: STR Stage Skipping Prevention**  
Given a validated STR at Manual Validation stage, when a user attempts to move it directly to Case stage, then the system prevents the action and displays "Must complete Analyze and Approve stages first."

**AC-8.2: CTR Routing to Compliance Review**  
Given a validated CTR that passes Manual Validation (Compliance Officer), when it enters the workflow, then the system routes it to Compliance Review stage (not directly to Analysis).

**AC-8.3: CTR Escalation Transition**  
Given a CTR at Compliance Review stage, when compliance officer selects "Escalate" and supervisor approves, then the CTR transitions to "Escalated CTR" status and enters the Analysis workflow at the Analyze stage.

**AC-8.4: Return to Previous Stage**  
Given a report at Approve stage, when supervisor selects "Return to Analyst" with documented reason, then report moves back to Analyze stage and original analyst is notified.

**AC-8.5: CTR Workflow Audit Trail**  
Given a CTR completed through Archive decision, when viewing audit trail, then the system displays CTR workflow stages with timestamps, responsible officers, and final disposition (Archive/Monitor/Escalate).

**AC-8.6: Escalated CTR Complete Audit Trail**  
Given an escalated CTR that later becomes disseminated intelligence, when viewing complete audit trail, then the system shows both CTR workflow history AND subsequent Analysis workflow history with clear transition point marked "Escalated by [Officer Name] on [Date]."

**AC-8.7: Automated Reminder Delivery**  
Given a report in Compliance Review for 6 days (exceeding 5-day threshold), when daily reminder check runs, then compliance officer receives automated reminder notification.

**AC-8.8: Executive Dashboard Metrics**  
Given Director of Operations views executive dashboard, when accessing workflow summary, then dashboard displays both CTR processing metrics (escalation rate, avg compliance review time) and STR processing metrics (case opening rate, avg analysis time).

**AC-8.9: Audit Log Immutability**  
Given any user including administrators, when attempting to modify or delete a stage transition log entry, then the system blocks the action and logs a security event.

**AC-8.10: Time-in-Stage Display**  
Given a CTR in Compliance Review for 7 days and an STR in Analyze for 9 days, when viewing respective dashboards, then Compliance dashboard shows "7 days in Compliance Review" and Analysis dashboard shows "9 days in Analyze."

---

## 9. Glossary

**Workflow Stage:** A defined step in the report lifecycle that must be completed before proceeding to the next stage. Each stage has specific entry conditions, actions, and exit conditions.

**CTR (Currency Transaction Report):** A report filed for large cash transactions above a defined threshold, typically used for compliance monitoring. CTRs follow the Compliance workflow path.

**STR (Suspicious Transaction Report):** A report filed when a transaction appears suspicious and may indicate money laundering, terrorist financing, or other financial crimes. STRs follow the Analysis workflow path.

**Escalated CTR:** A CTR that has been promoted from the Compliance workflow to the Analysis workflow due to identified suspicious patterns or red flags. Escalated CTRs are treated similarly to STRs in the Analysis workflow.

**Compliance Workflow:** The workflow path for CTRs: Submit → Automated Validation → Manual Validation (Compliance Officer) → Compliance Review → [Archive / Monitor / Escalate]. Managed by Compliance Officers and Compliance Officer Supervisors.

**Analysis Workflow:** The workflow path for STRs and Escalated CTRs: Submit → Automated Validation → Manual Validation (Analyst) → Analyze → Approve → Case → Intelligence → Dissemination. Managed by Analysts and Head of Analysis.

**Stage Transition:** The movement of a report from one workflow stage to the next. Each transition is recorded in the audit log with timestamp and responsible officer.

**Time-in-Stage:** The elapsed time a report spends in a particular workflow stage, calculated from stage entry to stage exit. Used for performance monitoring and automated reminders.

**Return to Previous Stage:** A workflow action where a report is sent back to a prior stage for additional work, requiring documented reasoning. Time calculations account for multiple iterations.

**Audit Trail:** The immutable log of all workflow actions including stage transitions, return actions, escalations, and decisions. Used for compliance and internal/external audits.

**Escalation:** The process of promoting a CTR from Compliance workflow to Analysis workflow when suspicious patterns are identified during compliance review. Escalation requires documented justification.

**Archive:** A terminal disposition for CTRs where the report is retained for record-keeping but requires no further action.

**Monitor:** A disposition for CTRs where the report is flagged for ongoing observation but does not warrant immediate escalation.

**Dissemination:** The final stage in the Analysis workflow where intelligence reports are shared with law enforcement or other authorized recipients.

---

## 10. Open Issues & Decisions Pending

| Issue ID | Description | Impact | Assigned To | Target Date |
|----------|-------------|--------|-------------|-------------|
| ISS-WF-001 | Should escalated CTRs be returnable to Compliance workflow for additional context? Current design prevents this. | Affects BR-8.3, ERR-WF-008 | Head of Compliance, Product Manager | TBD |
| ISS-WF-002 | Define exact time thresholds for automated reminders by stage and workflow type | Affects FR-8.9, BR-8.11 | Operations Manager, Product Manager | TBD |
| ISS-WF-003 | Determine handling of reports assigned to officers who leave FIA mid-workflow | Affects ERR-WF-009 | HR, Director of Operations | TBD |
| ISS-WF-004 | Should "Monitor" CTRs have a follow-up workflow or timeout period? | Affects CTR workflow terminal states | Head of Compliance, Product Manager | TBD |
| ISS-WF-005 | Define color coding scheme for workflow stage visual distinction (CTR blue vs STR green proposed) | Affects BR-8.14, NFR-WF-USAB-1 | UX Designer, Product Manager | TBD |
| ISS-WF-006 | Determine if workflow stage changes require re-notification to reporting entities | Affects notification scope | Compliance Manager | TBD |

---

## 11. Related Features

- **Feature 2: Digital Report Submission Portal (Excel Upload)** - Upstream feature that creates reports which enter the workflow at Submit stage. Reports from Feature 2 trigger the workflow upon successful submission.

- **Feature 3: Digital Submission via API (goAML XML)** - Upstream feature that creates reports which enter the workflow at Submit stage. API submissions also trigger the workflow upon successful submission.

- **Feature 4: Automated Validation Engine** - Provides the Automated Validation stage in both workflows. Reports must pass automated validation before proceeding to Manual Validation.

- **Feature 5: Manual Validation Workflow** - Provides the Manual Validation stage in both workflows. Compliance Officers validate CTRs; Analysts validate STRs. Manual validation must complete before reports proceed to Compliance Review (CTRs) or Analyze (STRs).

- **Feature 6: Task Assignment & Workload Distribution** - Manages assignment of reports to officers at various workflow stages. Task assignment integrates with workflow stage transitions.

- **Feature 7: Rule-Based Analysis & Alert Generation** - Generates alerts that may influence workflow decisions (e.g., high-risk alerts may prompt escalation). Alert information is visible during workflow stages.

- **Phase 2: Case Management** - Downstream functionality that handles Case and Intelligence stages in the Analysis workflow. This FRD defines the workflow stages; Phase 2 defines the detailed functionality.

---

## 12. Traceability Matrix

| FRD Requirement | PRD Source | Acceptance Criteria | Business Rules |
|----------------|------------|-------------------|----------------|
| FR-8.1 | PRD FR-9.1 | AC-8.2, AC-8.3 | BR-8.1, BR-8.2, BR-8.3 |
| FR-8.2 | PRD FR-9.2 | AC-8.1 | BR-8.4 |
| FR-8.3 | PRD FR-9.3 | AC-8.4 | BR-8.5 |
| FR-8.4 | PRD FR-9.4 | - | BR-8.6 |
| FR-8.5 | PRD FR-9.5 | AC-8.5, AC-8.6 | BR-8.7 |
| FR-8.6 | PRD FR-9.6 | AC-8.10 | BR-8.8 |
| FR-8.7 | PRD FR-9.7 | - | BR-8.9 |
| FR-8.8 | PRD FR-9.8 | - | BR-8.10 |
| FR-8.9 | PRD FR-9.9 | AC-8.7 | BR-8.11 |
| FR-8.10 | PRD FR-9.10 | AC-8.5, AC-8.6 | BR-8.12 |
| FR-8.11 | PRD FR-9.11 | AC-8.9 | BR-8.13 |
| FR-8.12 | PRD FR-9.12 | - | BR-8.14 |
| FR-8.13 | PRD FR-9.13 | AC-8.8 | BR-8.15 |

---

## 13. Approval

**Prepared by:** Senior Business Analyst  
**Reviewed by:** [To be filled]  
**Approved by:** [To be filled]  
**Date:** [To be filled]

---

## 14. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | February 2026 | Senior Business Analyst | Initial FRD created based on PRD v1.0 Feature 9: Workflow Management |

---

**Document End**
