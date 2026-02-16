# Minimum Viable Feature (MVF) Specification
## Feature 4: Automated Validation Engine

**Document Version:** 1.0  
**Date:** February 2026  
**Source FRD Version:** FRD v1.0 (frd_automated_validation_engine.md)  
**Feature ID:** FR-4-MVF  
**Phase:** Phase 1 - Foundation  
**Status:** Draft

---

## 1. MVF Overview

### 1.1 MVF Description
The MVF delivers core automated validation of file format, mandatory fields, and data types for STR/CTR submissions, with immediate rejection feedback and queue routing for valid reports.

### 1.2 Core Value Proposition
Enable the system to automatically filter out technically invalid reports before they reach FIA staff, ensuring only processable submissions enter the manual review workflow.

### 1.3 User Story
**As** the system,  
**I want to** automatically validate report file format and mandatory fields,  
**So that** only technically correct reports reach FIA officers for manual review.

---

## 2. Scope

### 2.1 In MVF Scope
- File format validation (Excel .xlsx/.xls; XML GoAML schema)
- Mandatory field presence validation for STR and CTR
- Core data type validation (dates, amounts)
- Automated rejection for failed validations
- Basic validation error reporting
- Rejection notification to submitting entities
- Routing validated reports to manual validation queue
- Basic validation logging
- Report type-based queue routing (CTR/STR)

### 2.2 Deferred to Future Iterations

| ID | Requirement | Reason for Deferral |
|----|-------------|---------------------|
| FR-4.4 | Report type classification matching | Enhancement - mismatches can be caught in manual review |
| BR-4.7 | Report type content matching rule | Supports deferred FR-4.4 |
| BR-4.10 | 10-second notification timing SLA | Performance optimization - basic notification sufficient for MVF |
| ERR-VAL-006 | Invalid amount value (negative/range) | Edge case validation |
| ERR-VAL-008 | Report type mismatch handling | Supports deferred FR-4.4 |
| ERR-VAL-009 | Validation timeout handling | Edge case - rare scenario |
| ERR-VAL-010 | System processing error handling | Edge case - rare scenario |
| NFR-PERF-002 | 10-second notification delivery SLA | Performance optimization |
| NFR-PERF-003 | 5-second queue routing time | Performance optimization |
| NFR-PERF-004 | 50 concurrent validation capacity | Scale optimization |
| NFR-SEC-001 | Immutable validation log integrity | Advanced security feature |
| NFR-SEC-003 | Access control for validation results | Can use existing auth system initially |
| NFR-REL-002 | Graceful degradation | Enhancement |
| NFR-REL-003 | Auto-retry failed validations | Enhancement |
| NFR-USAB-001 | Clear error message user testing | Polish/refinement |
| NFR-USAB-002 | Actionable feedback guidance | Polish/refinement |
| NFR-USAB-003 | Structured error report format | Polish/refinement |
| NFR-SCALE-001 | 10x volume scaling | Scale for future growth |
| NFR-COMPLY-001 | 7-year audit trail retention | Long-term compliance |
| NFR-MAINT-001 | Configurable validation rules without code deployment | Enhancement |
| NFR-MAINT-002 | Real-time monitoring dashboards | Enhancement |

### 2.3 Purpose
This MVF enables rapid delivery of core validation functionality, allowing the system to accept submissions and filter out invalid reports immediately while more advanced features are developed iteratively.

---

## 3. Essential Actors / Roles

### 3.1 System (Primary Actor)
**Description:** The automated validation engine  
**Core Capabilities:**
- Execute file format validation
- Check mandatory field presence
- Validate core data types
- Generate validation error lists
- Reject invalid submissions
- Route valid reports to queues
- Send rejection notifications

### 3.2 Reporting Entity User
**Description:** Compliance officers who submit reports  
**Core Capabilities:**
- Receive validation pass/fail result
- View error list for failed submissions
- Receive rejection notifications

### 3.3 Manual Validation Recipients (FIA)
**Description:** FIA staff who review validated reports  
**Core Capabilities:**
- Receive reports that passed validation in their queue

---

## 4. Core Functional Requirements

### FR-4.1: File Format Validation

**Description**  
The system shall automatically validate file format (Excel: .xlsx/.xls; XML: GoAML schema compliance) upon submission.

**Actor**  
System

**Traceability**  
- FRD: FR-4.1
- PRD: US-4.1

**Business Rules**  
BR-4.1, BR-4.2

**MVF Rationale**  
Core functionality - cannot process reports without verifying they are in a readable format.

---

### FR-4.2: Mandatory Field Presence Check

**Description**  
The system shall check for presence of all mandatory fields defined for each report type (STR, CTR).

**Actor**  
System

**Traceability**  
- FRD: FR-4.2
- PRD: US-4.1

**Business Rules**  
BR-4.3, BR-4.4

**MVF Rationale**  
Core functionality - reports missing mandatory fields are unusable and must be rejected.

---

### FR-4.3: Data Type Validation

**Description**  
The system shall validate data types for each field (dates as dates, amounts as numbers).

**Actor**  
System

**Traceability**  
- FRD: FR-4.3
- PRD: US-4.1

**Business Rules**  
BR-4.5, BR-4.6

**MVF Rationale**  
Core functionality - invalid data types prevent downstream processing and analysis.

---

### FR-4.5: Automatic Rejection

**Description**  
The system shall automatically reject reports that fail format or mandatory field validation without human intervention.

**Actor**  
System

**Traceability**  
- FRD: FR-4.5
- PRD: US-4.1

**Business Rules**  
BR-4.8

**MVF Rationale**  
Core workflow - invalid reports must be stopped before reaching manual review queues.

---

### FR-4.6: Validation Error Report

**Description**  
The system shall generate a validation error report listing each failure (field name, issue type, location).

**Actor**  
System

**Traceability**  
- FRD: FR-4.6
- PRD: US-4.1

**Business Rules**  
BR-4.9

**MVF Rationale**  
Essential feedback - users must know what errors to fix for resubmission.

---

### FR-4.7: Rejection Notification

**Description**  
The system shall send rejection notifications to the submitting entity with error details.

**Actor**  
System

**Traceability**  
- FRD: FR-4.7
- PRD: US-4.1

**Business Rules**  
None (timing SLA deferred)

**MVF Rationale**  
Essential communication - users must be informed when their submission fails validation.

---

### FR-4.8: Manual Validation Queue Routing

**Description**  
The system shall pass reports that succeed automated validation to the manual validation queue.

**Actor**  
System

**Traceability**  
- FRD: FR-4.8
- PRD: US-4.1

**Business Rules**  
BR-4.11

**MVF Rationale**  
Core workflow - validated reports must flow to the next stage for manual review.

---

### FR-4.9: Validation Outcome Logging

**Description**  
The system shall log all validation outcomes (pass/fail, error types, timestamp) for audit purposes.

**Actor**  
System

**Traceability**  
- FRD: FR-4.9
- PRD: US-4.1

**Business Rules**  
BR-4.12

**MVF Rationale**  
Compliance requirement - audit trail of validation decisions is mandatory for FIU operations.

---

### FR-4.10: Report Type-Based Queue Routing

**Description**  
The system shall route validated reports to appropriate queues based on report type: CTRs to compliance officer queue, STRs to analysis queue.

**Actor**  
System

**Traceability**  
- FRD: FR-4.10
- PRD: US-4.1

**Business Rules**  
BR-4.13, BR-4.14

**MVF Rationale**  
Core workflow - CTRs and STRs follow different processing paths; correct routing is essential.

---

## 5. Essential Business Rules

### BR-4.1: Supported Excel Formats

**Rule Statement**  
The system shall accept only .xlsx and .xls file formats for Excel submissions.

**Examples**
- report.xlsx → Accepted
- report.xls → Accepted
- report.csv → Rejected
- report.pdf → Rejected

**Traceability**  
FRD: BR-4.1

**MVF Rationale**  
Defines acceptable input formats - core to format validation.

---

### BR-4.2: GoAML XML Schema Compliance

**Rule Statement**  
XML submissions shall comply with the GoAML XML schema.

**Examples**
- Valid GoAML XML → Accepted
- Missing required elements → Rejected
- Malformed XML → Rejected

**Traceability**  
FRD: BR-4.2

**MVF Rationale**  
Defines XML validation criteria - core to format validation.

---

### BR-4.3: STR Mandatory Fields

**Rule Statement**  
STR reports shall contain all mandatory fields as defined in the STR template specification.

**Examples**
- STR with all mandatory fields → Valid
- STR missing "Transaction Date" → Invalid
- STR missing "Amount" → Invalid

**Traceability**  
FRD: BR-4.3

**MVF Rationale**  
Defines STR validation criteria - core to mandatory field validation.

---

### BR-4.4: CTR Mandatory Fields

**Rule Statement**  
CTR reports shall contain all mandatory fields as defined in the CTR template specification.

**Examples**
- CTR with all mandatory fields → Valid
- CTR missing "Transaction Date" → Invalid
- CTR missing "Total Transaction Amount" → Invalid

**Traceability**  
FRD: BR-4.4

**MVF Rationale**  
Defines CTR validation criteria - core to mandatory field validation.

---

### BR-4.5: Date Field Format

**Rule Statement**  
All date fields shall be in YYYY-MM-DD HH24:MI:SS format and represent valid calendar dates.

**Examples**
- 2026-02-05 14:30:00 → Valid
- 2026-02-30 00:00:00 → Invalid (February 30 does not exist)
- "February 5, 2026" → Invalid (wrong format)

**Traceability**  
FRD: BR-4.5

**MVF Rationale**  
Defines date validation criteria - core to data type validation.

---

### BR-4.6: Amount Field Format

**Rule Statement**  
All amount fields shall contain numeric values only, with optional decimal point. No commas, currency symbols, or text allowed.

**Examples**
- 500000.50 → Valid
- 5,456.56 → Invalid (comma not allowed)
- "five thousand" → Invalid (text not allowed)

**Traceability**  
FRD: BR-4.6

**MVF Rationale**  
Defines numeric validation criteria - core to data type validation.

---

### BR-4.8: Auto-Rejection Criteria

**Rule Statement**  
Reports shall be automatically rejected when:
1. File format is invalid or corrupted
2. One or more mandatory fields are missing
3. One or more fields contain invalid data types

**Examples**
- Corrupted .xlsx file → Auto-reject
- Missing "Transaction Date" → Auto-reject
- Text in numeric field → Auto-reject

**Traceability**  
FRD: BR-4.8

**MVF Rationale**  
Defines rejection triggers - core to auto-rejection workflow.

---

### BR-4.9: Error Report Content

**Rule Statement**  
Validation error reports shall include for each error: field name, error type, and row/location.

**Examples**
- "Field 'Transaction Date' is missing in Row 3"
- "Field 'Amount' must be numeric. Found 'five thousand' in Row 2"

**Traceability**  
FRD: BR-4.9

**MVF Rationale**  
Defines error feedback - essential for users to correct and resubmit.

---

### BR-4.11: Validation Pass Routing

**Rule Statement**  
Reports passing all automated validation checks shall be routed to the manual validation queue.

**Examples**
- Valid CTR → Compliance Officer queue for CTR
- Valid STR → Analyst queue for STR

**Traceability**  
FRD: BR-4.11

**MVF Rationale**  
Defines routing for valid reports - core workflow.

---

### BR-4.12: Validation Logging Requirements

**Rule Statement**  
All validation outcomes shall be logged with: submission reference, validation result (pass/fail), error details (if any), and timestamp.

**Examples**
- Log: REF-2026-00001, PASS, null, 2026-02-05 14:30:05
- Log: REF-2026-00002, FAIL, ["Missing field: Transaction Date"], 2026-02-05 14:31:10

**Traceability**  
FRD: BR-4.12

**MVF Rationale**  
Audit compliance requirement - validation decisions must be logged.

---

### BR-4.13: CTR Workflow Routing

**Rule Statement**  
CTRs passing automated validation shall be routed to the compliance officer queue.

**Examples**
- Validated CTR → Compliance Officer Queue

**Traceability**  
FRD: BR-4.13

**MVF Rationale**  
Core routing - CTRs must enter compliance workflow.

---

### BR-4.14: STR Workflow Routing

**Rule Statement**  
STRs passing automated validation shall be routed to the analysis queue.

**Examples**
- Validated STR → Analysis Queue

**Traceability**  
FRD: BR-4.14

**MVF Rationale**  
Core routing - STRs must enter analysis workflow.

---

## 6. Critical Error & Exception Handling

### ERR-VAL-001: Invalid File Format

**Error Condition**  
Submitted file is not .xlsx, .xls, or valid GoAML XML

**System Behavior**  
Reject submission immediately

**User Message**  
"Submission rejected: Invalid file format. Supported formats are .xlsx, .xls for Excel, or GoAML-compliant XML."

**Recovery Action**  
Re-submit using correct file format

**Traceability**  
FRD: ERR-VAL-001

**MVF Rationale**  
Blocking error - invalid format prevents any processing.

---

### ERR-VAL-002: Corrupted File

**Error Condition**  
File cannot be read or parsed

**System Behavior**  
Reject submission; log error

**User Message**  
"Submission rejected: File format corrupted or unreadable. Please verify the file opens correctly and re-submit."

**Recovery Action**  
Verify file integrity; re-submit

**Traceability**  
FRD: ERR-VAL-002

**MVF Rationale**  
Blocking error - corrupted file prevents any processing.

---

### ERR-VAL-003: Missing Mandatory Field

**Error Condition**  
One or more mandatory fields are empty or missing

**System Behavior**  
Reject submission; generate error report

**User Message**  
"Submission rejected: Mandatory field '[FIELD_NAME]' is missing in Row [ROW_NUMBER]."

**Recovery Action**  
Complete missing fields; re-submit

**Traceability**  
FRD: ERR-VAL-003

**MVF Rationale**  
Blocking error - missing mandatory fields make report unusable.

---

### ERR-VAL-004: Invalid Date Format

**Error Condition**  
Date field does not conform to YYYY-MM-DD HH24:MI:SS format

**System Behavior**  
Reject submission; identify field and row

**User Message**  
"Submission rejected: Field '[FIELD_NAME]' must be a valid date in format YYYY-MM-DD HH24:MI:SS. Found '[VALUE]' in Row [ROW_NUMBER]."

**Recovery Action**  
Correct date format; re-submit

**Traceability**  
FRD: ERR-VAL-004

**MVF Rationale**  
Blocking error - invalid dates prevent data processing.

---

### ERR-VAL-005: Invalid Numeric Format

**Error Condition**  
Numeric field contains non-numeric characters

**System Behavior**  
Reject submission; identify field and row

**User Message**  
"Submission rejected: Field '[FIELD_NAME]' must be numeric. Found '[VALUE]' in Row [ROW_NUMBER]."

**Recovery Action**  
Correct numeric format; re-submit

**Traceability**  
FRD: ERR-VAL-005

**MVF Rationale**  
Blocking error - invalid numbers prevent calculations and analysis.

---

### ERR-VAL-007: XML Schema Validation Failure

**Error Condition**  
XML file does not comply with GoAML schema

**System Behavior**  
Reject submission; list schema errors

**User Message**  
"Submission rejected: XML does not comply with GoAML schema. Error: [SCHEMA_ERROR_DETAILS]"

**Recovery Action**  
Correct XML structure; re-submit

**Traceability**  
FRD: ERR-VAL-007

**MVF Rationale**  
Blocking error - invalid XML schema prevents processing.

---

## 7. Minimal Non-Functional Requirements

### NFR-PERF-001: Validation Processing Time

**Description**  
The system shall complete automated validation within 30 seconds of submission for 95% of reports.

**Measurement Criteria**  
Time from submission receipt to validation result

**Traceability**  
- FRD: NFR-PERF-001 (relaxed from 10 seconds to 30 seconds for MVF)
- FR-4.1

**MVF Rationale**  
Basic performance expectation - users need timely feedback, but strict 10-second SLA can be optimized later.

---

### NFR-SEC-002: Secure Error Reporting

**Description**  
The system shall not expose sensitive data or system internals in error messages.

**Measurement Criteria**  
No stack traces or internal paths in user-facing messages

**Traceability**  
- FRD: NFR-SEC-002
- FR-4.6, FR-4.7

**MVF Rationale**  
Basic security requirement - prevents information disclosure vulnerabilities.

---

### NFR-REL-001: Validation Availability

**Description**  
The validation engine shall be available during system operating hours.

**Measurement Criteria**  
Validation service operational when submission portal is accessible

**Traceability**  
- FRD: NFR-REL-001 (relaxed from 99.5% SLA)
- FR-4.1

**MVF Rationale**  
Basic reliability - validation must work when users submit reports.

---

### NFR-COMPLY-002: Basic Audit Compliance

**Description**  
The system shall log validation outcomes sufficient for audit inquiry.

**Measurement Criteria**  
Validation logs contain submission reference, result, timestamp, and errors

**Traceability**  
- FRD: NFR-COMPLY-002, FR-4.9
- BR-4.12

**MVF Rationale**  
Compliance requirement - FIU must maintain audit trail of validation decisions.

---

## 8. MVF Acceptance Criteria

**AC-4.1: Missing Mandatory Field Detection**  
Given a report with a missing mandatory field, when validation runs, then the system rejects with an error message identifying the missing field.

**AC-4.2: Successful Validation Routing**  
Given a valid report with all mandatory fields and correct format, when validation runs, then the report moves to the manual validation queue (Compliance Officer queue for CTRs, Analyst queue for STRs).

**AC-4.3: Error Report Visibility**  
Given a rejected report, when the submitting entity checks status, then they see the error list explaining validation failures.

**AC-4.4: CTR Queue Routing**  
Given a validated CTR, then it appears in the Compliance Officer validation queue for CTR processing.

**AC-4.5: STR Queue Routing**  
Given a validated STR, then it appears in the Analyst validation queue for STR processing.

---

## 9. What's Deferred

### 9.1 Deferred Functional Requirements

| FR ID | Description | Reason |
|-------|-------------|--------|
| FR-4.4 | Report type classification matching | Enhancement - mismatches detectable in manual review |

### 9.2 Deferred Business Rules

| BR ID | Description | Reason |
|-------|-------------|--------|
| BR-4.7 | Report type content matching | Supports deferred FR-4.4 |
| BR-4.10 | 10-second notification timing | Performance optimization |

### 9.3 Deferred Error Handling

| ERR ID | Description | Reason |
|--------|-------------|--------|
| ERR-VAL-006 | Invalid amount value (negative/range) | Edge case - rare scenario |
| ERR-VAL-008 | Report type mismatch | Supports deferred FR-4.4 |
| ERR-VAL-009 | Validation timeout | Edge case - system error handling |
| ERR-VAL-010 | System processing error | Edge case - system error handling |

### 9.4 Deferred Non-Functional Requirements

| NFR ID | Description | Reason |
|--------|-------------|--------|
| NFR-PERF-002 | 10-second notification delivery | Performance optimization |
| NFR-PERF-003 | 5-second queue routing | Performance optimization |
| NFR-PERF-004 | 50 concurrent validations | Scale requirement |
| NFR-SEC-001 | Immutable log integrity | Advanced security |
| NFR-SEC-003 | Access control for results | Use existing auth initially |
| NFR-REL-002 | Graceful degradation | Enhancement |
| NFR-REL-003 | Auto-retry failed validations | Enhancement |
| NFR-USAB-001 | Clear error messages (tested) | Polish/refinement |
| NFR-USAB-002 | Actionable feedback | Polish/refinement |
| NFR-USAB-003 | Structured error format | Polish/refinement |
| NFR-SCALE-001 | 10x volume scaling | Future scalability |
| NFR-COMPLY-001 | 7-year retention policy | Long-term compliance |
| NFR-MAINT-001 | Configurable rules | Enhancement |
| NFR-MAINT-002 | Monitoring dashboards | Enhancement |

### 9.5 Future Iteration Notes

**Iteration 2 Candidates:**
- FR-4.4 + BR-4.7 + ERR-VAL-008 (Report type classification matching)
- NFR-USAB-001/002/003 (Enhanced error messaging)
- ERR-VAL-006 (Negative amount validation)

**Iteration 3 Candidates:**
- NFR-PERF-002/003/004 (Performance optimizations)
- NFR-REL-002/003 (Reliability enhancements)
- NFR-MAINT-001/002 (Maintainability features)

**Risks of Deferral:**
- Report type mismatches will require manual detection until FR-4.4 is implemented
- Basic error messages may require support assistance for some users
- No auto-retry means manual intervention for system errors

---

## 10. Glossary

| Term | Definition |
|------|------------|
| **STR** | Suspicious Transaction Report |
| **CTR** | Currency Transaction Report |
| **GoAML** | UNODC anti-money laundering XML schema standard |
| **FIA** | Financial Intelligence Authority (Liberia) |
| **Automated Validation** | System-driven validation without human intervention |
| **Mandatory Field** | Field that must be populated for validation to pass |
| **Data Type Validation** | Verification that values match expected types (date, numeric) |

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
