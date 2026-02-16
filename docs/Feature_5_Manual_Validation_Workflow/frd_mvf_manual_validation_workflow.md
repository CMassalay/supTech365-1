# Minimum Viable Feature (MVF) Specification
## Feature 5: Manual Validation Workflow

**Document Version:** 1.0  
**Date:** February 2026  
**Source FRD Version:** FRD v1.0 (frd_manual_validation_workflow.md)  
**Feature ID:** FR-5-MVF  
**Phase:** Phase 1 - Foundation  
**Status:** Draft

---

## 1. MVF Overview

### 1.1 MVF Description
The MVF delivers core manual validation capability for Compliance Officers (CTRs) and Analysts (STRs) to review reports that passed automated validation, make Accept/Return/Reject decisions with mandatory justification, and route reports to appropriate downstream queues based on report type.

### 1.2 Core Value Proposition
Enable Compliance Officers (for CTRs) and Analysts (for STRs) to perform quality control on validated reports, ensuring only properly reviewed submissions proceed to compliance review (CTRs) or analysis (STRs), with full audit trail of decisions.

### 1.3 User Story
**As** a Compliance Officer (for CTRs) or Analyst (for STRs),  
**I want to** review reports in my queue and make validation decisions with documented reasons,  
**So that** only quality-checked reports proceed to the next workflow stage.

---

## 2. Scope

### 2.1 In MVF Scope
- Manual validation queue presentation (Compliance Officer queue for CTRs, Analyst queue for STRs, oldest first ordering)
- Report content display in readable format for review
- Validation decision workflow (Accept, Return for Correction, Reject)
- Mandatory reason requirement for Return/Reject decisions
- Workflow progression blocking until validation complete
- Validation decision audit logging
- CTR routing to Compliance Review/Decision stage after acceptance
- STR routing to Analysis stage after acceptance (bypassing compliance review)

### 2.2 Deferred to Future Iterations

| ID | Requirement | Reason for Deferral |
|----|-------------|---------------------|
| FR-5.3 | Review notes and comments | Nice-to-have collaboration feature |
| FR-5.7 | Entity notification | Enhancement - entities can check portal status |
| FR-5.9 | Resubmission allowance | Edge case - manual process initially |
| FR-5.10 | Resubmission tracking and linking | Edge case - supports deferred FR-5.9 |
| FR-5.11 | Validation type distinction | Advanced workflow separation |
| FR-5.12 | STR manual validation requirement | Redundant - covered by FR-5.6 |
| FR-5.15 | Compliance officer CTR queue presentation | Covered by FR-5.1 with role-based filtering |
| FR-5.16 | CTR escalation flagging | Phase 2 - escalation workflow |
| FR-5.17 | Escalation queue display | Phase 2 - escalation workflow |
| BR-5.3 | Review notes visibility | Supports deferred FR-5.3 |
| BR-5.9 | Resubmission eligibility | Supports deferred FR-5.9 |
| BR-5.10 | Resubmission linking rules | Supports deferred FR-5.10 |
| BR-5.11 | Validation stage separation | Supports deferred FR-5.11 |
| BR-5.12 | Sequential validation requirement | Covered by FR-5.6 |
| BR-5.15 | Compliance officer queue ordering | Supports deferred FR-5.15 |
| BR-5.16 | CTR escalation flagging requirements | Supports deferred FR-5.16 |
| BR-5.17 | Escalation queue display requirements | Supports deferred FR-5.17 |
| ERR-VAL-004 | Resubmission linking failure | Supports deferred FR-5.10 |
| ERR-VAL-005 | Notification delivery failure | Supports deferred FR-5.7 |
| ERR-VAL-007 | Concurrent validation attempt | Enhancement - locking mechanism |
| ERR-VAL-008 | Escalation flagging without justification | Supports deferred FR-5.16 |
| NFR-VAL-PERF-1 | Queue load time (2 seconds) | Performance optimization |
| NFR-VAL-PERF-2 | Decision processing time (2 seconds) | Performance optimization |
| NFR-VAL-PERF-3 | Report content display time (1 second) | Performance optimization |
| NFR-VAL-PERF-4 | Concurrent queue access (50 users) | Scale optimization |
| NFR-VAL-SEC-3 | Decision authentication | Use existing auth system initially |
| NFR-VAL-SEC-4 | Data confidentiality | Use existing auth system initially |
| NFR-VAL-REL-1 | Queue persistence | Enhancement |
| NFR-VAL-REL-2 | Notification delivery reliability | Supports deferred FR-5.7 |
| NFR-VAL-USAB-1 | Decision workflow clarity | Polish/refinement |
| NFR-VAL-USAB-2 | Report content readability | Polish/refinement |
| NFR-VAL-USAB-3 | Resubmission history visibility | Supports deferred FR-5.10 |
| NFR-VAL-USAB-4 | Error message clarity | Polish/refinement |
| NFR-VAL-COMPLY-1 | Audit trail completeness | Covered by basic logging |
| NFR-VAL-COMPLY-2 | FATF compliance | Compliance enhancement |
| NFR-VAL-COMPLY-3 | Data retention (10 years) | Long-term compliance |
| NFR-VAL-SCALE-1 | Queue volume growth (10x) | Scale for future growth |
| NFR-VAL-SCALE-2 | Staff member growth (100 users) | Scale for future growth |

### 2.3 Purpose
This MVF enables rapid delivery of core manual validation functionality, allowing Compliance Officers (for CTRs) and Analysts (for STRs) to review and validate reports before they proceed to downstream workflows, ensuring basic quality control with full audit trail.

---

## 3. Essential Actors / Roles

### 3.1 Compliance Officer (Primary Actor for CTRs)
**Description:** FIA Compliance Officer responsible for reviewing CTRs that passed automated validation  
**Core Capabilities:**
- View queue of CTRs that passed automated validation
- Display and review full CTR content
- Make validation decisions (Accept, Return for Correction, Reject)
- Provide mandatory reasons for Return/Reject decisions

### 3.2 Analyst (Primary Actor for STRs)
**Description:** FIA Analyst responsible for reviewing STRs that passed automated validation  
**Core Capabilities:**
- View queue of STRs that passed automated validation
- Display and review full STR content
- Make validation decisions (Accept, Return for Correction, Reject)
- Provide mandatory reasons for Return/Reject decisions

### 3.3 System Process
**Description:** Automated workflow routing processor  
**Core Capabilities:**
- Route accepted CTRs to Compliance Review/Decision stage
- Route accepted STRs to Analysis stage
- Maintain immutable audit logs of all validation decisions
- Block workflow progression until validation complete

---

## 4. Core Functional Requirements

### FR-5.1: Manual Validation Queue Presentation

**Description**  
The system shall present Compliance Officers (for CTRs) and Analysts (for STRs) with a queue of reports that passed automated validation, ordered by submission timestamp (oldest first).

**Actor**  
Compliance Officer (CTRs), Analyst (STRs)

**Traceability**  
- FRD: FR-5.1
- PRD: FR-5.1

**Business Rules**  
BR-5.1

**MVF Rationale**  
Core functionality - reviewers cannot perform validation without a queue of reports to review.

---

### FR-5.2: Report Content Display

**Description**  
The system shall display the full report content in a readable format for reviewer (Compliance Officer or Analyst) review, including all transaction details, metadata, and narrative fields.

**Actor**  
Compliance Officer, Analyst

**Traceability**  
- FRD: FR-5.2
- PRD: FR-5.2

**Business Rules**  
BR-5.2

**MVF Rationale**  
Core functionality - reviewers must see report content to assess quality and make validation decisions.

---

### FR-5.4: Validation Decision Requirement

**Description**  
The system shall require the reviewer to make one decision per report: Accept, Return for Correction, or Reject.

**Actor**  
Compliance Officer (CTRs), Analyst (STRs)

**Traceability**  
- FRD: FR-5.4
- PRD: FR-5.4

**Business Rules**  
BR-5.4

**MVF Rationale**  
Core workflow - validation decisions are the primary output of the manual validation process.

---

### FR-5.5: Mandatory Reason for Return/Reject

**Description**  
The system shall require a mandatory text reason when choosing "Return for Correction" or "Reject," preventing submission of decisions without justification.

**Actor**  
Compliance Officer, Analyst

**Traceability**  
- FRD: FR-5.5
- PRD: FR-5.5

**Business Rules**  
BR-5.5

**MVF Rationale**  
Critical business rule - reasons are required for compliance, audit, and communication with reporting entities.

---

### FR-5.6: Workflow Progression Blocking

**Description**  
The system shall prevent reports from proceeding to the next stage until manual validation is completed and accepted.

**Actor**  
System Process

**Traceability**  
- FRD: FR-5.6
- PRD: FR-5.6

**Business Rules**  
BR-5.6

**MVF Rationale**  
Prevents invalid states - reports must not bypass validation to reach downstream workflows.

---

### FR-5.8: Validation Decision Audit Logging

**Description**  
The system shall log the reviewer's identity, decision, timestamp, and reason for every validation decision in an immutable audit log.

**Actor**  
System Process

**Traceability**  
- FRD: FR-5.8
- PRD: FR-5.8

**Business Rules**  
BR-5.8

**MVF Rationale**  
Compliance requirement - audit trail of validation decisions is mandatory for FIU operations.

---

### FR-5.13: CTR Routing to Compliance Review

**Description**  
The system shall route CTRs from automated validation directly to Compliance Officer queues for manual validation and regulatory review.

**Actor**  
System Process

**Traceability**  
- FRD: FR-5.13
- PRD: FR-5.13

**Business Rules**  
BR-5.13

**MVF Rationale**  
Core workflow - CTRs must enter Compliance Review after manual validation by Compliance Officer.

---

### FR-5.14: STR Routing to Analysis

**Description**  
The system shall route STRs from automated validation directly to Analyst queues for manual validation, then to Analysis stage, bypassing compliance officer review.

**Actor**  
System Process

**Traceability**  
- FRD: FR-5.14
- PRD: FR-5.14

**Business Rules**  
BR-5.14

**MVF Rationale**  
Core workflow - STRs follow different path than CTRs; correct routing is essential.

---

## 5. Essential Business Rules

### BR-5.1: Queue Ordering by Submission Timestamp

**Rule Statement**  
Manual validation queues shall display reports ordered by submission timestamp, with oldest submissions appearing first to ensure timely processing and prevent backlog accumulation.

**Examples**
- Report submitted on 2026-02-01 10:00 AM appears before report submitted on 2026-02-01 11:00 AM
- Reports are ordered by original submission timestamp, not validation completion time

**Traceability**  
FRD: BR-5.1

**MVF Rationale**  
Ensures FIFO processing - prevents reports from being stuck in queue indefinitely.

---

### BR-5.2: Report Content Display Requirements

**Rule Statement**  
The system shall display all report content including transaction details, metadata, narrative fields, and submission information in a format that enables reviewers (Compliance Officers for CTRs, Analysts for STRs) to assess data quality, format consistency, and narrative clarity.

**Examples**
- Report content is displayed in a structured, readable format with clear field labels
- All transaction rows are visible with proper formatting
- Narrative fields are displayed in full text without truncation

**Traceability**  
FRD: BR-5.2

**MVF Rationale**  
Defines content display requirements - essential for reviewer capability.

---

### BR-5.4: Single Decision Per Report

**Rule Statement**  
Each report in the manual validation queue requires exactly one decision (Accept, Return for Correction, or Reject) before the report can proceed or be removed from the queue.

**Examples**
- Reviewer selects "Accept" → decision is final and report proceeds to next workflow stage
- Reviewer cannot select both "Accept" and "Return" simultaneously
- Once a decision is submitted, the report is removed from the validation queue

**Traceability**  
FRD: BR-5.4

**MVF Rationale**  
Defines decision workflow - prevents ambiguous or duplicate decisions.

---

### BR-5.5: Mandatory Reason for Return/Reject

**Rule Statement**  
When a reviewer chooses "Return for Correction" or "Reject," a mandatory text reason must be provided. The system shall prevent submission if the reason field is empty or contains only whitespace.

**Examples**
- Compliance Officer selects "Return" and enters reason "Date format inconsistent in transaction rows" → decision can be submitted
- Analyst selects "Reject" but leaves reason field empty → system displays error and prevents submission
- Reason must be at least 10 characters in length

**Traceability**  
FRD: BR-5.5

**MVF Rationale**  
Critical compliance rule - reasons are required for audit trail and entity communication.

---

### BR-5.6: Workflow Progression Blocking

**Rule Statement**  
Reports shall not proceed to the next workflow stage until manual validation is completed with an "Accept" decision. Reports with "Return" or "Reject" decisions do not proceed.

**Examples**
- CTR accepted by Compliance Officer → proceeds to Compliance Review/Decision stage
- STR accepted by Analyst → proceeds to Analysis stage
- Report returned by reviewer → remains in returned status, does not proceed

**Traceability**  
FRD: BR-5.6

**MVF Rationale**  
Prevents invalid states - ensures all downstream reports have been validated.

---

### BR-5.8: Validation Decision Audit Logging

**Rule Statement**  
Every validation decision made by a Compliance Officer (for CTRs) or Analyst (for STRs) shall be logged with immutable records including: staff member identity, decision type, timestamp, reason (if applicable), and report reference number.

**Examples**
- Log entry: `Compliance Officer: John Doe, Decision: Accept, Timestamp: 2026-02-03T10:30:00Z, Report: FIA-2026-001234`
- Log entry: `Analyst: Jane Smith, Decision: Return, Reason: "Date format inconsistent", Timestamp: 2026-02-03T11:15:00Z, Report: FIA-2026-001235`

**Traceability**  
FRD: BR-5.8

**MVF Rationale**  
Compliance requirement - audit trail is mandatory for FIU operations.

---

### BR-5.13: CTR Workflow Routing

**Rule Statement**  
CTRs that pass automated validation shall be routed directly to Compliance Officer queues for manual validation and regulatory review.

**Examples**
- CTR passes automated validation → appears in Compliance Officer queue
- CTR workflow: Automated Validation → Manual Validation (Compliance Officer) → Compliance Review

**Traceability**  
FRD: BR-5.13

**MVF Rationale**  
Core routing rule - CTRs must follow compliance review path.

---

### BR-5.14: STR Workflow Routing

**Rule Statement**  
STRs that pass automated validation shall be routed directly to Analyst queues for manual validation. After validation, STRs proceed to Analysis stage, bypassing compliance officer review entirely.

**Examples**
- STR passes automated validation → appears in Analyst validation queue
- STR accepted by Analyst → proceeds to Analysis stage
- STR workflow: Automated Validation → Manual Validation (Analyst) → Analysis (bypasses Compliance Review)

**Traceability**  
FRD: BR-5.14

**MVF Rationale**  
Core routing rule - STRs follow different path than CTRs.

---

## 6. Critical Error & Exception Handling

### ERR-VAL-001: Missing Mandatory Reason for Return/Reject

**Error Condition**  
Reviewer (Compliance Officer or Analyst) selects "Return for Correction" or "Reject" but does not provide a mandatory text reason or provides a reason that is empty or contains only whitespace.

**System Behavior**  
System prevents submission of the decision and displays an error message. The decision is not saved and the report remains in the validation queue.

**User Message**  
"Reason is mandatory for Return/Reject decisions. Please provide a detailed reason explaining your decision."

**Recovery Action**  
Reviewer must enter a meaningful reason (minimum 10 characters) in the reason field before the decision can be submitted.

**Traceability**  
FRD: ERR-VAL-001

**MVF Rationale**  
Blocking error - reasons are required for compliance and cannot be bypassed.

---

### ERR-VAL-002: Invalid Validation Decision

**Error Condition**  
System receives a validation decision that is not one of the allowed values (Accept, Return for Correction, Reject) or the decision is submitted for a report that is not in the appropriate validation queue.

**System Behavior**  
System rejects the invalid decision and logs a security event. The report remains in its current state.

**User Message**  
"Invalid validation decision. Please select a valid decision option (Accept, Return for Correction, or Reject)."

**Recovery Action**  
User must select a valid decision option from the available choices.

**Traceability**  
FRD: ERR-VAL-002

**MVF Rationale**  
Blocking error - invalid decisions would corrupt workflow state.

---

### ERR-VAL-003: Queue Access Violation

**Error Condition**  
A staff member attempts to access a validation queue for which they do not have appropriate permissions, or attempts to make a validation decision on a report assigned to another staff member.

**System Behavior**  
System denies access to the queue or prevents the decision submission. Security log entry is generated.

**User Message**  
"You do not have permission to access this queue" or "This report is assigned to another staff member."

**Recovery Action**  
User must contact system administrator to verify role permissions or report assignment.

**Traceability**  
FRD: ERR-VAL-003

**MVF Rationale**  
Security requirement - prevents unauthorized access to validation queues.

---

### ERR-VAL-006: Workflow Routing Failure

**Error Condition**  
System attempts to route an accepted report to the next workflow stage but routing fails due to system error or queue unavailability.

**System Behavior**  
System logs the routing failure and retries routing according to retry policy. Report remains in accepted state but may not appear in target queue until routing succeeds.

**User Message**  
(No user message - this is a system-side error)

**Recovery Action**  
System automatically retries routing. If routing continues to fail, system administrator must investigate queue availability and manually route report if necessary.

**Traceability**  
FRD: ERR-VAL-006

**MVF Rationale**  
Critical system error - reports must reach downstream queues for workflow to function.

---

## 7. Minimal Non-Functional Requirements

### NFR-VAL-SEC-1: Role-Based Queue Access

**Description**  
The system shall enforce role-based access control preventing staff members from accessing validation queues outside their role permissions.

**Measurement Criteria**  
100% of queue access attempts are validated against role permissions. Unauthorized access attempts are blocked and logged.

**Traceability**  
- FRD: NFR-VAL-SEC-1
- FR-5.1, ERR-VAL-003

**MVF Rationale**  
Basic security requirement - prevents unauthorized access to sensitive report data.

---

### NFR-VAL-SEC-2: Audit Log Immutability

**Description**  
The system shall maintain immutable audit logs for all validation decisions. Audit logs cannot be modified or deleted once created.

**Measurement Criteria**  
Audit logs are append-only and cannot be modified or deleted.

**Traceability**  
- FRD: NFR-VAL-SEC-2
- FR-5.8, BR-5.8

**MVF Rationale**  
Compliance requirement - audit integrity is mandatory for FIU operations.

---

### NFR-VAL-REL-3: Decision Processing Reliability

**Description**  
The system shall process validation decisions reliably, ensuring no decisions are lost or duplicated even in case of system errors.

**Measurement Criteria**  
All submitted validation decisions are processed exactly once. No decisions are lost or duplicated.

**Traceability**  
- FRD: NFR-VAL-REL-3
- FR-5.4, FR-5.6, ERR-VAL-006

**MVF Rationale**  
Basic reliability - validation decisions are critical workflow data that must not be lost.

---

## 8. MVF Acceptance Criteria

**AC-5.1: Reject Without Reason Prevention**  
Given a report in the manual validation queue, when the reviewer selects "Reject" without providing a reason, then the system displays an error and prevents submission of the decision.

**AC-5.2: CTR Routing to Compliance Queue**  
Given a CTR that passes automated validation and is accepted by a Compliance Officer, when validation is complete, then the report proceeds to Compliance Review/Decision stage.

**AC-5.3: STR Routing to Analyst Queue**  
Given an STR that passes automated validation and is accepted by an Analyst, when validation is complete, then the report proceeds to Analysis stage (bypassing Compliance review).

**AC-5.4: Queue Display Order**  
Given multiple reports in the manual validation queue, when the queue is displayed, then reports are ordered by submission timestamp with oldest first.

**AC-5.5: Validation Decision Logging**  
Given a validation decision is submitted, when the decision is processed, then the decision is logged with reviewer identity, decision type, timestamp, reason, and report reference.

---

## 9. What's Deferred

### 9.1 Deferred Functional Requirements

| FR ID | Description | Reason |
|-------|-------------|--------|
| FR-5.3 | Review notes and comments | Nice-to-have collaboration feature |
| FR-5.7 | Entity notification | Enhancement - entities can check portal |
| FR-5.9 | Resubmission allowance | Edge case - manual process initially |
| FR-5.10 | Resubmission tracking and linking | Edge case - supports FR-5.9 |
| FR-5.11 | Validation type distinction | Advanced workflow separation |
| FR-5.12 | STR manual validation requirement | Redundant - covered by FR-5.6 |
| FR-5.15 | Compliance officer CTR queue presentation | Covered by FR-5.1 with role-based filtering |
| FR-5.16 | CTR escalation flagging | Phase 2 - escalation workflow |
| FR-5.17 | Escalation queue display | Phase 2 - escalation workflow |

### 9.2 Deferred Business Rules

| BR ID | Description | Reason |
|-------|-------------|--------|
| BR-5.3 | Review notes visibility | Supports deferred FR-5.3 |
| BR-5.9 | Resubmission eligibility | Supports deferred FR-5.9 |
| BR-5.10 | Resubmission linking rules | Supports deferred FR-5.10 |
| BR-5.11 | Validation stage separation | Supports deferred FR-5.11 |
| BR-5.12 | Sequential validation requirement | Covered by FR-5.6 |
| BR-5.15 | Compliance officer queue ordering | Supports deferred FR-5.15 |
| BR-5.16 | CTR escalation flagging requirements | Supports deferred FR-5.16 |
| BR-5.17 | Escalation queue display requirements | Supports deferred FR-5.17 |

### 9.3 Deferred Error Handling

| ERR ID | Description | Reason |
|--------|-------------|--------|
| ERR-VAL-004 | Resubmission linking failure | Supports deferred FR-5.10 |
| ERR-VAL-005 | Notification delivery failure | Supports deferred FR-5.7 |
| ERR-VAL-007 | Concurrent validation attempt | Enhancement - locking |
| ERR-VAL-008 | Escalation flagging without justification | Supports deferred FR-5.16 |

### 9.4 Deferred Non-Functional Requirements

| NFR ID | Description | Reason |
|--------|-------------|--------|
| NFR-VAL-PERF-1 | Queue load time (2 seconds) | Performance optimization |
| NFR-VAL-PERF-2 | Decision processing time (2 seconds) | Performance optimization |
| NFR-VAL-PERF-3 | Report content display time (1 second) | Performance optimization |
| NFR-VAL-PERF-4 | Concurrent queue access (50 users) | Scale optimization |
| NFR-VAL-SEC-3 | Decision authentication | Use existing auth system |
| NFR-VAL-SEC-4 | Data confidentiality | Use existing auth system |
| NFR-VAL-REL-1 | Queue persistence | Enhancement |
| NFR-VAL-REL-2 | Notification delivery reliability | Supports deferred FR-5.7 |
| NFR-VAL-USAB-1 | Decision workflow clarity | Polish/refinement |
| NFR-VAL-USAB-2 | Report content readability | Polish/refinement |
| NFR-VAL-USAB-3 | Resubmission history visibility | Supports deferred FR-5.10 |
| NFR-VAL-USAB-4 | Error message clarity | Polish/refinement |
| NFR-VAL-COMPLY-1 | Audit trail completeness | Covered by basic logging |
| NFR-VAL-COMPLY-2 | FATF compliance | Compliance enhancement |
| NFR-VAL-COMPLY-3 | Data retention (10 years) | Long-term compliance |
| NFR-VAL-SCALE-1 | Queue volume growth (10x) | Scale for future growth |
| NFR-VAL-SCALE-2 | Staff member growth (100 users) | Scale for future growth |

### 9.5 Future Iteration Notes

**Iteration 2 Candidates:**
- FR-5.7 + ERR-VAL-005 + NFR-VAL-REL-2 (Entity notification)
- FR-5.3 + BR-5.3 (Review notes and comments)
- NFR-VAL-USAB-1/2/4 (Enhanced usability)

**Iteration 3 Candidates:**
- FR-5.9 + FR-5.10 + BR-5.9 + BR-5.10 + ERR-VAL-004 (Resubmission workflow)
- FR-5.15 + BR-5.15 (Compliance officer queue)
- ERR-VAL-007 (Concurrent validation handling)

**Iteration 4 Candidates:**
- FR-5.16 + FR-5.17 + BR-5.16 + BR-5.17 + ERR-VAL-008 (Escalation workflow)
- NFR-VAL-PERF-1/2/3/4 (Performance optimizations)
- NFR-VAL-SCALE-1/2 (Scalability)

**Risks of Deferral:**
- No entity notifications means reporting entities must manually check portal for validation status
- No resubmission tracking means manual process for returned reports
- No escalation workflow means CTRs cannot be flagged for STR conversion in MVF

---

## 10. Glossary

| Term | Definition |
|------|------------|
| **Compliance Officer** | FIA Compliance Officer who performs manual validation on CTRs for data quality, format consistency, and regulatory conformity |
| **Analyst** | FIA Analyst who performs manual validation on STRs for data quality and format consistency |
| **CTR** | Currency Transaction Report - filed for large cash transactions |
| **STR** | Suspicious Transaction Report - filed for potentially suspicious activity |
| **Accept** | Validation decision approving a report to proceed to next workflow stage |
| **Return for Correction** | Validation decision sending a report back to the entity for fixes |
| **Reject** | Validation decision permanently rejecting a report from the workflow |
| **Validation Queue** | System queue displaying reports awaiting validation decisions |
| **Audit Log** | Immutable record of validation decisions for compliance purposes |

*See FRD Glossary for complete definitions.*

---

## 11. Approval

**Prepared by:** Product Management  
**Reviewed by:** [To be filled]  
**Approved by:** [To be filled]  
**Date:** [To be filled]

---

## 12. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | February 2026 | Product Management | Initial MVF specification derived from FRD v1.0 |
