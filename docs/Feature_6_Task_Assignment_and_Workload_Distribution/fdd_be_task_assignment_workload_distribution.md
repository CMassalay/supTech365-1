# Feature Design Document - Backend (FDD-BE)

## 1. Document Header

**Document Title:** Feature Design Document - Backend  
**Feature Name:** Task Assignment and Workload Distribution (MVF)  
**Product/System Name:** SupTech365 - FIA Financial Intelligence System  
**Version:** 1.0  
**Author:** Technical Design Team  
**Related FRD Version:** 1.0  
**Related MVF Version:** 1.0  
**Status:** Draft  
**Last Updated Date:** February 2026

---

## 2. Feature Context

**Feature Name**  
Task Assignment and Workload Distribution (MVF)

**Feature Description**  
Enables supervisors and department heads to manually assign validated reports (CTRs and STRs) to compliance officers and analysts with deadlines, view workload counts for informed decision-making, and enforce access control to ensure officers and analysts can only access reports assigned to them. The system supports separate workflows for compliance and analysis departments with immediate notifications upon assignment.

**Feature Purpose**  
Enable efficient distribution of report processing tasks across compliance and analysis teams through manual assignment with workload visibility, ensuring accountability and secure access control. This eliminates ad-hoc assignment methods and provides supervisors with real-time workload visibility for balanced task distribution.

**Related Features**  
- **Feature 2:** Digital Report Submission Portal - Source of reports to be assigned
- **Feature 4:** Automated Validation Engine - Validates reports before assignment
- **Feature 5:** Manual Validation Workflow - Reports flow from validation to assignment
- **Feature 1:** Authentication and Registration - User authentication and role management

**User Types**  
- Compliance Officer Supervisor (assigns CTRs to own team)
- Head of Compliance (assigns CTRs across all teams)
- Head of Analysis (assigns STRs and escalated CTRs)
- Compliance Officer (receives CTR assignments)
- Analyst (receives STR/escalated CTR assignments)

---

## 3. Technology Stack & Architecture

### Technology Stack

**Framework:** FastAPI  
**ORM:** SQLModel (async)  
**Database:** PostgreSQL  
**Auth:** JWT (Bearer token)  
**Validation:** Pydantic v2  
**Migrations:** Alembic  
**Background Tasks:** FastAPI BackgroundTasks  
**API Spec:** OpenAPI 3.0  
**Observability:** Prometheus + OpenTelemetry

### Architecture Pattern

**Model:** SQLModel database models (async)  
**Service:** Business logic layer  
**Controller:** FastAPI route handlers (routers)  
**DTO:** Pydantic request/response schemas

**Layer Responsibilities:**

**Model Layer:**
- Define data models/entities (ReportAssignment, AssignmentNotification)
- Handle database queries
- Manage relationships between entities

**Service Layer:**
- Implement business logic (assignment validation, workload calculation)
- Coordinate between models and external services
- Handle complex operations and workflows

**Controller Layer:**
- Handle HTTP requests/responses
- Validate input using Pydantic schemas
- Route requests to appropriate services
- Format responses

---

## 4. User Flow Diagrams

### Assignment Flow

```
[Supervisor] → [Frontend] → [POST /api/v1/assignments]
    |
    v
[Authentication Check]
    |
    |-- Invalid/Missing Token --> [401 Unauthorized]
    |
    v Valid Token
[Role Permission Check]
    |
    |-- Not Supervisor Role --> [403 Forbidden]
    |
    v Authorized Role
[Workflow Type Validation]
    |
    |-- Wrong Workflow for Role --> [400 Bad Request]
    |
    v Valid Workflow
[Team Boundary Check (BR-6.5)]
    |
    |-- Assignee Not in Team --> [403 Forbidden]
    |
    v Valid Team
[Deadline Validation (BR-6.2)]
    |
    |-- Past/Invalid Date --> [400 Bad Request]
    |
    v Valid Deadline
[Create Assignment Record]
    |
    v
[Create Assignment Notification (BR-6.6)]
    |
    v
[Log Audit Event (NFR-ASSIGN-SEC-2)]
    |
    v
[201 Created Response]
```

### Report Access Flow

```
[Officer/Analyst] → [Frontend] → [GET /api/v1/reports/{id}]
    |
    v
[Authentication Check]
    |
    |-- Invalid Token --> [401 Unauthorized]
    |
    v Valid Token
[Assignment Check (BR-6.7)]
    |
    |-- Report Not Assigned to User
    |   |
    |   v
    |   [Supervisory Permission Check]
    |       |
    |       |-- Has Supervisory Permission --> [Allow Access]
    |       |
    |       v No Permission
    |       [403 Forbidden - ERR-ASSIGN-ACCESS-001]
    |
    v Assigned to User
[Return Report Data]
    |
    v
[200 OK Response]
```

### Workload Query Flow

```
[Supervisor] → [Frontend] → [GET /api/v1/workload/officers]
    |
    v
[Authentication Check]
    |
    v Valid Token
[Role Check - Compliance Supervisor/Head of Compliance]
    |
    |-- Not Authorized Role --> [403 Forbidden]
    |
    v Authorized
[Calculate Workload Counts (BR-6.4)]
    |
    v
[Filter by Team (if Supervisor) (BR-6.5)]
    |
    v
[200 OK - Workload List]
```

---

## 5. Data Model

### Table: report_assignments

**Table Name**  
`report_assignments`

**Purpose**  
Stores all report assignments linking reports to officers/analysts with deadlines and workflow information.

**Columns + Types**

| Column Name | Data Type | Length/Constraints | Required | Nullable | Notes |
|-------------|-----------|-------------------|----------|----------|-------|
| id | UUID | - | Yes | No | Primary Key, auto-generated |
| report_id | UUID | - | Yes | No | Foreign Key to reports table |
| assignee_id | UUID | - | Yes | No | Foreign Key to users (officer/analyst) |
| assigned_by_id | UUID | - | Yes | No | Foreign Key to users (supervisor) |
| workflow_type | VARCHAR | 20 | Yes | No | ENUM: 'compliance', 'analysis' |
| deadline | TIMESTAMP | WITH TIMEZONE | Yes | No | Required per BR-6.2 |
| status | VARCHAR | 20 | Yes | No | ENUM: 'active', 'completed', 'cancelled' |
| assigned_at | TIMESTAMP | WITH TIMEZONE | Yes | No | Assignment timestamp |
| completed_at | TIMESTAMP | WITH TIMEZONE | No | Yes | Completion timestamp |
| created_at | TIMESTAMP | WITH TIMEZONE, DEFAULT NOW() | Yes | No | Record creation time |
| updated_at | TIMESTAMP | WITH TIMEZONE, DEFAULT NOW() | Yes | No | Last update time |

**Keys**
- Primary Key: `id`
- Foreign Keys:
  - `report_id` → `reports(id)`
  - `assignee_id` → `users(id)`
  - `assigned_by_id` → `users(id)`

**Indexes Needed**
- `idx_assignments_report_id` on `report_id` (for report lookup)
- `idx_assignments_assignee_id` on `assignee_id` (for user's assignments)
- `idx_assignments_assigned_by_id` on `assigned_by_id` (for supervisor's assignments)
- `idx_assignments_workflow_type` on `workflow_type` (for filtering by workflow)
- `idx_assignments_status` on `status` (for active assignment filtering)
- `idx_assignments_deadline` on `deadline` (for deadline queries)
- `idx_assignments_assignee_status` on `assignee_id, status` (for workload calculation)

**Relationship Notes**
- Many-to-one with `reports` (one report can have one active assignment)
- Many-to-one with `users` (one user can have many assignments)
- One-to-many with `assignment_notifications` (one assignment can have multiple notifications)

**Constraints**
- Unique constraint on `report_id` WHERE `status = 'active'` (only one active assignment per report)
- Check constraint: `deadline > assigned_at`
- Check constraint: `workflow_type IN ('compliance', 'analysis')`
- Check constraint: `status IN ('active', 'completed', 'cancelled')`

---

### Table: assignment_notifications

**Table Name**  
`assignment_notifications`

**Purpose**  
Stores notifications sent to users when reports are assigned to them, supporting the immediate notification requirement (BR-6.6).

**Columns + Types**

| Column Name | Data Type | Length/Constraints | Required | Nullable | Notes |
|-------------|-----------|-------------------|----------|----------|-------|
| id | UUID | - | Yes | No | Primary Key, auto-generated |
| assignment_id | UUID | - | Yes | No | Foreign Key to report_assignments |
| user_id | UUID | - | Yes | No | Foreign Key to users (recipient) |
| notification_type | VARCHAR | 30 | Yes | No | ENUM: 'new_assignment', 'deadline_reminder' |
| title | VARCHAR | 255 | Yes | No | Notification title |
| message | TEXT | - | Yes | No | Notification message content |
| is_read | BOOLEAN | DEFAULT FALSE | Yes | No | Read status |
| read_at | TIMESTAMP | WITH TIMEZONE | No | Yes | When notification was read |
| created_at | TIMESTAMP | WITH TIMEZONE, DEFAULT NOW() | Yes | No | Creation time |

**Keys**
- Primary Key: `id`
- Foreign Keys:
  - `assignment_id` → `report_assignments(id)`
  - `user_id` → `users(id)`

**Indexes Needed**
- `idx_notifications_user_id` on `user_id` (for user's notifications)
- `idx_notifications_assignment_id` on `assignment_id` (for assignment's notifications)
- `idx_notifications_user_unread` on `user_id, is_read` WHERE `is_read = FALSE` (for unread count)
- `idx_notifications_created_at` on `created_at` (for sorting)

**Relationship Notes**
- Many-to-one with `report_assignments`
- Many-to-one with `users`

**Constraints**
- Check constraint: `notification_type IN ('new_assignment', 'deadline_reminder')`

---

### Table: user_teams (New - for team boundaries)

**Table Name**  
`user_teams`

**Purpose**  
Associates compliance officers with their supervisors' teams to enforce team assignment boundaries (BR-6.5).

**Columns + Types**

| Column Name | Data Type | Length/Constraints | Required | Nullable | Notes |
|-------------|-----------|-------------------|----------|----------|-------|
| id | UUID | - | Yes | No | Primary Key, auto-generated |
| user_id | UUID | - | Yes | No | Foreign Key to users (compliance officer) |
| supervisor_id | UUID | - | Yes | No | Foreign Key to users (supervisor) |
| department | VARCHAR | 20 | Yes | No | ENUM: 'compliance', 'analysis' |
| is_active | BOOLEAN | DEFAULT TRUE | Yes | No | Team membership status |
| created_at | TIMESTAMP | WITH TIMEZONE, DEFAULT NOW() | Yes | No | Record creation time |
| updated_at | TIMESTAMP | WITH TIMEZONE, DEFAULT NOW() | Yes | No | Last update time |

**Keys**
- Primary Key: `id`
- Foreign Keys:
  - `user_id` → `users(id)`
  - `supervisor_id` → `users(id)`

**Indexes Needed**
- `idx_user_teams_user_id` on `user_id` (for user lookup)
- `idx_user_teams_supervisor_id` on `supervisor_id` (for team lookup)
- `idx_user_teams_department` on `department` (for department filtering)
- Unique constraint on `user_id, supervisor_id` (no duplicate team memberships)

**Relationship Notes**
- Many-to-one with `users` (as team member)
- Many-to-one with `users` (as supervisor)

---

### Referenced Tables (Existing)

**users**
- Referenced by: `report_assignments.assignee_id`, `report_assignments.assigned_by_id`, `assignment_notifications.user_id`, `user_teams.user_id`, `user_teams.supervisor_id`
- Used for: User identification, role validation, audit trail

**reports**
- Referenced by: `report_assignments.report_id`
- Used for: Report data, status management
- Expected columns: `id`, `reference_number`, `report_type`, `status`, `entity_id`

**roles**
- Used for: Role-based access control validation
- Expected roles: `COMPLIANCE_OFFICER_SUPERVISOR`, `HEAD_OF_COMPLIANCE`, `HEAD_OF_ANALYSIS`, `COMPLIANCE_OFFICER`, `ANALYST`

---

### Enum Types

**WorkflowType**
```
'compliance'  -- CTR workflow
'analysis'    -- STR/Escalated CTR workflow
```

**AssignmentStatus**
```
'active'      -- Currently assigned
'completed'   -- Assignment completed
'cancelled'   -- Assignment cancelled
```

**NotificationType**
```
'new_assignment'     -- New report assigned
'deadline_reminder'  -- Deadline approaching (future iteration)
```

---

## 6. API Contract (Endpoint List)

### Endpoint 1: Create Assignment

**Method + Path**  
`POST /api/v1/assignments`

**Request Body**
```json
{
  "report_id": "uuid-string",
  "assignee_id": "uuid-string",
  "deadline": "2026-02-20T17:00:00Z",
  "workflow_type": "compliance"
}
```

**Request Validation**
- `report_id`: Required, valid UUID, report must exist and be in assignable status
- `assignee_id`: Required, valid UUID, user must exist and have appropriate role
- `deadline`: Required, ISO 8601 timestamp, must be future date
- `workflow_type`: Required, must be "compliance" or "analysis"

**Response Shape (Success - 201 Created)**
```json
{
  "success": true,
  "data": {
    "id": "assignment-uuid",
    "report_id": "report-uuid",
    "report_reference": "FIA-ABC123-20260115143022",
    "assignee_id": "user-uuid",
    "assignee_name": "Jane Doe",
    "assigned_by_id": "supervisor-uuid",
    "assigned_by_name": "John Smith",
    "workflow_type": "compliance",
    "deadline": "2026-02-20T17:00:00Z",
    "status": "active",
    "assigned_at": "2026-02-06T10:30:00Z",
    "message": "Report assigned successfully"
  }
}
```

**Error Responses**

**400 Bad Request - Invalid Deadline**
```json
{
  "success": false,
  "error": {
    "code": "ERR-ASSIGN-VALID-002",
    "message": "Invalid deadline date. Deadline must be a future date after the assignment date.",
    "details": {
      "provided_deadline": "2026-01-01T00:00:00Z",
      "current_date": "2026-02-06T10:30:00Z"
    }
  }
}
```

**400 Bad Request - Wrong Workflow Type**
```json
{
  "success": false,
  "error": {
    "code": "ERR-ASSIGN-WORKFLOW-001",
    "message": "Invalid workflow type for your role. Compliance supervisors can only assign CTRs.",
    "details": {
      "provided_workflow": "analysis",
      "allowed_workflows": ["compliance"]
    }
  }
}
```

**403 Forbidden - Not Authorized to Assign**
```json
{
  "success": false,
  "error": {
    "code": "ERR-ASSIGN-PERM-001",
    "message": "You are not authorized to assign reports. Only supervisors can assign reports.",
    "details": {
      "user_role": "COMPLIANCE_OFFICER"
    }
  }
}
```

**403 Forbidden - Assignee Not in Team**
```json
{
  "success": false,
  "error": {
    "code": "ERR-ASSIGN-TEAM-001",
    "message": "Assignee is not in your team. You can only assign reports to officers within your team.",
    "details": {
      "assignee_id": "user-uuid",
      "your_team_members": ["member1-uuid", "member2-uuid"]
    }
  }
}
```

**401 Unauthorized**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required. Please log in."
  }
}
```

**Auth Required?**  
Yes - Bearer token (JWT) in Authorization header

**Role Permissions**
- `COMPLIANCE_OFFICER_SUPERVISOR`: Can assign CTRs to own team only
- `HEAD_OF_COMPLIANCE`: Can assign CTRs to any compliance officer
- `HEAD_OF_ANALYSIS`: Can assign STRs/escalated CTRs to any analyst

---

### Endpoint 2: List Assignments

**Method + Path**  
`GET /api/v1/assignments`

**Query Parameters**
- `workflow_type` (string, optional): Filter by "compliance" or "analysis"
- `status` (string, optional): Filter by "active", "completed", "cancelled"
- `assignee_id` (UUID, optional): Filter by assignee
- `page` (integer, optional): Page number, default 1
- `page_size` (integer, optional): Items per page, default 20, max 100

**Response Shape (Success - 200 OK)**
```json
{
  "success": true,
  "data": {
    "assignments": [
      {
        "id": "assignment-uuid",
        "report_id": "report-uuid",
        "report_reference": "FIA-ABC123-20260115143022",
        "report_type": "CTR",
        "assignee_id": "user-uuid",
        "assignee_name": "Jane Doe",
        "assigned_by_id": "supervisor-uuid",
        "assigned_by_name": "John Smith",
        "workflow_type": "compliance",
        "deadline": "2026-02-20T17:00:00Z",
        "status": "active",
        "assigned_at": "2026-02-06T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total_items": 45,
      "total_pages": 3
    }
  }
}
```

**Auth Required?**  
Yes - Bearer token (JWT)

**Role Permissions**
- `COMPLIANCE_OFFICER_SUPERVISOR`: See compliance assignments for own team
- `HEAD_OF_COMPLIANCE`: See all compliance assignments
- `HEAD_OF_ANALYSIS`: See all analysis assignments

---

### Endpoint 3: Get Assignment Details

**Method + Path**  
`GET /api/v1/assignments/{assignment_id}`

**Path Parameters**
- `assignment_id` (UUID, required): Assignment identifier

**Response Shape (Success - 200 OK)**
```json
{
  "success": true,
  "data": {
    "id": "assignment-uuid",
    "report_id": "report-uuid",
    "report_reference": "FIA-ABC123-20260115143022",
    "report_type": "CTR",
    "assignee_id": "user-uuid",
    "assignee_name": "Jane Doe",
    "assignee_email": "jane.doe@fia.gov.lr",
    "assigned_by_id": "supervisor-uuid",
    "assigned_by_name": "John Smith",
    "workflow_type": "compliance",
    "deadline": "2026-02-20T17:00:00Z",
    "status": "active",
    "assigned_at": "2026-02-06T10:30:00Z",
    "completed_at": null
  }
}
```

**Error Responses**

**404 Not Found**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Assignment not found."
  }
}
```

**Auth Required?**  
Yes - Bearer token (JWT)

**Role Permissions**
- Assignee can view their own assignments
- Supervisors can view assignments they created or in their department

---

### Endpoint 4: Get Compliance Officer Workloads

**Method + Path**  
`GET /api/v1/workload/officers`

**Query Parameters**
- `team_id` (UUID, optional): Filter by specific team (supervisor_id)

**Response Shape (Success - 200 OK)**
```json
{
  "success": true,
  "data": {
    "workloads": [
      {
        "user_id": "user-uuid",
        "user_name": "Jane Doe",
        "email": "jane.doe@fia.gov.lr",
        "role": "COMPLIANCE_OFFICER",
        "team_supervisor_id": "supervisor-uuid",
        "team_supervisor_name": "John Smith",
        "workload_count": 5,
        "active_ctrs": 5
      },
      {
        "user_id": "user-uuid-2",
        "user_name": "Bob Johnson",
        "email": "bob.johnson@fia.gov.lr",
        "role": "COMPLIANCE_OFFICER",
        "team_supervisor_id": "supervisor-uuid",
        "team_supervisor_name": "John Smith",
        "workload_count": 3,
        "active_ctrs": 3
      }
    ],
    "summary": {
      "total_officers": 2,
      "total_active_assignments": 8,
      "average_workload": 4.0
    }
  }
}
```

**Auth Required?**  
Yes - Bearer token (JWT)

**Role Permissions**
- `COMPLIANCE_OFFICER_SUPERVISOR`: See workloads for own team only
- `HEAD_OF_COMPLIANCE`: See workloads for all compliance officers

---

### Endpoint 5: Get Analyst Workloads

**Method + Path**  
`GET /api/v1/workload/analysts`

**Response Shape (Success - 200 OK)**
```json
{
  "success": true,
  "data": {
    "workloads": [
      {
        "user_id": "user-uuid",
        "user_name": "Alice Brown",
        "email": "alice.brown@fia.gov.lr",
        "role": "ANALYST",
        "workload_count": 6,
        "active_strs": 3,
        "active_escalated_ctrs": 2,
        "active_cases": 1
      }
    ],
    "summary": {
      "total_analysts": 1,
      "total_active_assignments": 6,
      "average_workload": 6.0
    }
  }
}
```

**Auth Required?**  
Yes - Bearer token (JWT)

**Role Permissions**
- `HEAD_OF_ANALYSIS`: Can view all analyst workloads

---

### Endpoint 6: Get My Assignments

**Method + Path**  
`GET /api/v1/my-assignments`

**Query Parameters**
- `status` (string, optional): Filter by "active", "completed", "cancelled"
- `page` (integer, optional): Page number, default 1
- `page_size` (integer, optional): Items per page, default 20

**Response Shape (Success - 200 OK)**
```json
{
  "success": true,
  "data": {
    "assignments": [
      {
        "id": "assignment-uuid",
        "report_id": "report-uuid",
        "report_reference": "FIA-ABC123-20260115143022",
        "report_type": "CTR",
        "deadline": "2026-02-20T17:00:00Z",
        "status": "active",
        "assigned_at": "2026-02-06T10:30:00Z",
        "assigned_by_name": "John Smith"
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total_items": 5,
      "total_pages": 1
    }
  }
}
```

**Auth Required?**  
Yes - Bearer token (JWT)

**Role Permissions**
- `COMPLIANCE_OFFICER`: View own CTR assignments
- `ANALYST`: View own STR/escalated CTR assignments

---

### Endpoint 7: Get My Workload

**Method + Path**  
`GET /api/v1/my-workload`

**Response Shape (Success - 200 OK)**
```json
{
  "success": true,
  "data": {
    "user_id": "user-uuid",
    "user_name": "Jane Doe",
    "role": "COMPLIANCE_OFFICER",
    "workload_count": 5,
    "breakdown": {
      "active_ctrs": 5,
      "active_strs": 0,
      "active_escalated_ctrs": 0,
      "active_cases": 0
    }
  }
}
```

**Auth Required?**  
Yes - Bearer token (JWT)

**Role Permissions**
- Any authenticated user can view their own workload

---

### Endpoint 8: Get Report (with Access Control)

**Method + Path**  
`GET /api/v1/reports/{report_id}`

**Path Parameters**
- `report_id` (UUID, required): Report identifier

**Response Shape (Success - 200 OK)**
```json
{
  "success": true,
  "data": {
    "id": "report-uuid",
    "reference_number": "FIA-ABC123-20260115143022",
    "report_type": "CTR",
    "status": "under_compliance_review",
    "entity_id": "entity-uuid",
    "entity_name": "ABC Bank",
    "submitted_at": "2026-01-15T14:30:22Z",
    "assignment": {
      "id": "assignment-uuid",
      "assignee_id": "user-uuid",
      "deadline": "2026-02-20T17:00:00Z",
      "assigned_at": "2026-02-06T10:30:00Z"
    }
  }
}
```

**Error Responses**

**403 Forbidden - Not Assigned (ERR-ASSIGN-ACCESS-001)**
```json
{
  "success": false,
  "error": {
    "code": "ERR-ASSIGN-ACCESS-001",
    "message": "Access Denied - This report is not assigned to you. Please contact your supervisor if you need access to this report.",
    "details": {
      "report_id": "report-uuid"
    }
  }
}
```

**Auth Required?**  
Yes - Bearer token (JWT)

**Access Control Rules (BR-6.7)**
- Officers can only access CTRs assigned to them
- Analysts can only access STRs/escalated CTRs assigned to them
- Supervisors can access all reports in their department

---

### Endpoint 9: Get My Notifications

**Method + Path**  
`GET /api/v1/notifications`

**Query Parameters**
- `is_read` (boolean, optional): Filter by read status
- `page` (integer, optional): Page number, default 1
- `page_size` (integer, optional): Items per page, default 20

**Response Shape (Success - 200 OK)**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notification-uuid",
        "assignment_id": "assignment-uuid",
        "notification_type": "new_assignment",
        "title": "New CTR Assigned",
        "message": "CTR FIA-ABC123-20260115143022 has been assigned to you by John Smith. Deadline: Feb 20, 2026.",
        "is_read": false,
        "created_at": "2026-02-06T10:30:00Z"
      }
    ],
    "unread_count": 3,
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total_items": 10,
      "total_pages": 1
    }
  }
}
```

**Auth Required?**  
Yes - Bearer token (JWT)

---

### Endpoint 10: Mark Notification as Read

**Method + Path**  
`PATCH /api/v1/notifications/{notification_id}/read`

**Path Parameters**
- `notification_id` (UUID, required): Notification identifier

**Response Shape (Success - 200 OK)**
```json
{
  "success": true,
  "data": {
    "id": "notification-uuid",
    "is_read": true,
    "read_at": "2026-02-06T11:00:00Z"
  }
}
```

**Auth Required?**  
Yes - Bearer token (JWT)

---

## 7. Data Transfer Objects (DTOs)

### Request Schemas

**CreateAssignmentRequest**
```python
class CreateAssignmentRequest(BaseModel):
    report_id: UUID                    # Required, valid report UUID
    assignee_id: UUID                  # Required, valid user UUID
    deadline: datetime                 # Required, future date
    workflow_type: WorkflowType        # Required, 'compliance' or 'analysis'
    
    @validator('deadline')
    def deadline_must_be_future(cls, v):
        if v <= datetime.now(timezone.utc):
            raise ValueError('Deadline must be a future date')
        return v
```

**ListAssignmentsRequest**
```python
class ListAssignmentsRequest(BaseModel):
    workflow_type: Optional[WorkflowType] = None
    status: Optional[AssignmentStatus] = None
    assignee_id: Optional[UUID] = None
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)
```

**ListNotificationsRequest**
```python
class ListNotificationsRequest(BaseModel):
    is_read: Optional[bool] = None
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)
```

### Response Schemas

**AssignmentResponse**
```python
class AssignmentResponse(BaseModel):
    id: UUID
    report_id: UUID
    report_reference: str
    report_type: str
    assignee_id: UUID
    assignee_name: str
    assignee_email: Optional[str] = None
    assigned_by_id: UUID
    assigned_by_name: str
    workflow_type: WorkflowType
    deadline: datetime
    status: AssignmentStatus
    assigned_at: datetime
    completed_at: Optional[datetime] = None
```

**AssignmentListResponse**
```python
class AssignmentListResponse(BaseModel):
    assignments: List[AssignmentResponse]
    pagination: PaginationResponse
```

**WorkloadItemResponse**
```python
class WorkloadItemResponse(BaseModel):
    user_id: UUID
    user_name: str
    email: str
    role: str
    team_supervisor_id: Optional[UUID] = None
    team_supervisor_name: Optional[str] = None
    workload_count: int
    active_ctrs: int = 0
    active_strs: int = 0
    active_escalated_ctrs: int = 0
    active_cases: int = 0
```

**WorkloadListResponse**
```python
class WorkloadListResponse(BaseModel):
    workloads: List[WorkloadItemResponse]
    summary: WorkloadSummary

class WorkloadSummary(BaseModel):
    total_users: int
    total_active_assignments: int
    average_workload: float
```

**MyWorkloadResponse**
```python
class MyWorkloadResponse(BaseModel):
    user_id: UUID
    user_name: str
    role: str
    workload_count: int
    breakdown: WorkloadBreakdown

class WorkloadBreakdown(BaseModel):
    active_ctrs: int = 0
    active_strs: int = 0
    active_escalated_ctrs: int = 0
    active_cases: int = 0
```

**NotificationResponse**
```python
class NotificationResponse(BaseModel):
    id: UUID
    assignment_id: UUID
    notification_type: NotificationType
    title: str
    message: str
    is_read: bool
    read_at: Optional[datetime] = None
    created_at: datetime
```

**NotificationListResponse**
```python
class NotificationListResponse(BaseModel):
    notifications: List[NotificationResponse]
    unread_count: int
    pagination: PaginationResponse
```

### Error Response Schemas

**ErrorResponse**
```python
class ErrorResponse(BaseModel):
    success: bool = False
    error: ErrorDetail

class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[Dict[str, Any]] = None
```

**PaginationResponse**
```python
class PaginationResponse(BaseModel):
    page: int
    page_size: int
    total_items: int
    total_pages: int
```

---

## 8. Service Classes

### AssignmentService

**Service Name**  
`AssignmentService`

**Service Purpose**  
Handles all assignment-related business logic including creation, retrieval, and validation.

**Methods**

**create_assignment()**
- **Purpose:** Create a new report assignment with all validations
- **Parameters:**
  - `request: CreateAssignmentRequest` - Assignment details
  - `current_user: User` - Authenticated user (supervisor)
  - `db: AsyncSession` - Database session
- **Return Type:** `AssignmentResponse`
- **Business Logic:**
  1. Validate user has assignment permissions (BR-6.1)
  2. Validate workflow type matches user role
  3. Validate assignee is in user's team (BR-6.5)
  4. Validate deadline is future date (BR-6.2)
  5. Validate report exists and is assignable
  6. Create assignment record
  7. Trigger notification (BR-6.6)
  8. Log audit event (NFR-ASSIGN-SEC-2)
- **Dependencies:** `NotificationService`, `AuditService`, `WorkloadService`

**get_assignments()**
- **Purpose:** List assignments with filters based on user role
- **Parameters:**
  - `request: ListAssignmentsRequest` - Filter parameters
  - `current_user: User` - Authenticated user
  - `db: AsyncSession` - Database session
- **Return Type:** `AssignmentListResponse`
- **Business Logic:**
  1. Apply role-based filtering (supervisors see their scope)
  2. Apply team filtering for supervisors (BR-6.5)
  3. Apply optional filters (status, workflow_type, assignee_id)
  4. Return paginated results

**get_assignment_by_id()**
- **Purpose:** Get single assignment details
- **Parameters:**
  - `assignment_id: UUID` - Assignment identifier
  - `current_user: User` - Authenticated user
  - `db: AsyncSession` - Database session
- **Return Type:** `AssignmentResponse`
- **Business Logic:**
  1. Retrieve assignment
  2. Validate user has access (assignee or supervisor)
  3. Return assignment with related data

**validate_assignment_permissions()**
- **Purpose:** Check if user can create assignments for given workflow
- **Parameters:**
  - `current_user: User` - Authenticated user
  - `workflow_type: WorkflowType` - Target workflow
  - `assignee_id: UUID` - Target assignee
- **Return Type:** `bool`
- **Business Logic:**
  1. Check user role matches workflow (BR-6.1)
  2. Check assignee is in user's scope (BR-6.5)
  3. Return True if authorized, raise exception if not

---

### WorkloadService

**Service Name**  
`WorkloadService`

**Service Purpose**  
Calculates and retrieves workload information for officers and analysts.

**Methods**

**get_officer_workloads()**
- **Purpose:** Get workload counts for compliance officers
- **Parameters:**
  - `current_user: User` - Authenticated supervisor
  - `team_id: Optional[UUID]` - Optional team filter
  - `db: AsyncSession` - Database session
- **Return Type:** `WorkloadListResponse`
- **Business Logic:**
  1. If supervisor, filter to own team only (BR-6.5)
  2. If Head of Compliance, include all teams
  3. Calculate active CTR count per officer (BR-6.4)
  4. Return workload list with summary

**get_analyst_workloads()**
- **Purpose:** Get workload counts for analysts
- **Parameters:**
  - `current_user: User` - Authenticated Head of Analysis
  - `db: AsyncSession` - Database session
- **Return Type:** `WorkloadListResponse`
- **Business Logic:**
  1. Get all analysts
  2. Calculate workload per analyst (BR-6.4):
     - Active STRs
     - Active escalated CTRs
     - Active cases
  3. Return workload list with summary

**get_user_workload()**
- **Purpose:** Get workload for a specific user
- **Parameters:**
  - `user_id: UUID` - Target user
  - `db: AsyncSession` - Database session
- **Return Type:** `MyWorkloadResponse`
- **Business Logic:**
  1. Identify user role
  2. Calculate appropriate workload based on role (BR-6.4)
  3. Return workload with breakdown

**calculate_workload_count()**
- **Purpose:** Calculate total workload count for a user
- **Parameters:**
  - `user_id: UUID` - Target user
  - `db: AsyncSession` - Database session
- **Return Type:** `int`
- **Business Logic:**
  - Count active assignments where `assignee_id = user_id` and `status = 'active'`

---

### NotificationService

**Service Name**  
`NotificationService`

**Service Purpose**  
Manages assignment notifications for users.

**Methods**

**create_assignment_notification()**
- **Purpose:** Create notification when report is assigned
- **Parameters:**
  - `assignment: ReportAssignment` - New assignment
  - `db: AsyncSession` - Database session
- **Return Type:** `AssignmentNotification`
- **Business Logic:**
  1. Create notification record
  2. Set notification type to 'new_assignment'
  3. Generate title and message
  4. Notification created within 1 minute (BR-6.6)

**get_user_notifications()**
- **Purpose:** Get notifications for current user
- **Parameters:**
  - `user_id: UUID` - Target user
  - `is_read: Optional[bool]` - Read filter
  - `page: int` - Page number
  - `page_size: int` - Items per page
  - `db: AsyncSession` - Database session
- **Return Type:** `NotificationListResponse`
- **Business Logic:**
  1. Query notifications for user
  2. Apply read filter if provided
  3. Include unread count
  4. Return paginated results

**mark_as_read()**
- **Purpose:** Mark notification as read
- **Parameters:**
  - `notification_id: UUID` - Notification identifier
  - `user_id: UUID` - Current user (ownership check)
  - `db: AsyncSession` - Database session
- **Return Type:** `NotificationResponse`
- **Business Logic:**
  1. Verify notification belongs to user
  2. Set is_read = True
  3. Set read_at timestamp
  4. Return updated notification

**get_unread_count()**
- **Purpose:** Get count of unread notifications
- **Parameters:**
  - `user_id: UUID` - Target user
  - `db: AsyncSession` - Database session
- **Return Type:** `int`
- **Business Logic:**
  - Count notifications where `user_id = user_id` and `is_read = False`

---

### ReportAccessService

**Service Name**  
`ReportAccessService`

**Service Purpose**  
Enforces access control for reports based on assignment status.

**Methods**

**check_report_access()**
- **Purpose:** Verify user can access a specific report
- **Parameters:**
  - `report_id: UUID` - Target report
  - `current_user: User` - Authenticated user
  - `db: AsyncSession` - Database session
- **Return Type:** `bool`
- **Business Logic:** (BR-6.7)
  1. If user is supervisor (HEAD_OF_COMPLIANCE, HEAD_OF_ANALYSIS), allow access to department reports
  2. Check if report is assigned to user
  3. If assigned and active, allow access
  4. If not assigned, deny access (ERR-ASSIGN-ACCESS-001)

**get_accessible_reports()**
- **Purpose:** Get list of reports user can access
- **Parameters:**
  - `current_user: User` - Authenticated user
  - `filters: Optional[ReportFilters]` - Optional filters
  - `db: AsyncSession` - Database session
- **Return Type:** `List[Report]`
- **Business Logic:**
  1. If supervisor, return all reports in department
  2. If officer/analyst, return only assigned reports
  3. Apply additional filters if provided

**has_supervisory_permission()**
- **Purpose:** Check if user has supervisory access to a workflow
- **Parameters:**
  - `current_user: User` - Authenticated user
  - `workflow_type: WorkflowType` - Target workflow
- **Return Type:** `bool`
- **Business Logic:**
  - HEAD_OF_COMPLIANCE has supervisory access to compliance workflow
  - HEAD_OF_ANALYSIS has supervisory access to analysis workflow
  - COMPLIANCE_OFFICER_SUPERVISOR has supervisory access to own team's compliance reports

---

## 9. Controller Classes

### AssignmentRouter

**Router Name**  
`AssignmentRouter`

**Base Path**  
`/api/v1/assignments`

**Route Handlers**

**POST /** - Create Assignment
```python
@router.post("/", response_model=SuccessResponse[AssignmentResponse], status_code=201)
async def create_assignment(
    request: CreateAssignmentRequest,
    current_user: User = Depends(get_current_user),
    assignment_service: AssignmentService = Depends(),
    db: AsyncSession = Depends(get_db)
) -> SuccessResponse[AssignmentResponse]:
    """
    Create a new report assignment.
    
    Requires: COMPLIANCE_OFFICER_SUPERVISOR, HEAD_OF_COMPLIANCE, or HEAD_OF_ANALYSIS role
    """
    assignment = await assignment_service.create_assignment(request, current_user, db)
    return SuccessResponse(data=assignment)
```

**GET /** - List Assignments
```python
@router.get("/", response_model=SuccessResponse[AssignmentListResponse])
async def list_assignments(
    workflow_type: Optional[WorkflowType] = None,
    status: Optional[AssignmentStatus] = None,
    assignee_id: Optional[UUID] = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    assignment_service: AssignmentService = Depends(),
    db: AsyncSession = Depends(get_db)
) -> SuccessResponse[AssignmentListResponse]:
    """
    List assignments with filters.
    
    Requires: Supervisor role (results filtered by role scope)
    """
```

**GET /{assignment_id}** - Get Assignment
```python
@router.get("/{assignment_id}", response_model=SuccessResponse[AssignmentResponse])
async def get_assignment(
    assignment_id: UUID,
    current_user: User = Depends(get_current_user),
    assignment_service: AssignmentService = Depends(),
    db: AsyncSession = Depends(get_db)
) -> SuccessResponse[AssignmentResponse]:
    """
    Get assignment details.
    
    Requires: Assignee or supervisor with access
    """
```

---

### WorkloadRouter

**Router Name**  
`WorkloadRouter`

**Base Path**  
`/api/v1/workload`

**Route Handlers**

**GET /officers** - Get Officer Workloads
```python
@router.get("/officers", response_model=SuccessResponse[WorkloadListResponse])
async def get_officer_workloads(
    team_id: Optional[UUID] = None,
    current_user: User = Depends(get_current_user),
    workload_service: WorkloadService = Depends(),
    db: AsyncSession = Depends(get_db)
) -> SuccessResponse[WorkloadListResponse]:
    """
    Get compliance officer workload counts.
    
    Requires: COMPLIANCE_OFFICER_SUPERVISOR or HEAD_OF_COMPLIANCE role
    """
```

**GET /analysts** - Get Analyst Workloads
```python
@router.get("/analysts", response_model=SuccessResponse[WorkloadListResponse])
async def get_analyst_workloads(
    current_user: User = Depends(get_current_user),
    workload_service: WorkloadService = Depends(),
    db: AsyncSession = Depends(get_db)
) -> SuccessResponse[WorkloadListResponse]:
    """
    Get analyst workload counts.
    
    Requires: HEAD_OF_ANALYSIS role
    """
```

---

### MyAssignmentsRouter

**Router Name**  
`MyAssignmentsRouter`

**Base Path**  
`/api/v1`

**Route Handlers**

**GET /my-assignments** - Get My Assignments
```python
@router.get("/my-assignments", response_model=SuccessResponse[AssignmentListResponse])
async def get_my_assignments(
    status: Optional[AssignmentStatus] = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    assignment_service: AssignmentService = Depends(),
    db: AsyncSession = Depends(get_db)
) -> SuccessResponse[AssignmentListResponse]:
    """
    Get current user's assignments.
    
    Requires: Any authenticated user
    """
```

**GET /my-workload** - Get My Workload
```python
@router.get("/my-workload", response_model=SuccessResponse[MyWorkloadResponse])
async def get_my_workload(
    current_user: User = Depends(get_current_user),
    workload_service: WorkloadService = Depends(),
    db: AsyncSession = Depends(get_db)
) -> SuccessResponse[MyWorkloadResponse]:
    """
    Get current user's workload count.
    
    Requires: Any authenticated user
    """
```

---

### NotificationRouter

**Router Name**  
`NotificationRouter`

**Base Path**  
`/api/v1/notifications`

**Route Handlers**

**GET /** - Get Notifications
```python
@router.get("/", response_model=SuccessResponse[NotificationListResponse])
async def get_notifications(
    is_read: Optional[bool] = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    notification_service: NotificationService = Depends(),
    db: AsyncSession = Depends(get_db)
) -> SuccessResponse[NotificationListResponse]:
    """
    Get current user's notifications.
    """
```

**PATCH /{notification_id}/read** - Mark as Read
```python
@router.patch("/{notification_id}/read", response_model=SuccessResponse[NotificationResponse])
async def mark_notification_read(
    notification_id: UUID,
    current_user: User = Depends(get_current_user),
    notification_service: NotificationService = Depends(),
    db: AsyncSession = Depends(get_db)
) -> SuccessResponse[NotificationResponse]:
    """
    Mark notification as read.
    """
```

---

## 10. Middleware and Guards

### AssignmentPermissionGuard

**Purpose**  
Validates user has permission to create assignments based on role and workflow type.

**Process:**
1. Extract user role from JWT token
2. Validate role is a supervisor role (BR-6.1):
   - `COMPLIANCE_OFFICER_SUPERVISOR`
   - `HEAD_OF_COMPLIANCE`
   - `HEAD_OF_ANALYSIS`
3. Validate workflow type matches role:
   - Compliance supervisors → compliance workflow only
   - Head of Analysis → analysis workflow only
4. Reject unauthorized requests with 403

**Implementation:**
```python
class AssignmentPermissionGuard:
    SUPERVISOR_ROLES = [
        RoleEnum.COMPLIANCE_OFFICER_SUPERVISOR,
        RoleEnum.HEAD_OF_COMPLIANCE,
        RoleEnum.HEAD_OF_ANALYSIS
    ]
    
    ROLE_WORKFLOW_MAP = {
        RoleEnum.COMPLIANCE_OFFICER_SUPERVISOR: [WorkflowType.COMPLIANCE],
        RoleEnum.HEAD_OF_COMPLIANCE: [WorkflowType.COMPLIANCE],
        RoleEnum.HEAD_OF_ANALYSIS: [WorkflowType.ANALYSIS]
    }
    
    async def __call__(self, current_user: User, workflow_type: WorkflowType):
        if current_user.role.name not in self.SUPERVISOR_ROLES:
            raise AssignmentPermissionError("ERR-ASSIGN-PERM-001")
        
        allowed_workflows = self.ROLE_WORKFLOW_MAP.get(current_user.role.name, [])
        if workflow_type not in allowed_workflows:
            raise AssignmentWorkflowError("ERR-ASSIGN-WORKFLOW-001")
```

### TeamBoundaryGuard

**Purpose**  
Validates supervisor can only assign to officers/analysts within their scope.

**Process:**
1. If `HEAD_OF_COMPLIANCE` or `HEAD_OF_ANALYSIS`, allow any assignee in department
2. If `COMPLIANCE_OFFICER_SUPERVISOR`, check assignee is in supervisor's team
3. Query `user_teams` table to verify team membership
4. Reject if assignee not in scope with 403

**Implementation:**
```python
class TeamBoundaryGuard:
    async def __call__(
        self, 
        current_user: User, 
        assignee_id: UUID,
        db: AsyncSession
    ):
        # Head roles can assign to anyone in their department
        if current_user.role.name in [RoleEnum.HEAD_OF_COMPLIANCE, RoleEnum.HEAD_OF_ANALYSIS]:
            return True
        
        # Supervisors can only assign to their team
        if current_user.role.name == RoleEnum.COMPLIANCE_OFFICER_SUPERVISOR:
            team_member = await db.execute(
                select(UserTeam)
                .where(UserTeam.user_id == assignee_id)
                .where(UserTeam.supervisor_id == current_user.id)
                .where(UserTeam.is_active == True)
            )
            if not team_member.scalar():
                raise TeamBoundaryError("ERR-ASSIGN-TEAM-001")
```

### ReportAccessGuard

**Purpose**  
Enforces access control for reports based on assignment status (BR-6.7).

**Process:**
1. Check if user is a supervisor → allow department access
2. Check if report is assigned to user → allow access
3. If neither, deny access with ERR-ASSIGN-ACCESS-001
4. Log access attempt for audit

**Implementation:**
```python
class ReportAccessGuard:
    async def __call__(
        self,
        report_id: UUID,
        current_user: User,
        report_access_service: ReportAccessService,
        db: AsyncSession
    ):
        has_access = await report_access_service.check_report_access(
            report_id, current_user, db
        )
        if not has_access:
            # Log unauthorized access attempt
            await audit_service.log_access_denied(
                user_id=current_user.id,
                report_id=report_id,
                reason="Report not assigned to user"
            )
            raise ReportAccessError("ERR-ASSIGN-ACCESS-001")
```

---

## 11. Utilities and Helpers

### WorkloadCalculator

**Purpose**  
Calculates workload counts based on business rules (BR-6.4).

**Functions:**

**calculate_officer_workload()**
```python
async def calculate_officer_workload(user_id: UUID, db: AsyncSession) -> int:
    """
    Calculate compliance officer workload.
    Workload = count of active CTR assignments
    """
    result = await db.execute(
        select(func.count(ReportAssignment.id))
        .where(ReportAssignment.assignee_id == user_id)
        .where(ReportAssignment.status == AssignmentStatus.ACTIVE)
        .where(ReportAssignment.workflow_type == WorkflowType.COMPLIANCE)
    )
    return result.scalar() or 0
```

**calculate_analyst_workload()**
```python
async def calculate_analyst_workload(user_id: UUID, db: AsyncSession) -> WorkloadBreakdown:
    """
    Calculate analyst workload.
    Workload = STRs + Escalated CTRs + Active Cases
    """
    # Count active STRs
    strs = await count_assignments(user_id, ReportType.STR, db)
    
    # Count escalated CTRs
    escalated_ctrs = await count_assignments(user_id, ReportType.ESCALATED_CTR, db)
    
    # Count active cases (from cases table)
    active_cases = await count_active_cases(user_id, db)
    
    return WorkloadBreakdown(
        active_strs=strs,
        active_escalated_ctrs=escalated_ctrs,
        active_cases=active_cases
    )
```

### DeadlineValidator

**Purpose**  
Validates deadline dates according to business rules (BR-6.2).

**Functions:**

**validate_deadline()**
```python
def validate_deadline(deadline: datetime, assignment_date: datetime = None) -> bool:
    """
    Validate deadline is a future date after assignment date.
    """
    now = datetime.now(timezone.utc)
    assignment_date = assignment_date or now
    
    if deadline <= now:
        raise InvalidDeadlineError("Deadline must be a future date")
    
    if deadline <= assignment_date:
        raise InvalidDeadlineError("Deadline must be after assignment date")
    
    return True
```

### NotificationMessageBuilder

**Purpose**  
Builds notification messages for assignment events.

**Functions:**

**build_assignment_notification()**
```python
def build_assignment_notification(
    assignment: ReportAssignment,
    report: Report,
    assigned_by: User
) -> Tuple[str, str]:
    """
    Build title and message for assignment notification.
    """
    report_type = report.report_type.value.upper()
    title = f"New {report_type} Assigned"
    message = (
        f"{report_type} {report.reference_number} has been assigned to you "
        f"by {assigned_by.username}. "
        f"Deadline: {assignment.deadline.strftime('%b %d, %Y')}."
    )
    return title, message
```

---

## 12. Configuration and Settings

### AssignmentSettings

**Settings Class Name**  
`AssignmentSettings`

**Configuration Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `DEFAULT_PAGE_SIZE` | int | 20 | Default pagination size |
| `MAX_PAGE_SIZE` | int | 100 | Maximum pagination size |
| `NOTIFICATION_DELIVERY_TIMEOUT` | int | 60 | Max seconds for notification delivery (BR-6.6) |
| `AUDIT_LOG_ENABLED` | bool | True | Enable assignment audit logging |

**Environment Variables**
```
ASSIGNMENT_DEFAULT_PAGE_SIZE=20
ASSIGNMENT_MAX_PAGE_SIZE=100
ASSIGNMENT_NOTIFICATION_TIMEOUT=60
ASSIGNMENT_AUDIT_ENABLED=true
```

### WorkflowSettings

**Settings Class Name**  
`WorkflowSettings`

**Configuration Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `COMPLIANCE_WORKFLOW_ROLES` | List[str] | ["COMPLIANCE_OFFICER_SUPERVISOR", "HEAD_OF_COMPLIANCE"] | Roles that can assign to compliance workflow |
| `ANALYSIS_WORKFLOW_ROLES` | List[str] | ["HEAD_OF_ANALYSIS"] | Roles that can assign to analysis workflow |

---

## 13. Database Migrations

### Migration 001: Create Assignment Tables

**Migration Name**  
`001_create_assignment_tables`

**Tables Created**
- `report_assignments`
- `assignment_notifications`
- `user_teams`

**SQL Script**
```sql
-- Create WorkflowType enum
CREATE TYPE workflow_type AS ENUM ('compliance', 'analysis');

-- Create AssignmentStatus enum
CREATE TYPE assignment_status AS ENUM ('active', 'completed', 'cancelled');

-- Create NotificationType enum
CREATE TYPE notification_type AS ENUM ('new_assignment', 'deadline_reminder');

-- Create report_assignments table
CREATE TABLE report_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES reports(id),
    assignee_id UUID NOT NULL REFERENCES users(id),
    assigned_by_id UUID NOT NULL REFERENCES users(id),
    workflow_type workflow_type NOT NULL,
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    status assignment_status NOT NULL DEFAULT 'active',
    assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create assignment_notifications table
CREATE TABLE assignment_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES report_assignments(id),
    user_id UUID NOT NULL REFERENCES users(id),
    notification_type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create user_teams table
CREATE TABLE user_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    supervisor_id UUID NOT NULL REFERENCES users(id),
    department VARCHAR(20) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, supervisor_id)
);

-- Check constraints
ALTER TABLE report_assignments 
    ADD CONSTRAINT chk_deadline_after_assignment 
    CHECK (deadline > assigned_at);

ALTER TABLE user_teams 
    ADD CONSTRAINT chk_department 
    CHECK (department IN ('compliance', 'analysis'));
```

### Migration 002: Create Indexes

**Migration Name**  
`002_create_assignment_indexes`

**Indexes Created**
```sql
-- report_assignments indexes
CREATE INDEX idx_assignments_report_id ON report_assignments(report_id);
CREATE INDEX idx_assignments_assignee_id ON report_assignments(assignee_id);
CREATE INDEX idx_assignments_assigned_by_id ON report_assignments(assigned_by_id);
CREATE INDEX idx_assignments_workflow_type ON report_assignments(workflow_type);
CREATE INDEX idx_assignments_status ON report_assignments(status);
CREATE INDEX idx_assignments_deadline ON report_assignments(deadline);
CREATE INDEX idx_assignments_assignee_status ON report_assignments(assignee_id, status);

-- Unique partial index for one active assignment per report
CREATE UNIQUE INDEX idx_assignments_active_report 
    ON report_assignments(report_id) 
    WHERE status = 'active';

-- assignment_notifications indexes
CREATE INDEX idx_notifications_user_id ON assignment_notifications(user_id);
CREATE INDEX idx_notifications_assignment_id ON assignment_notifications(assignment_id);
CREATE INDEX idx_notifications_user_unread ON assignment_notifications(user_id, is_read) 
    WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created_at ON assignment_notifications(created_at);

-- user_teams indexes
CREATE INDEX idx_user_teams_user_id ON user_teams(user_id);
CREATE INDEX idx_user_teams_supervisor_id ON user_teams(supervisor_id);
CREATE INDEX idx_user_teams_department ON user_teams(department);
```

---

## 14. Error Handling

### Custom Exceptions

**AssignmentPermissionError**
- **Purpose:** Raised when user lacks permission to assign reports
- **HTTP Status:** 403 Forbidden
- **Error Code:** `ERR-ASSIGN-PERM-001`
- **Message:** "You are not authorized to assign reports. Only supervisors can assign reports."

**AssignmentWorkflowError**
- **Purpose:** Raised when workflow type doesn't match user role
- **HTTP Status:** 400 Bad Request
- **Error Code:** `ERR-ASSIGN-WORKFLOW-001`
- **Message:** "Invalid workflow type for your role."

**TeamBoundaryError**
- **Purpose:** Raised when assignee is not in supervisor's team
- **HTTP Status:** 403 Forbidden
- **Error Code:** `ERR-ASSIGN-TEAM-001`
- **Message:** "Assignee is not in your team. You can only assign reports to officers within your team."

**InvalidDeadlineError**
- **Purpose:** Raised when deadline is invalid
- **HTTP Status:** 400 Bad Request
- **Error Code:** `ERR-ASSIGN-VALID-002`
- **Message:** "Invalid deadline date. Deadline must be a future date after the assignment date."

**ReportAccessError**
- **Purpose:** Raised when user attempts to access unassigned report
- **HTTP Status:** 403 Forbidden
- **Error Code:** `ERR-ASSIGN-ACCESS-001`
- **Message:** "Access Denied - This report is not assigned to you. Please contact your supervisor if you need access to this report."

### Exception Handlers

```python
@app.exception_handler(AssignmentPermissionError)
async def assignment_permission_handler(request: Request, exc: AssignmentPermissionError):
    return JSONResponse(
        status_code=403,
        content={
            "success": False,
            "error": {
                "code": exc.error_code,
                "message": exc.message,
                "details": exc.details
            }
        }
    )

@app.exception_handler(InvalidDeadlineError)
async def invalid_deadline_handler(request: Request, exc: InvalidDeadlineError):
    return JSONResponse(
        status_code=400,
        content={
            "success": False,
            "error": {
                "code": "ERR-ASSIGN-VALID-002",
                "message": exc.message,
                "details": exc.details
            }
        }
    )

@app.exception_handler(ReportAccessError)
async def report_access_handler(request: Request, exc: ReportAccessError):
    return JSONResponse(
        status_code=403,
        content={
            "success": False,
            "error": {
                "code": "ERR-ASSIGN-ACCESS-001",
                "message": exc.message,
                "details": exc.details
            }
        }
    )
```

---

## 15. Testing Considerations

### Unit Tests

**Scope:**
- `AssignmentService` methods
- `WorkloadService` calculations
- `NotificationService` methods
- `ReportAccessService` access checks
- Utility functions (WorkloadCalculator, DeadlineValidator)

**Test Coverage:**
- Assignment creation with valid data
- Assignment creation with invalid deadline (ERR-ASSIGN-VALID-002)
- Role-based permission validation (BR-6.1)
- Team boundary validation (BR-6.5)
- Workload calculation accuracy (BR-6.4)
- Access control enforcement (BR-6.7)

### Integration Tests

**Scope:**
- End-to-end assignment flow
- API endpoint responses
- Database interactions
- Notification delivery

**Test Scenarios:**
- Successful CTR assignment by Compliance Officer Supervisor
- Successful STR assignment by Head of Analysis
- Rejected assignment (wrong workflow for role)
- Rejected assignment (assignee not in team)
- Report access denied for unassigned officer
- Report access allowed for assigned officer
- Report access allowed for supervisor

### Test Fixtures

**Mock Data:**
```python
# Test users
compliance_supervisor = User(id=uuid4(), role="COMPLIANCE_OFFICER_SUPERVISOR")
head_of_compliance = User(id=uuid4(), role="HEAD_OF_COMPLIANCE")
head_of_analysis = User(id=uuid4(), role="HEAD_OF_ANALYSIS")
compliance_officer = User(id=uuid4(), role="COMPLIANCE_OFFICER")
analyst = User(id=uuid4(), role="ANALYST")

# Test reports
test_ctr = Report(id=uuid4(), report_type="CTR", status="validated")
test_str = Report(id=uuid4(), report_type="STR", status="validated")

# Test team
test_team = UserTeam(
    user_id=compliance_officer.id,
    supervisor_id=compliance_supervisor.id,
    department="compliance"
)
```

---

## 16. Security Considerations

### Authentication

**JWT Token Validation:**
- All endpoints require valid JWT token in Authorization header
- Token must not be expired
- Token must contain valid user ID and role

### Authorization

**Role-Based Access Control:**
- Assignment creation restricted to supervisor roles
- Workload viewing restricted by role scope
- Report access enforced by assignment status

**Permission Matrix:**

| Action | COS | HoC | HoA | CO | Analyst |
|--------|-----|-----|-----|----|---------
| Create CTR Assignment | Own Team | All Teams | No | No | No |
| Create STR Assignment | No | No | Yes | No | No |
| View Officer Workloads | Own Team | All Teams | No | No | No |
| View Analyst Workloads | No | No | Yes | No | No |
| View Assigned Report | No | All CTRs | All STRs | Own Only | Own Only |
| View Own Assignments | Yes | Yes | Yes | Yes | Yes |

### Audit Logging (NFR-ASSIGN-SEC-2)

**Events to Log:**
- Assignment created (actor, report_id, assignee_id, deadline)
- Assignment completed
- Unauthorized assignment attempt
- Report access denied
- Report access granted

**Log Format:**
```json
{
  "event_type": "ASSIGNMENT_CREATED",
  "timestamp": "2026-02-06T10:30:00Z",
  "actor_id": "supervisor-uuid",
  "actor_role": "COMPLIANCE_OFFICER_SUPERVISOR",
  "report_id": "report-uuid",
  "assignee_id": "officer-uuid",
  "deadline": "2026-02-20T17:00:00Z",
  "workflow_type": "compliance",
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0..."
}
```

### Data Protection

- All data in transit encrypted via TLS 1.2+
- Sensitive fields (if any) encrypted at rest
- Access logs retained per compliance requirements

---

## 17. Dependencies Between Components

### Data Flow Diagram

```
[Client Request]
       |
       v
[Authentication Middleware] ─── Validates JWT token
       |
       v
[Controller/Router] ─── Parses request, validates schema
       |
       v
[Permission Guard] ─── Checks role-based permissions
       |
       v
[Service Layer] ─── Business logic
       |
       ├── [AssignmentService] ─── Assignment CRUD
       │         |
       │         ├── [WorkloadService] ─── Workload queries
       │         ├── [NotificationService] ─── Notification creation
       │         └── [AuditService] ─── Audit logging
       │
       └── [ReportAccessService] ─── Access control
                 |
                 v
           [Model Layer] ─── Database operations
                 |
                 v
           [PostgreSQL Database]
```

### Service Dependencies

```
AssignmentService
    ├── depends on → WorkloadService (for team filtering)
    ├── depends on → NotificationService (for creating notifications)
    ├── depends on → AuditService (for logging)
    └── depends on → ReportAccessService (for access checks)

WorkloadService
    └── depends on → ReportAssignment model

NotificationService
    └── depends on → AssignmentNotification model

ReportAccessService
    ├── depends on → ReportAssignment model
    └── depends on → UserTeam model
```

---

## 18. Implementation Order

### Phase 1: Foundation (Sprint 1)

1. **Database migrations**
   - Create enum types
   - Create `report_assignments` table
   - Create `assignment_notifications` table
   - Create `user_teams` table
   - Create indexes

2. **Data models**
   - `ReportAssignment` SQLModel
   - `AssignmentNotification` SQLModel
   - `UserTeam` SQLModel

3. **Configuration settings**
   - `AssignmentSettings`
   - `WorkflowSettings`

### Phase 2: Core Services (Sprint 1-2)

4. **Utility classes**
   - `WorkloadCalculator`
   - `DeadlineValidator`
   - `NotificationMessageBuilder`

5. **Service classes**
   - `AssignmentService`
   - `WorkloadService`
   - `NotificationService`
   - `ReportAccessService`

6. **DTOs/Schemas**
   - Request schemas
   - Response schemas
   - Error schemas

### Phase 3: API Layer (Sprint 2)

7. **Controllers/Routers**
   - `AssignmentRouter`
   - `WorkloadRouter`
   - `MyAssignmentsRouter`
   - `NotificationRouter`

8. **Middleware and Guards**
   - `AssignmentPermissionGuard`
   - `TeamBoundaryGuard`
   - `ReportAccessGuard`

9. **Error handlers**
   - Custom exception classes
   - Exception handlers

### Phase 4: Integration (Sprint 2-3)

10. **Integration**
    - Wire up services with routers
    - Add audit logging
    - End-to-end testing

11. **Security implementation**
    - Role-based access control
    - Audit logging
    - Access control enforcement

---

## 19. Business Logic Specifications

### Assignment Creation Workflow

```
1. Receive CreateAssignmentRequest
2. Validate JWT token (Authentication)
3. Validate user role is supervisor (BR-6.1)
4. Validate workflow_type matches role:
   - COMPLIANCE_OFFICER_SUPERVISOR → compliance only
   - HEAD_OF_COMPLIANCE → compliance only
   - HEAD_OF_ANALYSIS → analysis only
5. Validate assignee exists and has correct role:
   - compliance workflow → COMPLIANCE_OFFICER
   - analysis workflow → ANALYST
6. Validate team boundaries (BR-6.5):
   - If COMPLIANCE_OFFICER_SUPERVISOR: assignee must be in supervisor's team
   - If HEAD_OF_COMPLIANCE: any compliance officer allowed
   - If HEAD_OF_ANALYSIS: any analyst allowed
7. Validate deadline (BR-6.2):
   - Must be future date
   - Must be after assignment date
8. Validate report:
   - Report must exist
   - Report must be in assignable status (validated)
   - Report must not have active assignment
9. Create ReportAssignment record
10. Create AssignmentNotification for assignee (BR-6.6)
11. Log audit event (NFR-ASSIGN-SEC-2)
12. Return AssignmentResponse
```

### Workload Calculation Rules (BR-6.4)

**Compliance Officer Workload:**
```
workload_count = COUNT(report_assignments)
    WHERE assignee_id = officer_id
    AND status = 'active'
    AND workflow_type = 'compliance'
```

**Analyst Workload:**
```
workload_count = 
    COUNT(active STR assignments) +
    COUNT(active escalated CTR assignments) +
    COUNT(active cases)

WHERE assignee_id = analyst_id
AND status = 'active'
```

### Access Control Rules (BR-6.7)

```
CAN_ACCESS_REPORT(user, report):
    IF user.role IN [HEAD_OF_COMPLIANCE, HEAD_OF_ANALYSIS]:
        RETURN report.workflow_type matches user.department
    
    IF user.role == COMPLIANCE_OFFICER_SUPERVISOR:
        RETURN report.workflow_type == 'compliance' 
            AND report.assignee IN user.team_members
    
    IF user.role IN [COMPLIANCE_OFFICER, ANALYST]:
        assignment = GET_ACTIVE_ASSIGNMENT(report.id)
        RETURN assignment.assignee_id == user.id
    
    RETURN FALSE
```

---

## 20. Traceability Matrix

| FRD Requirement | API Endpoint | Service Method | Business Rule |
|-----------------|--------------|----------------|---------------|
| FR-6.1 (CTR Assignment) | POST /assignments | AssignmentService.create_assignment() | BR-6.1, BR-6.2, BR-6.5 |
| FR-6.2 (STR Assignment) | POST /assignments | AssignmentService.create_assignment() | BR-6.1, BR-6.2, BR-6.5 |
| FR-6.4 (Officer Workload) | GET /workload/officers | WorkloadService.get_officer_workloads() | BR-6.4 |
| FR-6.5 (Analyst Workload) | GET /workload/analysts | WorkloadService.get_analyst_workloads() | BR-6.4 |
| FR-6.7 (Notifications) | GET /notifications | NotificationService.get_user_notifications() | BR-6.6 |
| FR-6.8 (Officer Access) | GET /reports/{id} | ReportAccessService.check_report_access() | BR-6.7 |
| FR-6.9 (Analyst Access) | GET /reports/{id} | ReportAccessService.check_report_access() | BR-6.7 |
| FR-6.15 (Workflow Separation) | POST /assignments | AssignmentPermissionGuard | BR-6.1 |

---

**Document End**
