# Functional Requirements Document (FRD)
## Feature 4: Automated Validation Engine

**Document Version:** 1.0  
**Date:** February 2026  
**Source:** PRD v1.0  
**Feature ID:** FR-4  
**Phase:** Phase 1 - Foundation (Months 1-8)  
**Status:** Draft

---

## 1. Feature Overview

### 1.1 Purpose
The Automated Validation Engine automatically validates report file format, mandatory fields, and data types for all submitted STR and CTR reports, ensuring only technically correct reports reach FIA officers for manual review.

### 1.2 Business Context
- **Current State:** Manual validation of report format and completeness is time-consuming and error-prone
- **Target State:** System automatically validates all submissions within 10 seconds, rejecting non-compliant reports with detailed error feedback
- **Value:** Reduces manual review burden, ensures data quality, provides instant feedback to reporting entities

### 1.3 User Story
**As** the system,  
**I want to** automatically validate report file format and mandatory fields,  
**So that** only technically correct reports reach FIA officers for manual review.

---

## 2. Scope & Feature Context

### 2.1 In Scope
- File format validation (Excel: .xlsx/.xls; XML: GoAML schema compliance)
- Mandatory field presence validation for STR and CTR report types
- Data type validation (dates, amounts, identifiers)
- Report type classification verification (STR vs CTR content matching)
- Automated rejection with detailed error reporting
- Automated notification to submitting entities
- Validation outcome logging for audit purposes
- Routing of validated reports to appropriate workflow queues

### 2.2 Out of Scope
- Content quality review (handled by Manual Validation Workflow - Feature 5)
- Narrative assessment or red-flag detection
- Regulatory compliance analysis
- Duplicate detection (handled by Submission features)
- Manual override of validation results
- Custom validation rule configuration by users

### 2.3 Purpose
Automated validation ensures data integrity and completeness before human review, reducing processing time and improving report quality through immediate, actionable feedback to reporting entities.

---

## 3. Actors / Roles

### 3.1 System (Primary Actor)
**Description:** The automated validation engine that processes submitted reports  
**Capabilities:**
- Execute format validation checks
- Verify mandatory field presence
- Validate data types
- Generate validation error reports
- Route validated reports to appropriate queues
- Send automated notifications

### 3.2 Reporting Entity User
**Description:** Compliance officers at reporting entities who submit reports  
**Capabilities:**
- Receive validation results (pass/fail)
- View detailed error reports for failed validations
- Receive rejection notifications with error details

### 3.3 Manual Validation Recipients (FIA)
**Description:** FIA staff who receive validated reports for manual review  
**Capabilities:**
- Receive reports that passed automated validation
- View validation status and timestamp

### 3.4 System Administrator
**Description:** Technical staff managing validation rules and configurations  
**Capabilities:**
- Monitor validation performance
- Review validation logs
- Manage validation rule configurations

---

## 4. Functional Requirements

### 4.1 File Format Validation

**FR-4.1: File Format Validation**

**Description**  
The system shall automatically validate file format (Excel: .xlsx/.xls; XML: GoAML schema compliance) within 10 seconds of submission.

**Actor**  
System

**Traceability**  
PRD Feature 4, FR-4.1; US-4.1

**Business Rules**  
BR-4.1, BR-4.2

---

### 4.2 Mandatory Field Validation

**FR-4.2: Mandatory Field Presence Check**

**Description**  
The system shall check for presence of all mandatory fields defined for each report type (STR, CTR).

**Actor**  
System

**Traceability**  
PRD Feature 4, FR-4.2; US-4.1

**Business Rules**  
BR-4.3, BR-4.4

---

### 4.3 Data Type Validation

**FR-4.3: Data Type Validation**

**Description**  
The system shall validate data types for each field (dates as dates, amounts as numbers, IDs as text).

**Actor**  
System

**Traceability**  
PRD Feature 4, FR-4.3; US-4.1

**Business Rules**  
BR-4.5, BR-4.6

---

### 4.4 Report Type Classification Verification

**FR-4.4: Report Type Classification Matching**

**Description**  
The system shall verify that report type classification matches content (STR vs CTR) and flag mismatches for manual review.

**Actor**  
System

**Traceability**  
PRD Feature 4, FR-4.4; US-4.1

**Business Rules**  
BR-4.7

---

### 4.5 Auto-Rejection

**FR-4.5: Automatic Rejection**

**Description**  
The system shall automatically reject reports that fail format or mandatory field validation without human intervention.

**Actor**  
System

**Traceability**  
PRD Feature 4, FR-4.5; US-4.1

**Business Rules**  
BR-4.8

---

### 4.6 Validation Error Report Generation

**FR-4.6: Detailed Validation Error Report**

**Description**  
The system shall generate a detailed validation error report listing each specific failure (field name, issue type, location).

**Actor**  
System

**Traceability**  
PRD Feature 4, FR-4.6; US-4.1

**Business Rules**  
BR-4.9

---

### 4.7 Rejection Notification

**FR-4.7: Automated Rejection Notification**

**Description**  
The system shall send automated rejection notifications to submitting entity with error details within 10 seconds of validation failure.

**Actor**  
System

**Traceability**  
PRD Feature 4, FR-4.7; US-4.1

**Business Rules**  
BR-4.10

---

### 4.8 Queue Routing (Passed Validation)

**FR-4.8: Manual Validation Queue Routing**

**Description**  
The system shall pass reports that succeed automated validation to the manual validation queue (Compliance Officer queue for CTRs, Analyst queue for STRs).

**Actor**  
System

**Traceability**  
PRD Feature 4, FR-4.8; US-4.1

**Business Rules**  
BR-4.11

---

### 4.9 Validation Logging

**FR-4.9: Validation Outcome Logging**

**Description**  
The system shall log all validation outcomes (pass/fail, error types, timestamp) for audit purposes.

**Actor**  
System

**Traceability**  
PRD Feature 4, FR-4.9; US-4.1

**Business Rules**  
BR-4.12

---

### 4.10 Report Type Queue Routing

**FR-4.10: Report Type-Based Queue Routing**

**Description**  
The system shall route validated reports to appropriate queues based on report type: CTRs to compliance officer queue (for Compliance workflow), STRs to analysis queue (for direct Analysis workflow).

**Actor**  
System

**Traceability**  
PRD Feature 4, FR-4.10; US-4.1

**Business Rules**  
BR-4.13, BR-4.14

---

## 5. Business Rules

### 5.1 Format Validation Rules

**BR-4.1: Supported Excel Formats**

**Rule Statement**  
The system shall accept only .xlsx and .xls file formats for Excel submissions.

**Examples**
- report.xlsx → Accepted
- report.xls → Accepted
- report.csv → Rejected
- report.pdf → Rejected

---

**BR-4.2: GoAML XML Schema Compliance**

**Rule Statement**  
XML submissions shall comply with the GoAML XML schema (version as defined in GoAML Schema 06012026.xsd).

**Examples**
- XML file with valid GoAML structure → Accepted
- XML file with missing required elements → Rejected
- Malformed XML → Rejected

---

### 5.2 Mandatory Field Rules

**BR-4.3: STR Mandatory Fields**

**Rule Statement**  
STR reports shall contain all mandatory fields as defined in the STR template specification.

**Examples**
- STR with all mandatory fields populated → Valid
- STR missing "Transaction Date" → Invalid (ERR-VAL-002)
- STR missing "Amount" → Invalid (ERR-VAL-002)
- STR missing "FOCUS ID" → Invalid (ERR-VAL-002)

---

**BR-4.4: CTR Mandatory Fields**

**Rule Statement**  
CTR reports shall contain all mandatory fields as defined in the CTR template specification.

**Examples**
- CTR with all mandatory fields populated → Valid
- CTR missing "Transaction Date" → Invalid (ERR-VAL-002)
- CTR missing "Total Transaction Amount" → Invalid (ERR-VAL-002)
- CTR missing "FOCUS ID" → Invalid (ERR-VAL-002)

---

### 5.3 Data Type Rules

**BR-4.5: Date Field Format**

**Rule Statement**  
All date fields shall be in YYYY-MM-DD HH24:MI:SS format and represent valid calendar dates.

**Examples**
- 2026-02-05 14:30:00 → Valid
- 2026-02-30 00:00:00 → Invalid (February 30 does not exist)
- "February 5, 2026" → Invalid (wrong format)
- 05-02-2026 → Invalid (wrong format)

---

**BR-4.6: Amount Field Format**

**Rule Statement**  
All amount fields shall contain numeric values only, with optional decimal point. No commas, currency symbols, or text allowed.

**Examples**
- 500000.50 → Valid
- 5456.56 → Valid
- 5,456.56 → Invalid (comma not allowed)
- "five thousand" → Invalid (text not allowed)
- $5000 → Invalid (currency symbol not allowed)
- 5000-51000 → Invalid (range not allowed)
- -5000 → Invalid (negative amounts not allowed for transaction values)

---

### 5.4 Report Type Rules

**BR-4.7: Report Type Content Matching**

**Rule Statement**  
The declared report type (STR or CTR) shall match the content structure of the submitted report. Mismatches shall be flagged for manual review rather than auto-rejected.

**Examples**
- Report declared as CTR with CTR field structure → Valid
- Report declared as STR with STR field structure → Valid
- Report declared as CTR containing STR-specific fields (e.g., "Reason for Suspicion") → Flagged for manual review

---

### 5.5 Rejection Rules

**BR-4.8: Auto-Rejection Criteria**

**Rule Statement**  
Reports shall be automatically rejected without human intervention when:
1. File format is invalid or corrupted
2. One or more mandatory fields are missing
3. One or more fields contain invalid data types

**Examples**
- Corrupted .xlsx file → Auto-reject
- Missing "Transaction Date" → Auto-reject
- Text in numeric field → Auto-reject

---

### 5.6 Error Reporting Rules

**BR-4.9: Error Report Content**

**Rule Statement**  
Validation error reports shall include for each error: field name, error type, row/location, and expected format.

**Examples**
- "Field 'Transaction Date' is missing in Row 3"
- "Field 'Amount' must be numeric. Found 'five thousand' in Row 2"
- "File format corrupted or unreadable"

---

### 5.7 Notification Rules

**BR-4.10: Rejection Notification Timing**

**Rule Statement**  
Automated rejection notifications shall be sent to the submitting entity within 10 seconds of validation failure determination.

**Examples**
- Validation fails at 14:30:05 → Notification sent by 14:30:15

---

### 5.8 Queue Routing Rules

**BR-4.11: Validation Pass Routing**

**Rule Statement**  
Reports passing all automated validation checks shall be immediately routed to the manual validation queue.

**Examples**
- Valid CTR passes all checks → Appears in Compliance Officer queue for CTR processing
- Valid STR passes all checks → Appears in Analyst queue for STR processing

---

**BR-4.12: Validation Logging Requirements**

**Rule Statement**  
All validation outcomes shall be logged with: submission reference, validation result (pass/fail), error details (if any), timestamp, and processing duration.

**Examples**
- Log entry: REF-2026-00001, PASS, null, 2026-02-05 14:30:05, 3.2s
- Log entry: REF-2026-00002, FAIL, ["Missing field: Transaction Date"], 2026-02-05 14:31:10, 1.8s

---

**BR-4.13: CTR Workflow Routing**

**Rule Statement**  
CTRs passing automated validation shall be routed to the compliance officer queue for Compliance workflow processing.

**Examples**
- Validated CTR → Compliance Officer Queue → Compliance Review

---

**BR-4.14: STR Workflow Routing**

**Rule Statement**  
STRs passing automated validation shall be routed to the analysis queue, bypassing compliance officer review.

**Examples**
- Validated STR → Analysis Queue → Analyst Assignment

---

## 6. Acceptance Criteria

**AC-4.1: Missing Mandatory Field Detection**  
Given a report with missing mandatory field "Beneficiary Name," when validation runs, then the system auto-rejects with error message identifying the specific missing field.

**AC-4.2: Successful Validation Routing**  
Given a report with all mandatory fields and correct format, when validation runs, then the system moves report to manual validation queue within 5 seconds (Compliance Officer queue for CTRs, Analyst queue for STRs).

**AC-4.3: Error Report Visibility**  
Given an auto-rejected report, when the submitting entity checks status, then they see the detailed error list explaining each validation failure.

**AC-4.4: CTR Queue Routing**  
Given a CTR that passes automated validation, when routed to manual validation, then it appears in the Compliance Officer validation queue for CTR processing.

**AC-4.5: STR Queue Routing**  
Given an STR that passes automated validation, when routed to manual validation, then it appears in the Analyst validation queue for STR processing.

---

## 7. Error & Exception Handling

### 7.1 Format Errors

**ERR-VAL-001: Invalid File Format**

**Error Condition**  
Submitted file is not .xlsx, .xls, or valid GoAML XML

**System Behavior**  
Reject submission immediately; do not process further

**User Message**  
"Submission rejected: Invalid file format. Supported formats are .xlsx, .xls for Excel, or GoAML-compliant XML."

**Recovery Action**  
Re-submit using correct file format

---

**ERR-VAL-002: Corrupted File**

**Error Condition**  
File cannot be read or parsed (corrupted, incomplete download)

**System Behavior**  
Reject submission; log error details

**User Message**  
"Submission rejected: File format corrupted or unreadable. Please verify the file opens correctly and re-submit."

**Recovery Action**  
Verify file integrity; re-download template if needed; re-submit

---

### 7.2 Mandatory Field Errors

**ERR-VAL-003: Missing Mandatory Field**

**Error Condition**  
One or more mandatory fields are empty or missing

**System Behavior**  
Reject submission; generate error report listing all missing fields

**User Message**  
"Submission rejected: Mandatory field '[FIELD_NAME]' is missing in Row [ROW_NUMBER]. Please complete all required fields."

**Recovery Action**  
Complete missing fields; re-submit

---

### 7.3 Data Type Errors

**ERR-VAL-004: Invalid Date Format**

**Error Condition**  
Date field does not conform to YYYY-MM-DD HH24:MI:SS format or contains invalid date

**System Behavior**  
Reject submission; identify specific field and row

**User Message**  
"Submission rejected: Field '[FIELD_NAME]' must be a valid date in format YYYY-MM-DD HH24:MI:SS. Found '[VALUE]' in Row [ROW_NUMBER]."

**Recovery Action**  
Correct date format; re-submit

---

**ERR-VAL-005: Invalid Numeric Format**

**Error Condition**  
Numeric field contains non-numeric characters (text, commas, currency symbols)

**System Behavior**  
Reject submission; identify specific field and row

**User Message**  
"Submission rejected: Field '[FIELD_NAME]' must be numeric. Found '[VALUE]' in Row [ROW_NUMBER]. Remove commas, currency symbols, and text."

**Recovery Action**  
Correct numeric format; re-submit

---

**ERR-VAL-006: Invalid Amount Value**

**Error Condition**  
Amount field contains negative value or range

**System Behavior**  
Reject submission; identify specific field and row

**User Message**  
"Submission rejected: Field '[FIELD_NAME]' must be a positive numeric value. Found '[VALUE]' in Row [ROW_NUMBER]."

**Recovery Action**  
Correct amount value; re-submit

---

### 7.4 Schema Errors

**ERR-VAL-007: XML Schema Validation Failure**

**Error Condition**  
XML file does not comply with GoAML schema

**System Behavior**  
Reject submission; list schema validation errors

**User Message**  
"Submission rejected: XML does not comply with GoAML schema. Error: [SCHEMA_ERROR_DETAILS]"

**Recovery Action**  
Correct XML structure per GoAML schema; re-submit

---

### 7.5 Report Type Errors

**ERR-VAL-008: Report Type Mismatch**

**Error Condition**  
Declared report type does not match content indicators

**System Behavior**  
Flag for manual review; do not auto-reject; notify submitter

**User Message**  
"Notice: Report type mismatch detected. Your [DECLARED_TYPE] submission contains fields typically associated with [DETECTED_TYPE] reports. This will be reviewed manually."

**Recovery Action**  
No action required; report will be manually reviewed

---

### 7.6 System Errors

**ERR-VAL-009: Validation Timeout**

**Error Condition**  
Validation processing exceeds 10-second limit

**System Behavior**  
Log timeout; queue for retry; notify system administrator

**User Message**  
"Validation is taking longer than expected. Your submission is queued for processing. You will be notified when validation completes."

**Recovery Action**  
Wait for notification; contact support if no response within 1 hour

---

**ERR-VAL-010: System Processing Error**

**Error Condition**  
Unexpected system error during validation

**System Behavior**  
Log error details; queue for retry; alert system administrator

**User Message**  
"An unexpected error occurred during validation. Your submission has been queued for review. Reference: [ERROR_REF]"

**Recovery Action**  
Wait for notification; contact support with error reference if needed

---

## 8. Non-Functional Requirements

### 8.1 Performance (PERF)

**NFR-PERF-001: Validation Processing Time**

**Description**  
The system shall complete automated validation within 10 seconds of submission for 95% of reports.

**Measurement Criteria**  
Time from submission receipt to validation result (pass/fail determination)

**Traceability**  
FR-4.1, FR-4.7

---

**NFR-PERF-002: Notification Delivery Time**

**Description**  
The system shall deliver rejection notifications to submitting entities within 10 seconds of validation failure.

**Measurement Criteria**  
Time from validation failure determination to notification dispatch

**Traceability**  
FR-4.7

---

**NFR-PERF-003: Queue Routing Time**

**Description**  
The system shall route validated reports to appropriate queues within 5 seconds of validation pass.

**Measurement Criteria**  
Time from validation pass to report appearing in target queue

**Traceability**  
FR-4.8, FR-4.10

---

**NFR-PERF-004: Concurrent Validation Capacity**

**Description**  
The system shall support validation of at least 50 concurrent submissions without performance degradation.

**Measurement Criteria**  
Validation time remains under 10 seconds with 50 concurrent submissions

**Traceability**  
FR-4.1

---

### 8.2 Security (SEC)

**NFR-SEC-001: Validation Log Integrity**

**Description**  
The system shall maintain immutable validation logs that cannot be modified or deleted.

**Measurement Criteria**  
Audit verification that log entries are append-only and tamper-evident

**Traceability**  
FR-4.9

---

**NFR-SEC-002: Secure Error Reporting**

**Description**  
The system shall not expose sensitive data or system internals in error messages to users.

**Measurement Criteria**  
Security review of all error messages; no stack traces or internal paths exposed

**Traceability**  
FR-4.6, FR-4.7

---

**NFR-SEC-003: Access Control for Validation Results**

**Description**  
The system shall restrict validation result visibility to the submitting entity and authorized FIA staff only.

**Measurement Criteria**  
Penetration testing confirms no cross-entity data access

**Traceability**  
FR-4.6, FR-4.7

---

### 8.3 Reliability (REL)

**NFR-REL-001: Validation Availability**

**Description**  
The validation engine shall achieve 99.5% uptime during system operating hours.

**Measurement Criteria**  
Monthly uptime calculation: (Total minutes - Downtime minutes) / Total minutes

**Traceability**  
FR-4.1

---

**NFR-REL-002: Graceful Degradation**

**Description**  
The system shall queue submissions for later processing if validation engine is temporarily unavailable.

**Measurement Criteria**  
No submissions lost during temporary validation service outage

**Traceability**  
FR-4.1, FR-4.8

---

**NFR-REL-003: Error Recovery**

**Description**  
The system shall automatically retry failed validations up to 3 times before requiring manual intervention.

**Measurement Criteria**  
Retry attempts logged; manual intervention required only after 3 failures

**Traceability**  
FR-4.1

---

### 8.4 Usability (USAB)

**NFR-USAB-001: Clear Error Messages**

**Description**  
The system shall provide error messages in clear, non-technical language with specific field names, row numbers, and corrective guidance.

**Measurement Criteria**  
User testing confirms 90% of users can correct errors without support assistance

**Traceability**  
FR-4.6, FR-4.7

---

**NFR-USAB-002: Actionable Feedback**

**Description**  
The system shall provide specific corrective actions for each validation error.

**Measurement Criteria**  
Each error type includes at least one specific corrective action

**Traceability**  
FR-4.6

---

**NFR-USAB-003: Error Report Format**

**Description**  
The system shall present validation errors in a structured, scannable format (list view with field, error, location).

**Measurement Criteria**  
User testing confirms error reports are easy to understand and navigate

**Traceability**  
FR-4.6

---

### 8.5 Scalability (SCALE)

**NFR-SCALE-001: Report Volume Scaling**

**Description**  
The system shall handle 10x increase in validation volume without architecture changes.

**Measurement Criteria**  
Load testing demonstrates acceptable performance at 10x current volume

**Traceability**  
FR-4.1

---

### 8.6 Compliance (COMPLY)

**NFR-COMPLY-001: Audit Trail Completeness**

**Description**  
The system shall maintain complete audit trails of all validation activities for minimum 7 years.

**Measurement Criteria**  
Audit logs contain all required fields; retention policy enforced

**Traceability**  
FR-4.9

---

**NFR-COMPLY-002: FATF Compliance**

**Description**  
The system shall support FATF Recommendation 29 requirements for FIU data quality and integrity.

**Measurement Criteria**  
Compliance review confirms validation supports regulatory requirements

**Traceability**  
FR-4.1 through FR-4.10

---

### 8.7 Maintainability (MAINT)

**NFR-MAINT-001: Validation Rule Configurability**

**Description**  
The system shall allow authorized administrators to update mandatory field lists without code deployment.

**Measurement Criteria**  
Field configuration changes take effect within 5 minutes without system restart

**Traceability**  
FR-4.2

---

**NFR-MAINT-002: Validation Monitoring**

**Description**  
The system shall provide real-time monitoring dashboards for validation performance and error rates.

**Measurement Criteria**  
Dashboard displays current validation queue, processing times, and error statistics

**Traceability**  
FR-4.9

---

## 9. Test Cases (Conceptual)

### Test Case 4.1 - Missing Mandatory Fields
**Input:** STR with empty "Transaction Date" field  
**Expected:** Auto-rejection, error message: "Mandatory field 'Transaction Date' is missing in Row 3"

### Test Case 4.2 - Invalid Data Type
**Input:** CTR with text "five thousand" in Amount field instead of number 5000  
**Expected:** Auto-rejection, error message: "Field 'Amount' must be numeric. Found 'five thousand' in Row 2"

### Test Case 4.3 - Format Corruption
**Input:** Corrupted .xlsx file (incomplete download)  
**Expected:** Auto-rejection, error message: "File format corrupted or unreadable"

### Test Case 4.4 - Successful Validation
**Input:** Fully compliant CTR with all mandatory fields, correct types  
**Expected:** Validation pass, report appears in Compliance Officer validation queue for CTR workflow, submitter notified

### Test Case 4.5 - Report Type Routing
**Input:** One STR and one CTR, both passing automated validation  
**Expected:** CTR routed to Compliance workflow queue; STR routed to Analysis workflow queue

### Test Case 4.6 - Invalid Date
**Input:** Report with date "2026-02-30 00:00:00" (February 30 does not exist)  
**Expected:** Auto-rejection with specific error identifying invalid date

### Test Case 4.7 - Negative Amount
**Input:** CTR with negative amount in transaction value field  
**Expected:** Auto-rejection with error message about invalid amount value

### Test Case 4.8 - Report Type Mismatch
**Input:** Report classified as CTR but contains STR indicators (e.g., "Reason for Suspicion" field)  
**Expected:** Flagged for manual review, not auto-rejected

---

## 10. Edge Cases

1. **Optional fields contain invalid data types**
   - System shall validate data types for optional fields if populated
   - Invalid optional field data shall trigger validation error

2. **Date fields with impossible dates (e.g., February 30)**
   - System shall reject with specific error identifying the invalid date

3. **Negative amounts in transaction value fields**
   - System shall reject with error message about invalid amount value

4. **Special characters in text fields causing encoding issues**
   - System shall handle UTF-8 encoding; reject files with unsupported encoding

5. **Report classified as CTR but contains STR indicators**
   - System shall flag for manual review rather than auto-reject

6. **Empty file submission**
   - System shall reject with error: "Submission rejected: File is empty or contains no data"

7. **Multiple errors in single submission**
   - System shall report all errors found, not just the first error

8. **Maximum field length exceeded**
   - System shall validate against defined max lengths and report violations

---

## 11. Dependencies

### 11.1 Prerequisites
- **Feature 2:** Digital Report Submission Portal (Excel) - Source of Excel submissions
- **Feature 3:** Digital Submission via API (goAML XML) - Source of XML submissions
- **Feature 1:** Authentication and Registration - Entity authentication required

### 11.2 Downstream Dependencies
- **Feature 5:** Manual Validation Workflow - Receives validated reports
- **Feature 9:** Workflow Management - Routing validated reports through workflow stages

---

## 12. Glossary

| Term | Definition |
|------|------------|
| **STR** | Suspicious Transaction Report - Report filed when a transaction is suspected of involving money laundering or terrorist financing |
| **CTR** | Currency Transaction Report - Report filed for cash transactions exceeding defined thresholds |
| **GoAML** | UNODC's anti-money laundering software and XML schema standard for FIU report exchange |
| **FIA** | Financial Intelligence Authority (Liberia) - The national Financial Intelligence Unit |
| **Automated Validation** | System-driven validation of file format, mandatory fields, and data types without human intervention |
| **Manual Validation** | Human review of report content quality performed by Compliance Officers (for CTRs) and Analysts (for STRs) |
| **Validation Error Report** | Detailed listing of all validation failures including field names, error types, and locations |
| **Compliance Officer** | FIA staff member responsible for manual validation and review of CTRs |
| **Analyst** | FIA staff member responsible for manual validation and analysis of STRs |
| **Compliance Officer (FIA)** | FIA staff member responsible for regulatory review of CTR reports |
| **Analyst** | FIA staff member responsible for analysis of STR reports |
| **Reporting Entity** | Financial institution or designated non-financial business required to submit STR/CTR reports |
| **Schema Validation** | Verification that XML structure conforms to defined XSD schema |
| **Mandatory Field** | Field that must be populated for a report to pass validation |
| **Data Type Validation** | Verification that field values conform to expected data types (date, numeric, text) |

---

## 13. Open Issues & Decisions Pending

| Issue ID | Description | Impact | Assigned To | Target Date |
|----------|-------------|--------|-------------|-------------|
| ISS-4.001 | Define complete list of mandatory fields for STR validation | Affects FR-4.2, BR-4.3 | Product Manager | TBD |
| ISS-4.002 | Define complete list of mandatory fields for CTR validation | Affects FR-4.2, BR-4.4 | Product Manager | TBD |
| ISS-4.003 | Confirm GoAML XML schema version to use for validation | Affects FR-4.1, BR-4.2 | Technical Lead | TBD |
| ISS-4.004 | Define maximum file size limit for validation processing | Affects NFR-PERF-001 | Technical Lead | TBD |
| ISS-4.005 | Define retry policy for validation timeout scenarios | Affects ERR-VAL-009 | Product Manager | TBD |

---

## 14. Approval

**Prepared by:** Product Management  
**Reviewed by:** [To be filled]  
**Approved by:** [To be filled]  
**Date:** [To be filled]

---

## 15. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | February 2026 | Product Management | Initial FRD created from PRD v1.0 |
