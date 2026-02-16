# Backend Feature Design Document (FDD-BE)
## Feature 5: Manual Validation Workflow (MVF)

**Document Version:** 1.0  
**Date:** February 2026  
**Product/System Name:** SupTech365  
**Related FRD Version:** FRD-MVF v1.0  
**Status:** Draft  
**Author:** Technical Design Team

---

## 1. Feature Context

### 1.1 Feature Name
Manual Validation Workflow (MVF)

### 1.2 Feature Description
The Manual Validation Workflow enables Compliance Officers (for CTRs) and Analysts (for STRs) to review reports that passed automated validation, make validation decisions (Accept, Return for Correction, Reject) with mandatory justification for non-acceptance decisions, and route accepted reports to appropriate downstream queues based on report type.

### 1.3 Feature Purpose
Provide human oversight for quality control of validated reports, ensuring data entry quality, format consistency, and narrative clarity before reports proceed to compliance review (CTRs) or analyst assignment (STRs).

### 1.4 Related Features
- **Feature 4:** Automated Validation Engine - Source of validated reports entering manual validation queue
- **Feature 2:** Digital Report Submission Portal (Excel) - Source of Excel submissions
- **Feature 3:** Digital Submission via API (goAML XML) - Source of XML submissions
- **Feature 6:** Task Assignment & Workload Distribution - Receives accepted STRs for analyst assignment
- **Feature 1:** Authentication - Provides user authentication and role-based access control

### 1.5 User Types
- **Compliance Officer (FIA)** - Primary actor who reviews and validates CTRs
- **Analyst (FIA)** - Primary actor who reviews and validates STRs
- **System Process** - Routes accepted reports to downstream queues

---

## 2. Technology Stack Reference

| Category | Selection |
|----------|-----------|
| **Framework** | FastAPI |
| **ORM Library** | SQLAlchemy 2.0 (async) |
| **Database** | PostgreSQL |
| **Auth Method** | JWT Bearer Token (existing auth system) |
| **Validation Library** | Pydantic v2 |
| **Migration Tool** | Alembic |

---

## 3. Architecture Pattern

### 3.1 Model-Service-Controller (MSC) Pattern

```
Request → Router/Controller → Service → Model → Database
                ↓
           Middleware (Auth/RBAC)
```

### 3.2 Layer Responsibilities

**Model Layer:**
- Define `ManualValidationDecision`, `ManualValidationAuditLog` entities
- Handle database queries for validation queues
- Manage relationships with `Submission` entity

**Service Layer:**
- `ManualValidationService` - Core validation decision workflow
- `ValidationQueueService` - Queue management and FIFO ordering
- `ValidationAuditService` - Immutable audit logging
- `WorkflowRoutingService` - CTR/STR routing logic

**Controller Layer:**
- Handle HTTP requests for queue viewing and decision submission
- Validate input via Pydantic schemas
- Route to appropriate services
- Format responses

---

## 4. Data Model

### 4.1 Table: manual_validation_decisions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique identifier |
| submission_id | UUID | FK, NOT NULL, UNIQUE | Reference to submission |
| decision | VARCHAR(20) | NOT NULL | ACCEPT, RETURN, REJECT |
| reason | TEXT | NULL | Mandatory for RETURN/REJECT |
| decided_by | UUID | FK, NOT NULL | Reviewer user ID (Compliance Officer or Analyst) |
| decided_at | TIMESTAMP | NOT NULL | Decision timestamp |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |

**Indexes:**
- `idx_manual_validation_submission_id` on `submission_id` (UNIQUE)
- `idx_manual_validation_decision` on `decision`
- `idx_manual_validation_decided_by` on `decided_by`
- `idx_manual_validation_decided_at` on `decided_at`

**Foreign Keys:**
- `submission_id` → `submissions.id` ON DELETE CASCADE
- `decided_by` → `users.id` ON DELETE RESTRICT

---

### 4.2 Table: manual_validation_audit_logs

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique identifier |
| submission_id | UUID | FK, NOT NULL | Reference to submission |
| submission_reference | VARCHAR(50) | NOT NULL | Submission reference number |
| report_type | VARCHAR(10) | NOT NULL | STR, CTR |
| decision | VARCHAR(20) | NOT NULL | ACCEPT, RETURN, REJECT |
| reason | TEXT | NULL | Reason for RETURN/REJECT |
| decided_by_id | UUID | NOT NULL | Reviewer user ID (Compliance Officer or Analyst) |
| decided_by_username | VARCHAR(100) | NOT NULL | Reviewer username (denormalized) |
| decided_at | TIMESTAMP | NOT NULL | When decision was made |
| routed_to_queue | VARCHAR(30) | NULL | Target queue (COMPLIANCE, ANALYST) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Record creation time (immutable) |

**Indexes:**
- `idx_audit_logs_submission_id` on `submission_id`
- `idx_audit_logs_reference` on `submission_reference`
- `idx_audit_logs_decided_by` on `decided_by_id`
- `idx_audit_logs_decided_at` on `decided_at`
- `idx_audit_logs_decision` on `decision`

**Foreign Keys:**
- `submission_id` → `submissions.id` ON DELETE CASCADE

**Note:** This table is append-only. No UPDATE or DELETE operations are permitted to ensure audit trail immutability.

---

### 4.3 Table Modification: submissions

**Add Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| manual_validation_status | VARCHAR(20) | NOT NULL, DEFAULT 'PENDING' | PENDING, ACCEPTED, RETURNED, REJECTED |
| manual_validation_queue_position | INTEGER | NULL | Position in validation queue |
| entered_manual_validation_at | TIMESTAMP | NULL | When report entered manual validation queue |

**Add Indexes:**
- `idx_submissions_manual_validation_status` on `manual_validation_status`
- `idx_submissions_entered_manual_validation` on `entered_manual_validation_at`

---

### 4.4 Table: workflow_queue_assignments

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique identifier |
| submission_id | UUID | FK, NOT NULL, UNIQUE | Reference to submission |
| source_queue | VARCHAR(30) | NOT NULL | MANUAL_VALIDATION |
| target_queue | VARCHAR(30) | NOT NULL | COMPLIANCE, ANALYST |
| report_type | VARCHAR(10) | NOT NULL | STR, CTR |
| assigned_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Assignment timestamp |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'PENDING' | PENDING, COMPLETED, FAILED |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Record creation time |

**Indexes:**
- `idx_workflow_queue_submission_id` on `submission_id` (UNIQUE)
- `idx_workflow_queue_target` on `target_queue`
- `idx_workflow_queue_status` on `status`

**Foreign Keys:**
- `submission_id` → `submissions.id` ON DELETE CASCADE

---

### 4.5 Enum Types

```sql
CREATE TYPE manual_validation_decision_enum AS ENUM ('ACCEPT', 'RETURN', 'REJECT');
CREATE TYPE manual_validation_status_enum AS ENUM ('PENDING', 'ACCEPTED', 'RETURNED', 'REJECTED');
CREATE TYPE target_queue_enum AS ENUM ('COMPLIANCE', 'ANALYST');
```

---

## 5. API Contract

### 5.1 Get Validation Queue

**GET /api/v1/manual-validation/queue**

Returns the manual validation queue ordered by submission timestamp (oldest first). Compliance Officers see CTRs; Analysts see STRs.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number (default: 1) |
| page_size | integer | No | Items per page (default: 20, max: 100) |
| report_type | string | No | Filter by STR or CTR |

**Response: 200 OK**
```json
{
  "items": [
    {
      "submission_id": "uuid",
      "reference_number": "FIA-2026-001234",
      "report_type": "CTR",
      "entity_name": "Bank of Liberia",
      "submitted_at": "2026-02-03T10:30:00Z",
      "entered_queue_at": "2026-02-03T10:31:00Z",
      "transaction_count": 5,
      "total_amount": 150000.00
    }
  ],
  "total": 45,
  "page": 1,
  "page_size": 20,
  "total_pages": 3
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing JWT token
- `403 Forbidden` - User role not authorized to access validation queue

**Auth Required:** Yes (COMPLIANCE_OFFICER role for CTRs, ANALYST role for STRs)

---

### 5.2 Get Report Content

**GET /api/v1/manual-validation/reports/{submission_id}**

Returns full report content for reviewer (Compliance Officer or Analyst) review.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| submission_id | UUID | Submission identifier |

**Response: 200 OK**
```json
{
  "submission_id": "uuid",
  "reference_number": "FIA-2026-001234",
  "report_type": "CTR",
  "submission_method": "EXCEL",
  "entity": {
    "id": "uuid",
    "name": "Bank of Liberia",
    "entity_type": "BANK"
  },
  "submitted_by": {
    "id": "uuid",
    "username": "compliance_officer"
  },
  "submitted_at": "2026-02-03T10:30:00Z",
  "metadata": {
    "reporting_period_start": "2026-01-01",
    "reporting_period_end": "2026-01-31"
  },
  "transactions": [
    {
      "row_number": 1,
      "transaction_date": "2026-01-15",
      "transaction_type": "CASH_DEPOSIT",
      "amount": 25000.00,
      "currency": "LRD",
      "account_number": "****1234",
      "beneficiary_name": "John Doe",
      "narrative": "Monthly salary deposit"
    }
  ],
  "validation_status": "PENDING",
  "automated_validation_passed_at": "2026-02-03T10:31:00Z"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing JWT token
- `403 Forbidden` - User role not authorized
- `404 Not Found` - Submission not found or not in validation queue

**Auth Required:** Yes (COMPLIANCE_OFFICER role for CTRs, ANALYST role for STRs)

---

### 5.3 Submit Validation Decision

**POST /api/v1/manual-validation/reports/{submission_id}/decision**

Submits a validation decision for a report.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| submission_id | UUID | Submission identifier |

**Request Body:**
```json
{
  "decision": "ACCEPT | RETURN | REJECT",
  "reason": "string (required for RETURN/REJECT, min 10 chars)"
}
```

**Response: 200 OK**
```json
{
  "submission_id": "uuid",
  "reference_number": "FIA-2026-001234",
  "decision": "ACCEPT",
  "decided_at": "2026-02-03T11:00:00Z",
  "routed_to_queue": "COMPLIANCE",
  "message": "Report accepted and routed to compliance officer queue"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid decision or missing mandatory reason
  ```json
  {
    "error_code": "VALIDATION_ERROR",
    "error_message": "Reason is mandatory for Return/Reject decisions",
    "details": {
      "field": "reason",
      "constraint": "min_length",
      "min_length": 10
    }
  }
  ```
- `401 Unauthorized` - Invalid or missing JWT token
- `403 Forbidden` - User role not authorized
- `404 Not Found` - Submission not found or not in validation queue
- `409 Conflict` - Decision already made for this submission

**Auth Required:** Yes (COMPLIANCE_OFFICER role for CTRs, ANALYST role for STRs)

---

### 5.4 Get Audit Logs

**GET /api/v1/manual-validation/audit-logs**

Returns validation decision audit logs for querying and compliance reporting.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number (default: 1) |
| page_size | integer | No | Items per page (default: 20, max: 100) |
| submission_reference | string | No | Filter by submission reference |
| decided_by | UUID | No | Filter by reviewer ID |
| decision | string | No | Filter by decision (ACCEPT, RETURN, REJECT) |
| from_date | datetime | No | Filter from date (inclusive) |
| to_date | datetime | No | Filter to date (inclusive) |

**Response: 200 OK**
```json
{
  "items": [
    {
      "id": "uuid",
      "submission_id": "uuid",
      "submission_reference": "FIA-2026-001234",
      "report_type": "CTR",
      "decision": "ACCEPT",
      "reason": null,
      "decided_by": {
        "id": "uuid",
        "username": "compliance_officer_1"
      },
      "decided_at": "2026-02-03T11:00:00Z",
      "routed_to_queue": "COMPLIANCE"
    }
  ],
  "total": 150,
  "page": 1,
  "page_size": 20,
  "total_pages": 8
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing JWT token
- `403 Forbidden` - User role not authorized to view audit logs

**Auth Required:** Yes (COMPLIANCE_OFFICER, ANALYST, or Admin role)

---

## 6. Data Transfer Objects (DTOs)

### 6.1 Request Schemas

**ValidationQueueQueryParams**
```python
class ValidationQueueQueryParams(BaseModel):
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)
    report_type: Optional[ReportTypeEnum] = None
```

**ValidationDecisionRequest**
```python
class ValidationDecisionRequest(BaseModel):
    decision: ManualValidationDecisionEnum  # ACCEPT, RETURN, REJECT
    reason: Optional[str] = Field(default=None, min_length=10, max_length=2000)
    
    @validator('reason')
    def reason_required_for_return_reject(cls, v, values):
        if values.get('decision') in ['RETURN', 'REJECT']:
            if not v or len(v.strip()) < 10:
                raise ValueError('Reason is mandatory for Return/Reject decisions (minimum 10 characters)')
        return v
```

**AuditLogQueryParams**
```python
class AuditLogQueryParams(BaseModel):
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)
    submission_reference: Optional[str] = None
    decided_by: Optional[UUID] = None
    decision: Optional[ManualValidationDecisionEnum] = None
    from_date: Optional[datetime] = None
    to_date: Optional[datetime] = None
```

---

### 6.2 Response Schemas

**ValidationQueueItemResponse**
```python
class ValidationQueueItemResponse(BaseModel):
    submission_id: UUID
    reference_number: str
    report_type: ReportTypeEnum
    entity_name: str
    submitted_at: datetime
    entered_queue_at: datetime
    transaction_count: int
    total_amount: Decimal
```

**ValidationQueueResponse**
```python
class ValidationQueueResponse(BaseModel):
    items: List[ValidationQueueItemResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
```

**ReportContentResponse**
```python
class ReportContentResponse(BaseModel):
    submission_id: UUID
    reference_number: str
    report_type: ReportTypeEnum
    submission_method: str
    entity: EntitySummary
    submitted_by: UserSummary
    submitted_at: datetime
    metadata: dict
    transactions: List[TransactionRow]
    validation_status: ManualValidationStatusEnum
    automated_validation_passed_at: datetime
```

**ValidationDecisionResponse**
```python
class ValidationDecisionResponse(BaseModel):
    submission_id: UUID
    reference_number: str
    decision: ManualValidationDecisionEnum
    decided_at: datetime
    routed_to_queue: Optional[TargetQueueEnum]
    message: str
```

**AuditLogItemResponse**
```python
class AuditLogItemResponse(BaseModel):
    id: UUID
    submission_id: UUID
    submission_reference: str
    report_type: ReportTypeEnum
    decision: ManualValidationDecisionEnum
    reason: Optional[str]
    decided_by: UserSummary
    decided_at: datetime
    routed_to_queue: Optional[TargetQueueEnum]
```

**AuditLogResponse**
```python
class AuditLogResponse(BaseModel):
    items: List[AuditLogItemResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
```

---

### 6.3 Error Response Schema

**ErrorResponse**
```python
class ErrorResponse(BaseModel):
    error_code: str
    error_message: str
    details: Optional[dict] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
```

---

## 7. Service Classes

### 7.1 ManualValidationService

**Service Name:** ManualValidationService  
**Purpose:** Core service for processing validation decisions

**Methods:**

**submit_decision()**
- **Purpose:** Process and record a validation decision
- **Parameters:**
  - `submission_id: UUID` - Submission to validate
  - `decision: ManualValidationDecisionEnum` - ACCEPT, RETURN, REJECT
  - `reason: Optional[str]` - Mandatory for RETURN/REJECT
  - `user_id: UUID` - Reviewer (Compliance Officer or Analyst) making decision
- **Return Type:** `ValidationDecisionResponse`
- **Business Logic:**
  1. Verify submission exists and is in PENDING manual validation status
  2. Verify user has COMPLIANCE_OFFICER role (for CTRs) or ANALYST role (for STRs)
  3. Validate reason is provided for RETURN/REJECT (min 10 chars)
  4. Create `ManualValidationDecision` record
  5. Update submission `manual_validation_status`
  6. Call `ValidationAuditService.log_decision()`
  7. If ACCEPT, call `WorkflowRoutingService.route_report()`
  8. Return response with routing information
- **Dependencies:** ValidationQueueService, ValidationAuditService, WorkflowRoutingService

**get_report_content()**
- **Purpose:** Retrieve full report content for review
- **Parameters:**
  - `submission_id: UUID` - Submission to retrieve
  - `user_id: UUID` - Requesting user
- **Return Type:** `ReportContentResponse`
- **Business Logic:**
  1. Verify submission exists
  2. Verify submission is in validation queue (PENDING status)
  3. Verify user has COMPLIANCE_OFFICER role (for CTRs) or ANALYST role (for STRs)
  4. Load full submission with transactions and metadata
  5. Return formatted response
- **Dependencies:** SubmissionRepository

---

### 7.2 ValidationQueueService

**Service Name:** ValidationQueueService  
**Purpose:** Manage validation queue and FIFO ordering

**Methods:**

**get_queue()**
- **Purpose:** Retrieve paginated validation queue ordered by submission timestamp
- **Parameters:**
  - `page: int` - Page number
  - `page_size: int` - Items per page
  - `report_type: Optional[ReportTypeEnum]` - Filter by report type
  - `user_id: UUID` - Requesting user
- **Return Type:** `ValidationQueueResponse`
- **Business Logic:**
  1. Query submissions with `manual_validation_status = 'PENDING'`
  2. Order by `submitted_at ASC` (oldest first - FIFO)
  3. Apply report_type filter if provided
  4. Apply pagination
  5. Return paginated response
- **Dependencies:** SubmissionRepository

**add_to_queue()**
- **Purpose:** Add a newly validated submission to the manual validation queue
- **Parameters:**
  - `submission_id: UUID` - Submission that passed automated validation
- **Return Type:** `void`
- **Business Logic:**
  1. Update submission `manual_validation_status` to 'PENDING'
  2. Set `entered_manual_validation_at` to current timestamp
  3. Commit changes
- **Dependencies:** SubmissionRepository

**remove_from_queue()**
- **Purpose:** Remove a submission from the validation queue after decision
- **Parameters:**
  - `submission_id: UUID` - Submission to remove
  - `new_status: ManualValidationStatusEnum` - ACCEPTED, RETURNED, REJECTED
- **Return Type:** `void`
- **Business Logic:**
  1. Update submission `manual_validation_status` to new status
  2. Commit changes
- **Dependencies:** SubmissionRepository

---

### 7.3 ValidationAuditService

**Service Name:** ValidationAuditService  
**Purpose:** Manage immutable audit logging for validation decisions

**Methods:**

**log_decision()**
- **Purpose:** Create immutable audit log entry for a validation decision
- **Parameters:**
  - `submission_id: UUID` - Submission validated
  - `submission_reference: str` - Reference number
  - `report_type: ReportTypeEnum` - STR or CTR
  - `decision: ManualValidationDecisionEnum` - Decision made
  - `reason: Optional[str]` - Reason for RETURN/REJECT
  - `user_id: UUID` - Reviewer ID (Compliance Officer or Analyst)
  - `username: str` - Reviewer username (denormalized)
  - `routed_to_queue: Optional[TargetQueueEnum]` - Target queue for ACCEPT
- **Return Type:** `ManualValidationAuditLog`
- **Business Logic:**
  1. Create new `ManualValidationAuditLog` record
  2. Set `decided_at` to current timestamp
  3. Insert record (append-only, no updates allowed)
  4. Return created record
- **Dependencies:** None

**get_audit_logs()**
- **Purpose:** Query audit logs with filters for compliance reporting
- **Parameters:**
  - `page: int` - Page number
  - `page_size: int` - Items per page
  - `filters: AuditLogQueryParams` - Query filters
- **Return Type:** `AuditLogResponse`
- **Business Logic:**
  1. Build query with optional filters (reference, user, decision, date range)
  2. Order by `decided_at DESC` (most recent first)
  3. Apply pagination
  4. Return paginated response
- **Dependencies:** None

---

### 7.4 WorkflowRoutingService

**Service Name:** WorkflowRoutingService  
**Purpose:** Route accepted reports to appropriate downstream queues

**Methods:**

**route_report()**
- **Purpose:** Route an accepted report to the correct downstream queue
- **Parameters:**
  - `submission_id: UUID` - Submission to route
  - `report_type: ReportTypeEnum` - STR or CTR
- **Return Type:** `TargetQueueEnum`
- **Business Logic:**
  1. Determine target queue based on report type:
     - CTR → COMPLIANCE (compliance officer queue)
     - STR → ANALYST (analyst assignment queue, bypasses compliance)
  2. Create `WorkflowQueueAssignment` record
  3. Return target queue
- **Dependencies:** None

**get_routing_status()**
- **Purpose:** Check routing status for a submission
- **Parameters:**
  - `submission_id: UUID` - Submission to check
- **Return Type:** `Optional[WorkflowQueueAssignment]`
- **Business Logic:**
  1. Query `workflow_queue_assignments` by submission_id
  2. Return assignment record or None
- **Dependencies:** None

---

## 8. Controller Classes

### 8.1 ManualValidationRouter

**Router Name:** ManualValidationRouter  
**Base Path:** `/api/v1/manual-validation`

**Route Handlers:**

**GET /queue**
```python
@router.get("/queue", response_model=ValidationQueueResponse)
async def get_validation_queue(
    params: ValidationQueueQueryParams = Depends(),
    current_user: User = Depends(get_current_user),
    queue_service: ValidationQueueService = Depends()
) -> ValidationQueueResponse:
    """
    Get manual validation queue ordered by submission timestamp (oldest first). Compliance Officers see CTRs; Analysts see STRs.
    Requires COMPLIANCE_OFFICER role (for CTRs) or ANALYST role (for STRs).
    """
```
- **Dependencies:** AuthenticationMiddleware, RoleGuard(COMPLIANCE_OFFICER, ANALYST)
- **Request:** ValidationQueueQueryParams
- **Response:** ValidationQueueResponse (200) or ErrorResponse (401, 403)

**GET /reports/{submission_id}**
```python
@router.get("/reports/{submission_id}", response_model=ReportContentResponse)
async def get_report_content(
    submission_id: UUID,
    current_user: User = Depends(get_current_user),
    validation_service: ManualValidationService = Depends()
) -> ReportContentResponse:
    """
    Get full report content for reviewer (Compliance Officer or Analyst) review.
    Requires COMPLIANCE_OFFICER role (for CTRs) or ANALYST role (for STRs).
    """
```
- **Dependencies:** AuthenticationMiddleware, RoleGuard(COMPLIANCE_OFFICER, ANALYST)
- **Request:** Path parameter submission_id
- **Response:** ReportContentResponse (200) or ErrorResponse (401, 403, 404)

**POST /reports/{submission_id}/decision**
```python
@router.post("/reports/{submission_id}/decision", response_model=ValidationDecisionResponse)
async def submit_validation_decision(
    submission_id: UUID,
    request: ValidationDecisionRequest,
    current_user: User = Depends(get_current_user),
    validation_service: ManualValidationService = Depends()
) -> ValidationDecisionResponse:
    """
    Submit validation decision for a report.
    Requires COMPLIANCE_OFFICER role (for CTRs) or ANALYST role (for STRs).
    Reason is mandatory for RETURN/REJECT decisions (min 10 chars).
    """
```
- **Dependencies:** AuthenticationMiddleware, RoleGuard(COMPLIANCE_OFFICER, ANALYST)
- **Request:** ValidationDecisionRequest
- **Response:** ValidationDecisionResponse (200) or ErrorResponse (400, 401, 403, 404, 409)

**GET /audit-logs**
```python
@router.get("/audit-logs", response_model=AuditLogResponse)
async def get_audit_logs(
    params: AuditLogQueryParams = Depends(),
    current_user: User = Depends(get_current_user),
    audit_service: ValidationAuditService = Depends()
) -> AuditLogResponse:
    """
    Query validation decision audit logs.
    Requires COMPLIANCE_OFFICER, ANALYST, or ADMIN role.
    """
```
- **Dependencies:** AuthenticationMiddleware, RoleGuard(COMPLIANCE_OFFICER, ANALYST, ADMIN)
- **Request:** AuditLogQueryParams
- **Response:** AuditLogResponse (200) or ErrorResponse (401, 403)

---

## 9. Middleware and Guards

### 9.1 Authentication Middleware

**Middleware Name:** AuthenticationMiddleware (existing)

**Purpose:** Validates JWT token and extracts current user

**Process:**
1. Extract JWT from Authorization header
2. Validate token signature and expiration
3. Load user from database
4. Attach user to request context

---

### 9.2 Role Guard

**Guard Name:** RoleGuard

**Purpose:** Enforce role-based access control for manual validation endpoints

**Configuration:**
```python
class RoleGuard:
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles
    
    async def __call__(self, current_user: User = Depends(get_current_user)):
        if current_user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=403,
                detail="You do not have permission to access this queue"
            )
        return current_user
```

**Role Mappings:**
- `/queue` - COMPLIANCE_OFFICER (for CTRs), ANALYST (for STRs)
- `/reports/{id}` - COMPLIANCE_OFFICER (for CTRs), ANALYST (for STRs)
- `/reports/{id}/decision` - COMPLIANCE_OFFICER (for CTRs), ANALYST (for STRs)
- `/audit-logs` - COMPLIANCE_OFFICER, ANALYST, ADMIN

---

## 10. Error Handling

### 10.1 Custom Exceptions

**ValidationReasonRequiredError**
- **Purpose:** Raised when RETURN/REJECT decision lacks mandatory reason
- **HTTP Status:** 400
- **Error Code:** `VALIDATION_REASON_REQUIRED`
- **Message:** "Reason is mandatory for Return/Reject decisions. Please provide a detailed reason explaining your decision."

**InvalidValidationDecisionError**
- **Purpose:** Raised when decision is not ACCEPT, RETURN, or REJECT
- **HTTP Status:** 400
- **Error Code:** `INVALID_VALIDATION_DECISION`
- **Message:** "Invalid validation decision. Please select a valid decision option (Accept, Return for Correction, or Reject)."

**QueueAccessViolationError**
- **Purpose:** Raised when user lacks permission to access validation queue
- **HTTP Status:** 403
- **Error Code:** `QUEUE_ACCESS_VIOLATION`
- **Message:** "You do not have permission to access this queue."

**SubmissionNotInQueueError**
- **Purpose:** Raised when submission is not in validation queue
- **HTTP Status:** 404
- **Error Code:** `SUBMISSION_NOT_IN_QUEUE`
- **Message:** "Submission not found or not in validation queue."

**DecisionAlreadyMadeError**
- **Purpose:** Raised when attempting to make decision on already-validated submission
- **HTTP Status:** 409
- **Error Code:** `DECISION_ALREADY_MADE`
- **Message:** "A decision has already been made for this submission."

**WorkflowRoutingError**
- **Purpose:** Raised when routing to downstream queue fails
- **HTTP Status:** 500
- **Error Code:** `WORKFLOW_ROUTING_ERROR`
- **Message:** "Failed to route report to downstream queue. Please try again or contact support."

---

### 10.2 Exception Handler

```python
@app.exception_handler(ManualValidationException)
async def manual_validation_exception_handler(request: Request, exc: ManualValidationException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error_code": exc.error_code,
            "error_message": exc.message,
            "details": exc.details,
            "timestamp": datetime.utcnow().isoformat()
        }
    )
```

---

## 11. Business Logic Specifications

### 11.1 Queue Ordering (FIFO)

**Rule:** BR-5.1 - Queue Ordering by Submission Timestamp

**Implementation:**
```sql
SELECT * FROM submissions 
WHERE manual_validation_status = 'PENDING'
ORDER BY submitted_at ASC
LIMIT :page_size OFFSET :offset;
```

### 11.2 Mandatory Reason Validation

**Rule:** BR-5.5 - Mandatory Reason for Return/Reject

**Implementation:**
```python
def validate_decision(decision: str, reason: Optional[str]) -> None:
    if decision in ['RETURN', 'REJECT']:
        if not reason or len(reason.strip()) < 10:
            raise ValidationReasonRequiredError(
                "Reason is mandatory for Return/Reject decisions (minimum 10 characters)"
            )
```

### 11.3 Workflow Routing Logic

**Rule:** BR-5.13, BR-5.14 - CTR/STR Routing

**Implementation:**
```python
def determine_target_queue(report_type: ReportTypeEnum) -> TargetQueueEnum:
    if report_type == ReportTypeEnum.CTR:
        return TargetQueueEnum.COMPLIANCE  # CTR → Compliance Officer
    elif report_type == ReportTypeEnum.STR:
        return TargetQueueEnum.ANALYST  # STR → Analyst (bypasses compliance)
    else:
        raise ValueError(f"Unknown report type: {report_type}")
```

### 11.4 Validation Decision Workflow

**Processing Flow:**
```
1. Receive decision request
2. Authenticate user (JWT)
3. Authorize user (COMPLIANCE_OFFICER role for CTRs, ANALYST role for STRs)
4. Validate submission exists in queue
5. Validate decision value (ACCEPT/RETURN/REJECT)
6. Validate reason (if RETURN/REJECT, min 10 chars)
7. Create ManualValidationDecision record
8. Update submission status
9. Create audit log entry (immutable)
10. If ACCEPT:
    a. Determine target queue (COMPLIANCE for CTR, ANALYST for STR)
    b. Create WorkflowQueueAssignment
11. Return response with routing info
```

---

## 12. Database Migrations

### 12.1 Migration: Add Manual Validation Tables

**Migration Name:** `001_add_manual_validation_tables`

**Up Migration:**
```sql
-- Create enum types
CREATE TYPE manual_validation_decision_enum AS ENUM ('ACCEPT', 'RETURN', 'REJECT');
CREATE TYPE manual_validation_status_enum AS ENUM ('PENDING', 'ACCEPTED', 'RETURNED', 'REJECTED');
CREATE TYPE target_queue_enum AS ENUM ('COMPLIANCE', 'ANALYST');

-- Create manual_validation_decisions table
CREATE TABLE manual_validation_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL UNIQUE REFERENCES submissions(id) ON DELETE CASCADE,
    decision manual_validation_decision_enum NOT NULL,
    reason TEXT,
    decided_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    decided_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_manual_validation_submission_id ON manual_validation_decisions(submission_id);
CREATE INDEX idx_manual_validation_decision ON manual_validation_decisions(decision);
CREATE INDEX idx_manual_validation_decided_by ON manual_validation_decisions(decided_by);
CREATE INDEX idx_manual_validation_decided_at ON manual_validation_decisions(decided_at);

-- Create manual_validation_audit_logs table (append-only)
CREATE TABLE manual_validation_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    submission_reference VARCHAR(50) NOT NULL,
    report_type VARCHAR(10) NOT NULL,
    decision manual_validation_decision_enum NOT NULL,
    reason TEXT,
    decided_by_id UUID NOT NULL,
    decided_by_username VARCHAR(100) NOT NULL,
    decided_at TIMESTAMP NOT NULL,
    routed_to_queue target_queue_enum,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_submission_id ON manual_validation_audit_logs(submission_id);
CREATE INDEX idx_audit_logs_reference ON manual_validation_audit_logs(submission_reference);
CREATE INDEX idx_audit_logs_decided_by ON manual_validation_audit_logs(decided_by_id);
CREATE INDEX idx_audit_logs_decided_at ON manual_validation_audit_logs(decided_at);
CREATE INDEX idx_audit_logs_decision ON manual_validation_audit_logs(decision);

-- Create workflow_queue_assignments table
CREATE TABLE workflow_queue_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL UNIQUE REFERENCES submissions(id) ON DELETE CASCADE,
    source_queue VARCHAR(30) NOT NULL,
    target_queue target_queue_enum NOT NULL,
    report_type VARCHAR(10) NOT NULL,
    assigned_at TIMESTAMP NOT NULL DEFAULT NOW(),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workflow_queue_submission_id ON workflow_queue_assignments(submission_id);
CREATE INDEX idx_workflow_queue_target ON workflow_queue_assignments(target_queue);
CREATE INDEX idx_workflow_queue_status ON workflow_queue_assignments(status);

-- Add columns to submissions table
ALTER TABLE submissions 
ADD COLUMN manual_validation_status manual_validation_status_enum NOT NULL DEFAULT 'PENDING',
ADD COLUMN entered_manual_validation_at TIMESTAMP;

CREATE INDEX idx_submissions_manual_validation_status ON submissions(manual_validation_status);
CREATE INDEX idx_submissions_entered_manual_validation ON submissions(entered_manual_validation_at);
```

**Down Migration:**
```sql
ALTER TABLE submissions 
DROP COLUMN manual_validation_status,
DROP COLUMN entered_manual_validation_at;

DROP TABLE workflow_queue_assignments;
DROP TABLE manual_validation_audit_logs;
DROP TABLE manual_validation_decisions;

DROP TYPE target_queue_enum;
DROP TYPE manual_validation_status_enum;
DROP TYPE manual_validation_decision_enum;
```

---

## 13. Implementation Order

### 13.1 Recommended Sequence

**Phase 1: Foundation**
1. Database migrations (enums, tables, indexes)
2. SQLAlchemy models (ManualValidationDecision, ManualValidationAuditLog, WorkflowQueueAssignment)
3. Pydantic DTOs (request/response schemas)

**Phase 2: Core Services**
4. ValidationAuditService (audit logging)
5. ValidationQueueService (queue management)
6. WorkflowRoutingService (CTR/STR routing)
7. ManualValidationService (orchestration)

**Phase 3: API Layer**
8. ManualValidationRouter (endpoints)
9. Role guards and authorization
10. Exception handlers

**Phase 4: Integration**
11. Integration with Feature 4 (receive validated reports)
12. Integration tests
13. End-to-end workflow testing

### 13.2 Component Dependencies

```
ManualValidationService
    ├── ValidationQueueService
    ├── ValidationAuditService
    └── WorkflowRoutingService

ManualValidationRouter
    ├── ManualValidationService
    ├── ValidationQueueService
    ├── ValidationAuditService
    └── AuthenticationMiddleware / RoleGuard
```

---

## 14. Testing Considerations

### 14.1 Unit Tests

**Service Tests:**
- `test_submit_decision_accept` - Accept decision routes correctly
- `test_submit_decision_return_without_reason` - Returns error
- `test_submit_decision_reject_with_reason` - Reject with valid reason succeeds
- `test_queue_ordering_fifo` - Queue returns oldest first
- `test_ctr_routes_to_compliance` - CTR routing logic
- `test_str_routes_to_analyst` - STR routing logic
- `test_audit_log_created` - Audit log created on decision

### 14.2 Integration Tests

**API Tests:**
- `test_get_queue_unauthorized` - 401 without token
- `test_get_queue_forbidden` - 403 for non-data-clerk
- `test_get_queue_success` - Returns paginated queue
- `test_submit_decision_full_flow` - End-to-end decision flow
- `test_audit_logs_query_filters` - Audit log filtering

### 14.3 Test Fixtures

**Required Fixtures:**
- Sample submissions in PENDING manual validation status
- Compliance Officer user with COMPLIANCE_OFFICER role (for CTRs)
- Analyst user with ANALYST role (for STRs)
- Compliance officer user for audit log access
- CTR and STR sample reports

---

## 15. Security Considerations

### 15.1 Role-Based Access Control

**Endpoint Permissions:**
| Endpoint | Allowed Roles |
|----------|---------------|
| GET /queue | COMPLIANCE_OFFICER (CTRs), ANALYST (STRs) |
| GET /reports/{id} | COMPLIANCE_OFFICER (CTRs), ANALYST (STRs) |
| POST /reports/{id}/decision | COMPLIANCE_OFFICER (CTRs), ANALYST (STRs) |
| GET /audit-logs | COMPLIANCE_OFFICER, ANALYST, ADMIN |

### 15.2 Audit Log Immutability

**Protection Measures:**
- No UPDATE permission on `manual_validation_audit_logs` table
- No DELETE permission on `manual_validation_audit_logs` table
- Database-level triggers to prevent modifications (optional)
- Application-level enforcement in service layer

### 15.3 Data Protection

**Sensitive Data:**
- Report content is accessible only to authorized FIA staff
- Audit logs include user identity for accountability
- JWT authentication required for all endpoints

---

**Document End**
