# Feature Design Document (FDD)
## Feature: API Digital Submission (goAML XML)

**Document Title:** Feature Design Document  
**Feature Name:** API Digital Submission (goAML XML)  
**Product/System Name:** SupTech365  
**Version:** 1.2  
**Author:** Senior Product Designer  
**Related FRD Version:** 1.0  
**Status:** Draft  
**Last Updated Date:** February 2026

---

## 2. Feature Context

**Feature Name**  
API Digital Submission (goAML XML)

**Feature Description**  
The API Digital Submission feature enables reporting entities to submit Suspicious Transaction Reports (STRs) and Currency Transaction Reports (CTRs) automatically to SupTech365 via a secure REST API using goAML XML format. This feature provides machine-to-machine communication, eliminating manual processes and enabling direct integration with core banking systems.

**Feature Purpose**  
Enable automated, standardized, and reliable report submissions from reporting entities' core banking systems, reducing manual processing overhead, ensuring data consistency through goAML XML schema compliance, and supporting high-volume submission capabilities (approximately 1,000 reports/day) while maintaining system availability and security.

**Related Features**  
- Feature 2: Digital Report Submission Portal (Excel upload) - shares submission workflow and validation logic
- Feature 1: Authentication and Registration - provides entity registration foundation for API credential issuance
- Manual Validation Workflow - receives API submissions for validation processing

**User Types**  
- **Reporting Entity IT/Compliance Team:** Submit reports via API from core banking systems
- **Reporting Entity User:** View and regenerate API credentials via the portal
- **Tech Admin:** Manage API credentials and monitor API usage (admin interface out of scope for this feature); optionally issue credentials during entity registration
- **System Process:** Automated processing of API requests

---

## 3. Technology Stack & Architecture

### Technology Stack

**Framework:** FastAPI  
**ORM:** SQLModel (async)  
**Database:** PostgreSQL  
**Auth:** API Key (hashed with Argon2)  
**Validation:** Pydantic v2  
**Migrations:** Alembic  
**XML Parsing:** lxml  
**XML Validation:** XSD 1.1 (via xmlschema or lxml) for goAML schema compliance  
**Background Tasks:** FastAPI BackgroundTasks / Celery  
**API Spec:** OpenAPI 3.0  
**Observability:** Prometheus + OpenTelemetry  

### Architecture Pattern

**Model:** SQLModel database models (async)  
**Service:** Business logic layer  
**Controller:** FastAPI route handlers (routers)  
**DTO:** Pydantic request/response schemas  

---

## 4. Screen List + Wireframes

**Primarily API-only feature with one entity-facing portal page**

Report submission is API-only with no user-facing screens. Tech Admin credential management UI is out of scope (covered in separate feature).

**Entity-Facing Page:**
- **API Credentials Page** (`/reporting-entity/api-credentials`) - Allows Reporting Entity Users to view their masked API credentials and regenerate keys. Frontend specification is documented in the Feature 3 Frontend FDD / Feature 1 FE Registration FDD addendum.

All API submission functionality is exposed via REST API endpoints documented in Section 7 (API Contract).

---

## 5. User Flow Diagram

### API Submission Flow

```
[Reporting Entity System]
    |
    | POST /api/v1/submissions
    | Headers: X-API-Key, X-Idempotency-Key
    | Body: { report_type, xml_content }
    |
    v
[API Gateway]
    |
    | Validate TLS 1.2+
    |
    v
[Authentication Check]
    |
    |-- Invalid/Missing Credentials --> [Reject Response] ERR-API-AUTH-001
    |
    v Valid Credentials
[Payload Size Check]
    |
    |-- Size > 25MB --> [Reject Response] ERR-API-SIZE-001
    |
    v Size Valid
[goAML XML Schema Validation]
    |
    |-- Schema Invalid --> [Reject Response] ERR-API-VALID-001
    |
    v Schema Valid
[Report Type Validation]
    |
    |-- Type Mismatch --> [Reject Response] ERR-API-VALID-002
    |
    v Type Valid
[Duplicate Detection]
    |
    |-- Duplicate Found --> [Reject Response] ERR-API-DUP-001
    |
    v Not Duplicate
[Extract Transaction Data]
    |
    | Extract transactions from XML
    | Store in transactions table
    |
    v
[Create Submission Record]
    |
    | Generate Reference Number
    | Create report record
    | Create api_submission_data (xml_content = NULL)
    | Discard XML (not stored)
    | Log Audit Event
    |
    v
[Success Response]
    |
    | Status: Accepted/Received for Review
    | Reference Number
    | Timestamp
    |
    v
[Return to Reporting Entity System]
```

### Status Query Flow

```
[Reporting Entity System]
    |
    | GET /api/v1/submissions/{reference}
    | Headers: X-API-Key
    |
    v
[API Gateway]
    |
    | Validate TLS 1.2+
    |
    v
[Authentication Check]
    |
    |-- Invalid Credentials --> [Reject Response] ERR-API-AUTH-001
    |
    v Valid Credentials
[Authorization Check]
    |
    |-- Entity doesn't own submission --> [Reject Response] 403 Forbidden
    |
    v Authorized
[Query Submission Status]
    |
    v
[Return Status Response]
    |
    | Status: Pending/Validated/Rejected/etc.
    | Last Updated Timestamp
    |
    v
[Return to Reporting Entity System]
```

### Error Recovery Flow

```
[Network Timeout / System Error]
    |
    v
[Check Submission Status]
    |
    | GET /api/v1/submissions/{reference}
    |
    v
[Status Response]
    |
    |-- Already Processed --> Use existing reference
    |-- Not Found --> Retry with exponential backoff
    |
    v
[Retry Logic]
    |
    | Initial delay: 2s
    | Max retries: 3
    | Backoff: 2x (2s, 4s, 8s)
    | Jitter: ±20%
    |
    v
[Resubmit or Use Existing Reference]
```

---

## 6. Data Model

### Table: `api_credentials`

> **v1.2 CHANGES — API Key Encryption + Portal Reveal + Email Delivery**
> - Replaced single `api_key` column with `api_key_hash` + `api_key_encrypted` (dual storage)
> - `api_key_hash`: Argon2 hash for authentication (was previously the only storage)
> - `api_key_encrypted`: 🆕 NEW — AES-256-GCM encrypted key for portal reveal and email delivery

**Purpose:** Store API credentials for reporting entities to authenticate API requests.

| Column Name | Data Type | Length/Constraints | Required | Notes |
|------------|-----------|-------------------|----------|-------|
| `id` | INTEGER | AUTO_INCREMENT | Yes | Primary Key |
| `entity_id` | INTEGER | - | Yes | Foreign Key to `reporting_entities` table |
| `api_key_hash` | VARCHAR | 255 | Yes | 🔄 CHANGED (v1.2) Argon2 hash of API key (used for fast authentication validation) |
| `api_key_encrypted` | VARCHAR | 512 | Yes | 🆕 NEW (v1.2) AES-256 encrypted API key (used for portal reveal and email delivery). Decrypted on demand using server-side `API_KEY_ENCRYPTION_SECRET`. |
| `status` | ENUM | 'active', 'inactive', 'revoked' | Yes | Credential status |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Yes | Credential creation timestamp |
| `expires_at` | TIMESTAMP | - | No | Optional expiration date |
| `last_used_at` | TIMESTAMP | - | No | Last successful API request timestamp |
| `revoked_at` | TIMESTAMP | - | No | Revocation timestamp if revoked |
| `revoked_reason` | TEXT | - | No | Reason for revocation |
| `created_by` | INTEGER | - | Yes | Foreign Key to `users` (Tech Admin) |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Yes | Last update timestamp |

**Keys:**
- Primary Key: `id`
- Foreign Keys: `entity_id` → `reporting_entities.id`, `created_by` → `users.id`
- Unique Constraints: `api_key_hash` (unique)

**Indexes:**
- `idx_api_credentials_entity_id` on `entity_id`
- `idx_api_credentials_api_key_hash` on `api_key_hash` (unique index)
- `idx_api_credentials_status` on `status`

**Relationship Notes:**
- One-to-many: One entity can have multiple API credentials (for rotation, different environments)
- Many-to-one: Multiple credentials created by same Tech Admin user

---

### Table: `reports` (Shared with Excel Submission)

**Purpose:** Store all report submissions (both Excel and API) with metadata, status, and reference information. API submissions use this same table with `submission_method = 'api'`.

**Note:** This table is shared with Feature 2 (Excel Submission). API submissions populate additional fields specific to API submissions.

**Columns + Types (API-specific usage)**

| Column Name | Data Type | Length/Constraints | Required | Notes |
|-------------|-----------|-------------------|----------|-------|
| `id` | INTEGER | AUTO_INCREMENT | Yes | Primary Key |
| `reference_number` | VARCHAR | 255 | Yes | Format: FIA-{ENTITYID}-{TIMESTAMP}, UNIQUE |
| `entity_id` | INTEGER | - | Yes | Foreign Key to `reporting_entities` |
| `report_type` | ENUM | 'STR', 'CTR' | Yes | Classification from API request |
| `submission_method` | ENUM | 'excel', 'api' | Yes | Set to 'api' for API submissions |
| `status` | ENUM | 'submitted', 'validated', 'rejected', 'returned', 'under_review', 'under_compliance_review', 'under_analysis' | Yes | Current workflow status |
| `entity_reference` | VARCHAR | 255 | No | Optional reference provided by entity (from XML) |
| `prev_rejected_ref_number` | VARCHAR | 255 | No | Reference to previous rejected submission (for resubmissions) |
| `file_path` | VARCHAR | 500 | No | NULL for API submissions (XML is not stored, only extracted) |
| `file_name` | VARCHAR | 255 | No | NULL for API submissions |
| `file_size` | INTEGER | - | No | NULL for API submissions (use `api_submission_data.payload_size_bytes`) |
| `submitted_at` | TIMESTAMP | - | Yes | Submission timestamp |
| `submitted_by` | INTEGER | - | No | NULL for API submissions (no user context) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Yes | Record creation time |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Yes | Last update time |

**Additional API-specific data stored in `api_submission_data` table (see below)**

**Keys:**
- Primary Key: `id`
- Foreign Keys:
  - `entity_id` → `reporting_entities(id)`
  - `submitted_by` → `users(id)` (nullable for API submissions)
- Unique Constraints:
  - `reference_number` (UNIQUE)

**Indexes Needed:**
- `idx_reports_entity_id` on `entity_id` (for filtering by entity)
- `idx_reports_reference_number` on `reference_number` (for lookups)
- `idx_reports_status` on `status` (for status filtering)
- `idx_reports_submitted_at` on `submitted_at` (for date filtering)
- `idx_reports_submission_method` on `submission_method` (for filtering by method)
- `idx_reports_entity_reference` on `entity_id, entity_reference` (for duplicate detection, where entity_reference IS NOT NULL)

**Relationship Notes:**
- One-to-many with `reporting_entities` (one entity has many reports)
- One-to-one with `api_submission_data` (one API report has one API-specific data record)
- One-to-many with `decisions` (one report has many validation/analysis decisions)
- One-to-many with `transactions` (one report contains many transactions - data extracted from XML)
- One-to-many with `validation_errors` (one report can have multiple validation errors)

---

### Table: `api_submission_data`

**Purpose:** Store API-specific submission data that is not part of the shared `reports` table structure.

| Column Name | Data Type | Length/Constraints | Required | Notes |
|------------|-----------|-------------------|----------|-------|
| `id` | INTEGER | AUTO_INCREMENT | Yes | Primary Key |
| `report_id` | INTEGER | - | Yes | Foreign Key to `reports` table (one-to-one) |
| `api_credential_id` | INTEGER | - | Yes | Foreign Key to `api_credentials` table |
| `xml_content` | TEXT | - | No | Full goAML XML content (NULL - XML is extracted and discarded, not stored) |
| `payload_size_bytes` | INTEGER | - | Yes | Size of XML content in bytes |
| `submission_ip` | VARCHAR | 45 | No | IP address of API request (IPv4 or IPv6) |
| `idempotency_key` | VARCHAR | 255 | No | Idempotency key from request header |
| `processed_at` | TIMESTAMP | - | No | Processing completion timestamp |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Yes | Record creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Yes | Last update timestamp |

**Keys:**
- Primary Key: `id`
- Foreign Keys: `report_id` → `reports.id` (UNIQUE, one-to-one), `api_credential_id` → `api_credentials.id`
- Unique Constraints: `report_id` (unique - one API submission data per report), `idempotency_key` + `entity_id` (composite unique, where idempotency_key IS NOT NULL)

**Indexes:**
- `idx_api_submission_data_report_id` on `report_id` (unique index)
- `idx_api_submission_data_api_credential_id` on `api_credential_id`
- `idx_api_submission_data_idempotency` on `idempotency_key` (for idempotency checks, where idempotency_key IS NOT NULL)

**Relationship Notes:**
- One-to-one: Each API submission in `reports` table has exactly one record in this table
- Many-to-one: Multiple API submissions using same API credential

**Important Notes:**
- `xml_content` is NULL - XML content is NOT stored in the database
- XML is parsed to extract transaction data and validation information, then discarded
- Only metadata is stored (api_credential_id, payload_size_bytes, submission_ip, idempotency_key)
- Transaction data extracted from XML is stored in `transactions` table

---

### Table: `validation_errors`

**Purpose:** Store structured validation errors for both Excel and API submissions. Enables users to view detailed error information and supports future analytics.

| Column Name | Data Type | Length/Constraints | Required | Notes |
|------------|-----------|-------------------|----------|-------|
| `id` | INTEGER | AUTO_INCREMENT | Yes | Primary Key |
| `entity_id` | INTEGER | - | Yes | Foreign Key to `reporting_entities` table (for direct entity filtering and access control) |
| `report_id` | INTEGER | - | No | Foreign Key to `reports` table (NULL if rejected before report creation) |
| `submission_log_id` | INTEGER | - | No | Foreign Key to `submission_logs` table (for pre-report rejections) |
| `error_code` | VARCHAR | 50 | Yes | Error code (e.g., "MISSING_FIELD", "INVALID_FORMAT", "DUPLICATE", "SCHEMA_VALIDATION_FAILED") |
| `error_message` | TEXT | - | Yes | Full error description for user display |
| `location` | VARCHAR | 255 | No | Error location (e.g., XML XPath like "/Report/Transaction/TransactionDate" or row/column for Excel) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Yes | Error record creation timestamp |

**Keys:**
- Primary Key: `id`
- Foreign Keys:
  - `entity_id` → `reporting_entities.id`
  - `report_id` → `reports.id`
  - `submission_log_id` → `submission_logs.id`

**Indexes:**
- `idx_validation_errors_entity_id` on `entity_id` (for direct entity filtering without JOINs)
- `idx_validation_errors_report_id` on `report_id`
- `idx_validation_errors_submission_log_id` on `submission_log_id`
- `idx_validation_errors_error_code` on `error_code` (for future analytics)

**Relationship Notes:**
- Many-to-one with `reporting_entities` (errors belong to entities for access control)
- Many-to-one with `reports` (errors can belong to reports, nullable if rejected before report creation)
- Many-to-one with `submission_logs` (errors can belong to submission logs, nullable if report exists)
- One-to-many: One report/submission_log can have multiple validation errors
- Shared table: Used by both Excel and API submissions

**Usage Notes:**
- `entity_id` must be set when creating error records (from api_credential.entity_id or report.entity_id)
- Enables direct entity filtering: `WHERE entity_id = ?` (no JOINs needed)
- Supports future analytics by error_code

---

### Table: `api_audit_logs`

**Purpose:** Immutable audit log of all API submission events for compliance and troubleshooting.

| Column Name | Data Type | Length/Constraints | Required | Notes |
|------------|-----------|-------------------|----------|-------|
| `id` | INTEGER | AUTO_INCREMENT | Yes | Primary Key |
| `entity_id` | INTEGER | - | Yes | Foreign Key to `reporting_entities` table |
| `api_credential_id` | INTEGER | - | No | Foreign Key to `api_credentials` table (NULL if auth failed) |
| `report_id` | INTEGER | - | No | Foreign Key to `reports` table (NULL if submission not created) |
| `event_type` | VARCHAR | 50 | Yes | 'submission_request', 'authentication_failure', 'validation_failure', 'duplicate_detected', etc. |
| `endpoint` | VARCHAR | 255 | Yes | API endpoint path |
| `http_method` | VARCHAR | 10 | Yes | 'GET', 'POST', etc. |
| `request_ip` | VARCHAR | 45 | No | IP address of request |
| `request_size_bytes` | INTEGER | - | No | Request payload size |
| `response_status_code` | INTEGER | - | No | HTTP status code |
| `validation_outcome` | VARCHAR | 50 | No | 'accepted', 'rejected', 'error' |
| `error_code` | VARCHAR | 50 | No | Error code if applicable |
| `processing_time_ms` | INTEGER | - | No | Request processing time in milliseconds |
| `timestamp` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Yes | Event timestamp |
| `metadata` | JSON | - | No | Additional event metadata |

**Keys:**
- Primary Key: `id`
- Foreign Keys: `entity_id` → `reporting_entities.id`, `api_credential_id` → `api_credentials.id`, `report_id` → `reports.id`

**Indexes:**
- `idx_api_audit_logs_entity_id` on `entity_id`
- `idx_api_audit_logs_timestamp` on `timestamp`
- `idx_api_audit_logs_event_type` on `event_type`
- `idx_api_audit_logs_report_id` on `report_id`
- `idx_api_audit_logs_entity_timestamp` on `entity_id`, `timestamp` (composite for entity-specific queries)

**Relationship Notes:**
- Many-to-one: Multiple audit logs for same entity
- Many-to-one: Multiple audit logs for same report
- Append-only: Records are never updated or deleted (immutable)

---

### Table: `duplicate_submission_checks`

**Purpose:** Store checksums and identifiers for duplicate detection (shared between Excel and API submissions).

| Column Name | Data Type | Length/Constraints | Required | Notes |
|------------|-----------|-------------------|----------|-------|
| `id` | INTEGER | AUTO_INCREMENT | Yes | Primary Key |
| `entity_id` | INTEGER | - | Yes | Foreign Key to `reporting_entities` table |
| `entity_report_id` | VARCHAR | 100 | No | Entity's report identifier |
| `transaction_identifier_hash` | VARCHAR | 255 | No | Hash of key transaction identifiers |
| `report_id` | INTEGER | - | Yes | Foreign Key to `reports` table |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Yes | Check record creation timestamp |

**Keys:**
- Primary Key: `id`
- Foreign Keys: `entity_id` → `reporting_entities.id`, `report_id` → `reports.id`
- Unique Constraints: `entity_id` + `entity_report_id` (composite unique, where entity_report_id IS NOT NULL), `entity_id` + `transaction_identifier_hash` (composite unique, where transaction_identifier_hash IS NOT NULL)

**Indexes:**
- `idx_duplicate_checks_entity_report` on `entity_id`, `entity_report_id` (composite unique index, where entity_report_id IS NOT NULL)
- `idx_duplicate_checks_transaction_hash` on `entity_id`, `transaction_identifier_hash` (composite unique index, where transaction_identifier_hash IS NOT NULL)
- `idx_duplicate_checks_report_id` on `report_id`

**Relationship Notes:**
- Many-to-one: Multiple checks for same report (different check types)
- One-to-many: Each report can have one or more duplicate check records
- Shared table: Used by both Excel and API submissions

---

### Referenced Tables (Existing)

**`reporting_entities`**  
- Referenced by: `api_credentials.entity_id`, `reports.entity_id`, `api_audit_logs.entity_id`, `duplicate_submission_checks.entity_id`, `validation_errors.entity_id`
- Assumed columns: `id` (INTEGER, PK, AUTO_INCREMENT), `name`, `registration_number`, etc.

**`users`**  
- Referenced by: `api_credentials.created_by`
- Assumed columns: `id` (INTEGER, PK, AUTO_INCREMENT), `email`, `role`, etc.

**`reports`**  
- Shared table with Excel submission feature (Feature 2)
- Referenced by: `api_submission_data.report_id`, `validation_errors.report_id`, `api_audit_logs.report_id`, `duplicate_submission_checks.report_id`, `transactions.report_id`
- See Excel FDD for full table structure
- API submissions use `submission_method = 'api'` and link to `api_submission_data` for API-specific fields

---

## 7. API Contract (Endpoint List)

### Endpoint 1: Submit Report

**Method + Path**  
`POST /api/v1/submissions`

**Request Headers**  
- `X-API-Key`: `string` (required) - API key for authentication
- `X-Idempotency-Key`: `string` (optional) - Unique key for idempotent requests
- `Content-Type`: `application/json` (required)
- `Content-Length`: Maximum 25MB

**Request Body**  
```json
{
  "report_type": "STR" | "CTR",
  "xml_content": "string (goAML XML as string)"
}
```

**Request Body Fields:**
- `report_type`: `string` (required) - Must be "STR" or "CTR"
- `xml_content`: `string` (required) - goAML XML content as string (max 25MB)

**Response Shape - Success (201 Created)**  
```json
{
  "status": "Accepted" | "Received for Review",
  "reference": "FIA-ABC123-20260203103000",
  "timestamp": "2026-02-03T10:30:00Z"
}
```

**Response Shape - Rejected (400 Bad Request)**  
```json
{
  "status": "Rejected",
  "error_code": "ERR-API-VALID-001" | "ERR-API-VALID-002" | "ERR-API-DUP-001" | "ERR-API-SIZE-001",
  "message": "Error description",
  "timestamp": "2026-02-03T10:30:00Z",
  "errors": [
    {
      "element": "TransactionDate",
      "issue": "Missing required element",
      "location": "/Report/Transaction/TransactionDate"
    }
  ],
  "original_reference": "FIA-ABC123-20260201090000" // Only for ERR-API-DUP-001
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors (ERR-API-VALID-001, ERR-API-VALID-002, ERR-API-DUP-001, ERR-API-SIZE-001)
- `401 Unauthorized`: Authentication failure (ERR-API-AUTH-001)
- `500 Internal Server Error`: System error (ERR-API-SYS-001)
- `503 Service Unavailable`: System unavailable (ERR-API-SYS-001)

**Auth Required?**  
Yes - API Key authentication via `X-API-Key` header

**Traceability:** FR-API.1, FR-API.3, FR-API.4, FR-API.5, FR-API.6, FR-API.7, FR-API.10

---

### Endpoint 2: Query Submission Status

**Method + Path**  
`GET /api/v1/submissions/{reference}`

**Path Parameters**  
- `reference`: `string` (required) - Submission reference number (e.g., "FIA-ABC123-20260203103000")

**Request Headers**  
- `X-API-Key`: `string` (required) - API key for authentication

**Query Parameters**  
None

**Response Shape - Success (200 OK)**  
```json
{
  "reference": "FIA-ABC123-20260203103000",
  "status": "Pending" | "Validated" | "Rejected" | "Processing" | "Completed",
  "report_type": "STR" | "CTR",
  "submitted_at": "2026-02-03T10:30:00Z",
  "last_updated_at": "2026-02-03T10:35:00Z",
  "entity_report_id": "REP-2026-001" // If provided in submission
}
```

**Error Responses:**
- `401 Unauthorized`: Authentication failure (ERR-API-AUTH-001)
- `403 Forbidden`: Entity does not own this submission
- `404 Not Found`: Submission reference not found
- `500 Internal Server Error`: System error (ERR-API-SYS-001)

**Auth Required?**  
Yes - API Key authentication via `X-API-Key` header

**Traceability:** FR-API.8

---

### Endpoint 3: Health Check (Optional)

**Method + Path**  
`GET /api/v1/health`

**Request Headers**  
None

**Query Parameters**  
None

**Response Shape - Success (200 OK)**  
```json
{
  "status": "healthy",
  "timestamp": "2026-02-03T10:30:00Z",
  "version": "1.0"
}
```

**Error Responses:**
- `503 Service Unavailable`: System unavailable

**Auth Required?**  
No

**Traceability:** NFR-API-REL-1 (availability monitoring)

---

### Endpoint 4: Get Entity API Credentials (Entity-Facing)

**Method + Path**  
`GET /api/v1/reporting-entity/credentials`

**Request Headers**  
- `Authorization: Bearer {token}` (JWT - logged-in Reporting Entity User)

**Query Parameters**  
None

**Response Shape - Success (200 OK)**  
```json
{
  "entity_id": 12345,
  "credentials": [
    {
      "id": 1,
      "masked_key": "sk-****...****abcd",
      "status": "active",
      "created_at": "2026-01-15T10:30:00Z",
      "expires_at": "2027-01-15T10:30:00Z",
      "last_used_at": "2026-02-10T08:15:00Z"
    }
  ],
  "total": 1
}
```

**Error Responses:**
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: User is not a Reporting Entity User or has no entity linked

**Auth Required?**  
Yes - Bearer token (JWT) with Reporting Entity User role. Entity ID is derived from the authenticated user's `entity_id` field.

**Traceability:** FR-API.2

---

### Endpoint 5: Regenerate API Credentials (Entity-Facing)

> **v1.2 CHANGES — API Key Encryption + Portal Reveal + Email Delivery**
> - Removed `warning` field from success response (key is no longer one-time)
> - Updated security note: key is now always accessible via reveal endpoint

**Method + Path**  
`POST /api/v1/reporting-entity/credentials/regenerate`

**Request Headers**  
- `Authorization: Bearer {token}` (JWT - logged-in Reporting Entity User)
- `Content-Type: application/json`

**Request Body**  
```json
{
  "confirm": true
}
```

**Request Body Fields:**
- `confirm`: `boolean` (required) - Must be `true` to confirm regeneration. Prevents accidental calls.

**Response Shape - Success (200 OK)**  
```json
{
  "api_key": "a1b2c3d4e5f6...64_char_hex_string",
  "credential": {
    "id": 2,
    "masked_key": "sk-****...****f6g7",
    "status": "active",
    "created_at": "2026-02-10T09:00:00Z",
    "expires_at": "2027-02-10T09:00:00Z",
    "last_used_at": null
  },
  "message": "API credentials regenerated successfully. Previous credentials have been revoked."
}
```
🔄 CHANGED (v1.2): Removed `warning` field from response — key is no longer one-time.

**Error Responses:**
- `400 Bad Request`: `confirm` field is missing or false
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: User is not a Reporting Entity User or has no entity linked

**Auth Required?**  
Yes - Bearer token (JWT) with Reporting Entity User role. Requires re-authentication (elevated session) as this is a sensitive action.

**Security Notes:**
- This endpoint revokes all existing active credentials for the entity before issuing a new one
- Requires re-authentication (sensitive action per Feature 1 re-auth flow)
- 🔄 CHANGED (v1.2) The API key is also always accessible via the reveal endpoint and in the entity portal

**Traceability:** FR-API.2

---

### 🆕 NEW (v1.2) Endpoint 6: Reveal API Key (Entity-Facing)

**Method + Path**  
`POST /api/v1/reporting-entity/credentials/reveal`

**Request Headers**  
- `Authorization: Bearer {token}` (JWT - logged-in Reporting Entity User)
- `Content-Type: application/json`

**Request Body**  
```json
{
  "credential_id": 1
}
```

**Request Body Fields:**
- `credential_id`: `integer` (required) - The ID of the credential to reveal. Must belong to the authenticated user's entity and be in 'active' status.

**Response Shape - Success (200 OK)**  
```json
{
  "api_key": "a1b2c3d4e5f6...64_char_hex_string",
  "credential_id": 1
}
```

**Error Responses:**
- `400 Bad Request`: `credential_id` field is missing
- `401 Unauthorized`: Not authenticated or re-authentication required
- `403 Forbidden`: User is not a Reporting Entity User, has no entity linked, or credential does not belong to their entity
- `404 Not Found`: Credential ID not found or not in 'active' status

**Auth Required?**  
Yes - Bearer token (JWT) with Reporting Entity User role. Requires re-authentication (password re-entry) as this is a sensitive action.

**Security Notes:**
- The backend decrypts the `api_key_encrypted` field using the server-side `API_KEY_ENCRYPTION_SECRET`
- Re-authentication is required every time (prevents access from unattended sessions)
- Each reveal is logged in the audit trail (event_type: 'credential_revealed')

**Traceability:** FR-API.2

---

## 8. Pydantic Schemas (DTOs)

### 8.1 Request Schemas

**ApiSubmissionRequest:**
- `report_type` (Literal["STR", "CTR"], required) - Report type declaration
- `xml_content` (str, required, max_length=26214400) - goAML XML content as string (max 25MB)

**ApiStatusQueryRequest:**
- `reference` (str, required) - Submission reference number (path parameter)

### 8.2 Response Schemas

**ApiSubmissionResponse:**
- `status` (Literal["Accepted", "Received for Review"], required)
- `reference` (str, required) - Unique submission reference number
- `timestamp` (datetime, required) - ISO 8601 timestamp

**ApiSubmissionErrorResponse:**
- `status` (Literal["Rejected", "Error"], required)
- `error_code` (str, required) - Error code (e.g., "ERR-API-VALID-001")
- `message` (str, required) - Human-readable error message
- `timestamp` (datetime, required) - ISO 8601 timestamp
- `errors` (list[ValidationErrorDetail], optional) - Array of detailed validation errors
- `original_reference` (str, optional) - Original submission reference (for duplicate errors)
- `max_size` (int, optional) - Maximum allowed size (for size errors)
- `received_size` (int, optional) - Received size (for size errors)
- `retry_after` (datetime, optional) - Retry timestamp (for system errors)

**ValidationErrorDetail:**
- `element` (str, required) - XML element name
- `issue` (str, required) - Error description
- `location` (str, required) - XPath location in XML

**ApiStatusResponse:**
- `reference` (str, required) - Submission reference number
- `status` (str, required) - Current workflow status
- `report_type` (Literal["STR", "CTR"], required)
- `submitted_at` (datetime, required)
- `last_updated_at` (datetime, required)
- `entity_report_id` (str, optional) - Entity's internal report identifier

**HealthCheckResponse:**
- `status` (Literal["healthy"], required)
- `timestamp` (datetime, required)
- `version` (str, required)

**ErrorResponse:**
- `status` (Literal["Rejected", "Error"], required)
- `error_code` (str, required)
- `message` (str, required)
- `timestamp` (datetime, required)
- `errors` (list[ValidationErrorDetail], optional)
- Additional error-specific fields as needed

**ApiCredentialMaskedResponse:**
- `id` (int, required) - Credential ID
- `masked_key` (str, required) - Masked API key for display (e.g., `sk-****...****abcd`)
- `status` (Literal["active", "inactive", "revoked"], required) - Credential status
- `created_at` (datetime, required) - Creation timestamp
- `expires_at` (datetime, optional) - Expiration timestamp
- `last_used_at` (datetime, optional) - Last successful API request timestamp

**EntityCredentialsListResponse:**
- `credentials` (list[ApiCredentialMaskedResponse], required) - List of entity's API credentials
- `entity_id` (int, required) - Entity ID
- `total` (int, required) - Total number of credentials

**ApiCredentialRegenerateResponse:** 🔄 CHANGED (v1.2): Removed `warning` field
- `api_key` (str, required) - Plaintext API key
- `credential` (ApiCredentialMaskedResponse, required) - New credential metadata
- `message` (str, required) - Success message

**ApiCredentialRevealResponse:** 🆕 NEW (v1.2)
- `api_key` (str, required) - Decrypted plaintext API key
- `credential_id` (int, required) - ID of the revealed credential

---

## 9. Service Classes

### 9.1 ApiSubmissionService

**Purpose:** Core API submission business logic

**Methods:**
- `submit_report(entity_id: int, api_credential_id: int, report_type: str, xml_content: str, idempotency_key: str | None, submission_ip: str | None) -> ApiSubmissionResponse`
  - Validate payload size (max 25MB)
  - Validate goAML XML schema compliance
  - Validate report type matches XML content
  - Extract transaction data from XML
  - Store transactions in `transactions` table
  - Check for duplicate submissions (using shared duplicate detection service)
  - Generate reference number (using shared reference number generator)
  - Create report record in `reports` table
  - Create API-specific data record in `api_submission_data` table (xml_content set to NULL - not stored)
  - Create duplicate check records
  - If validation errors occur, store them in `validation_errors` table with `entity_id` set from api_credential.entity_id
  - Discard XML content after successful extraction (do not store)
  - Log audit event
  - Return submission response

- `validate_goaml_schema(xml_content: str, report_type: str, entity_id: int) -> tuple[bool, list[ValidationErrorDetail]]`
  - Load goAML XSD schema for report type
  - Validate XML against schema using xmlschema or lxml
  - **Note:** Validation rules are automatically determined from the goAML XSD schema file. The schema validator library (xmlschema/lxml) enforces required elements, data types, constraints, and structure defined in the XSD. No manual coding of validation rules is needed.
  - Store validation errors in `validation_errors` table with `entity_id` set
  - Return (is_valid, list_of_errors)
  - Extract detailed error information (element, location, issue)

- `validate_report_type_match(report_type: str, xml_content: str) -> bool`
  - Parse XML to extract report type from content
  - Compare declared type with XML content type
  - Return True if match, False if mismatch

- `check_idempotency(entity_id: int, idempotency_key: str) -> int | None`
  - Check if idempotency key exists for entity
  - Return report_id if found, None if not found
  - Used to prevent duplicate processing of retry requests

- `get_submission_status(reference_number: str, entity_id: int) -> ApiStatusResponse | None`
  - Query report by reference number
  - Verify entity owns the submission
  - Return status response or None if not found/unauthorized

---

### 9.2 ApiCredentialService

> **v1.2 CHANGES — API Key Encryption + Portal Reveal + Email Delivery**
> - `create_credential`: Now also encrypts the key (AES-256) and stores encrypted value alongside hash
> - `regenerate_credential`: Updated to use dual-store (hash + encrypted)
> - `reveal_credential`: 🆕 NEW method — decrypts and returns plaintext key for portal/email

**Purpose:** API credential management, creation, validation, and entity-facing credential access

**Methods:**
- 🔄 CHANGED (v1.2) `create_credential(entity_id: int, created_by: int, expires_in_days: int | None = 365) -> tuple[str, ApiCredential]`
  - Generate a cryptographically random API key (64-character hex string using `secrets.token_hex(32)`)
  - Hash the API key using Argon2 (via `ApiKeyHasher.hash_api_key()`) — stored in `api_key_hash` for fast authentication
  - 🆕 NEW (v1.2) Encrypt the API key using AES-256 (via `ApiKeyHasher.encrypt_api_key()`) — stored in `api_key_encrypted` for portal reveal and email delivery
  - 🔄 CHANGED (v1.2) Create `api_credentials` record with: entity_id, api_key_hash, api_key_encrypted, status='active', created_by, expires_at (if expires_in_days provided)
  - Log audit event for credential creation
  - Return tuple of (plaintext_api_key, credential_record)
  - 🔄 CHANGED (v1.2) **Storage:** The key is stored both as an irreversible hash (for authentication) and as a reversible encrypted value (for portal display and email). The encrypted value can only be decrypted using the server-side `API_KEY_ENCRYPTION_SECRET`.

- 🔄 CHANGED (v1.2) `regenerate_credential(entity_id: int, requested_by: int, reason: str = "Key rotation") -> tuple[str, ApiCredential]`
  - Revoke all active credentials for the entity (set status='revoked', revoked_at, revoked_reason="Replaced by key regeneration")
  - 🔄 CHANGED (v1.2) Call `create_credential(entity_id, requested_by)` to issue a new credential (stores both hash and encrypted value)
  - Log audit event for credential regeneration
  - Return tuple of (new_plaintext_api_key, new_credential_record)

- 🆕 NEW (v1.2) `reveal_credential(entity_id: int, credential_id: int) -> str`
  - Retrieve `api_key_encrypted` for the given credential
  - Verify the credential belongs to the requesting entity (entity_id check)
  - Verify the credential status is 'active'
  - Decrypt the API key using `ApiKeyHasher.decrypt_api_key()` with server-side `API_KEY_ENCRYPTION_SECRET`
  - Log audit event for credential reveal (event_type: 'credential_revealed')
  - Return the plaintext API key

- `validate_api_key(api_key: str) -> tuple[bool, ApiCredential | None]`
  - Hash provided API key
  - Lookup credential by api_key_hash
  - Check credential status (active/inactive/revoked)
  - Check expiration (if expires_at is set)
  - Update last_used_at timestamp
  - Return (is_valid, credential_object)

- `get_credential_by_id(credential_id: int) -> ApiCredential | None`
  - Retrieve API credential by ID
  - Return credential or None

- `get_entity_credentials(entity_id: int) -> list[ApiCredential]`
  - Retrieve all credentials for entity
  - Return list of credentials (api_key_hash is never exposed; return masked key prefix only)

- `get_entity_credentials_masked(entity_id: int) -> list[ApiCredentialMaskedResponse]`
  - Retrieve all credentials for entity
  - Return credentials with masked key display (e.g., `sk-****...****abcd`), status, created_at, expires_at, last_used_at
  - Used by entity-facing portal endpoint

- `revoke_credential(credential_id: int, revoked_by: int, reason: str) -> bool`
  - Set credential status to 'revoked'
  - Set revoked_at timestamp
  - Set revoked_reason
  - Log audit event
  - Return success status

---

### 9.3 ApiAuditService

**Purpose:** API-specific audit logging

**Methods:**
- `log_api_event(entity_id: int, api_credential_id: int | None, report_id: int | None, event_type: str, endpoint: str, http_method: str, request_ip: str | None, request_size_bytes: int | None, response_status_code: int | None, validation_outcome: str | None, error_code: str | None, processing_time_ms: int | None, metadata: dict | None) -> ApiAuditLog`
  - Create immutable audit log entry
  - Store all provided context
  - Return audit log object

- `get_entity_audit_logs(entity_id: int, start_date: datetime | None, end_date: datetime | None, limit: int, offset: int) -> list[ApiAuditLog]`
  - Retrieve audit logs for entity with pagination
  - Support date range filtering
  - Return list of audit logs

- `get_audit_logs_by_event_type(event_type: str, start_date: datetime, end_date: datetime) -> list[ApiAuditLog]`
  - Query logs by event type and date range
  - Return list of audit logs

---

### 9.4 DuplicateDetectionService (Shared with Excel Submission)

**Purpose:** Detect duplicate submissions (shared service used by both Excel and API submissions)

**Methods:**
- `check_duplicate(entity_id: int, entity_report_id: str | None, xml_content: str | None, excel_data: dict | None) -> tuple[bool, str | None]`
  - Check entity_report_id against existing submissions (if provided)
  - Extract transaction identifiers from XML or Excel data
  - Hash transaction identifiers
  - Check against duplicate_submission_checks table
  - Return (is_duplicate, existing_reference_number)
  - Note: This service is shared - API submissions pass xml_content, Excel submissions pass excel_data

- `create_duplicate_check_records(report_id: int, entity_id: int, entity_report_id: str | None, transaction_identifier_hash: str | None) -> None`
  - Create duplicate check records in duplicate_submission_checks table
  - Store entity_report_id if provided
  - Store transaction identifier hash if provided

---

### 9.5 ReferenceNumberGeneratorService (Shared with Excel Submission)

**Purpose:** Generate unique reference numbers (shared service)

**Methods:**
- `generate_reference_number(entity_id: int) -> str`
  - Format: `FIA-{ENTITYID}-{TIMESTAMP}`
  - `ENTITYID`: Reporting entity identifier (derived from entity.registration_number or entity code)
  - `TIMESTAMP`: YYYYMMDDHHMMSS format (server time)
  - Generate timestamp using server time (synchronized with national time standard)
  - Check for collisions (extremely rare)
  - If collision, append sequence number or retry
  - Return reference number string
  - Note: This service is shared between Excel and API submissions
  - Example: `FIA-ABC123-20260203103000` (where ABC123 is the entity identifier)

---

## 10. Controller Classes (FastAPI Routers)

### 10.1 ApiSubmissionRouter

**Purpose:** API submission endpoints

**Routes:**
- `POST /api/v1/submissions` - Submit report via API
  - Dependencies: ApiSubmissionService, ApiCredentialService, ApiAuditService, DuplicateDetectionService, ReferenceNumberGeneratorService
  - Middleware: ApiAuthenticationMiddleware, PayloadSizeMiddleware
  - Request: ApiSubmissionRequest
  - Response: ApiSubmissionResponse or ApiSubmissionErrorResponse
  - Error handling: Custom exception handlers for validation, authentication, duplicate errors

- `GET /api/v1/submissions/{reference}` - Query submission status
  - Dependencies: ApiSubmissionService, ApiCredentialService
  - Middleware: ApiAuthenticationMiddleware
  - Path parameter: reference (str)
  - Response: ApiStatusResponse or ErrorResponse
  - Authorization: Verify entity owns the submission

- `GET /api/v1/health` - Health check endpoint
  - Dependencies: None
  - Middleware: None
  - Response: HealthCheckResponse
  - No authentication required

**Error Handling:**
- All endpoints use FastAPI exception handlers
- Convert service exceptions to appropriate HTTP status codes
- Return standardized error responses

### 10.2 EntityCredentialRouter

**Purpose:** Entity-facing API credential management endpoints (authenticated via JWT, not API key)

**Routes:**
- `GET /api/v1/reporting-entity/credentials` - Get entity's API credentials (masked)
  - Dependencies: ApiCredentialService
  - Auth: JWT Bearer token (Reporting Entity User role)
  - Response: EntityCredentialsListResponse
  - Derives entity_id from authenticated user's entity_id

- `POST /api/v1/reporting-entity/credentials/regenerate` - Regenerate API credentials
  - Dependencies: ApiCredentialService, ApiAuditService
  - Auth: JWT Bearer token (Reporting Entity User role) + re-authentication required
  - Request: `{ "confirm": true }`
  - Response: ApiCredentialRegenerateResponse
  - Revokes all existing active credentials, issues new one

- 🆕 NEW (v1.2) `POST /api/v1/reporting-entity/credentials/reveal` - Reveal plaintext API key
  - Dependencies: ApiCredentialService, ApiAuditService
  - Auth: JWT Bearer token (Reporting Entity User role) + re-authentication required
  - Request: `{ "credential_id": 1 }`
  - Response: ApiCredentialRevealResponse
  - Decrypts and returns the plaintext key for the specified credential
  - Logs reveal event to audit trail

**Authorization:** JWT role guard - Reporting Entity User only. User must have a linked entity_id.

---

## 11. Middleware & Guards

### 11.1 ApiAuthenticationMiddleware

**Purpose:** Validate API key authentication on protected routes

**Functionality:**
- Extract `X-API-Key` header from request
- Validate API key using ApiCredentialService
- Check credential status (active/inactive/revoked)
- Check expiration (if applicable)
- Attach entity_id and api_credential_id to request state
- Return 401 Unauthorized if invalid/missing
- Log authentication failures to audit log

**Implementation:**
- FastAPI dependency function
- Applied to all API submission endpoints except health check

---

### 11.2 PayloadSizeMiddleware

**Purpose:** Enforce maximum payload size limit (25MB)

**Functionality:**
- Check Content-Length header
- Reject requests exceeding 25MB before processing
- Return 400 Bad Request with ERR-API-SIZE-001 error code
- Applied to POST /api/v1/submissions endpoint

---

### 11.3 TLSValidationMiddleware

**Purpose:** Ensure TLS 1.2+ is used for API requests

**Functionality:**
- Check request scheme (must be HTTPS)
- Verify TLS version (if available from request)
- Reject non-HTTPS connections
- Return 400 Bad Request if TLS requirement not met
- Applied to all API endpoints

**Note:** This may be handled at reverse proxy/load balancer level in production

---


---

## 12. Utilities & Helpers

### 12.1 GoAMLValidator

**Purpose:** goAML XML schema validation

**Methods:**
- `load_schema(report_type: str) -> XMLSchema`
  - Load goAML XSD schema file for report type (STR or CTR)
  - Cache schema in memory for performance
  - Return XMLSchema object

- `validate_xml(xml_content: str, schema: XMLSchema) -> tuple[bool, list[ValidationErrorDetail]]`
  - Parse XML content using lxml
  - Validate against XSD schema using xmlschema or lxml
  - **Note:** Validation rules are automatically determined from the goAML XSD schema file. The schema validator library (xmlschema/lxml) enforces:
    - Required elements (defined by `minOccurs` in XSD)
    - Data types (xs:int, xs:string, xs:date, etc.)
    - Constraints (minLength, maxLength, minInclusive, maxInclusive, patterns)
    - Element structure and hierarchy
  - No manual coding of validation rules is needed - the XSD schema IS the source of truth
  - Extract detailed validation errors from schema validator
  - Return (is_valid, list_of_errors)

- `extract_report_type_from_xml(xml_content: str) -> str | None`
  - Parse XML to extract report type indicator
  - Look for goAML report type elements
  - Return "STR" or "CTR" or None if ambiguous

---

### 12.2 XMLTransactionExtractor

**Purpose:** Extract transaction data from goAML XML

**Methods:**
- `extract_transactions(xml_content: str, report_type: str) -> list[dict]`
  - Parse goAML XML using lxml
  - Extract transaction elements based on report type (STR/CTR)
  - Map XML elements to transaction fields
  - Return list of transaction dictionaries for database insertion
  - Each transaction dict contains: transaction_date, transaction_amount, account_number, subject_name, subject_id_number, etc.

- `extract_and_store_transactions(xml_content: str, report_id: int, report_type: str) -> int`
  - Use extract_transactions to get transaction data
  - Insert transactions into `transactions` table
  - Link transactions to report via `report_id` foreign key
  - Return count of transactions stored
  - Handle errors during extraction (log but don't fail submission)

---

### 12.3 IdempotencyHandler

**Purpose:** Handle idempotency key validation and lookup

**Methods:**
- `check_idempotency_key(entity_id: int, idempotency_key: str) -> int | None`
  - Query api_submission_data table for matching idempotency_key and entity_id
  - Return report_id if found, None if not found
  - Used to prevent duplicate processing

- `store_idempotency_key(report_id: int, entity_id: int, idempotency_key: str) -> None`
  - Store idempotency key in api_submission_data table
  - Create composite unique constraint for idempotency_key + entity_id

---

### 12.4 ApiKeyHasher

> **v1.2 CHANGES — API Key Encryption + Portal Reveal + Email Delivery**
> - Purpose updated: now includes encryption alongside hashing
> - `encrypt_api_key()`: 🆕 NEW method — AES-256-GCM encryption
> - `decrypt_api_key()`: 🆕 NEW method — AES-256-GCM decryption

**Purpose:** Secure API key hashing, encryption, and validation

**Methods:**
- `hash_api_key(api_key: str) -> str`
  - Hash API key using Argon2 (same as password hashing)
  - Return hashed string
  - Used when creating new API credentials (stored in `api_key_hash`)

- `verify_api_key(api_key: str, api_key_hash: str) -> bool`
  - Verify API key against stored hash
  - Return True if match, False otherwise
  - Used during API authentication

- 🆕 NEW (v1.2) `encrypt_api_key(api_key: str) -> str`
  - Encrypt API key using AES-256-GCM with the server-side `API_KEY_ENCRYPTION_SECRET`
  - Generate a random IV (initialization vector) per encryption
  - Return base64-encoded string containing IV + ciphertext + auth tag
  - Used when creating/regenerating credentials (stored in `api_key_encrypted`)

- 🆕 NEW (v1.2) `decrypt_api_key(encrypted_api_key: str) -> str`
  - Decode base64 string to extract IV + ciphertext + auth tag
  - Decrypt using AES-256-GCM with the server-side `API_KEY_ENCRYPTION_SECRET`
  - Verify authentication tag to detect tampering
  - Return plaintext API key
  - Used when revealing credential in portal or including in welcome email

---

### 12.5 ProcessingTimeTracker

**Purpose:** Track API request processing time for monitoring

**Methods:**
- `start_timer() -> float`
  - Record start time (monotonic clock)
  - Return timestamp

- `get_elapsed_ms(start_time: float) -> int`
  - Calculate elapsed time in milliseconds
  - Return integer milliseconds
  - Used for audit logging

---

## 13. Configuration & Settings

### 13.1 ApiSettings (Pydantic Settings)

**Purpose:** Centralized API configuration

**Settings:**
- `API_MAX_PAYLOAD_SIZE_BYTES` (int, default: 26214400) - Maximum payload size (25MB)
- `API_KEY_HASH_ALGORITHM` (str, default: "argon2") - Hashing algorithm for API keys
- 🆕 NEW (v1.2) `API_KEY_ENCRYPTION_SECRET` (str, required) - AES-256 encryption secret key for encrypting/decrypting API keys. Must be exactly 32 bytes (64 hex characters). Stored as environment variable, **never** in the database or source code. Used by `ApiKeyHasher.encrypt_api_key()` and `ApiKeyHasher.decrypt_api_key()`.
- `API_IDEMPOTENCY_WINDOW_SECONDS` (int, default: 3600) - Idempotency key validity window
- `API_AUDIT_RETENTION_DAYS` (int, default: 3650) - Audit log retention (10 years)
- `API_RATE_LIMIT_REQUESTS_PER_HOUR` (int, default: 1000) - Rate limit per entity per hour
- `API_RATE_LIMIT_ENABLED` (bool, default: False) - Enable rate limiting
- `GOAML_SCHEMA_PATH_STR` (str) - Path to goAML STR XSD schema file
- `GOAML_SCHEMA_PATH_CTR` (str) - Path to goAML CTR XSD schema file
- `API_RESPONSE_TIMEOUT_SECONDS` (int, default: 3) - Target response time (95th percentile)
- `TLS_MIN_VERSION` (str, default: "1.2") - Minimum TLS version required

---

## 14. Database Schema

### 14.1 Tables to Create

**Purpose:** Create API-specific database tables

**Tables to Create:**
- `api_credentials` - API credential storage
- `api_submission_data` - API-specific submission data (xml_content nullable)
- `validation_errors` - Structured validation errors (shared with Excel submissions)
- `api_audit_logs` - API audit trail
- `transactions` - Transaction data (shared with Excel submissions)

**Operations:**
- Create all tables with columns as specified in Data Model section (Section 6)
- Create indexes as specified in Data Model section (Section 6)
- Create foreign key constraints
- Create unique constraints
- Create ENUM types for status fields

**Note:** Since this feature is not yet implemented, no migration is needed. Tables will be created as part of initial database setup.

---

## 15. Error Handling

### 15.1 Custom Exceptions

**ApiAuthenticationError:**
- Raised when API key is invalid, missing, expired, or revoked
- HTTP Status: 401 Unauthorized
- Error Code: ERR-API-AUTH-001

**SchemaValidationError:**
- Raised when goAML XML fails schema validation
- HTTP Status: 400 Bad Request
- Error Code: ERR-API-VALID-001
- Contains list of ValidationErrorDetail objects

**ReportTypeMismatchError:**
- Raised when declared report type doesn't match XML content
- HTTP Status: 400 Bad Request
- Error Code: ERR-API-VALID-002

**DuplicateSubmissionError:**
- Raised when duplicate submission is detected
- HTTP Status: 400 Bad Request
- Error Code: ERR-API-DUP-001
- Contains original_reference field

**PayloadSizeExceededError:**
- Raised when payload exceeds 25MB limit
- HTTP Status: 400 Bad Request
- Error Code: ERR-API-SIZE-001
- Contains max_size and received_size fields

**SystemUnavailableError:**
- Raised when system is temporarily unavailable
- HTTP Status: 503 Service Unavailable
- Error Code: ERR-API-SYS-001
- Contains retry_after timestamp

**SubmissionNotFoundError:**
- Raised when submission reference not found
- HTTP Status: 404 Not Found
- Error Code: ERR-API-NOTFOUND-001

**UnauthorizedAccessError:**
- Raised when entity doesn't own requested submission
- HTTP Status: 403 Forbidden
- Error Code: ERR-API-FORBIDDEN-001

### 15.2 Exception Handlers

**Global Exception Handlers:**
- FastAPI exception handlers for all custom exceptions
- Convert exceptions to appropriate HTTP status codes
- Return standardized error response format
- Log errors for debugging
- Include error codes for machine-readable responses

**Error Response Format:**
- All errors follow ApiSubmissionErrorResponse schema
- Consistent structure across all endpoints
- Include timestamp and error_code for all errors

---

## 16. Security Considerations

### 16.1 API Key Security

> **v1.2 CHANGES — API Key Encryption + Portal Reveal + Email Delivery**
> - Storage model changed from hash-only to dual-storage (hash + encrypted)
> - Added portal reveal re-authentication and audit logging requirements

- 🔄 CHANGED (v1.2) API keys stored using dual-storage: Argon2 hash (for authentication) + AES-256-GCM encrypted (for portal reveal / email delivery)
- API keys transmitted only over HTTPS/TLS 1.2+
- Credential rotation support (multiple credentials per entity)
- Credential revocation with audit trail
- Credential expiration support
- 🆕 NEW (v1.2) Portal reveal requires re-authentication (password re-entry) every time
- 🆕 NEW (v1.2) Each reveal is logged in the audit trail

### 16.2 Data Encryption

> **v1.2 CHANGES — API Key Encryption + Portal Reveal + Email Delivery**
> - Updated encryption notes to reflect dual-storage model
> - Added 16.2.1 Encryption Key Management subsection

- All API communication encrypted in transit (TLS 1.2+)
- Transaction data stored in database (encrypted at rest by database)
- XML content is NOT stored - extracted and discarded after processing
- Audit logs encrypted at rest
- 🔄 CHANGED (v1.2) API keys hashed using Argon2 (for authentication validation)
- 🆕 NEW (v1.2) API keys encrypted using AES-256-GCM (for on-demand decryption)

### 🆕 NEW (v1.2) 16.2.1 Encryption Key Management
- `API_KEY_ENCRYPTION_SECRET` must be stored as an environment variable or in a secrets manager (e.g., AWS Secrets Manager, Azure Key Vault) — **never** in the database or source code
- The encryption secret must be exactly 32 bytes (256 bits) for AES-256
- If the encryption secret is rotated, all encrypted API keys must be re-encrypted (run a migration that decrypts with the old key and re-encrypts with the new key)
- Losing the encryption secret means all encrypted API keys become unrecoverable — credentials must be regenerated
- Access to the encryption secret should be restricted to the application service account only

### 16.3 Audit Trail
- All API events logged to immutable audit log
- Audit logs include: entity, credential, IP, timestamp, outcome
- Audit logs retained for 10 years (regulatory requirement)
- Audit logs append-only (no updates/deletes)

### 16.4 Rate Limiting
- Optional rate limiting per entity
- Prevents API abuse and ensures fair usage
- Configurable limits per entity
- 429 Too Many Requests response when limit exceeded

### 16.5 Input Validation
- Payload size limits enforced (25MB max)
- XML schema validation (goAML compliance)
- Report type validation
- All inputs validated before processing

---

## 17. Dependencies Between Components

**Request Flow:**
1. Request received by FastAPI router
2. Middleware validates TLS, payload size, and API key
3. Controller extracts request data and validates with Pydantic
4. Controller calls ApiSubmissionService
5. Service uses GoAMLValidator for XML validation
6. Service uses DuplicateDetectionService (shared) for duplicate checks
7. Service uses ReferenceNumberGeneratorService (shared) for reference numbers
8. Service creates database records using SQLModel models
9. Service calls ApiAuditService for audit logging
10. Controller returns Pydantic response schema
11. FastAPI serializes response to JSON

**Data Flow:**
- Request → Pydantic Request Schema → Controller → Service → Model → Database
- Database → Model → Service → Pydantic Response Schema → Controller → Response

**Service Dependencies:**
- ApiSubmissionService depends on:
  - ApiCredentialService (for credential validation)
  - ApiAuditService (for audit logging)
  - DuplicateDetectionService (shared, for duplicate checks)
  - ReferenceNumberGeneratorService (shared, for reference numbers)
  - GoAMLValidator (for XML validation)

---

## 18. Implementation Order (Recommended)

1. **Database Models** (SQLModel async models)
   - api_credentials
   - api_submission_data (xml_content nullable)
   - validation_errors (shared with Excel submissions)
   - api_audit_logs
   - transactions (shared with Excel submissions)

2. **Database Migrations** (Alembic)
   - Create tables, indexes, constraints

3. **Pydantic Schemas** (Request/Response DTOs)
   - ApiSubmissionRequest
   - ApiSubmissionResponse
   - ApiSubmissionErrorResponse
   - ApiStatusResponse
   - ValidationErrorDetail

4. **Utilities** (Helper classes)
   - GoAMLValidator
   - XMLTransactionExtractor
   - ApiKeyHasher
   - IdempotencyHandler
   - ProcessingTimeTracker

5. **Services** (Business logic)
   - ApiCredentialService
   - ApiAuditService
   - ApiSubmissionService
   - Integration with shared services (DuplicateDetectionService, ReferenceNumberGeneratorService)

6. **Middleware & Guards**
   - ApiAuthenticationMiddleware
   - PayloadSizeMiddleware
   - TLSValidationMiddleware

7. **Controllers/Routers** (FastAPI endpoints)
   - ApiSubmissionRouter with all endpoints

8. **Error Handling** (Exception handlers)
   - Custom exceptions
   - FastAPI exception handlers

9. **Configuration** (Settings)
   - ApiSettings (Pydantic Settings)

10. **Integration Testing**
    - End-to-end API submission flows
    - Error scenario testing

---

## 19. Business Logic Specifications

### 19.1 goAML XML Schema Validation

**Implementation:**
- Load goAML XSD schema files for STR and CTR report types
- Use xmlschema or lxml library for validation
- Validate XML structure, required elements, data types
- Extract detailed error information (element name, location, issue)
- Return structured error details for machine-readable responses

**Error Details:**
- Element name (e.g., "TransactionDate")
- Issue description (e.g., "Missing required element")
- XPath location (e.g., "/Report/Transaction/TransactionDate")

---

### 19.2 Report Type Matching Validation

**Implementation:**
- Parse XML content to extract report type indicator
- Compare declared report type (from API request) with XML content type
- Reject if mismatch detected
- Return clear error message indicating the mismatch

### 19.3 Idempotency Handling

**Implementation:**
- Check idempotency key in request header (X-Idempotency-Key)
- If key provided, check api_submission_data table for existing submission
- If found, return existing submission reference (don't create duplicate)
- If not found, process submission and store idempotency key
- Idempotency window: 1 hour (configurable)

**Use Cases:**
- Network timeout retries
- Client-side retry logic
- Prevents duplicate submissions from retry attempts

---

## 20. Traceability to FRD

| FDD Section | FRD Requirement |
|------------|----------------|
| API Endpoint: POST /api/v1/submissions | FR-API.1, FR-API.3, FR-API.4, FR-API.5, FR-API.6, FR-API.7, FR-API.10 |
| API Endpoint: GET /api/v1/submissions/{reference} | FR-API.8 |
| Data Model: api_credentials | FR-API.2, FR-API.3 |
| Data Model: reports (shared) | FR-API.1, FR-API.6, FR-API.7 |
| Data Model: api_submission_data | FR-API.1, FR-API.6, FR-API.7 |
| Data Model: validation_errors (shared) | FR-API.4, FR-API.5, FR-API.6 |
| Data Model: transactions (shared) | FR-API.1, FR-API.6 |
| Data Model: api_audit_logs | FR-API.9 |
| Data Model: duplicate_submission_checks (shared) | FR-API.7 |
| User Flow: API Submission Flow | FR-API.1 through FR-API.7, FR-API.10 |
| User Flow: Status Query Flow | FR-API.8 |
| User Flow: Error Recovery Flow | ERR-API-NET-001, NFR-API-REL-3 |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | February 2026 | Senior Product Designer | Initial FDD created from FRD v1.0 |
| 1.1 | February 2026 | Technical Design Team | Added create_credential, regenerate_credential, get_entity_credentials_masked methods to ApiCredentialService; added entity-facing endpoints (GET /reporting-entity/credentials, POST /reporting-entity/credentials/regenerate); added EntityCredentialRouter; added ApiCredentialMaskedResponse, EntityCredentialsListResponse, ApiCredentialRegenerateResponse schemas |
| 1.2 | February 2026 | Technical Design Team | API key dual-storage: added `api_key_encrypted` column (AES-256-GCM); added `reveal_credential()` to ApiCredentialService; added `encrypt_api_key()`/`decrypt_api_key()` to ApiKeyHasher; added POST /reporting-entity/credentials/reveal endpoint + ApiCredentialRevealResponse schema; added `API_KEY_ENCRYPTION_SECRET` config setting; added encryption key management security notes; removed "shown once" language from regenerate response |

---

**Document End**
