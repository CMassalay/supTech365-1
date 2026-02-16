# Feature Requirements Document (FRD)
## Feature 6: Task Assignment and Workload Distribution

**Document Version:** 1.0  
**Date:** February 2026  
**Source:** PRD v1.0  
**Feature ID:** FR-6  
**Phase:** Phase 1 - Foundation (Months 6-7)
**Status:** Draft  
**Related PRD Version:** 1.0

---

## 1. Document Header

**Document Title:** Feature Requirements Document  
**Feature/Product Name:** Task Assignment and Workload Distribution  
**Version:** 1.0  
**Author:** Senior Business Analyst  
**Related PRD Version:** 1.0  
**Status:** Draft  
**Last Updated Date:** February 2026

---

## 2. Scope & Feature Context

### Feature Name
Task Assignment and Workload Distribution

### Description
The Task Assignment and Workload Distribution feature enables supervisors and department heads to assign validated reports (CTRs and STRs) to compliance officers and analysts, monitor workload distribution across teams, and ensure balanced task allocation. The system supports both manual assignment and automated assignment based on lowest workload, with separate workflows for compliance (CTR) and analysis (STR/escalated CTR) departments.

### In Scope
- Manual assignment of validated CTRs to compliance officers by Compliance Officer Supervisors and Head of Compliance
- Manual assignment of validated STRs and escalated CTRs to analysts by Head of Analysis
- Auto-assignment functionality based on lowest current workload for both CTR and STR workflows
- Workload count display for compliance officers (assigned CTRs) and analysts (assigned STRs, escalated CTRs, and active cases)
- Reassignment of reports between officers/analysts with documented reasons
- Immediate notification to officers and analysts when reports are assigned
- Access control preventing officers/analysts from accessing reports not assigned to them
- Time tracking from assignment to completion for performance metrics
- Separate dashboards for compliance and analysis departments showing assignments, status, and age
- Overdue flagging for reports assigned more than 10 days without status change
- Cross-department visibility for Director of Operations showing combined workload
- Deadline assignment and tracking for assigned reports

### Out of Scope
- Report validation workflows (covered in Feature 3: Manual Validation Workflow)
- CTR escalation decision-making (covered in Feature 5: CTR Escalation Workflow)
- Case creation and management (covered in Feature 9: Workflow Management)
- Performance review and evaluation systems
- Automated workload balancing algorithms beyond lowest workload assignment
- Real-time collaboration features for shared report review
- Mobile application support for assignment management

### Purpose
Enable efficient and balanced distribution of report processing tasks across compliance and analysis teams, ensuring no individual is overwhelmed while maintaining accountability, visibility, and performance tracking. The feature supports FIA's operational efficiency goals by reducing manual coordination overhead and providing supervisors with real-time workload visibility for informed decision-making.

---

## 3. Actors / Roles

### Actor 1: Compliance Officer Supervisor
**Role Name:** Compliance Officer Supervisor  
**Description:** Supervisory staff within the compliance department responsible for managing a team of compliance officers and assigning CTRs to officers within their team.  
**Capabilities:**
- Manually assign validated CTRs to compliance officers within their team
- View workload counts for compliance officers in their team
- Reassign CTRs between officers within their team with documented reasons
- View compliance dashboard showing CTR assignments, status, and age
- Set deadlines for assigned CTRs
- Use auto-assignment for CTRs within their team

### Actor 2: Head of Compliance
**Role Name:** Head of Compliance  
**Description:** Department head responsible for overall compliance operations, including cross-team workload balancing and escalation decisions.  
**Capabilities:**
- Manually assign validated CTRs to compliance officers across all teams
- Reassign CTRs across different supervisor teams when workload balancing is needed
- View compliance dashboard showing all CTR assignments across all teams
- View workload distribution across all compliance officer supervisors' teams
- Set deadlines for assigned CTRs
- Use auto-assignment for CTRs across all teams

### Actor 3: Head of Analysis
**Role Name:** Head of Analysis  
**Description:** Department head responsible for managing the analysis team and assigning STRs and escalated CTRs to analysts.  
**Capabilities:**
- Manually assign validated STRs and escalated CTRs to analysts
- View workload counts for all analysts (including STRs, escalated CTRs, and active cases)
- Reassign reports between analysts with documented reasons
- View analysis dashboard showing all STR/escalated CTR assignments, status, and age
- Set deadlines for assigned reports
- Use auto-assignment for STRs and escalated CTRs

### Actor 4: Director of Operations
**Role Name:** Director of Operations  
**Description:** Executive role with oversight across both compliance and analysis departments.  
**Capabilities:**
- View combined workload dashboard showing both compliance CTR workloads and analysis STR workloads
- View cross-department metrics and performance indicators
- Monitor overall organizational workload distribution

### Actor 5: Compliance Officer
**Role Name:** Compliance Officer  
**Description:** Staff member in the compliance department responsible for reviewing assigned CTRs.  
**Capabilities:**
- View CTRs assigned to them
- Receive notifications when new CTRs are assigned
- Access only CTRs assigned to them (unless explicitly granted permission)
- View their own workload count

### Actor 6: Analyst
**Role Name:** Analyst  
**Description:** Staff member in the analysis department responsible for investigating assigned STRs and escalated CTRs.  
**Capabilities:**
- View STRs and escalated CTRs assigned to them
- Receive notifications when new reports are assigned
- Access only reports assigned to them (unless explicitly granted permission)
- View their own workload count (including STRs, escalated CTRs, and active cases)

---

## 4. Functional Requirements

### 4.1 Manual Assignment

**FR-6.1: Manual CTR Assignment by Compliance Officer Supervisor**  
**Description:** The system shall allow Compliance Officer Supervisors to manually assign validated CTRs to specific compliance officers within their team with a deadline.  
**Actor:** Compliance Officer Supervisor  
**Traceability:** PRD FR-6.1, FR-6.13  
**Business Rules:** BR-6.1, BR-6.2, BR-6.5

**FR-6.2: Manual STR and Escalated CTR Assignment by Head of Analysis**  
**Description:** The system shall allow Head of Analysis to manually assign validated STRs and escalated CTRs to specific analysts within the analysis department with a deadline.  
**Actor:** Head of Analysis  
**Traceability:** PRD FR-6.2, FR-6.15  
**Business Rules:** BR-6.1, BR-6.2, BR-6.5

**FR-6.3: Cross-Team CTR Reassignment by Head of Compliance**  
**Description:** The system shall allow Head of Compliance to reassign CTRs across compliance officer supervisors' teams when workload balancing is needed.  
**Actor:** Head of Compliance  
**Traceability:** PRD FR-6.14  
**Business Rules:** BR-6.3, BR-6.5

### 4.2 Workload Display

**FR-6.4: Compliance Officer Workload Display**  
**Description:** The system shall display each compliance officer's current workload count (assigned CTRs).  
**Actor:** Compliance Officer Supervisor, Head of Compliance, Director of Operations  
**Traceability:** PRD FR-6.3  
**Business Rules:** BR-6.4

**FR-6.5: Analyst Workload Display**  
**Description:** The system shall display each analyst's current workload count (assigned STRs and escalated CTRs, plus active cases).  
**Actor:** Head of Analysis, Director of Operations  
**Traceability:** PRD FR-6.4  
**Business Rules:** BR-6.4

### 4.3 Reassignment

**FR-6.6: Report Reassignment with Documentation**  
**Description:** The system shall allow supervisors to reassign reports from one officer/analyst to another with a documented reason.  
**Actor:** Compliance Officer Supervisor, Head of Compliance, Head of Analysis  
**Traceability:** PRD FR-6.5  
**Business Rules:** BR-6.3, BR-6.5

### 4.4 Notifications

**FR-6.7: Assignment Notification**  
**Description:** The system shall notify compliance officers and analysts immediately when a new report is assigned to them.  
**Actor:** System Process  
**Traceability:** PRD FR-6.6  
**Business Rules:** BR-6.6

### 4.5 Access Control

**FR-6.8: Compliance Officer Access Restriction**  
**Description:** The system shall prevent compliance officers from accessing CTRs not assigned to them unless explicitly granted permission.  
**Actor:** System Process  
**Traceability:** PRD FR-6.7  
**Business Rules:** BR-6.7

**FR-6.9: Analyst Access Restriction**  
**Description:** The system shall prevent analysts from accessing reports not assigned to them unless explicitly granted permission.  
**Actor:** System Process  
**Traceability:** PRD FR-6.8  
**Business Rules:** BR-6.7

### 4.6 Performance Tracking

**FR-6.10: Assignment to Completion Time Tracking**  
**Description:** The system shall track time from assignment to completion for performance metrics.  
**Actor:** System Process  
**Traceability:** PRD FR-6.9  
**Business Rules:** BR-6.8

### 4.7 Dashboards

**FR-6.11: Compliance Dashboard**  
**Description:** The system shall display a compliance dashboard showing all CTR assignments by compliance officer, status, and age (days since assignment).  
**Actor:** Compliance Officer Supervisor, Head of Compliance, Director of Operations  
**Traceability:** PRD FR-6.10, FR-6.16  
**Business Rules:** BR-6.9

**FR-6.12: Analysis Dashboard**  
**Description:** The system shall display an analysis dashboard showing all STR/escalated CTR assignments by analyst, status, and age (days since assignment).  
**Actor:** Head of Analysis, Director of Operations  
**Traceability:** PRD FR-6.10, FR-6.16  
**Business Rules:** BR-6.9

**FR-6.13: Combined Dashboard for Director of Operations**  
**Description:** The system shall allow Director of Operations to view combined workload across both compliance and analysis departments in a unified view.  
**Actor:** Director of Operations  
**Traceability:** PRD FR-6.17  
**Business Rules:** BR-6.9

### 4.8 Overdue Flagging

**FR-6.14: Overdue Report Flagging**  
**Description:** The system shall flag reports that have been assigned for more than 10 days without status change.  
**Actor:** System Process  
**Traceability:** PRD FR-6.11  
**Business Rules:** BR-6.10

### 4.9 Workflow Separation

**FR-6.15: Separate Assignment Workflows**  
**Description:** The system shall support two separate assignment workflows: CTR Assignment Workflow managed by Compliance Officer Supervisors and Head of Compliance, and STR Assignment Workflow managed by Head of Analysis.  
**Actor:** System Process  
**Traceability:** PRD FR-6.12  
**Business Rules:** BR-6.11

### 4.10 Auto-Assignment

**FR-6.16: Auto-Assignment Functionality**  
**Description:** The system shall provide auto-assignment functionality for both CTR and STR workflows based on lowest current workload.  
**Actor:** Compliance Officer Supervisor, Head of Compliance, Head of Analysis  
**Traceability:** PRD FR-6.18  
**Business Rules:** BR-6.12

---

## 5. Business Rules

### BR-6.1: Assignment Workflow Separation
**Rule Statement:** CTR assignments are managed exclusively by Compliance Officer Supervisors and Head of Compliance within the compliance workflow. STR and escalated CTR assignments are managed exclusively by Head of Analysis within the analysis workflow. The two workflows operate independently and do not overlap.  
**Examples:**
- A validated CTR can only be assigned by Compliance Officer Supervisor or Head of Compliance, not by Head of Analysis.
- A validated STR can only be assigned by Head of Analysis, not by Compliance Officer Supervisors.
- An escalated CTR transitions from compliance workflow to analysis workflow and becomes eligible for assignment by Head of Analysis only.

### BR-6.2: Deadline Requirement
**Rule Statement:** All manual and auto-assignments must include a deadline date. Deadlines are required for assignment completion and cannot be omitted.  
**Examples:**
- When Compliance Officer Supervisor assigns a CTR to an officer, they must specify a deadline date.
- When Head of Analysis assigns an STR to an analyst, they must specify a deadline date.
- Auto-assignment functionality automatically sets a default deadline based on report type and complexity.

### BR-6.3: Reassignment Documentation Requirement
**Rule Statement:** All reassignments must include a documented reason explaining why the report is being moved from one officer/analyst to another. The reason is mandatory and cannot be omitted.  
**Examples:**
- Reassignment from Officer A to Officer B requires reason: "Medical leave coverage" or "Workload rebalancing" or "Specialized expertise required."
- Reassignment reason is logged in audit trail and visible to both the previous and new assignee.
- Reassignment without a reason is not permitted by the system.

### BR-6.4: Workload Calculation Method
**Rule Statement:** Workload counts are calculated as follows: For compliance officers, workload equals the number of assigned CTRs that are not yet completed. For analysts, workload equals the number of assigned STRs plus assigned escalated CTRs plus active cases. Workload counts update in real-time as assignments change.  
**Examples:**
- Compliance Officer with 5 assigned CTRs (3 in progress, 2 pending) has workload count of 5.
- Analyst with 3 assigned STRs, 2 assigned escalated CTRs, and 1 active case has workload count of 6.
- When a CTR is completed, it is removed from the compliance officer's workload count immediately.

### BR-6.5: Team Assignment Boundaries
**Rule Statement:** Compliance Officer Supervisors can only assign CTRs to compliance officers within their own team. Head of Compliance can assign CTRs to any compliance officer across all teams. Head of Analysis can assign STRs and escalated CTRs to any analyst within the analysis department.  
**Examples:**
- Compliance Officer Supervisor Team A can assign CTRs only to officers in Team A.
- Head of Compliance can assign CTRs to officers in Team A, Team B, or any other team.
- Head of Analysis can assign STRs to any analyst in the analysis department regardless of specialization.

### BR-6.6: Immediate Notification Requirement
**Rule Statement:** When a report is assigned (manually or via auto-assignment), the assigned officer or analyst must receive an immediate notification. Notifications are sent within 1 minute of assignment completion.  
**Examples:**
- CTR assigned to Compliance Officer Jane Doe at 10:00 AM triggers notification at 10:00 AM (within 1 minute).
- STR assigned to Analyst John Smith triggers immediate notification visible in their dashboard and notification center.
- Reassignment also triggers immediate notification to both the previous assignee (informing of removal) and new assignee (informing of assignment).

### BR-6.7: Access Control Enforcement
**Rule Statement:** Compliance officers can only access CTRs assigned to them. Analysts can only access STRs and escalated CTRs assigned to them. Access to unassigned reports is denied unless the user has explicit supervisory permission to view all reports in their department.  
**Examples:**
- Compliance Officer attempts to open CTR assigned to another officer → System displays "Access Denied - Not assigned to you."
- Analyst attempts to open STR assigned to another analyst → System displays "Access Denied - Not assigned to you."
- Head of Compliance can access all CTRs in compliance department (supervisory permission).
- Head of Analysis can access all STRs and escalated CTRs in analysis department (supervisory permission).

### BR-6.8: Performance Metric Tracking
**Rule Statement:** The system tracks the time elapsed from assignment to completion for each report. Completion is defined as the report reaching a final status (Archived, Monitored, Case Created, Disseminated, etc.) in its workflow. Time tracking is used for performance metrics and workload analysis.  
**Examples:**
- CTR assigned on 2026-02-01 and completed (Archived) on 2026-02-08 has assignment-to-completion time of 7 days.
- STR assigned on 2026-02-01 and case created on 2026-02-15 has assignment-to-completion time of 14 days.
- Performance metrics aggregate assignment-to-completion times by officer/analyst, report type, and time period.

### BR-6.9: Dashboard Data Requirements
**Rule Statement:** Dashboards must display assignments with the following information: assignee name, report reference number, assignment date, deadline date, current status, and age (days since assignment). Dashboards update in real-time as assignments and statuses change.  
**Examples:**
- Compliance dashboard shows: "CTR-2026-001234 | Officer Jane Doe | Assigned: 2026-02-01 | Deadline: 2026-02-10 | Status: In Review | Age: 3 days"
- Analysis dashboard shows: "STR-2026-005678 | Analyst John Smith | Assigned: 2026-02-05 | Deadline: 2026-02-15 | Status: Analyzing | Age: 1 day"
- Director of Operations combined dashboard shows both compliance and analysis data in separate sections.

### BR-6.10: Overdue Flagging Threshold
**Rule Statement:** Reports that have been assigned for more than 10 days without any status change are automatically flagged as overdue. The 10-day threshold is calculated from the assignment date to the current date, excluding weekends and holidays if business days are used. Overdue reports appear highlighted (e.g., in red) on dashboards.  
**Examples:**
- CTR assigned on 2026-02-01 with no status change by 2026-02-12 (11 days) is flagged as overdue.
- STR assigned on 2026-02-05 with status change on 2026-02-08 (3 days) is not overdue, even if not completed.
- Overdue flagging runs daily and updates dashboards automatically.

### BR-6.11: Escalated CTR Workflow Transition
**Rule Statement:** When a CTR is escalated to STR status (becomes an Escalated CTR), it is automatically removed from compliance workload counts and added to the analysis assignment queue. The escalation removes the CTR from the assigned compliance officer's workload and makes it available for assignment by Head of Analysis.  
**Examples:**
- CTR assigned to Compliance Officer A is escalated by Head of Compliance → CTR removed from Officer A's workload count, appears in analysis assignment queue for Head of Analysis to assign.
- Escalated CTR retains original CTR data and escalation justification for analyst review.
- Escalated CTR is counted in analyst workload calculations once assigned.

### BR-6.12: Auto-Assignment Algorithm
**Rule Statement:** Auto-assignment selects the officer or analyst with the lowest current workload count. If multiple officers/analysts have the same lowest workload, the system assigns to the one who has been assigned the fewest reports in the current time period (e.g., current month). If still tied, assignment is made to the officer/analyst with the earliest last assignment date.  
**Examples:**
- 5 analysts with workloads of 10, 8, 12, 9, and 7 → Auto-assign selects analyst with workload of 7.
- 4 compliance officers with workloads of 15, 12, 18, and 10 → Auto-assign selects officer with workload of 10.
- If 2 analysts both have workload of 7, system checks which has fewer assignments this month, or earliest last assignment date.

---

## 6. Error & Exception Handling

### ERR-ASSIGN-ACCESS-001: Access Denied - Report Not Assigned
**Error Condition:** A compliance officer or analyst attempts to access a report that is not assigned to them and they do not have supervisory permission to view all reports.  
**System Behavior:** System denies access and displays error message. No report data is displayed. Access attempt is logged for audit purposes.  
**User Message:** "Access Denied - This report is not assigned to you. Please contact your supervisor if you need access to this report."  
**Recovery Action:** User must request assignment or supervisory permission to access the report.

### ERR-ASSIGN-CONFLICT-001: Reassignment Conflict - Report Actively Being Reviewed
**Error Condition:** A supervisor attempts to reassign a report while the current assignee is actively reviewing it (e.g., report is open in their session, or status indicates active review).  
**System Behavior:** System warns the supervisor about the active review status and requires confirmation to proceed with reassignment. If confirmed, the reassignment proceeds and the previous assignee's session is invalidated.  
**User Message:** "Warning: This report is currently being reviewed by [Officer/Analyst Name]. Reassigning will close their active session. Do you want to proceed?"  
**Recovery Action:** Supervisor can proceed with reassignment after confirmation, or cancel and wait for the current assignee to complete their review.

### ERR-ASSIGN-OVERDUE-001: Overdue Report Flagging
**Error Condition:** A report has been assigned for more than 10 days without any status change.  
**System Behavior:** System automatically flags the report as overdue. The report appears highlighted (e.g., in red) on dashboards with an "Overdue" indicator. Supervisors receive notifications about overdue reports in their department.  
**User Message:** Dashboard displays: "[Report Reference] - Overdue (Assigned [X] days ago)" with red highlighting.  
**Recovery Action:** Supervisor should review the overdue report, contact the assignee, and either reassign if necessary or extend the deadline with documented reason.

### ERR-ASSIGN-VALID-001: Missing Reassignment Reason
**Error Condition:** A supervisor attempts to reassign a report without providing a documented reason.  
**System Behavior:** System prevents reassignment and requires the reason field to be completed before proceeding.  
**User Message:** "Reassignment reason is required. Please provide a reason for reassigning this report."  
**Recovery Action:** Supervisor must enter a reason in the required field and resubmit the reassignment.

### ERR-ASSIGN-VALID-002: Invalid Deadline Date
**Error Condition:** A supervisor attempts to assign a report with a deadline date that is in the past or before the assignment date.  
**System Behavior:** System rejects the assignment and requires a valid future deadline date.  
**User Message:** "Invalid deadline date. Deadline must be a future date after the assignment date."  
**Recovery Action:** Supervisor must enter a valid future deadline date and resubmit the assignment.

### ERR-ASSIGN-AUTO-001: Auto-Assignment Failure - No Available Assignees
**Error Condition:** Auto-assignment is attempted but no officers or analysts are available (all are inactive, on leave, or have reached maximum workload capacity).  
**System Behavior:** System cannot complete auto-assignment and places the report in an unassigned queue. Supervisors are notified that manual assignment is required.  
**User Message:** "Auto-assignment failed - No available [officers/analysts]. Please assign manually."  
**Recovery Action:** Supervisor must manually assign the report to an available officer or analyst, or activate additional staff members.

### ERR-ASSIGN-ESCALATE-001: CTR Escalated While Under Active Review
**Error Condition:** A CTR is escalated to STR status while a compliance officer is actively reviewing it (report is open in their session).  
**System Behavior:** System immediately removes the CTR from the compliance officer's workload and closes their active session. The compliance officer is notified of the escalation. The escalated CTR appears in the analysis assignment queue.  
**User Message:** To compliance officer: "CTR [Reference] has been escalated to Analysis. Your review session has been closed." To Head of Analysis: "New Escalated CTR available for assignment: [Reference]."  
**Recovery Action:** Compliance officer's work is saved if possible, but they can no longer access the report. Head of Analysis can assign the escalated CTR to an analyst.

---

## 7. Non-Functional Requirements

### 7.1 Performance Requirements

**NFR-ASSIGN-PERF-1: Dashboard Load Time**  
**Description:** The system shall load workload dashboards within 3 seconds under normal load conditions for up to 50 active users.  
**Measurement Criteria:** Dashboard load time measured from page request to full data display. 95th percentile load time must be ≤ 3 seconds.  
**Traceability:** FR-6.11, FR-6.12, FR-6.13

**NFR-ASSIGN-PERF-2: Assignment Processing Time**  
**Description:** The system shall process manual and auto-assignments within 2 seconds from submission to completion (including notification delivery).  
**Measurement Criteria:** Time from assignment submission to assignment confirmation and notification delivery. 95th percentile processing time must be ≤ 2 seconds.  
**Traceability:** FR-6.1, FR-6.2, FR-6.16, FR-6.7

**NFR-ASSIGN-PERF-3: Workload Count Calculation**  
**Description:** The system shall calculate and update workload counts in real-time as assignments change, with updates visible within 5 seconds of assignment modification.  
**Measurement Criteria:** Time from assignment change to workload count update on all relevant dashboards. Updates must be visible within 5 seconds.  
**Traceability:** FR-6.4, FR-6.5

### 7.2 Security Requirements

**NFR-ASSIGN-SEC-1: Access Control Enforcement**  
**Description:** The system shall enforce access control rules preventing officers and analysts from accessing unassigned reports with 100% accuracy. Access control checks must occur on every report access attempt.  
**Measurement Criteria:** All unauthorized access attempts are blocked. Zero false positives (legitimate access denied) or false negatives (unauthorized access allowed).  
**Traceability:** FR-6.8, FR-6.9, BR-6.7

**NFR-ASSIGN-SEC-2: Assignment Audit Logging**  
**Description:** The system shall log all assignment, reassignment, and auto-assignment actions with immutable records including: actor, timestamp, report reference, previous assignee (if reassignment), new assignee, deadline, and reason (if applicable).  
**Measurement Criteria:** All assignment actions are logged. Audit logs are append-only and cannot be modified or deleted. Log integrity can be verified through cryptographic checksums.  
**Traceability:** FR-6.1, FR-6.2, FR-6.6, BR-6.3

**NFR-ASSIGN-SEC-3: Role-Based Assignment Permissions**  
**Description:** The system shall enforce role-based permissions ensuring only authorized supervisors can assign reports within their domain. Compliance Officer Supervisors cannot assign STRs. Head of Analysis cannot assign CTRs (except escalated CTRs).  
**Measurement Criteria:** All assignment attempts are validated against role permissions. Unauthorized assignment attempts are rejected with 100% accuracy.  
**Traceability:** FR-6.1, FR-6.2, FR-6.15, BR-6.1

### 7.3 Reliability Requirements

**NFR-ASSIGN-REL-1: Assignment System Availability**  
**Description:** The system shall maintain 99% availability for assignment functionality during business hours (8 AM - 6 PM local time, Monday-Friday).  
**Measurement Criteria:** Assignment features are accessible and functional 99% of the time during defined business hours. Planned maintenance windows are excluded from availability calculation.  
**Traceability:** FR-6.1, FR-6.2, FR-6.16

**NFR-ASSIGN-REL-2: Notification Delivery Reliability**  
**Description:** The system shall deliver assignment notifications with 99.9% success rate. Failed notifications must be retried automatically up to 3 times within 5 minutes.  
**Measurement Criteria:** Notification delivery success rate ≥ 99.9%. Failed notifications are automatically retried. Notification delivery status is logged.  
**Traceability:** FR-6.7, BR-6.6

**NFR-ASSIGN-REL-3: Data Integrity for Reassignments**  
**Description:** The system shall ensure data integrity during reassignments, preventing duplicate assignments or lost assignments. Reassignment operations must be atomic (all-or-nothing).  
**Measurement Criteria:** All reassignments complete successfully or roll back completely. No reports are left in an inconsistent state (assigned to multiple officers or unassigned after reassignment).  
**Traceability:** FR-6.6, ERR-ASSIGN-CONFLICT-001

### 7.4 Usability Requirements

**NFR-ASSIGN-USAB-1: Dashboard Clarity**  
**Description:** Dashboards shall display workload information in a clear, intuitive format that allows supervisors to quickly identify workload imbalances, overdue reports, and assignment status.  
**Measurement Criteria:** Supervisors can identify the officer/analyst with lowest workload within 10 seconds of viewing the dashboard. Overdue reports are immediately visible.  
**Traceability:** FR-6.11, FR-6.12, FR-6.14

**NFR-ASSIGN-USAB-2: Assignment Workflow Simplicity**  
**Description:** Manual assignment shall be completed in 3 steps or fewer: (1) Select report, (2) Select assignee, (3) Set deadline and confirm. Auto-assignment shall be completed in 1 step: Select report and confirm auto-assign.  
**Measurement Criteria:** 95% of users can complete manual assignment in under 30 seconds. 95% of users can complete auto-assignment in under 10 seconds.  
**Traceability:** FR-6.1, FR-6.2, FR-6.16

**NFR-ASSIGN-USAB-3: Workload Visualization**  
**Description:** The system shall provide visual indicators (e.g., color coding, progress bars, charts) to help supervisors quickly assess workload distribution across teams.  
**Measurement Criteria:** Supervisors can identify workload imbalances visually without reading individual numbers. Visual indicators are accessible (color-blind friendly).  
**Traceability:** FR-6.4, FR-6.5, FR-6.11, FR-6.12

### 7.5 Scalability Requirements

**NFR-ASSIGN-SCALE-1: Team Growth Support**  
**Description:** The system shall support scaling from current team sizes (10-12 compliance officers, 10-12 analysts) to 50+ officers and 50+ analysts without performance degradation.  
**Measurement Criteria:** System maintains performance targets (NFR-ASSIGN-PERF-1, NFR-ASSIGN-PERF-2) as team sizes increase to 50+ members per department.  
**Traceability:** FR-6.4, FR-6.5, FR-6.11, FR-6.12

**NFR-ASSIGN-SCALE-2: Assignment Volume Growth**  
**Description:** The system shall handle 10x increase in assignment volume (from baseline to 10x) without performance degradation.  
**Measurement Criteria:** System maintains assignment processing time (NFR-ASSIGN-PERF-2) and dashboard load time (NFR-ASSIGN-PERF-1) when assignment volume increases 10x.  
**Traceability:** FR-6.1, FR-6.2, FR-6.16

### 7.6 Compliance Requirements

**NFR-ASSIGN-COMPLY-1: Assignment Audit Trail**  
**Description:** The system shall maintain complete, immutable audit trails for all assignment actions supporting regulatory compliance and internal audits. Audit trails must be retained for minimum 10 years per Liberian AML/CFT regulations.  
**Measurement Criteria:** All assignment actions are logged with complete details. Audit logs are retained for 10 years minimum. Audit logs are queryable and exportable for compliance reporting.  
**Traceability:** NFR-ASSIGN-SEC-2, FR-6.1, FR-6.2, FR-6.6

**NFR-ASSIGN-COMPLY-2: FATF Compliance**  
**Description:** The system shall comply with FATF Recommendation 29 (Financial Intelligence Units) requirements for assignment and workload management processes.  
**Measurement Criteria:** Assignment workflows and audit trails meet FATF standards. Compliance reports can be generated demonstrating adherence to FATF requirements.  
**Traceability:** General compliance requirement

---

## 8. Acceptance Criteria

**AC-6.1: Auto-Assignment to Lowest Workload (Analysis)**  
Given 5 analysts with workloads of 10, 8, 12, 9, and 7 reports respectively, when Head of Analysis chooses "Auto-Assign" for an STR, then the system assigns the STR to the analyst with 7 reports.

**AC-6.2: Access Denied for Unassigned Report**  
Given a report assigned to Analyst A, when Analyst B attempts to open it, then the system displays "Access Denied - Not assigned to you."

**AC-6.3: Overdue Report Flagging**  
Given a report assigned crosses the deadline and it's not complete, when supervisor views dashboard, then the report appears highlighted in red with "Overdue" flag.

**AC-6.4: Auto-Assignment to Lowest Workload (Compliance)**  
Given 4 compliance officers with workloads of 15, 12, 18, and 10 CTRs respectively, when Compliance Officer Supervisor chooses "Auto-Assign" for a validated CTR, then the system assigns the CTR to the compliance officer with 10 reports.

**AC-6.5: Escalated CTR Workflow Transition**  
Given a CTR is escalated to STR status by Head of Compliance, when the escalation is finalized, then the system removes the report from compliance workload counts and adds it to analysis assignment queue.

**AC-6.6: Combined Dashboard Visibility**  
Given Director of Operations views the combined dashboard, when accessing the interface, then they can see both compliance CTR workloads and analysis STR workloads in a unified view.

---

## 9. Glossary

**Assignment:** The act of assigning a validated report (CTR, STR, or escalated CTR) to a specific compliance officer or analyst for review or investigation.

**Workload:** The total number of reports and cases currently assigned to a compliance officer or analyst that are not yet completed. For compliance officers, workload includes assigned CTRs. For analysts, workload includes assigned STRs, assigned escalated CTRs, and active cases.

**Compliance Officer Supervisor:** A supervisory role within the compliance department responsible for managing a team of compliance officers and assigning CTRs to officers within their team.

**Head of Compliance:** The department head responsible for overall compliance operations, including cross-team workload balancing and escalation decisions.

**Head of Analysis:** The department head responsible for managing the analysis team and assigning STRs and escalated CTRs to analysts.

**Director of Operations:** An executive role with oversight across both compliance and analysis departments, with access to combined workload dashboards.

**CTR (Currency Transaction Report):** A report filed for large cash transactions above a defined threshold, used for compliance monitoring. CTRs follow the compliance workflow and are assigned by Compliance Officer Supervisors or Head of Compliance.

**STR (Suspicious Transaction Report):** A report filed when a transaction appears suspicious and may indicate money laundering, terrorist financing, or other financial crimes. STRs follow the analysis workflow and are assigned by Head of Analysis.

**Escalated CTR:** A CTR that has been escalated from the compliance workflow to the analysis workflow. Escalated CTRs are treated as STRs for assignment purposes and are assigned by Head of Analysis.

**Auto-Assignment:** Automated assignment functionality that selects the officer or analyst with the lowest current workload count for assignment.

**Reassignment:** The act of moving a report from one assigned officer/analyst to another, requiring a documented reason.

**Overdue Report:** A report that has been assigned for more than 10 days without any status change, automatically flagged by the system.

**Deadline:** A target completion date assigned to a report when it is assigned to an officer or analyst. Deadlines are required for all assignments.

**Workload Dashboard:** A visual interface displaying assignment information including assignee, report reference, assignment date, deadline, status, and age (days since assignment).

**Assignment Queue:** A collection of validated reports awaiting assignment to officers or analysts.

**Active Case:** A case that has been created from an STR or escalated CTR and is currently under investigation by an analyst. Active cases are included in analyst workload calculations.

---

## 10. Open Issues & Decisions Pending

| Issue ID | Description | Impact | Assigned To | Target Date |
|----------|-------------|--------|-------------|-------------|
| ISS-ASSIGN-001 | Determine default deadline calculation method for auto-assignment (fixed days vs. business days vs. complexity-based) | Affects FR-6.16, BR-6.2 | Product Manager, Head of Compliance, Head of Analysis | TBD |
| ISS-ASSIGN-002 | Define maximum workload capacity per officer/analyst before auto-assignment excludes them from selection | Affects FR-6.16, BR-6.12 | Head of Compliance, Head of Analysis | TBD |
| ISS-ASSIGN-003 | Specify notification delivery method (in-app, email, SMS, or combination) and user preferences | Affects FR-6.7, NFR-ASSIGN-REL-2 | Product Manager, Technical Lead | TBD |
| ISS-ASSIGN-004 | Determine if overdue reports should trigger automatic escalation to supervisor or require manual intervention | Affects FR-6.14, ERR-ASSIGN-OVERDUE-001 | Head of Compliance, Head of Analysis | TBD |
| ISS-ASSIGN-005 | Define business days calculation for overdue flagging (exclude weekends/holidays or use calendar days) | Affects FR-6.14, BR-6.10 | Product Manager, Compliance Manager | TBD |

---

## 11. Traceability Matrix

| FRD Requirement | PRD Source | Acceptance Criteria |
|----------------|------------|-------------------|
| FR-6.1 | PRD FR-6.1, FR-6.13 | AC-6.4 |
| FR-6.2 | PRD FR-6.2, FR-6.15 | AC-6.1 |
| FR-6.3 | PRD FR-6.14 | - |
| FR-6.4 | PRD FR-6.3 | - |
| FR-6.5 | PRD FR-6.4 | - |
| FR-6.6 | PRD FR-6.5 | - |
| FR-6.7 | PRD FR-6.6 | - |
| FR-6.8 | PRD FR-6.7 | AC-6.2 |
| FR-6.9 | PRD FR-6.8 | AC-6.2 |
| FR-6.10 | PRD FR-6.9 | - |
| FR-6.11 | PRD FR-6.10, FR-6.16 | AC-6.6 |
| FR-6.12 | PRD FR-6.10, FR-6.16 | AC-6.6 |
| FR-6.13 | PRD FR-6.17 | AC-6.6 |
| FR-6.14 | PRD FR-6.11 | AC-6.3 |
| FR-6.15 | PRD FR-6.12 | - |
| FR-6.16 | PRD FR-6.18 | AC-6.1, AC-6.4 |

---

**Document End**
