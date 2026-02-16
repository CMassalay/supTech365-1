# Feature Requirements Document (FRD)
## Feature FR-API: Digital Submission via API (goAML XML)

**Document Version:** 1.0  
**Date:** February 2026  
**Source:** PRD v1.0  
**Feature ID:** FR-API  
**Phase:** Phase 1 - Foundation
**Status:** Draft  
**Related PRD Version:** 1.0

---

## 1. Document Header

**Document Title:** Feature Requirements Document  
**Feature/Product Name:** API Digital Submission (goAML XML)  
**Version:** 1.0  
**Author:** Senior Business Analyst  
**Related PRD Version:** 1.0  
**Status:** Draft  
**Last Updated Date:** February 2026

---

## 2. Scope & Feature Context

### Feature Name
API Digital Submission (goAML XML)

### Description
The API Digital Submission feature enables reporting entities to submit Suspicious Transaction Reports (STRs) and Currency Transaction Reports (CTRs) automatically to SupTech365 via a secure API using goAML XML format. This primary submission method eliminates manual email and Excel processes, providing reliable, standardized, and automated report submission directly from core banking systems.

### In Scope
- Secure API endpoint for goAML XML report submission
- Reporting entity registration and API credential management
- API authentication and authorization
- goAML XML schema validation
- Report type validation (STR/CTR matching)
- Machine-readable API responses with submission status
- Duplicate submission prevention for API submissions
- API status query endpoint for submission tracking
- Comprehensive API audit logging
- Payload size limit enforcement
- Error handling and recovery actions

### Out of Scope
- Excel file upload submission (covered in Feature 1: Digital Report Submission Portal)
- Manual validation workflows (covered in Feature 3: Manual Validation Workflow)
- Web portal UI for API credential management (covered in separate feature)
- Real-time transaction monitoring
- Webhook notifications for status updates

### Purpose
Enable automated, standardized, and reliable report submissions from reporting entities' core banking systems, reducing manual processing overhead, ensuring data consistency through goAML XML schema compliance, and supporting submission capabilities (approximately 1,000 reports/day across all entities) while maintaining system availability and security.

---

## 3. Actors / Roles

### Actor 1: Reporting Entity IT/Compliance Team
**Role Name:** Reporting Entity API User  
**Description:** IT staff or compliance officers at reporting entities (banks, MFIs, FinTech, insurance companies) responsible for integrating and submitting reports via API from their core banking systems.  
**Capabilities:**
- Submit STR/CTR reports via API using goAML XML format
- Query submission status using API status endpoint
- Receive machine-readable response messages
- Handle API errors and retry submissions when appropriate

### Actor 2: System Process
**Role Name:** API Submission Processor  
**Description:** Automated system processes that handle API request authentication, validation, processing, and response generation.  
**Capabilities:**
- Authenticate API requests
- Validate goAML XML schema compliance
- Validate report type declarations
- Detect duplicate submissions
- Generate submission reference numbers
- Enforce payload size limits
- Log all API events for audit

### Actor 3: Tech Admin
**Role Name:** Technical System Administrator  
**Description:** FIA technical administrator responsible for managing API credentials, monitoring API usage, and maintaining API infrastructure.  
**Capabilities:**
- Issue API credentials to registered reporting entities
- Monitor API usage
- Review API audit logs
- Manage API credential lifecycle (activation, deactivation)

---

## 4. Functional Requirements

### 4.1 API Endpoint Provision

**FR-API.1: Secure API Endpoint**  
**Description:** The system shall provide a secure API endpoint for reporting entities to submit transaction reports in goAML XML format directly from their core banking system.  
**Actor:** Reporting Entity IT/Compliance Team  
**Traceability:** PRD FR-API.1  
**Business Rules:** BR-API.1, BR-API.2

### 4.2 Entity Registration and Credentials

**FR-API.2: Entity Registration and Credential Issuance**  
**Description:** The system shall require each reporting entity to be uniquely registered and issued API credentials prior to API submission access.  
**Actor:** Tech Admin  
**Traceability:** PRD FR-API.2  
**Business Rules:** BR-API.3

### 4.3 API Authentication

**FR-API.3: API Request Authentication**  
**Description:** The system shall authenticate every API submission request using an approved API authentication method (e.g., API key or equivalent) and reject unauthenticated requests.  
**Actor:** System Process  
**Traceability:** PRD FR-API.3  
**Business Rules:** BR-API.2

### 4.4 Schema Validation

**FR-API.4: goAML XML Schema Compliance Validation**  
**Description:** The system shall validate every API submission for goAML XML schema compliance and reject submissions that fail schema validation.  
**Actor:** System Process  
**Traceability:** PRD FR-API.4  
**Business Rules:** BR-API.1

### 4.5 Report Type Validation

**FR-API.5: Report Type Matching Validation**  
**Description:** The system shall validate that the report type declared in the API request matches the goAML XML content (STR/CTR) and reject submissions with mismatches.  
**Actor:** System Process  
**Traceability:** PRD FR-API.5  
**Business Rules:** BR-API.4

### 4.6 API Response Generation

**FR-API.6: Machine-Readable Response**  
**Description:** The system shall return an immediate machine-readable response for each API submission, including at minimum: Submission status (Accepted / Rejected / Received for Review), Unique submission reference number (when accepted/received), Timestamp, Validation error details (when rejected).  
**Actor:** System Process  
**Traceability:** PRD FR-API.6  
**Business Rules:** BR-API.5

### 4.7 Duplicate Prevention

**FR-API.7: Duplicate Submission Prevention**  
**Description:** The system shall enforce duplicate submission prevention for API submissions by checking reporting-entity report identifiers and key transaction identifiers, blocking duplicates according to defined deduplication rules. The system shall support optional idempotency keys in request headers to prevent duplicate processing of retry requests when the original request outcome is unknown (e.g., network timeouts). Idempotency keys are optional but recommended for retry scenarios. When an idempotency key is provided and matches a previously processed submission, the system shall return the original submission reference without creating a duplicate record.  
**Actor:** System Process  
**Traceability:** PRD FR-API.7  
**Business Rules:** BR-API.6, BR-API.10

### 4.8 Status Query Endpoint

**FR-API.8: Submission Status Query Endpoint**  
**Description:** The system shall support an API submission status endpoint that allows reporting entities to query the current workflow status of a submission using the submission reference number.  
**Actor:** Reporting Entity IT/Compliance Team  
**Traceability:** PRD FR-API.8  
**Business Rules:** BR-API.2

### 4.9 Audit Logging

**FR-API.9: API Event Audit Logging**  
**Description:** The system shall log all API submission events for audit purposes, including entity identity, timestamp, submission size, IP/source identifier (if available), and validation outcome.  
**Actor:** System Process  
**Traceability:** PRD FR-API.9  
**Business Rules:** BR-API.7

### 4.10 Payload Size Limits

**FR-API.10: Payload Size Limit Enforcement**  
**Description:** The system shall support submission of large reports by defining maximum payload limits and providing a clear rejection message when exceeded.  
**Actor:** System Process  
**Traceability:** PRD FR-API.11  
**Business Rules:** BR-API.8

### 4.11 XML Content Processing and Storage

**FR-API.11: XML Content Extraction and Discard**  
**Description:** The system shall extract transaction data and metadata from goAML XML content for processing and storage, but shall not store the original XML content in the database. After successful extraction, the XML content shall be discarded. Only extracted transaction data, metadata, and submission information shall be persisted.  
**Actor:** System Process  
**Traceability:** PRD FR-API.4 (implied)  
**Business Rules:** BR-API.9

---

## 5. Business Rules

### BR-API.1: goAML XML Schema Compliance
**Rule Statement:** All API submissions must conform to the goAML XML schema standard. Submissions that fail schema validation shall be automatically rejected with detailed error information identifying the specific schema violation.  
**Examples:**
- If a required XML element is missing (e.g., `<TransactionDate>`), the submission is rejected with error code indicating the missing element.
- If an element contains invalid data type (e.g., text in a numeric field), the submission is rejected with error indicating the field and expected type.
- If XML structure violates goAML schema hierarchy, the submission is rejected with error indicating the structural violation.

### BR-API.2: API Authentication Requirement
**Rule Statement:** Every API submission request must include valid API credentials. Unauthenticated requests shall be rejected immediately without processing the submission content.  
**Examples:**
- Request with missing API key header returns authentication error immediately.
- Request with expired API credentials returns authentication error.
- Request with invalid API credentials returns authentication error.

### BR-API.3: Entity Registration Prerequisite
**Rule Statement:** Reporting entities must be registered in the system and issued API credentials before they can submit reports via API. Registration includes entity identification, contact information, and credential assignment.  
**Examples:**
- New entity "Bank ABC" must complete registration process before API credentials are issued.
- Only registered entities appear in the list of entities eligible for API credential issuance.
- API credentials are entity-specific and cannot be shared across entities.

### BR-API.4: Report Type Declaration Matching
**Rule Statement:** The report type declared in the API request must match the report type embedded in the goAML XML content. Mismatches shall be automatically rejected.  
**Examples:**
- API request declares "STR" but XML content indicates CTR structure → rejected.
- API request declares "CTR" and XML content confirms CTR structure → accepted.
- Ambiguous cases (e.g., missing declaration) → rejected with error requesting clarification.

### BR-API.5: Response Format Standardization
**Rule Statement:** All API responses must follow a standardized machine-readable format (e.g., JSON or XML) containing required fields: submission status, reference number (when applicable), timestamp, and error details (when applicable).  
**Examples:**
- Successful submission returns: `{"status": "Accepted", "reference": "FIA-2026-001234", "timestamp": "2026-02-03T10:30:00Z"}`
- Rejected submission returns: `{"status": "Rejected", "timestamp": "2026-02-03T10:30:00Z", "errors": [{"field": "TransactionDate", "message": "Missing required element"}]}`
- Pending review returns: `{"status": "Received for Review", "reference": "FIA-2026-001234", "timestamp": "2026-02-03T10:30:00Z"}`

### BR-API.6: Duplicate Detection Criteria
**Rule Statement:** Duplicate submissions are identified by checking the combination of reporting entity identifier, entity-provided report identifier, and key transaction identifiers. If a match is found, the duplicate submission shall be rejected.  
**Examples:**
- Same entity submits report with same entity report ID "REP-2026-001" twice → second submission rejected as duplicate.
- Same entity submits report with same transaction identifiers → duplicate detected and rejected.
- Different entity submits report with same entity report ID → not considered duplicate (different entity).

### BR-API.7: Audit Logging Requirements
**Rule Statement:** All API submission events must be logged with immutable records including: entity identity, timestamp, submission size (bytes), IP address or source identifier (if available), validation outcome (accepted/rejected), and error details (if rejected).  
**Examples:**
- Log entry for accepted submission: `Entity: Bank ABC, Timestamp: 2026-02-03T10:30:00Z, Size: 245KB, IP: 192.168.1.100, Outcome: Accepted, Reference: FIA-2026-001234`
- Log entry for rejected submission: `Entity: Bank ABC, Timestamp: 2026-02-03T10:30:00Z, Size: 245KB, IP: 192.168.1.100, Outcome: Rejected, Error: Schema validation failure - missing TransactionDate`

### BR-API.8: Payload Size Maximum Limit
**Rule Statement:** API submissions must not exceed the maximum payload size limit of 25MB. Submissions exceeding the limit shall be rejected with a clear error message indicating the maximum allowed size.  
**Examples:**
- Maximum payload: 25MB → submission of 30MB XML file rejected with error "Payload size 30MB exceeds maximum limit of 25MB".
- Large reports (500-1000 transactions) within limit are accepted.
- Payload size is measured as uncompressed XML content size.

### BR-API.9: XML Content Storage Policy
**Rule Statement:** The system shall extract all required transaction data, metadata, and submission information from goAML XML content during processing, but shall not store the original XML content in the database. After successful extraction and validation, the XML content shall be discarded. Only extracted structured data (transactions, report metadata, validation results) and submission metadata (reference number, timestamps, entity information) shall be persisted.  
**Examples:**
- XML content is parsed and transaction records are extracted and stored in the `transactions` table.
- Report metadata (report type, entity information, submission details) is stored in the `reports` table.
- Original XML content is not stored in `api_submission_data.xml_content` (set to NULL).
- This policy ensures efficient storage while maintaining all necessary data for processing and audit purposes.

### BR-API.10: Idempotency Key Handling
**Rule Statement:** The system shall support optional idempotency keys provided in the `X-Idempotency-Key` request header to prevent duplicate processing of retry requests. Idempotency keys are optional but recommended for retry scenarios, particularly when network timeouts occur and the client cannot determine if the original request was processed. When an idempotency key is provided and matches a previously processed submission for the same entity, the system shall return the original submission reference number and status without creating a duplicate record. Idempotency key validation occurs before duplicate detection based on entity report identifiers. If no idempotency key is provided, duplicate detection relies solely on entity report identifiers and transaction identifiers.  
**Examples:**
- Client submits request with `X-Idempotency-Key: abc123xyz` and network times out before receiving response.
- Client retries with same idempotency key → system returns original submission reference without creating duplicate.
- Client submits request without idempotency key → duplicate detection uses entity_report_id and transaction identifiers only.
- Different entities can use the same idempotency key value (scoped per entity).

---

## 6. Error & Exception Handling

### ERR-API-AUTH-001: Invalid or Missing Credentials
**Error Condition:** API request is submitted without authentication credentials or with invalid/expired credentials.  
**System Behavior:** System rejects the request immediately without processing the submission content. No submission record is created. Security log entry is generated.  
**User Message:** Machine-readable error response: `{"status": "Rejected", "error_code": "ERR-API-AUTH-001", "message": "Authentication failed - invalid or missing credentials", "timestamp": "2026-02-03T10:30:00Z"}`  
**Recovery Action:** Reporting entity must obtain valid API credentials from Tech Admin or verify credentials are correctly included in request headers.

### ERR-API-VALID-001: goAML Schema Validation Failure
**Error Condition:** API submission contains goAML XML that fails schema validation (missing required elements, invalid data types, structural violations).  
**System Behavior:** System rejects the submission after schema validation. No submission record is created. Detailed validation errors are included in response.  
**User Message:** Machine-readable error response: `{"status": "Rejected", "error_code": "ERR-API-VALID-001", "message": "Schema validation failed", "errors": [{"element": "TransactionDate", "issue": "Missing required element", "location": "/Report/Transaction/TransactionDate"}]}`  
**Recovery Action:** Reporting entity must correct XML structure to comply with goAML schema and resubmit.

### ERR-API-VALID-002: Report Type Mismatch
**Error Condition:** Report type declared in API request does not match the report type embedded in goAML XML content.  
**System Behavior:** System rejects the submission immediately. No submission record is created.  
**User Message:** Machine-readable error response: `{"status": "Rejected", "error_code": "ERR-API-VALID-002", "message": "Report type mismatch - declared 'STR' but XML content indicates 'CTR'", "timestamp": "2026-02-03T10:30:00Z"}`  
**Recovery Action:** Reporting entity must correct the report type declaration or XML content to match and resubmit.

### ERR-API-DUP-001: Duplicate Submission Detected
**Error Condition:** API submission contains report identifier or transaction identifiers that match a previously submitted report from the same entity.  
**System Behavior:** System rejects the duplicate submission. No new submission record is created. Reference to original submission may be provided in response.  
**User Message:** Machine-readable error response: `{"status": "Rejected", "error_code": "ERR-API-DUP-001", "message": "Duplicate submission detected - report identifier 'REP-2026-001' already submitted on 2026-02-01", "original_reference": "FIA-2026-000123", "timestamp": "2026-02-03T10:30:00Z"}`  
**Recovery Action:** Reporting entity must verify if resubmission is intentional. If intentional, contact FIA to resolve. If accidental, no action needed.

### ERR-API-SIZE-001: Payload Size Exceeded
**Error Condition:** API submission payload size exceeds the maximum allowed limit of 25MB.  
**System Behavior:** System rejects the submission without processing content. No submission record is created.  
**User Message:** Machine-readable error response: `{"status": "Rejected", "error_code": "ERR-API-SIZE-001", "message": "Payload size 30MB exceeds maximum limit of 25MB", "max_size": "25MB", "received_size": "30MB", "timestamp": "2026-02-03T10:30:00Z"}`  
**Recovery Action:** Reporting entity must split large reports into multiple smaller submissions or reduce payload size to within limit.

### ERR-API-SYS-001: System Unavailable or Processing Error
**Error Condition:** System experiences internal error, temporary unavailability, or processing failure during API request handling.  
**System Behavior:** System returns error response indicating system issue. Submission may or may not have been processed (idempotency handling required).  
**User Message:** Machine-readable error response: `{"status": "Error", "error_code": "ERR-API-SYS-001", "message": "System temporarily unavailable. Please retry after 60 seconds.", "retry_after": "2026-02-03T10:31:00Z", "timestamp": "2026-02-03T10:30:00Z"}`  
**Recovery Action:** Reporting entity must retry submission after the indicated retry time. If error persists, contact FIA technical support.

### ERR-API-NET-001: Network Timeout
**Error Condition:** Network connection times out during API submission transmission, or entity retries submission after timeout (may trigger duplicate detection).  
**System Behavior:** System may have partially processed the original request. Duplicate detection logic handles retry scenarios.  
**User Message:** If original submission was processed: `{"status": "Accepted", "reference": "FIA-2026-001234", "message": "Submission already processed", "timestamp": "2026-02-03T10:30:00Z"}` OR if not processed: Timeout error from network layer.  
**Recovery Action:** Reporting entity should implement exponential backoff retry strategy with the following parameters:
- **Initial retry delay:** 2 seconds
- **Maximum retries:** 3 attempts
- **Backoff multiplier:** 2x (delays: 2s, 4s, 8s)
- **Jitter:** ±20% random variation to prevent thundering herd
- **Retry only on:** Network timeout errors (not validation or authentication errors)
- **Idempotency:** Use idempotency keys in request headers to prevent duplicate submissions
- **Status check:** Before retrying, check submission status using reference number if received from initial request

---

## 7. Non-Functional Requirements

### 7.1 Performance Requirements

**NFR-API-PERF-1: API Response Time**  
**Description:** The system shall return API submission responses within 3 seconds for 95% of valid submissions under normal load conditions.  
**Measurement Criteria:** Response time measured from request receipt to response transmission. 95th percentile response time must be ≤ 3 seconds for accepted submissions.  
**Traceability:** PRD AC-API.1, FR-API.6

**NFR-API-PERF-2: API Throughput Capacity**  
**Description:** The system shall support processing of approximately 1,000 reports per day via API across all reporting entities without performance degradation.  
**Measurement Criteria:** System maintains response time targets (NFR-API-PERF-1) and validation processing time (≤5 minutes) when processing peak daily volume.  
**Traceability:** PRD Section 6 (Report Volume Projections), FR-API.1

**NFR-API-PERF-3: Concurrent API Requests**  
**Description:** The system shall handle concurrent API submission requests from multiple reporting entities without performance degradation.  
**Measurement Criteria:** System maintains response time targets when processing concurrent requests from 50+ reporting entities simultaneously.  
**Traceability:** PRD NFR-P1, FR-API.1

### 7.2 Security Requirements

**NFR-API-SEC-1: API Authentication Security**  
**Description:** The system shall enforce secure API authentication using API keys or equivalent authentication methods that meet industry security standards.  
**Measurement Criteria:** All API requests are authenticated. Unauthenticated requests are rejected with 100% accuracy. Authentication credentials are transmitted securely (encrypted).  
**Traceability:** PRD NFR-S10, FR-API.3

**NFR-API-SEC-2: Data Encryption in Transit**  
**Description:** The system shall encrypt all API communication using TLS 1.2 or higher to protect data in transit.  
**Measurement Criteria:** All API endpoints require HTTPS/TLS 1.2+ connections. Non-encrypted connections are rejected.  
**Traceability:** PRD NFR-S2, FR-API.1

**NFR-API-SEC-3: API Credential Protection**  
**Description:** The system shall protect API credentials from unauthorized access, disclosure, or compromise. Credentials must be stored securely and transmitted only over encrypted channels.  
**Measurement Criteria:** API credentials are stored using industry-standard secure storage (hashed/encrypted). Credential compromise incidents are logged and trigger immediate revocation.  
**Traceability:** PRD NFR-S10, FR-API.2

**NFR-API-SEC-4: Audit Log Immutability**  
**Description:** The system shall maintain immutable and tamper-evident audit logs for all API submission events.  
**Measurement Criteria:** Audit logs are append-only and cannot be modified or deleted. Log integrity can be verified through cryptographic checksums or equivalent mechanisms.  
**Traceability:** PRD NFR-S9, FR-API.9

### 7.3 Reliability Requirements

**NFR-API-REL-1: API Availability**  
**Description:** The system shall maintain 99% availability for API endpoints during business hours (8 AM - 6 PM local time, Monday-Friday).  
**Measurement Criteria:** API endpoints are accessible and functional 99% of the time during defined business hours. Planned maintenance windows are excluded from availability calculation.  
**Traceability:** PRD NFR-A1, FR-API.1

**NFR-API-REL-2: Graceful Error Handling**  
**Description:** The system shall handle API errors gracefully without system crashes or data corruption. Error responses must be consistent and machine-readable.  
**Measurement Criteria:** All error scenarios return appropriate error responses. System continues operating normally after error conditions. No data corruption occurs due to error handling.  
**Traceability:** PRD NFR-A5, Section 6 (Error & Exception Handling)

**NFR-API-REL-3: Idempotency Support**  
**Description:** The system shall support idempotent API requests where retries of the same submission do not create duplicate records when the original submission was successfully processed.  
**Measurement Criteria:** Duplicate detection logic correctly identifies retry attempts and returns original submission reference without creating duplicate records.  
**Traceability:** PRD Edge Cases (Network timeout), FR-API.7

### 7.4 Scalability Requirements

**NFR-API-SCALE-1: Entity Growth Support**  
**Description:** The system shall support scaling from 50+ to 379+ reporting entities using API submission without major redesign.  
**Measurement Criteria:** System maintains performance targets (NFR-API-PERF-1, NFR-API-PERF-2) as entity count increases from 50 to 379.  
**Traceability:** PRD NFR-SC1, FR-API.2

**NFR-API-SCALE-2: Volume Growth Support**  
**Description:** The system shall handle 10x increase in report volume via API without performance degradation.  
**Measurement Criteria:** System maintains response time and throughput targets when report volume increases 10x from baseline.  
**Traceability:** PRD NFR-SC3, FR-API.1

### 7.5 Compliance Requirements

**NFR-API-COMPLY-1: FATF Compliance**  
**Description:** The system shall comply with FATF Recommendation 29 (Financial Intelligence Units) requirements for API-based report submission and processing.  
**Measurement Criteria:** All API submissions and processing follow FATF standards. Audit logs support FATF compliance reporting.  
**Traceability:** PRD NFR-C1, FR-API.9

**NFR-API-COMPLY-2: Data Retention**  
**Description:** The system shall retain all API submission data and audit logs for minimum 10 years per Liberian AML/CFT regulations.  
**Measurement Criteria:** API submission records and audit logs are retained for 10 years minimum. Retention policies are enforced automatically.  
**Traceability:** PRD NFR-C6, FR-API.9

### 7.6 Maintainability Requirements

**NFR-API-MAINT-1: Comprehensive API Logging**  
**Description:** The system shall log all API submission events with sufficient detail for troubleshooting, monitoring, and audit purposes.  
**Measurement Criteria:** All API events include: entity identity, timestamp, submission size, IP/source identifier (if available), validation outcome, and error details (if applicable). Logs are queryable and exportable.  
**Traceability:** PRD FR-API.9, BR-API.7

**NFR-API-MAINT-2: API Monitoring and Alerting**  
**Description:** The system shall provide monitoring capabilities for API usage, performance, and errors.  
**Measurement Criteria:** API metrics (request count, response times, error rates) are available for monitoring dashboards. Alerts are generated for critical issues (e.g., high error rates, system unavailability).  
**Traceability:** Section 6 (Error & Exception Handling)

---

## 8. Acceptance Criteria

**AC-API.1: Successful API Submission**  
Given a reporting entity submits a valid goAML XML STR via the API with valid credentials, when the system receives the request, then the system returns Accepted and a unique submission reference number within 3 seconds.

**AC-API.2: Schema Validation Failure Handling**  
Given a reporting entity submits an invalid goAML XML (schema failure), when the system validates it, then the system returns Rejected with a machine-readable error response identifying the schema validation failure.

**AC-API.3: Authentication Failure Handling**  
Given a reporting entity submits without valid credentials, when the system receives the request, then the system returns Rejected and does not create a submission record.

**AC-API.4: Duplicate Submission Prevention**  
Given a reporting entity submits a duplicate report identifier previously submitted successfully, when the system receives the request, then the system returns Rejected with a clear duplicate message and does not create a new submission reference number.

**AC-API.5: Status Query Functionality**  
Given a submission reference number exists, when the reporting entity queries the status endpoint, then the system returns the current workflow status and last-updated timestamp.

---

## 9. Glossary

**API (Application Programming Interface):** A set of protocols and tools that allows different software systems to communicate with each other. In this context, it enables reporting entities' core banking systems to submit reports automatically to SupTech365.

**goAML XML:** The Global Anti-Money Laundering XML format developed by the United Nations Office on Drugs and Crime (UNODC). It is the standardized XML schema for financial intelligence reporting used by Financial Intelligence Units (FIUs) worldwide.

**API Key:** A unique identifier and secret token used to authenticate API requests. It serves as credentials for API access.


**Payload:** The actual data content transmitted in an API request. In this context, it refers to the goAML XML report content being submitted.

**Submission Reference Number:** A unique identifier generated by the system for each successfully received submission. It is used to track the submission through the workflow and query its status.

**Machine-Readable Response:** An API response formatted in a structured data format (e.g., JSON or XML) that can be automatically parsed and processed by software systems without human intervention.

**Idempotency:** A property of API operations where making the same request multiple times produces the same result as making it once. This prevents duplicate records when network timeouts cause retries.

**TLS (Transport Layer Security):** A cryptographic protocol that provides secure communication over a network. TLS 1.2 or higher is required for API communication to encrypt data in transit.

**CTR (Currency Transaction Report):** A report filed for large cash transactions above a defined threshold, typically used for compliance monitoring.

**STR (Suspicious Transaction Report):** A report filed when a transaction appears suspicious and may indicate money laundering, terrorist financing, or other financial crimes.

**FATF (Financial Action Task Force):** An intergovernmental organization that sets international standards for combating money laundering and terrorist financing. Recommendation 29 specifically addresses Financial Intelligence Units.

---

## 10. Open Issues & Decisions Pending

| Issue ID | Description | Impact | Assigned To | Target Date |
|----------|-------------|--------|-------------|-------------|
| ISS-API-001 | ~~Determine maximum payload size limit (considering reports with 500-1000 transactions)~~ **RESOLVED: 25MB** | ~~Affects FR-API.10, BR-API.8~~ | ~~Technical Lead, Product Manager~~ | Resolved |
| ISS-API-003 | Specify exact API authentication method (API key format, OAuth 2.0, etc.) | Affects FR-API.3, BR-API.2 | Technical Lead, Security Officer | TBD |
| ISS-API-004 | ~~Define report type mismatch handling policy (reject vs. flag for manual review)~~ **RESOLVED: Reject mismatches** | ~~Affects FR-API.5, BR-API.4~~ | ~~Compliance Manager, Head of Compliance~~ | Resolved |
| ISS-API-005 | ~~Determine retry and idempotency handling strategy for network timeout scenarios~~ **RESOLVED: Exponential backoff with jitter** | ~~Affects FR-API.7, NFR-API-REL-3~~ | ~~Technical Lead~~ | Resolved |

---

## 11. Traceability Matrix

| FRD Requirement | PRD Source | Acceptance Criteria |
|----------------|------------|-------------------|
| FR-API.1 | PRD FR-API.1 | AC-API.1 |
| FR-API.2 | PRD FR-API.2 | - |
| FR-API.3 | PRD FR-API.3 | AC-API.3 |
| FR-API.4 | PRD FR-API.4 | AC-API.2 |
| FR-API.5 | PRD FR-API.5 | - |
| FR-API.6 | PRD FR-API.6 | AC-API.1 |
| FR-API.7 | PRD FR-API.7 | AC-API.4 |
| FR-API.8 | PRD FR-API.8 | AC-API.5 |
| FR-API.9 | PRD FR-API.9 | - |
| FR-API.10 | PRD FR-API.11 | Edge Cases |
| FR-API.11 | PRD FR-API.4 (implied) | - |

---

**Document End**
