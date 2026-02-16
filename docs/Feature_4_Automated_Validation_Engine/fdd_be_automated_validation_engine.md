# Backend Feature Design Document (FDD-BE)
## Feature 4: Automated Validation Engine

**Document Version:** 1.0  
**Date:** February 2026  
**Product/System Name:** SupTech365  
**Related FRD Version:** FRD-MVF v1.0  
**Status:** Draft  
**Author:** Technical Design Team

---

## 1. Feature Context

### 1.1 Feature Name
Automated Validation Engine

### 1.2 Feature Description
The Automated Validation Engine validates submitted STR/CTR reports for file format compliance, mandatory field presence, and data type correctness. Invalid reports are automatically rejected with detailed error feedback, while valid reports are routed to appropriate workflow queues.

### 1.3 Feature Purpose
Ensure only technically valid reports reach FIA staff for manual review, reducing processing burden and providing immediate feedback to reporting entities.

### 1.4 Related Features
- **Feature 2:** Digital Report Submission Portal (Excel) - Source of Excel submissions
- **Feature 3:** Digital Submission via API (goAML XML) - Source of XML submissions
- **Feature 5:** Manual Validation Workflow - Receives validated reports

### 1.5 User Types
- **System** - Primary actor executing validation
- **Reporting Entity User** - Receives validation results
- **Compliance Officer (FIA)** - Receives validated CTRs in queue
- **Analyst (FIA)** - Receives validated STRs in queue

---

## 2. Technology Stack Reference

| Category | Selection |
|----------|-----------|
| **Framework** | Python Web Framework (FastAPI) |
| **ORM Library** | SQLAlchemy |
| **Database** | PostgreSQL |
| **Auth Method** | JWT Bearer Token (existing auth system) |
| **Validation Library** | Pydantic |
| **Migration Tool** | Alembic |
| **XML Validation** | lxml with XSD schema validation |
| **Excel Processing** | openpyxl |

---

## 3. Architecture Pattern

### 3.1 Model-Service-Controller (MSC) Pattern

```
Request → Router/Controller → Service → Model → Database
                ↓
           Validators/Utilities
```

### 3.2 Layer Responsibilities

**Model Layer:**
- Define `ValidationResult`, `ValidationError`, `ValidationLog` entities
- Handle database queries for validation logs
- Manage relationships with `Submission` entity

**Service Layer:**
- `ValidationService` - Orchestrates validation workflow
- `ExcelValidationService` - Excel-specific validation logic
- `XmlValidationService` - GoAML XML validation logic
- `ValidationNotificationService` - Sends rejection notifications
- `ValidationQueueService` - Routes reports to queues

**Controller Layer:**
- Handle validation trigger requests
- Format validation responses
- Route to appropriate services

---

## 4. Data Model

### 4.1 Table: validation_results

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique identifier |
| submission_id | UUID | FK, NOT NULL | Reference to submission |
| validation_status | VARCHAR(20) | NOT NULL | PASSED, FAILED |
| report_type | VARCHAR(10) | NOT NULL | STR, CTR |
| validated_at | TIMESTAMP | NOT NULL | Validation timestamp |
| processing_duration_ms | INTEGER | NULL | Processing time in milliseconds |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |

**Indexes:**
- `idx_validation_results_submission_id` on `submission_id`
- `idx_validation_results_status` on `validation_status`
- `idx_validation_results_validated_at` on `validated_at`

**Foreign Keys:**
- `submission_id` → `submissions.id` ON DELETE CASCADE

---

### 4.2 Table: validation_errors

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique identifier |
| validation_result_id | UUID | FK, NOT NULL | Reference to validation result |
| error_code | VARCHAR(20) | NOT NULL | Error code (ERR-VAL-XXX) |
| error_type | VARCHAR(50) | NOT NULL | FORMAT, MANDATORY_FIELD, DATA_TYPE, SCHEMA |
| field_name | VARCHAR(100) | NULL | Field that caused error |
| row_number | INTEGER | NULL | Row number in Excel |
| expected_value | VARCHAR(255) | NULL | Expected format/type |
| actual_value | VARCHAR(255) | NULL | Actual value found |
| error_message | TEXT | NOT NULL | Human-readable error message |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Record creation time |

**Indexes:**
- `idx_validation_errors_result_id` on `validation_result_id`
- `idx_validation_errors_code` on `error_code`

**Foreign Keys:**
- `validation_result_id` → `validation_results.id` ON DELETE CASCADE

---

### 4.3 Table: validation_logs

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique identifier |
| submission_id | UUID | FK, NOT NULL | Reference to submission |
| submission_reference | VARCHAR(50) | NOT NULL | Submission reference number |
| validation_result | VARCHAR(20) | NOT NULL | PASS, FAIL |
| error_count | INTEGER | NOT NULL, DEFAULT 0 | Number of errors found |
| error_summary | JSONB | NULL | Summary of error types |
| validated_at | TIMESTAMP | NOT NULL | When validation occurred |
| validated_by | VARCHAR(50) | NOT NULL, DEFAULT 'SYSTEM' | Validator identifier |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Record creation time |

**Indexes:**
- `idx_validation_logs_submission_id` on `submission_id`
- `idx_validation_logs_reference` on `submission_reference`
- `idx_validation_logs_validated_at` on `validated_at`

**Foreign Keys:**
- `submission_id` → `submissions.id` ON DELETE CASCADE

---

### 4.4 Table: validation_queue_assignments

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique identifier |
| submission_id | UUID | FK, NOT NULL, UNIQUE | Reference to submission |
| queue_type | VARCHAR(20) | NOT NULL | COMPLIANCE, ANALYSIS |
| assigned_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Assignment timestamp |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'PENDING' | PENDING, ASSIGNED, COMPLETED |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Record creation time |

**Indexes:**
- `idx_queue_assignments_submission_id` on `submission_id` (UNIQUE)
- `idx_queue_assignments_queue_type` on `queue_type`
- `idx_queue_assignments_status` on `status`

**Foreign Keys:**
- `submission_id` → `submissions.id` ON DELETE CASCADE

---

### 4.5 Enum Types

```sql
CREATE TYPE validation_status_enum AS ENUM ('PASSED', 'FAILED', 'PENDING');
CREATE TYPE validation_error_type_enum AS ENUM ('FORMAT', 'MANDATORY_FIELD', 'DATA_TYPE', 'SCHEMA');
CREATE TYPE report_type_enum AS ENUM ('STR', 'CTR');
CREATE TYPE queue_type_enum AS ENUM ('COMPLIANCE', 'ANALYSIS');
```

---

## 5. API Contract

### 5.1 Trigger Validation (Internal)

**POST /api/v1/validation/trigger**

Triggers validation for a submitted report. Called internally after submission.

**Request Body:**
```json
{
  "submission_id": "uuid",
  "file_path": "string",
  "file_type": "EXCEL | XML",
  "report_type": "STR | CTR"
}
```

**Response (201 Created):**
```json
{
  "validation_id": "uuid",
  "submission_id": "uuid",
  "status": "PASSED | FAILED",
  "errors": [],
  "validated_at": "timestamp",
  "queue_assignment": "COMPLIANCE | ANALYSIS | null"
}
```

**Error Responses:**
- 400: Invalid request
- 404: Submission not found
- 500: Validation processing error

**Auth Required:** Yes (Internal service token)

---

### 5.2 Get Validation Result

**GET /api/v1/validation/{submission_id}**

Retrieves validation result for a submission.

**Path Parameters:**
- `submission_id` (UUID): Submission identifier

**Response (200 OK):**
```json
{
  "validation_id": "uuid",
  "submission_id": "uuid",
  "submission_reference": "string",
  "status": "PASSED | FAILED",
  "report_type": "STR | CTR",
  "validated_at": "timestamp",
  "processing_duration_ms": 1234,
  "errors": [
    {
      "error_code": "ERR-VAL-003",
      "error_type": "MANDATORY_FIELD",
      "field_name": "transaction_date",
      "row_number": 3,
      "message": "Mandatory field 'Transaction Date' is missing in Row 3"
    }
  ],
  "queue_assignment": {
    "queue_type": "COMPLIANCE | ANALYSIS",
    "assigned_at": "timestamp",
    "status": "PENDING"
  }
}
```

**Error Responses:**
- 404: Validation result not found
- 403: Access denied (entity can only view own submissions)

**Auth Required:** Yes (Bearer token)

---

### 5.3 Get Validation Errors

**GET /api/v1/validation/{submission_id}/errors**

Retrieves detailed error list for a failed validation.

**Path Parameters:**
- `submission_id` (UUID): Submission identifier

**Response (200 OK):**
```json
{
  "submission_id": "uuid",
  "submission_reference": "string",
  "total_errors": 5,
  "errors": [
    {
      "error_code": "ERR-VAL-003",
      "error_type": "MANDATORY_FIELD",
      "field_name": "transaction_date",
      "row_number": 3,
      "expected": "YYYY-MM-DD HH24:MI:SS",
      "actual": null,
      "message": "Mandatory field 'Transaction Date' is missing in Row 3"
    }
  ]
}
```

**Error Responses:**
- 404: Submission not found
- 403: Access denied

**Auth Required:** Yes (Bearer token)

---

### 5.4 Get Validation Queue (FIA Staff)

**GET /api/v1/validation/queue**

Retrieves queue of validated reports pending manual review.

**Query Parameters:**
- `queue_type` (string, optional): COMPLIANCE, ANALYSIS
- `status` (string, optional): PENDING, ASSIGNED
- `page` (int, default 1): Page number
- `limit` (int, default 20): Items per page

**Response (200 OK):**
```json
{
  "total": 45,
  "page": 1,
  "limit": 20,
  "items": [
    {
      "submission_id": "uuid",
      "submission_reference": "REF-2026-00001",
      "report_type": "CTR",
      "queue_type": "COMPLIANCE",
      "validated_at": "timestamp",
      "assigned_at": "timestamp",
      "status": "PENDING"
    }
  ]
}
```

**Auth Required:** Yes (FIA staff role)

---

## 6. Data Transfer Objects (DTOs)

### 6.1 Request Schemas

**ValidationTriggerRequest:**
```python
class ValidationTriggerRequest(BaseModel):
    submission_id: UUID                    # Required
    file_path: str                         # Required, max 500 chars
    file_type: Literal["EXCEL", "XML"]     # Required
    report_type: Literal["STR", "CTR"]     # Required
```

**ValidationQueueQueryParams:**
```python
class ValidationQueueQueryParams(BaseModel):
    queue_type: Optional[Literal["COMPLIANCE", "ANALYSIS"]] = None
    status: Optional[Literal["PENDING", "ASSIGNED"]] = None
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)
```

---

### 6.2 Response Schemas

**ValidationResultResponse:**
```python
class ValidationResultResponse(BaseModel):
    validation_id: UUID
    submission_id: UUID
    submission_reference: str
    status: Literal["PASSED", "FAILED"]
    report_type: Literal["STR", "CTR"]
    validated_at: datetime
    processing_duration_ms: Optional[int]
    errors: List[ValidationErrorResponse]
    queue_assignment: Optional[QueueAssignmentResponse]
```

**ValidationErrorResponse:**
```python
class ValidationErrorResponse(BaseModel):
    error_code: str
    error_type: str
    field_name: Optional[str]
    row_number: Optional[int]
    expected: Optional[str]
    actual: Optional[str]
    message: str
```

**QueueAssignmentResponse:**
```python
class QueueAssignmentResponse(BaseModel):
    queue_type: Literal["COMPLIANCE", "ANALYSIS"]
    assigned_at: datetime
    status: str
```

---

### 6.3 Error Response Schema

**ErrorResponse:**
```python
class ErrorResponse(BaseModel):
    error_code: str
    error_message: str
    details: Optional[Dict[str, Any]] = None
    timestamp: datetime
```

---

## 7. Service Classes

### 7.1 ValidationService

**Purpose:** Main orchestration service for validation workflow.

**Methods:**

| Method | Purpose | Parameters | Returns |
|--------|---------|------------|---------|
| `validate_submission()` | Execute full validation workflow | `submission_id: UUID, file_path: str, file_type: str, report_type: str` | `ValidationResult` |
| `get_validation_result()` | Retrieve validation result | `submission_id: UUID` | `ValidationResult` |
| `get_validation_errors()` | Get detailed error list | `submission_id: UUID` | `List[ValidationError]` |

**Business Logic - validate_submission():**
1. Load submission record
2. Determine validator based on file_type (Excel/XML)
3. Execute format validation
4. Execute mandatory field validation
5. Execute data type validation
6. Compile errors and determine status
7. Save validation result
8. Log validation outcome
9. If PASSED: route to queue
10. If FAILED: send rejection notification
11. Return result

**Dependencies:** `ExcelValidationService`, `XmlValidationService`, `ValidationNotificationService`, `ValidationQueueService`, `ValidationLogService`

---

### 7.2 ExcelValidationService

**Purpose:** Excel-specific validation logic.

**Methods:**

| Method | Purpose | Parameters | Returns |
|--------|---------|------------|---------|
| `validate_format()` | Validate Excel file format | `file_path: str` | `List[ValidationError]` |
| `validate_mandatory_fields()` | Check required fields | `workbook: Workbook, report_type: str` | `List[ValidationError]` |
| `validate_data_types()` | Validate field data types | `workbook: Workbook, report_type: str` | `List[ValidationError]` |
| `parse_excel_file()` | Parse Excel to data structure | `file_path: str` | `Workbook` |

**Business Logic - validate_mandatory_fields():**
1. Load field configuration for report_type (STR/CTR)
2. Iterate through each row
3. For each mandatory field, check if value exists and is non-empty
4. Collect errors with field name, row number
5. Return error list

**Dependencies:** `FieldConfigurationService`

---

### 7.3 XmlValidationService

**Purpose:** GoAML XML validation logic.

**Methods:**

| Method | Purpose | Parameters | Returns |
|--------|---------|------------|---------|
| `validate_format()` | Validate XML well-formedness | `file_path: str` | `List[ValidationError]` |
| `validate_schema()` | Validate against GoAML XSD | `xml_content: str` | `List[ValidationError]` |
| `validate_mandatory_fields()` | Check required elements | `xml_tree: ElementTree, report_type: str` | `List[ValidationError]` |
| `validate_data_types()` | Validate element data types | `xml_tree: ElementTree, report_type: str` | `List[ValidationError]` |

**Business Logic - validate_schema():**
1. Load GoAML XSD schema
2. Parse XML content
3. Validate against schema
4. Capture schema validation errors
5. Format errors with element path, error details
6. Return error list

**Dependencies:** `GoAMLSchemaLoader`

---

### 7.4 ValidationNotificationService

**Purpose:** Send validation notifications to reporting entities.

**Methods:**

| Method | Purpose | Parameters | Returns |
|--------|---------|------------|---------|
| `send_rejection_notification()` | Notify entity of rejection | `submission_id: UUID, errors: List[ValidationError]` | `bool` |
| `send_success_notification()` | Notify entity of success | `submission_id: UUID` | `bool` |

**Business Logic - send_rejection_notification():**
1. Load submission and entity details
2. Format error list for notification
3. Create notification record
4. Trigger notification delivery (email/in-app)
5. Log notification sent
6. Return success status

**Dependencies:** `NotificationService` (existing), `SubmissionRepository`

---

### 7.5 ValidationQueueService

**Purpose:** Route validated reports to appropriate queues.

**Methods:**

| Method | Purpose | Parameters | Returns |
|--------|---------|------------|---------|
| `route_to_queue()` | Assign report to queue | `submission_id: UUID, report_type: str` | `QueueAssignment` |
| `get_queue_items()` | Get items in queue | `queue_type: str, status: str, page: int, limit: int` | `PaginatedResult` |
| `determine_queue()` | Determine queue based on report type | `report_type: str` | `str` |

**Business Logic - route_to_queue():**
1. Determine queue type: CTR → COMPLIANCE, STR → ANALYSIS
2. Create queue assignment record
3. Update submission status
4. Return assignment

---

### 7.6 ValidationLogService

**Purpose:** Log validation outcomes for audit.

**Methods:**

| Method | Purpose | Parameters | Returns |
|--------|---------|------------|---------|
| `log_validation()` | Create audit log entry | `submission_id: UUID, result: ValidationResult` | `ValidationLog` |
| `get_logs_by_submission()` | Get logs for submission | `submission_id: UUID` | `List[ValidationLog]` |

---

### 7.7 FieldConfigurationService

**Purpose:** Provide field configuration for STR/CTR templates.

**Methods:**

| Method | Purpose | Parameters | Returns |
|--------|---------|------------|---------|
| `get_mandatory_fields()` | Get mandatory field list | `report_type: str` | `List[FieldConfig]` |
| `get_field_data_types()` | Get field type definitions | `report_type: str` | `Dict[str, FieldTypeConfig]` |
| `get_date_fields()` | Get date field names | `report_type: str` | `List[str]` |
| `get_numeric_fields()` | Get numeric field names | `report_type: str` | `List[str]` |

---

## 8. Controller Classes

### 8.1 ValidationRouter

**Base Path:** `/api/v1/validation`

**Route Handlers:**

| Route | Method | Handler | Auth | Description |
|-------|--------|---------|------|-------------|
| `/trigger` | POST | `trigger_validation()` | Internal | Trigger validation |
| `/{submission_id}` | GET | `get_validation_result()` | Bearer | Get result |
| `/{submission_id}/errors` | GET | `get_validation_errors()` | Bearer | Get errors |
| `/queue` | GET | `get_validation_queue()` | FIA Staff | Get queue |

**Handler: trigger_validation()**
```python
@router.post("/trigger", response_model=ValidationResultResponse, status_code=201)
async def trigger_validation(
    request: ValidationTriggerRequest,
    service: ValidationService = Depends(get_validation_service),
    auth: InternalAuth = Depends(get_internal_auth)
) -> ValidationResultResponse:
    result = await service.validate_submission(
        submission_id=request.submission_id,
        file_path=request.file_path,
        file_type=request.file_type,
        report_type=request.report_type
    )
    return ValidationResultResponse.from_orm(result)
```

---

## 9. Middleware and Guards

### 9.1 Authentication Middleware

Uses existing authentication middleware from Feature 1. No new middleware required.

**Internal Service Authentication:**
- For `/trigger` endpoint: Validate internal service token
- Token passed in `X-Internal-Service-Token` header

### 9.2 Authorization Guards

**ReportingEntityAccessGuard:**
- Ensures reporting entities can only view their own validation results
- Compares `submission.entity_id` with authenticated user's entity

**FIAStaffGuard:**
- Ensures only FIA staff roles can access queue endpoints
- Validates role in `[COMPLIANCE_OFFICER, ANALYST, HEAD_*]`

---

## 10. Utilities and Helpers

### 10.1 ExcelParser

**Purpose:** Parse and read Excel files.

**Functions:**

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `load_workbook()` | `file_path: str` | `Workbook` | Load Excel file |
| `get_sheet_data()` | `workbook: Workbook, sheet_name: str` | `List[Dict]` | Get sheet as list of dicts |
| `get_cell_value()` | `sheet, row: int, col: int` | `Any` | Get typed cell value |
| `is_valid_excel()` | `file_path: str` | `bool` | Check if valid Excel format |

---

### 10.2 GoAMLValidator

**Purpose:** Validate XML against GoAML schema.

**Functions:**

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `load_schema()` | `schema_path: str` | `XMLSchema` | Load XSD schema |
| `validate_xml()` | `xml_content: str, schema: XMLSchema` | `Tuple[bool, List[str]]` | Validate and return errors |
| `parse_xml()` | `xml_content: str` | `ElementTree` | Parse XML string |
| `is_well_formed()` | `xml_content: str` | `bool` | Check XML well-formedness |

---

### 10.3 DateValidator

**Purpose:** Validate date fields.

**Functions:**

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `is_valid_date_format()` | `value: str, format: str` | `bool` | Check date format |
| `is_valid_calendar_date()` | `value: str` | `bool` | Check if real date |
| `parse_date()` | `value: str` | `datetime` | Parse date string |

**Expected Format:** `YYYY-MM-DD HH24:MI:SS`

---

### 10.4 NumericValidator

**Purpose:** Validate numeric fields.

**Functions:**

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `is_numeric()` | `value: Any` | `bool` | Check if numeric |
| `is_positive()` | `value: Any` | `bool` | Check if positive |
| `parse_amount()` | `value: str` | `Decimal` | Parse amount string |
| `has_invalid_chars()` | `value: str` | `bool` | Check for commas, symbols |

---

### 10.5 ErrorMessageFormatter

**Purpose:** Format user-friendly error messages.

**Functions:**

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `format_missing_field()` | `field_name: str, row: int` | `str` | Format missing field error |
| `format_invalid_type()` | `field_name: str, expected: str, actual: str, row: int` | `str` | Format type error |
| `format_schema_error()` | `element: str, error: str` | `str` | Format XML schema error |

---

## 11. Configuration and Settings

### 11.1 ValidationSettings

```python
class ValidationSettings(BaseSettings):
    # File Processing
    MAX_FILE_SIZE_MB: int = 50
    ALLOWED_EXCEL_EXTENSIONS: List[str] = [".xlsx", ".xls"]
    
    # Schema Paths
    GOAML_SCHEMA_PATH: str = "schemas/goaml_schema.xsd"
    
    # Date Format
    DATE_FORMAT: str = "%Y-%m-%d %H:%M:%S"
    
    # Timeouts
    VALIDATION_TIMEOUT_SECONDS: int = 30
    
    # Queue Settings
    CTR_QUEUE_TYPE: str = "COMPLIANCE"
    STR_QUEUE_TYPE: str = "ANALYSIS"
    
    class Config:
        env_prefix = "VALIDATION_"
```

### 11.2 Field Configuration (STR)

```python
STR_MANDATORY_FIELDS = [
    "serial_number",
    "surname_organization_name",
    "bank_name",
    "institution_code",
    "report_type",
    "customer_type",
    "nationality",
    "account_number",
    "transaction_date",
    "transaction_type",
    "amount",
    "currency_type",
    "focus_id"
]

STR_DATE_FIELDS = [
    "date_of_incorporation_birth",
    "date_of_commencement",
    "date_of_issue",
    "date_opened",
    "transaction_date",
    "date_of_posting"
]

STR_NUMERIC_FIELDS = [
    "amount"
]
```

### 11.3 Field Configuration (CTR)

```python
CTR_MANDATORY_FIELDS = [
    "serial_number",
    "surname_organization_name",
    "bank_name",
    "institution_code",
    "customer_type",
    "nationality",
    "account_number",
    "transaction_date",
    "transaction_type",
    "debit_credit",
    "currency_type",
    "total_transaction_amount",
    "focus_id"
]

CTR_DATE_FIELDS = [
    "date_of_incorporation_birth",
    "date_of_issue",
    "date_opened",
    "transaction_date"
]

CTR_NUMERIC_FIELDS = [
    "amount_foreign_currency",
    "exchange_rate",
    "amount_local_currency",
    "total_transaction_amount"
]
```

---

## 12. Database Migrations

### 12.1 Migration: 001_create_validation_tables

**Tables Created:**
- `validation_results`
- `validation_errors`
- `validation_logs`
- `validation_queue_assignments`

**Enum Types Created:**
- `validation_status_enum`
- `validation_error_type_enum`
- `report_type_enum`
- `queue_type_enum`

**Indexes Created:**
- All indexes defined in Data Model section

**Foreign Keys Created:**
- All foreign keys defined in Data Model section

---

## 13. Error Handling

### 13.1 Custom Exceptions

**ValidationProcessingError:**
- Raised when validation cannot be processed
- HTTP Status: 500
- Message: "Validation processing failed"

**InvalidFileFormatError:**
- Raised when file format is invalid
- HTTP Status: 400
- Message: "Invalid file format: {details}"

**FileCorruptedError:**
- Raised when file cannot be read
- HTTP Status: 400
- Message: "File corrupted or unreadable"

**SchemaValidationError:**
- Raised when XML schema validation fails
- HTTP Status: 400
- Message: "XML schema validation failed: {details}"

**SubmissionNotFoundError:**
- Raised when submission doesn't exist
- HTTP Status: 404
- Message: "Submission not found"

**AccessDeniedError:**
- Raised when user lacks access
- HTTP Status: 403
- Message: "Access denied to this resource"

### 13.2 Exception Handler

```python
@app.exception_handler(ValidationProcessingError)
async def validation_error_handler(request: Request, exc: ValidationProcessingError):
    return JSONResponse(
        status_code=500,
        content={
            "error_code": "VALIDATION_PROCESSING_ERROR",
            "error_message": str(exc),
            "timestamp": datetime.utcnow().isoformat()
        }
    )
```

---

## 14. Testing Considerations

### 14.1 Unit Tests

**ValidationService Tests:**
- Test validate_submission with valid Excel STR
- Test validate_submission with valid Excel CTR
- Test validate_submission with valid XML
- Test validate_submission with missing mandatory fields
- Test validate_submission with invalid data types
- Test validate_submission with corrupted file

**ExcelValidationService Tests:**
- Test format validation with .xlsx
- Test format validation with .xls
- Test format validation with .csv (should fail)
- Test mandatory field detection
- Test date format validation
- Test numeric field validation

**XmlValidationService Tests:**
- Test schema validation with valid GoAML
- Test schema validation with invalid structure
- Test malformed XML handling

### 14.2 Integration Tests

**End-to-End Flow Tests:**
- Valid STR submission → validation pass → queue assignment
- Valid CTR submission → validation pass → queue assignment
- Invalid submission → validation fail → error report → notification

### 14.3 Test Fixtures

**Mock Data:**
- Valid STR Excel file
- Valid CTR Excel file
- Valid GoAML XML file
- Excel with missing mandatory fields
- Excel with invalid date formats
- Excel with non-numeric amounts
- Corrupted Excel file
- Invalid XML (malformed)
- XML failing schema validation

---

## 15. Security Considerations

### 15.1 Input Validation

- Validate file size before processing (max 50MB)
- Validate file extension before opening
- Sanitize file paths to prevent path traversal
- Validate XML to prevent XXE attacks (disable external entities)

### 15.2 Error Message Security

- Do not expose internal file paths in error messages
- Do not expose stack traces in responses
- Sanitize user-provided values in error messages

### 15.3 Access Control

- Reporting entities can only view own validation results
- FIA staff can view all results based on role
- Internal trigger endpoint requires service token

### 15.4 Audit Logging

- Log all validation attempts with submission reference
- Log validation results (pass/fail)
- Log error details for failed validations
- Log user/service that triggered validation

---

## 16. Dependencies Between Components

### 16.1 Data Flow Diagram

```
Submission Service
       │
       ▼
┌──────────────────┐
│ ValidationRouter │
│  /trigger POST   │
└────────┬─────────┘
         │
         ▼
┌──────────────────────┐
│  ValidationService   │
│  validate_submission │
└────────┬─────────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌───────┐ ┌───────┐
│ Excel │ │  XML  │
│Service│ │Service│
└───┬───┘ └───┬───┘
    │         │
    ▼         ▼
┌─────────────────────┐
│   Validators        │
│ (Date, Numeric, etc)│
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ ValidationResult    │
│ (PASS/FAIL)         │
└────────┬────────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌───────┐ ┌────────────┐
│ Queue │ │Notification│
│Service│ │  Service   │
└───────┘ └────────────┘
```

### 16.2 Service Dependencies

| Service | Dependencies |
|---------|--------------|
| ValidationService | ExcelValidationService, XmlValidationService, ValidationQueueService, ValidationNotificationService, ValidationLogService |
| ExcelValidationService | ExcelParser, DateValidator, NumericValidator, FieldConfigurationService |
| XmlValidationService | GoAMLValidator, DateValidator, NumericValidator, FieldConfigurationService |
| ValidationQueueService | SubmissionRepository |
| ValidationNotificationService | NotificationService, SubmissionRepository |

---

## 17. Implementation Order

### 17.1 Phase 1: Foundation (Sprint 1)

1. Database migrations (tables, indexes, enums)
2. Data models (SQLAlchemy models)
3. Configuration settings
4. Field configuration (STR/CTR mandatory fields)

### 17.2 Phase 2: Core Validators (Sprint 1-2)

1. ExcelParser utility
2. GoAMLValidator utility
3. DateValidator utility
4. NumericValidator utility
5. ExcelValidationService
6. XmlValidationService

### 17.3 Phase 3: Services (Sprint 2)

1. FieldConfigurationService
2. ValidationLogService
3. ValidationQueueService
4. ValidationNotificationService
5. ValidationService (orchestration)

### 17.4 Phase 4: API Layer (Sprint 2-3)

1. DTOs (request/response schemas)
2. ValidationRouter (controllers)
3. Exception handlers
4. Authorization guards

### 17.5 Phase 5: Integration (Sprint 3)

1. Integration with Submission Service
2. Integration with Notification Service
3. End-to-end testing
4. Security testing

---

## 18. Business Logic Specifications

### 18.1 Validation Workflow

```
1. RECEIVE validation trigger
2. LOAD submission record
3. DETERMINE file type (Excel/XML)
4. IF Excel:
   a. VALIDATE file format (.xlsx/.xls)
   b. PARSE workbook
   c. VALIDATE mandatory fields
   d. VALIDATE data types (dates, numbers)
5. IF XML:
   a. VALIDATE well-formedness
   b. VALIDATE against GoAML schema
   c. VALIDATE mandatory elements
   d. VALIDATE data types
6. COMPILE errors
7. DETERMINE status (PASSED if no errors, FAILED otherwise)
8. SAVE validation result
9. LOG validation outcome
10. IF PASSED:
    a. DETERMINE queue (CTR→COMPLIANCE, STR→ANALYSIS)
    b. CREATE queue assignment
    c. SEND success notification
11. IF FAILED:
    a. SEND rejection notification with errors
12. RETURN result
```

### 18.2 Queue Routing Logic

```python
def determine_queue(report_type: str) -> str:
    if report_type == "CTR":
        return "COMPLIANCE"  # CTR → Compliance Officer queue
    elif report_type == "STR":
        return "ANALYSIS"    # STR → Analysis queue
    else:
        raise ValueError(f"Unknown report type: {report_type}")
```

### 18.3 Date Validation Logic

```python
def validate_date(value: str) -> Tuple[bool, Optional[str]]:
    if not value:
        return False, "Value is empty"
    
    try:
        # Expected format: YYYY-MM-DD HH24:MI:SS
        parsed = datetime.strptime(value, "%Y-%m-%d %H:%M:%S")
        
        # Check for impossible dates (datetime.strptime handles this)
        return True, None
    except ValueError as e:
        return False, f"Invalid date format: {str(e)}"
```

### 18.4 Numeric Validation Logic

```python
def validate_numeric(value: Any) -> Tuple[bool, Optional[str]]:
    if value is None or value == "":
        return False, "Value is empty"
    
    str_value = str(value)
    
    # Check for invalid characters
    if "," in str_value:
        return False, "Commas not allowed in numeric values"
    if any(c in str_value for c in ["$", "€", "£", "¥"]):
        return False, "Currency symbols not allowed"
    if "-" in str_value and not str_value.startswith("-"):
        return False, "Ranges not allowed"
    
    try:
        decimal_value = Decimal(str_value)
        return True, None
    except:
        return False, "Value is not numeric"
```

---

## 19. Approval

**Prepared by:** Technical Design Team  
**Reviewed by:** [To be filled]  
**Approved by:** [To be filled]  
**Date:** [To be filled]

---

## 20. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | February 2026 | Technical Design Team | Initial FDD-BE based on MVF scope |
