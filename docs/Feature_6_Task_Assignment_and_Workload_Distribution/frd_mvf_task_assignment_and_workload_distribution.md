# Minimum Viable Feature Specification
## Feature 6: Task Assignment and Workload Distribution

**Document Title:** Minimum Viable Feature Specification  
**Feature/Product Name:** Task Assignment and Workload Distribution  
**Version:** 1.0  
**Author:** Senior Business Analyst  
**Related FRD Version:** 1.0 (for traceability - REQUIRED)  
**Status:** Draft  
**Last Updated Date:** February 2026

---

## 1. Document Header

**Document Title:** Minimum Viable Feature Specification  
**Feature/Product Name:** Task Assignment and Workload Distribution  
**Version:** 1.0  
**Author:** Senior Business Analyst  
**Related FRD Version:** 1.0  
**Status:** Draft  
**Last Updated Date:** February 2026

---

## 2. Scope & Feature Context

### Feature Name
Task Assignment and Workload Distribution

### MVF Description
This MVF enables supervisors and department heads to manually assign validated reports (CTRs and STRs) to compliance officers and analysts with deadlines, view workload counts for informed decision-making, and enforce access control to ensure officers and analysts can only access reports assigned to them. The system supports separate workflows for compliance and analysis departments with immediate notifications upon assignment.

### Core Value Proposition
Enable supervisors to assign validated reports to their team members with deadlines, make assignment decisions based on visible workload counts, and ensure secure access control so that officers and analysts can only work on reports assigned to them. This delivers the essential functionality needed for task distribution and accountability without requiring advanced features like auto-assignment, dashboards, or reassignment capabilities.

### In MVF Scope
- Manual assignment of validated CTRs to compliance officers by Compliance Officer Supervisors and Head of Compliance with deadlines
- Manual assignment of validated STRs and escalated CTRs to analysts by Head of Analysis with deadlines
- Workload count display for compliance officers (assigned CTRs) and analysts (assigned STRs, escalated CTRs, and active cases)
- Immediate notification to officers and analysts when reports are assigned
- Access control preventing officers/analysts from accessing reports not assigned to them
- Separate assignment workflows for compliance (CTR) and analysis (STR/escalated CTR) departments

### Deferred to Future Iterations

**Deferred Functional Requirements:**
- **FR-6.3**: Cross-Team CTR Reassignment by Head of Compliance - Edge case, not part of primary user journey
- **FR-6.6**: Report Reassignment with Documentation - Edge case, can be added later without breaking changes
- **FR-6.10**: Assignment to Completion Time Tracking - Secondary functionality for performance metrics
- **FR-6.11**: Compliance Dashboard - Enhancement, simple list view sufficient for MVF
- **FR-6.12**: Analysis Dashboard - Enhancement, simple list view sufficient for MVF
- **FR-6.13**: Combined Dashboard for Director of Operations - Secondary user role, can be added later
- **FR-6.14**: Overdue Report Flagging - Nice-to-have feature, not blocking for core functionality
- **FR-6.16**: Auto-Assignment Functionality - Enhancement, manual assignment works for MVF

**Deferred Business Rules:**
- **BR-6.3**: Reassignment Documentation Requirement - Deferred with reassignment feature
- **BR-6.8**: Performance Metric Tracking - Secondary functionality
- **BR-6.9**: Dashboard Data Requirements - Deferred with dashboard features
- **BR-6.10**: Overdue Flagging Threshold - Deferred with overdue flagging feature
- **BR-6.11**: Escalated CTR Workflow Transition - Edge case handling
- **BR-6.12**: Auto-Assignment Algorithm - Deferred with auto-assignment feature

**Deferred Error Handling:**
- **ERR-ASSIGN-CONFLICT-001**: Reassignment Conflict - Deferred with reassignment feature
- **ERR-ASSIGN-OVERDUE-001**: Overdue Report Flagging - Deferred with overdue flagging feature
- **ERR-ASSIGN-VALID-001**: Missing Reassignment Reason - Deferred with reassignment feature
- **ERR-ASSIGN-AUTO-001**: Auto-Assignment Failure - Deferred with auto-assignment feature
- **ERR-ASSIGN-ESCALATE-001**: CTR Escalated While Under Active Review - Edge case

**Deferred Non-Functional Requirements:**
- **NFR-ASSIGN-PERF-1**: Dashboard Load Time - Performance optimization, not needed for MVF
- **NFR-ASSIGN-PERF-2**: Assignment Processing Time - Performance optimization, not needed for MVF
- **NFR-ASSIGN-PERF-3**: Workload Count Calculation - Performance optimization, not needed for MVF
- **NFR-ASSIGN-REL-1**: Assignment System Availability - Can optimize later
- **NFR-ASSIGN-REL-2**: Notification Delivery Reliability - Can optimize later
- **NFR-ASSIGN-REL-3**: Data Integrity for Reassignments - Deferred with reassignment feature
- **NFR-ASSIGN-USAB-1**: Dashboard Clarity - Deferred with dashboard features
- **NFR-ASSIGN-USAB-2**: Assignment Workflow Simplicity - Usability enhancement
- **NFR-ASSIGN-USAB-3**: Workload Visualization - Usability enhancement
- **NFR-ASSIGN-SCALE-1**: Team Growth Support - Scalability requirement, not needed for initial launch
- **NFR-ASSIGN-SCALE-2**: Assignment Volume Growth - Scalability requirement, not needed for initial launch
- **NFR-ASSIGN-COMPLY-1**: Assignment Audit Trail - Compliance requirement, covered by NFR-ASSIGN-SEC-2
- **NFR-ASSIGN-COMPLY-2**: FATF Compliance - Compliance requirement, can be added later

### Purpose
Enable efficient distribution of report processing tasks across compliance and analysis teams through manual assignment with workload visibility, ensuring accountability and secure access control. This MVF delivers the core value of task assignment and workload monitoring without requiring advanced features that can be added in future iterations.

---

## 3. Essential Actors / Roles

### Actor 1: Compliance Officer Supervisor
**Role Name:** Compliance Officer Supervisor  
**Description:** Supervisory staff within the compliance department responsible for managing a team of compliance officers and assigning CTRs to officers within their team.  
**Core Capabilities (MVF only):**
- Manually assign validated CTRs to compliance officers within their team with deadlines
- View workload counts for compliance officers in their team

### Actor 2: Head of Compliance
**Role Name:** Head of Compliance  
**Description:** Department head responsible for overall compliance operations, including cross-team workload balancing.  
**Core Capabilities (MVF only):**
- Manually assign validated CTRs to compliance officers across all teams with deadlines
- View workload distribution across all compliance officer supervisors' teams

### Actor 3: Head of Analysis
**Role Name:** Head of Analysis  
**Description:** Department head responsible for managing the analysis team and assigning STRs and escalated CTRs to analysts.  
**Core Capabilities (MVF only):**
- Manually assign validated STRs and escalated CTRs to analysts with deadlines
- View workload counts for all analysts (including STRs, escalated CTRs, and active cases)

### Actor 4: Compliance Officer
**Role Name:** Compliance Officer  
**Description:** Staff member in the compliance department responsible for reviewing assigned CTRs.  
**Core Capabilities (MVF only):**
- View CTRs assigned to them
- Receive notifications when new CTRs are assigned
- Access only CTRs assigned to them (unless explicitly granted permission)
- View their own workload count

### Actor 5: Analyst
**Role Name:** Analyst  
**Description:** Staff member in the analysis department responsible for investigating assigned STRs and escalated CTRs.  
**Core Capabilities (MVF only):**
- View STRs and escalated CTRs assigned to them
- Receive notifications when new reports are assigned
- Access only reports assigned to them (unless explicitly granted permission)
- View their own workload count (including STRs, escalated CTRs, and active cases)

---

## 4. Core Functional Requirements (FR)

### FR-6.1: Manual CTR Assignment by Compliance Officer Supervisor
**Description:** The system shall allow Compliance Officer Supervisors to manually assign validated CTRs to specific compliance officers within their team with a deadline.  
**Actor:** Compliance Officer Supervisor  
**Traceability:** 
- FRD FR-6.1
- PRD FR-6.1, FR-6.13  
**Business Rules:** BR-6.1, BR-6.2, BR-6.5  
**MVF Rationale:** This is the core functionality of the feature. Without manual assignment, the feature cannot fulfill its primary purpose. It enables the primary user journey of supervisors assigning reports to their team members.

### FR-6.2: Manual STR and Escalated CTR Assignment by Head of Analysis
**Description:** The system shall allow Head of Analysis to manually assign validated STRs and escalated CTRs to specific analysts within the analysis department with a deadline.  
**Actor:** Head of Analysis  
**Traceability:** 
- FRD FR-6.2
- PRD FR-6.2, FR-6.15  
**Business Rules:** BR-6.1, BR-6.2, BR-6.5  
**MVF Rationale:** Essential for the analysis workflow. Without this, Head of Analysis cannot assign reports to analysts, making the feature unusable for the analysis department.

### FR-6.4: Compliance Officer Workload Display
**Description:** The system shall display each compliance officer's current workload count (assigned CTRs).  
**Actor:** Compliance Officer Supervisor, Head of Compliance  
**Traceability:** 
- FRD FR-6.4
- PRD FR-6.3  
**Business Rules:** BR-6.4  
**MVF Rationale:** Essential for assignment decision-making. Supervisors need workload visibility to make informed assignment decisions. Without this, assignments would be made blindly without considering current workload distribution.

### FR-6.5: Analyst Workload Display
**Description:** The system shall display each analyst's current workload count (assigned STRs and escalated CTRs, plus active cases).  
**Actor:** Head of Analysis  
**Traceability:** 
- FRD FR-6.5
- PRD FR-6.4  
**Business Rules:** BR-6.4  
**MVF Rationale:** Essential for assignment decision-making. Head of Analysis needs workload visibility to make informed assignment decisions. Without this, assignments would be made blindly without considering current workload distribution.

### FR-6.7: Assignment Notification
**Description:** The system shall notify compliance officers and analysts immediately when a new report is assigned to them.  
**Actor:** System Process  
**Traceability:** 
- FRD FR-6.7
- PRD FR-6.6  
**Business Rules:** BR-6.6  
**MVF Rationale:** Core user experience requirement. Without notifications, officers and analysts would not know when reports are assigned to them, making the feature non-functional. This is required for the feature to be usable.

### FR-6.8: Compliance Officer Access Restriction
**Description:** The system shall prevent compliance officers from accessing CTRs not assigned to them unless explicitly granted permission.  
**Actor:** System Process  
**Traceability:** 
- FRD FR-6.8
- PRD FR-6.7  
**Business Rules:** BR-6.7  
**MVF Rationale:** Critical security requirement. Without access control, officers could access reports they shouldn't, violating data security and accountability. This prevents data access violations and is essential for the feature to work correctly.

### FR-6.9: Analyst Access Restriction
**Description:** The system shall prevent analysts from accessing reports not assigned to them unless explicitly granted permission.  
**Actor:** System Process  
**Traceability:** 
- FRD FR-6.9
- PRD FR-6.8  
**Business Rules:** BR-6.7  
**MVF Rationale:** Critical security requirement. Without access control, analysts could access reports they shouldn't, violating data security and accountability. This prevents data access violations and is essential for the feature to work correctly.

### FR-6.15: Separate Assignment Workflows
**Description:** The system shall support two separate assignment workflows: CTR Assignment Workflow managed by Compliance Officer Supervisors and Head of Compliance, and STR Assignment Workflow managed by Head of Analysis.  
**Actor:** System Process  
**Traceability:** 
- FRD FR-6.15
- PRD FR-6.12  
**Business Rules:** BR-6.1  
**MVF Rationale:** Critical business rule and foundation for feature architecture. The separation of workflows is a mandatory business constraint that must be enforced from the start. Without this, the feature would violate core business requirements and require complete rework if added later.

---

## 5. Essential Business Rules (BR)

### BR-6.1: Assignment Workflow Separation
**Rule Statement:** CTR assignments are managed exclusively by Compliance Officer Supervisors and Head of Compliance within the compliance workflow. STR and escalated CTR assignments are managed exclusively by Head of Analysis within the analysis workflow. The two workflows operate independently and do not overlap.  
**Examples:**
- A validated CTR can only be assigned by Compliance Officer Supervisor or Head of Compliance, not by Head of Analysis.
- A validated STR can only be assigned by Head of Analysis, not by Compliance Officer Supervisors.
- An escalated CTR transitions from compliance workflow to analysis workflow and becomes eligible for assignment by Head of Analysis only.  
**Traceability:** FRD BR-6.1  
**MVF Rationale:** This is a critical business rule that enforces mandatory business constraints. It is required for legal/compliance reasons and prevents invalid or dangerous states. Without this rule, the feature would violate core business requirements.

### BR-6.2: Deadline Requirement
**Rule Statement:** All manual and auto-assignments must include a deadline date. Deadlines are required for assignment completion and cannot be omitted.  
**Examples:**
- When Compliance Officer Supervisor assigns a CTR to an officer, they must specify a deadline date.
- When Head of Analysis assigns an STR to an analyst, they must specify a deadline date.  
**Traceability:** FRD BR-6.2  
**MVF Rationale:** This is a mandatory business constraint. Deadlines are required for assignment completion and cannot be omitted. Without this rule, assignments would be incomplete and the feature would not work correctly.

### BR-6.4: Workload Calculation Method
**Rule Statement:** Workload counts are calculated as follows: For compliance officers, workload equals the number of assigned CTRs that are not yet completed. For analysts, workload equals the number of assigned STRs plus assigned escalated CTRs plus active cases. Workload counts update in real-time as assignments change.  
**Examples:**
- Compliance Officer with 5 assigned CTRs (3 in progress, 2 pending) has workload count of 5.
- Analyst with 3 assigned STRs, 2 assigned escalated CTRs, and 1 active case has workload count of 6.
- When a CTR is completed, it is removed from the compliance officer's workload count immediately.  
**Traceability:** FRD BR-6.4  
**MVF Rationale:** This rule is required for workload display functionality (FR-6.4, FR-6.5). Without a defined calculation method, workload counts would be inconsistent or incorrect, making the feature unusable for assignment decision-making.

### BR-6.5: Team Assignment Boundaries
**Rule Statement:** Compliance Officer Supervisors can only assign CTRs to compliance officers within their own team. Head of Compliance can assign CTRs to any compliance officer across all teams. Head of Analysis can assign STRs and escalated CTRs to any analyst within the analysis department.  
**Examples:**
- Compliance Officer Supervisor Team A can assign CTRs only to officers in Team A.
- Head of Compliance can assign CTRs to officers in Team A, Team B, or any other team.
- Head of Analysis can assign STRs to any analyst in the analysis department regardless of specialization.  
**Traceability:** FRD BR-6.5  
**MVF Rationale:** This rule enforces access control and organizational boundaries. It is a critical business rule that prevents invalid assignment states and ensures proper authorization. Without this rule, supervisors could assign reports to officers outside their authority, violating business constraints.

### BR-6.6: Immediate Notification Requirement
**Rule Statement:** When a report is assigned (manually or via auto-assignment), the assigned officer or analyst must receive an immediate notification. Notifications are sent within 1 minute of assignment completion.  
**Examples:**
- CTR assigned to Compliance Officer Jane Doe at 10:00 AM triggers notification at 10:00 AM (within 1 minute).
- STR assigned to Analyst John Smith triggers immediate notification visible in their dashboard and notification center.  
**Traceability:** FRD BR-6.6  
**MVF Rationale:** This rule is essential for core user experience. Without immediate notifications, officers and analysts would not know when reports are assigned to them, making the feature non-functional. This is required for the feature to be usable.

### BR-6.7: Access Control Enforcement
**Rule Statement:** Compliance officers can only access CTRs assigned to them. Analysts can only access STRs and escalated CTRs assigned to them. Access to unassigned reports is denied unless the user has explicit supervisory permission to view all reports in their department.  
**Examples:**
- Compliance Officer attempts to open CTR assigned to another officer → System displays "Access Denied - Not assigned to you."
- Analyst attempts to open STR assigned to another analyst → System displays "Access Denied - Not assigned to you."
- Head of Compliance can access all CTRs in compliance department (supervisory permission).
- Head of Analysis can access all STRs and escalated CTRs in analysis department (supervisory permission).  
**Traceability:** FRD BR-6.7  
**MVF Rationale:** This is a critical security rule that prevents data access violations. Without this rule, officers and analysts could access reports they shouldn't, violating data security and accountability. This is essential for the feature to work correctly and securely.

---

## 6. Critical Error & Exception Handling

### ERR-ASSIGN-ACCESS-001: Access Denied - Report Not Assigned
**Error Condition:** A compliance officer or analyst attempts to access a report that is not assigned to them and they do not have supervisory permission to view all reports.  
**System Behavior:** System denies access and displays error message. No report data is displayed. Access attempt is logged for audit purposes.  
**User Message:** "Access Denied - This report is not assigned to you. Please contact your supervisor if you need access to this report."  
**Recovery Action:** User must request assignment or supervisory permission to access the report.  
**Traceability:** FRD ERR-ASSIGN-ACCESS-001  
**MVF Rationale:** This is a blocking error that would make the feature unusable if not handled. Without proper access control error handling, unauthorized users could potentially access reports, violating security and data integrity. This prevents critical security violations.

### ERR-ASSIGN-VALID-002: Invalid Deadline Date
**Error Condition:** A supervisor attempts to assign a report with a deadline date that is in the past or before the assignment date.  
**System Behavior:** System rejects the assignment and requires a valid future deadline date.  
**User Message:** "Invalid deadline date. Deadline must be a future date after the assignment date."  
**Recovery Action:** Supervisor must enter a valid future deadline date and resubmit the assignment.  
**Traceability:** FRD ERR-ASSIGN-VALID-002  
**MVF Rationale:** This error handling is critical because deadlines are mandatory (BR-6.2). Without validation, invalid deadlines could be set, making assignments incomplete or invalid. This prevents invalid assignment states and ensures data integrity.

---

## 7. Minimal Non-Functional Requirements (NFR)

### NFR-ASSIGN-SEC-1: Access Control Enforcement
**Description:** The system shall enforce access control rules preventing officers and analysts from accessing unassigned reports with 100% accuracy. Access control checks must occur on every report access attempt.  
**Measurement Criteria:** All unauthorized access attempts are blocked. Zero false positives (legitimate access denied) or false negatives (unauthorized access allowed).  
**Traceability:** 
- FRD NFR-ASSIGN-SEC-1
- FR-6.8, FR-6.9, BR-6.7  
**MVF Rationale:** This NFR is essential for viability. Without proper access control enforcement, the feature would be unusable from a security perspective. This is a foundational security requirement that makes the feature unusable if missing.

### NFR-ASSIGN-SEC-2: Assignment Audit Logging
**Description:** The system shall log all assignment actions with immutable records including: actor, timestamp, report reference, new assignee, and deadline.  
**Measurement Criteria:** All assignment actions are logged. Audit logs are append-only and cannot be modified or deleted. Log integrity can be verified through cryptographic checksums.  
**Traceability:** 
- FRD NFR-ASSIGN-SEC-2
- FR-6.1, FR-6.2  
**MVF Rationale:** This NFR is essential for compliance and accountability. Assignment actions must be auditable for regulatory compliance and internal accountability. Without audit logging, the feature would not meet basic compliance requirements.

### NFR-ASSIGN-SEC-3: Role-Based Assignment Permissions
**Description:** The system shall enforce role-based permissions ensuring only authorized supervisors can assign reports within their domain. Compliance Officer Supervisors cannot assign STRs. Head of Analysis cannot assign CTRs (except escalated CTRs).  
**Measurement Criteria:** All assignment attempts are validated against role permissions. Unauthorized assignment attempts are rejected with 100% accuracy.  
**Traceability:** 
- FRD NFR-ASSIGN-SEC-3
- FR-6.1, FR-6.2, FR-6.15, BR-6.1  
**MVF Rationale:** This NFR is essential for security and business rule enforcement. Without role-based permissions, unauthorized users could assign reports, violating business rules and security. This makes the feature unusable if missing.

---

## 8. What's Deferred

### Deferred Functional Requirements

**FR-6.3: Cross-Team CTR Reassignment by Head of Compliance**  
**Reason:** Edge case - not part of primary user journey. Manual assignment works for MVF. Reassignment can be added in future iteration without breaking changes.

**FR-6.6: Report Reassignment with Documentation**  
**Reason:** Edge case - not part of primary user journey. Initial assignments work for MVF. Reassignment can be added later without breaking changes.

**FR-6.10: Assignment to Completion Time Tracking**  
**Reason:** Secondary functionality for performance metrics. Feature works without performance tracking. Can be added in future iteration.

**FR-6.11: Compliance Dashboard**  
**Reason:** Enhancement - simple list view sufficient for MVF. Advanced visualizations can be added later without breaking changes.

**FR-6.12: Analysis Dashboard**  
**Reason:** Enhancement - simple list view sufficient for MVF. Advanced visualizations can be added later without breaking changes.

**FR-6.13: Combined Dashboard for Director of Operations**  
**Reason:** Secondary user role. Director of Operations can use existing workload displays. Combined dashboard can be added later.

**FR-6.14: Overdue Report Flagging**  
**Reason:** Nice-to-have feature. Not blocking for core functionality. Can be added in future iteration.

**FR-6.16: Auto-Assignment Functionality**  
**Reason:** Enhancement - manual assignment works for MVF. Auto-assignment adds convenience but not core functionality. Can be added in future iteration without breaking changes.

### Deferred Business Rules

**BR-6.3: Reassignment Documentation Requirement**  
**Reason:** Deferred with reassignment feature (FR-6.6). Not needed for initial assignments.

**BR-6.8: Performance Metric Tracking**  
**Reason:** Secondary functionality. Feature works without performance tracking. Can be added in future iteration.

**BR-6.9: Dashboard Data Requirements**  
**Reason:** Deferred with dashboard features (FR-6.11, FR-6.12, FR-6.13). Simple workload counts sufficient for MVF.

**BR-6.10: Overdue Flagging Threshold**  
**Reason:** Deferred with overdue flagging feature (FR-6.14). Not blocking for core functionality.

**BR-6.11: Escalated CTR Workflow Transition**  
**Reason:** Edge case handling. Core assignment functionality works without this. Can be added when escalation workflow is implemented.

**BR-6.12: Auto-Assignment Algorithm**  
**Reason:** Deferred with auto-assignment feature (FR-6.16). Manual assignment works for MVF.

### Deferred Error Handling

**ERR-ASSIGN-CONFLICT-001: Reassignment Conflict - Report Actively Being Reviewed**  
**Reason:** Deferred with reassignment feature (FR-6.6). Not applicable to initial assignments.

**ERR-ASSIGN-OVERDUE-001: Overdue Report Flagging**  
**Reason:** Deferred with overdue flagging feature (FR-6.14). Not blocking for core functionality.

**ERR-ASSIGN-VALID-001: Missing Reassignment Reason**  
**Reason:** Deferred with reassignment feature (FR-6.6). Not applicable to initial assignments.

**ERR-ASSIGN-AUTO-001: Auto-Assignment Failure - No Available Assignees**  
**Reason:** Deferred with auto-assignment feature (FR-6.16). Manual assignment works for MVF.

**ERR-ASSIGN-ESCALATE-001: CTR Escalated While Under Active Review**  
**Reason:** Edge case. Core assignment functionality works without this. Can be added when escalation workflow is implemented.

### Deferred Non-Functional Requirements

**NFR-ASSIGN-PERF-1: Dashboard Load Time**  
**Reason:** Performance optimization. Feature works slower without it but is still usable. Can be optimized later.

**NFR-ASSIGN-PERF-2: Assignment Processing Time**  
**Reason:** Performance optimization. Feature works slower without it but is still usable. Can be optimized later.

**NFR-ASSIGN-PERF-3: Workload Count Calculation**  
**Reason:** Performance optimization. Feature works slower without it but is still usable. Can be optimized later.

**NFR-ASSIGN-REL-1: Assignment System Availability**  
**Reason:** Can optimize later. Basic availability sufficient for MVF.

**NFR-ASSIGN-REL-2: Notification Delivery Reliability**  
**Reason:** Can optimize later. Basic notification delivery sufficient for MVF.

**NFR-ASSIGN-REL-3: Data Integrity for Reassignments**  
**Reason:** Deferred with reassignment feature (FR-6.6). Not applicable to initial assignments.

**NFR-ASSIGN-USAB-1: Dashboard Clarity**  
**Reason:** Deferred with dashboard features (FR-6.11, FR-6.12, FR-6.13). Usability enhancement.

**NFR-ASSIGN-USAB-2: Assignment Workflow Simplicity**  
**Reason:** Usability enhancement. Feature works without this refinement. Can be added later.

**NFR-ASSIGN-USAB-3: Workload Visualization**  
**Reason:** Usability enhancement. Simple workload counts sufficient for MVF. Visualizations can be added later.

**NFR-ASSIGN-SCALE-1: Team Growth Support**  
**Reason:** Scalability requirement. Not needed for initial launch with current team sizes.

**NFR-ASSIGN-SCALE-2: Assignment Volume Growth**  
**Reason:** Scalability requirement. Not needed for initial launch with baseline volume.

**NFR-ASSIGN-COMPLY-1: Assignment Audit Trail**  
**Reason:** Compliance requirement. Covered by NFR-ASSIGN-SEC-2 (Assignment Audit Logging) in MVF. Extended retention can be added later.

**NFR-ASSIGN-COMPLY-2: FATF Compliance**  
**Reason:** Compliance requirement. Can be added later. Basic audit logging (NFR-ASSIGN-SEC-2) provides foundation.

### Future Iteration Notes

**When might these be added?**
- Auto-assignment (FR-6.16) and reassignment (FR-6.3, FR-6.6) can be added in Iteration 2 after MVF validation
- Dashboards (FR-6.11, FR-6.12, FR-6.13) can be added in Iteration 2 or 3 based on user feedback
- Overdue flagging (FR-6.14) and performance tracking (FR-6.10) can be added in Iteration 3 or later
- Performance and scalability NFRs can be optimized as user base grows

**What dependencies exist?**
- Reassignment features depend on initial assignment functionality (already in MVF)
- Auto-assignment depends on workload calculation (already in MVF via BR-6.4)
- Dashboards depend on assignment data (already captured in MVF)
- Performance tracking depends on assignment timestamps (can be added later)

**Any risks of deferring?**
- Low risk: Manual assignment works for MVF, auto-assignment is a convenience feature
- Low risk: Reassignment is an edge case, initial assignments cover primary use case
- Low risk: Simple workload counts sufficient for MVF, dashboards are enhancements
- Low risk: Performance optimizations can be added as needed based on actual usage patterns

---

## 9. Glossary

**Assignment:** The act of assigning a validated report (CTR, STR, or escalated CTR) to a specific compliance officer or analyst for review or investigation.

**Workload:** The total number of reports and cases currently assigned to a compliance officer or analyst that are not yet completed. For compliance officers, workload includes assigned CTRs. For analysts, workload includes assigned STRs, assigned escalated CTRs, and active cases.

**Compliance Officer Supervisor:** A supervisory role within the compliance department responsible for managing a team of compliance officers and assigning CTRs to officers within their team.

**Head of Compliance:** The department head responsible for overall compliance operations, including cross-team workload balancing and escalation decisions.

**Head of Analysis:** The department head responsible for managing the analysis team and assigning STRs and escalated CTRs to analysts.

**CTR (Currency Transaction Report):** A report filed for large cash transactions above a defined threshold, used for compliance monitoring. CTRs follow the compliance workflow and are assigned by Compliance Officer Supervisors or Head of Compliance.

**STR (Suspicious Transaction Report):** A report filed when a transaction appears suspicious and may indicate money laundering, terrorist financing, or other financial crimes. STRs follow the analysis workflow and are assigned by Head of Analysis.

**Escalated CTR:** A CTR that has been escalated from the compliance workflow to the analysis workflow. Escalated CTRs are treated as STRs for assignment purposes and are assigned by Head of Analysis.

**Deadline:** A target completion date assigned to a report when it is assigned to an officer or analyst. Deadlines are required for all assignments.

**Compliance Officer:** Staff member in the compliance department responsible for reviewing assigned CTRs.

**Analyst:** Staff member in the analysis department responsible for investigating assigned STRs and escalated CTRs.

---

**Document End**
