# Backend Feature Design Document (FDD)
## Feature 7: Subject Profiling Tool (MVF)

**Document Version:** 1.0  
**Date:** February 2026  
**Feature Name:** Subject Profiling Tool (MVF)  
**Product/System Name:** SupTech365  
**Related FRD Version:** frd_mvf_subject_profiling_tool.md v1.0  
**Status:** Draft  
**Last Updated Date:** February 2026

---

## 1. Document Header

**Document Title:** Backend Feature Design Document  
**Feature Name:** Subject Profiling Tool (MVF)  
**Product/System Name:** SupTech365  
**Version:** 1.0  
**Author:** Senior Technical Designer  
**Related FRD Version:** frd_mvf_subject_profiling_tool.md v1.0  
**Status:** Draft  
**Last Updated Date:** February 2026

---

## 2. Feature Context

### Feature Name
Subject Profiling Tool (MVF)

### Feature Description
The Subject Profiling Tool enables FIA analysts and compliance officers to view consolidated subject profiles showing all associated reports (STRs and CTRs) with proper role-based access control enforcement. The backend provides profile creation, automatic linking via identifier matching, and CTR access control based on user roles and assignments.

### Feature Purpose
Enable cross-report analysis for AML/CFT investigations by:
- Automatically creating subject profiles from validated report data
- Linking reports to existing profiles via identifier matching
- Providing role-based access to CTR data (analysts vs. compliance officers)
- Calculating summary statistics for investigative value

### Related Features
- **Feature 1 (Authentication)**: User authentication and role management
- **Feature 2 (Excel Submission)**: Source of report data for profile creation
- **Feature 3 (API Submission)**: Source of report data for profile creation
- **Feature 4 (Automated Validation)**: Triggers profile creation after validation
- **Feature 6 (Task Assignment)**: Provides STR assignment context for access control

### User Types
- **Analyst**: Views profiles with restricted CTR access (escalated only, or subject in assigned STR)
- **Compliance Officer**: Views profiles with full CTR access
- **System Process**: Creates profiles and links reports automatically

---

## 3. Technology Stack Reference

| Category | Technology |
|----------|------------|
| **Framework** | FastAPI |
| **ORM Library** | SQLModel (async) / SQLAlchemy 2.0 (async) |
| **Database** | PostgreSQL |
| **Auth Method** | JWT (Bearer Token) |
| **Validation Library** | Pydantic v2 |
| **Migration Tool** | Alembic |
| **Testing** | pytest, pytest-asyncio |

---

## 4. Architecture Pattern

### Pattern: Model-Service-Controller (MSC)

Following the existing SupTech365 architecture pattern with layered separation:

```
HTTP Request
    ↓
Router (Controller Layer)
    ↓
Middleware (Authentication/Authorization)
    ↓
Service (Business Logic Layer)
    ↓
Model (Data Access Layer)
    ↓
Database (PostgreSQL)
```

### Layer Responsibilities

**Model Layer:**
- Define SubjectProfile, SubjectIdentifier, SubjectReportLink, SubjectAttribute, SubjectStatistics entities
- Handle database queries and relationships
- Manage data integrity constraints

**Service Layer:**
- SubjectProfileService: Profile CRUD, search, linking logic
- SubjectAccessControlService: CTR access enforcement
- SubjectStatisticsService: Statistics calculation

**Controller Layer:**
- SubjectRouter: Handle HTTP requests for subject endpoints
- Request validation and response formatting
- Error handling and status codes

---

## 5. Data Model

### 5.1 Entity Relationship Overview

```
┌─────────────────────┐
│   subject_profiles  │
│   (PK: id)          │
└─────────┬───────────┘
          │
          ├──────────────────────────────────────┐
          │                                      │
          ▼                                      ▼
┌─────────────────────┐              ┌─────────────────────┐
│ subject_identifiers │              │  subject_attributes │
│ (FK: profile_id)    │              │  (FK: profile_id)   │
└─────────────────────┘              └─────────────────────┘
          │
          │
          ▼
┌─────────────────────┐              ┌─────────────────────┐
│subject_report_links │──────────────│      reports        │
│(FK: profile_id,     │              │   (existing table)  │
│    report_id)       │              └─────────────────────┘
└─────────────────────┘
          │
          ▼
┌─────────────────────┐
│ subject_statistics  │
│ (FK: profile_id)    │
└─────────────────────┘
```

### 5.2 Table Specifications

#### Table: `subject_profiles`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PK, AUTO_INCREMENT | Unique profile identifier |
| `uuid` | UUID | NOT NULL, UNIQUE | Public unique identifier |
| `subject_type` | ENUM | NOT NULL | 'PERSON', 'COMPANY', 'ACCOUNT' |
| `primary_name` | VARCHAR(255) | NOT NULL | Primary display name |
| `normalized_name` | VARCHAR(255) | NOT NULL, INDEX | Lowercase name for matching |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | Soft delete flag |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_subject_profiles_uuid` on `uuid` (UNIQUE)
- `idx_subject_profiles_normalized_name` on `normalized_name`
- `idx_subject_profiles_subject_type` on `subject_type`

---

#### Table: `subject_identifiers`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PK, AUTO_INCREMENT | Unique identifier |
| `profile_id` | INTEGER | FK → subject_profiles.id, NOT NULL | Parent profile |
| `identifier_type` | ENUM | NOT NULL | 'NATIONAL_ID', 'PASSPORT', 'COMPANY_REG', 'ACCOUNT_NUMBER', 'TAX_ID' |
| `identifier_value` | VARCHAR(100) | NOT NULL | Original value |
| `normalized_value` | VARCHAR(100) | NOT NULL, INDEX | Normalized for matching |
| `source_report_id` | INTEGER | FK → reports.id | Report where identifier was found |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Indexes:**
- `idx_subject_identifiers_profile_id` on `profile_id`
- `idx_subject_identifiers_normalized_value` on `normalized_value`
- `idx_subject_identifiers_type_value` on (`identifier_type`, `normalized_value`) (UNIQUE per profile)

**Constraints:**
- UNIQUE (`profile_id`, `identifier_type`, `normalized_value`)

---

#### Table: `subject_report_links`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PK, AUTO_INCREMENT | Unique identifier |
| `profile_id` | INTEGER | FK → subject_profiles.id, NOT NULL | Subject profile |
| `report_id` | INTEGER | FK → reports.id, NOT NULL | Linked report |
| `link_source` | ENUM | NOT NULL | 'AUTOMATIC', 'MANUAL' |
| `matched_identifier_id` | INTEGER | FK → subject_identifiers.id | Identifier that triggered link |
| `linked_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | When link was created |
| `linked_by` | INTEGER | FK → users.id | User who created manual link (NULL for auto) |

**Indexes:**
- `idx_subject_report_links_profile_id` on `profile_id`
- `idx_subject_report_links_report_id` on `report_id`

**Constraints:**
- UNIQUE (`profile_id`, `report_id`)

---

#### Table: `subject_attributes`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PK, AUTO_INCREMENT | Unique identifier |
| `profile_id` | INTEGER | FK → subject_profiles.id, NOT NULL | Parent profile |
| `attribute_type` | ENUM | NOT NULL | 'ADDRESS', 'PHONE', 'EMAIL', 'DATE_OF_BIRTH', 'NATIONALITY', 'OCCUPATION' |
| `attribute_value` | TEXT | NOT NULL | Attribute value |
| `source_report_id` | INTEGER | FK → reports.id | Report where attribute was found |
| `is_primary` | BOOLEAN | NOT NULL, DEFAULT FALSE | Primary attribute of this type |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Indexes:**
- `idx_subject_attributes_profile_id` on `profile_id`
- `idx_subject_attributes_type` on `attribute_type`

---

#### Table: `subject_statistics`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PK, AUTO_INCREMENT | Unique identifier |
| `profile_id` | INTEGER | FK → subject_profiles.id, NOT NULL, UNIQUE | Parent profile |
| `str_count` | INTEGER | NOT NULL, DEFAULT 0 | Number of linked STRs |
| `ctr_count` | INTEGER | NOT NULL, DEFAULT 0 | Number of linked CTRs |
| `escalated_ctr_count` | INTEGER | NOT NULL, DEFAULT 0 | Number of escalated CTRs |
| `total_transaction_value` | DECIMAL(18,2) | NOT NULL, DEFAULT 0 | Sum of transaction values |
| `first_activity_date` | DATE | NULL | Earliest report date |
| `last_activity_date` | DATE | NULL | Latest report date |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last calculation timestamp |

**Indexes:**
- `idx_subject_statistics_profile_id` on `profile_id` (UNIQUE)

---

### 5.3 Relationship Summary

| Relationship | Type | Description |
|--------------|------|-------------|
| subject_profiles → subject_identifiers | One-to-Many | Profile has multiple identifiers |
| subject_profiles → subject_attributes | One-to-Many | Profile has multiple attributes |
| subject_profiles → subject_report_links | One-to-Many | Profile linked to multiple reports |
| subject_profiles → subject_statistics | One-to-One | Profile has one statistics record |
| subject_report_links → reports | Many-to-One | Link references existing report |
| subject_identifiers → reports | Many-to-One | Identifier sourced from report |

---

## 6. API Contract

### 6.1 Endpoint Summary

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/subjects/search` | Search subject profiles | JWT Required |
| GET | `/api/v1/subjects/{uuid}` | Get profile details | JWT Required |
| GET | `/api/v1/subjects/{uuid}/reports` | Get linked reports (access-filtered) | JWT Required |
| GET | `/api/v1/subjects/{uuid}/statistics` | Get profile statistics | JWT Required |

---

### 6.2 Endpoint Details

#### GET `/api/v1/subjects/search`

**Description:** Search subject profiles by name, identifier, or account number.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search query (name, ID, account) |
| `subject_type` | string | No | Filter by type: PERSON, COMPANY, ACCOUNT |
| `page` | integer | No | Page number (default: 1) |
| `page_size` | integer | No | Results per page (default: 20, max: 100) |

**Success Response (200):**
```json
{
  "results": [
    {
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "subject_type": "PERSON",
      "primary_name": "John Mensah",
      "report_count": 5,
      "last_activity_date": "2026-01-15"
    }
  ],
  "total": 42,
  "page": 1,
  "page_size": 20,
  "total_pages": 3
}
```

**Error Responses:**
- `400 Bad Request`: Invalid query parameters
- `401 Unauthorized`: Missing or invalid JWT

---

#### GET `/api/v1/subjects/{uuid}`

**Description:** Get detailed subject profile with attributes.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uuid` | UUID | Yes | Subject profile UUID |

**Success Response (200):**
```json
{
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "subject_type": "PERSON",
  "primary_name": "John Mensah",
  "identifiers": [
    {
      "type": "NATIONAL_ID",
      "value": "LIB123456"
    },
    {
      "type": "PASSPORT",
      "value": "P789012"
    }
  ],
  "attributes": [
    {
      "type": "ADDRESS",
      "value": "123 Main St, Monrovia",
      "is_primary": true
    },
    {
      "type": "PHONE",
      "value": "+231-555-1234",
      "is_primary": true
    }
  ],
  "created_at": "2025-06-15T10:30:00Z",
  "updated_at": "2026-01-20T14:45:00Z"
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid JWT
- `404 Not Found`: Profile not found

---

#### GET `/api/v1/subjects/{uuid}/reports`

**Description:** Get reports linked to subject profile. Results are filtered based on user role and CTR access rules.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uuid` | UUID | Yes | Subject profile UUID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `report_type` | string | No | Filter: STR, CTR, ALL (default: ALL) |
| `page` | integer | No | Page number (default: 1) |
| `page_size` | integer | No | Results per page (default: 20) |

**Success Response (200):**
```json
{
  "profile_uuid": "550e8400-e29b-41d4-a716-446655440000",
  "reports": [
    {
      "report_id": 1234,
      "reference_number": "FIA-001-20260115-0001",
      "report_type": "STR",
      "status": "validated",
      "submitted_at": "2026-01-15T10:30:00Z",
      "entity_name": "Bank of Liberia",
      "access_level": "full"
    },
    {
      "report_id": 1235,
      "reference_number": "FIA-001-20260120-0002",
      "report_type": "CTR",
      "escalation_status": "archived",
      "submitted_at": "2026-01-20T14:45:00Z",
      "entity_name": "Bank of Liberia",
      "access_level": "restricted"
    }
  ],
  "access_summary": {
    "total_reports": 5,
    "accessible_reports": 3,
    "restricted_reports": 2
  },
  "page": 1,
  "page_size": 20,
  "total_pages": 1
}
```

**Access Level Values:**
- `full`: User has full access to report details
- `restricted`: CTR not accessible to analyst (shows limited metadata only)

**Error Responses:**
- `401 Unauthorized`: Missing or invalid JWT
- `404 Not Found`: Profile not found

---

#### GET `/api/v1/subjects/{uuid}/statistics`

**Description:** Get summary statistics for a subject profile.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uuid` | UUID | Yes | Subject profile UUID |

**Success Response (200):**
```json
{
  "profile_uuid": "550e8400-e29b-41d4-a716-446655440000",
  "statistics": {
    "str_count": 2,
    "ctr_count": 3,
    "escalated_ctr_count": 1,
    "total_reports": 5,
    "total_transaction_value": 125000.50,
    "first_activity_date": "2025-06-15",
    "last_activity_date": "2026-01-20",
    "activity_span_days": 219
  },
  "calculated_at": "2026-01-20T15:00:00Z"
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid JWT
- `404 Not Found`: Profile not found

---

## 7. Data Transfer Objects (DTOs)

### 7.1 Request Schemas

#### SubjectSearchRequest
```python
class SubjectSearchRequest(BaseModel):
    q: str = Field(..., min_length=2, max_length=100, description="Search query")
    subject_type: Optional[SubjectType] = Field(None, description="Filter by type")
    page: int = Field(1, ge=1, description="Page number")
    page_size: int = Field(20, ge=1, le=100, description="Results per page")
```

#### SubjectReportsRequest
```python
class SubjectReportsRequest(BaseModel):
    report_type: Optional[str] = Field("ALL", pattern="^(STR|CTR|ALL)$")
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)
```

---

### 7.2 Response Schemas

#### SubjectSearchResultItem
```python
class SubjectSearchResultItem(BaseModel):
    uuid: UUID
    subject_type: SubjectType
    primary_name: str
    report_count: int
    last_activity_date: Optional[date]
```

#### SubjectSearchResponse
```python
class SubjectSearchResponse(BaseModel):
    results: List[SubjectSearchResultItem]
    total: int
    page: int
    page_size: int
    total_pages: int
```

#### SubjectIdentifierResponse
```python
class SubjectIdentifierResponse(BaseModel):
    type: IdentifierType
    value: str
```

#### SubjectAttributeResponse
```python
class SubjectAttributeResponse(BaseModel):
    type: AttributeType
    value: str
    is_primary: bool
```

#### SubjectProfileResponse
```python
class SubjectProfileResponse(BaseModel):
    uuid: UUID
    subject_type: SubjectType
    primary_name: str
    identifiers: List[SubjectIdentifierResponse]
    attributes: List[SubjectAttributeResponse]
    created_at: datetime
    updated_at: datetime
```

#### SubjectReportItem
```python
class SubjectReportItem(BaseModel):
    report_id: int
    reference_number: str
    report_type: str  # STR or CTR
    status: Optional[str]
    escalation_status: Optional[str]  # For CTRs: archived, monitoring, escalated
    submitted_at: datetime
    entity_name: str
    access_level: str  # full or restricted
```

#### AccessSummary
```python
class AccessSummary(BaseModel):
    total_reports: int
    accessible_reports: int
    restricted_reports: int
```

#### SubjectReportsResponse
```python
class SubjectReportsResponse(BaseModel):
    profile_uuid: UUID
    reports: List[SubjectReportItem]
    access_summary: AccessSummary
    page: int
    page_size: int
    total_pages: int
```

#### SubjectStatisticsData
```python
class SubjectStatisticsData(BaseModel):
    str_count: int
    ctr_count: int
    escalated_ctr_count: int
    total_reports: int
    total_transaction_value: Decimal
    first_activity_date: Optional[date]
    last_activity_date: Optional[date]
    activity_span_days: Optional[int]
```

#### SubjectStatisticsResponse
```python
class SubjectStatisticsResponse(BaseModel):
    profile_uuid: UUID
    statistics: SubjectStatisticsData
    calculated_at: datetime
```

---

### 7.3 Error Response Schemas

#### ErrorResponse
```python
class ErrorResponse(BaseModel):
    error_code: str
    error_message: str
    details: Optional[dict] = None
    timestamp: datetime
```

#### ValidationErrorResponse
```python
class ValidationErrorDetail(BaseModel):
    field: str
    message: str

class ValidationErrorResponse(BaseModel):
    error_code: str = "VALIDATION_ERROR"
    error_message: str = "Request validation failed"
    errors: List[ValidationErrorDetail]
    timestamp: datetime
```

---

### 7.4 Enum Definitions

```python
class SubjectType(str, Enum):
    PERSON = "PERSON"
    COMPANY = "COMPANY"
    ACCOUNT = "ACCOUNT"

class IdentifierType(str, Enum):
    NATIONAL_ID = "NATIONAL_ID"
    PASSPORT = "PASSPORT"
    COMPANY_REG = "COMPANY_REG"
    ACCOUNT_NUMBER = "ACCOUNT_NUMBER"
    TAX_ID = "TAX_ID"

class AttributeType(str, Enum):
    ADDRESS = "ADDRESS"
    PHONE = "PHONE"
    EMAIL = "EMAIL"
    DATE_OF_BIRTH = "DATE_OF_BIRTH"
    NATIONALITY = "NATIONALITY"
    OCCUPATION = "OCCUPATION"

class LinkSource(str, Enum):
    AUTOMATIC = "AUTOMATIC"
    MANUAL = "MANUAL"

class EscalationStatus(str, Enum):
    ARCHIVED = "archived"
    MONITORING = "monitoring"
    ESCALATED = "escalated"
```

---

## 8. Service Classes

### 8.1 SubjectProfileService

**Purpose:** Core service for subject profile operations including creation, search, retrieval, and automatic linking.

#### Methods

**`search_profiles(query: str, subject_type: Optional[SubjectType], page: int, page_size: int) -> SubjectSearchResponse`**

| Parameter | Type | Description |
|-----------|------|-------------|
| query | str | Search term (name or identifier) |
| subject_type | Optional[SubjectType] | Filter by type |
| page | int | Page number |
| page_size | int | Results per page |

**Returns:** SubjectSearchResponse with paginated results

**Business Logic:**
1. Normalize search query (lowercase, trim whitespace)
2. Search `subject_profiles.normalized_name` using ILIKE
3. Search `subject_identifiers.normalized_value` for exact match
4. Combine results, deduplicate by profile_id
5. Apply subject_type filter if provided
6. Calculate pagination and return

---

**`get_profile_by_uuid(uuid: UUID) -> SubjectProfileResponse`**

| Parameter | Type | Description |
|-----------|------|-------------|
| uuid | UUID | Profile UUID |

**Returns:** SubjectProfileResponse with identifiers and attributes

**Business Logic:**
1. Query subject_profiles by uuid
2. Load related identifiers and attributes
3. Raise ProfileNotFoundError if not found
4. Return formatted response

---

**`get_profile_reports(uuid: UUID, user: User, report_type: Optional[str], page: int, page_size: int) -> SubjectReportsResponse`**

| Parameter | Type | Description |
|-----------|------|-------------|
| uuid | UUID | Profile UUID |
| user | User | Current authenticated user |
| report_type | Optional[str] | Filter: STR, CTR, ALL |
| page | int | Page number |
| page_size | int | Results per page |

**Returns:** SubjectReportsResponse with access-filtered reports

**Business Logic:**
1. Get profile by uuid (raise error if not found)
2. Query subject_report_links for profile
3. Join with reports table for report details
4. Apply report_type filter if specified
5. Call SubjectAccessControlService to determine access levels
6. Calculate access summary
7. Return paginated, access-filtered results

---

**`create_or_link_subject(report_id: int, subject_data: dict) -> SubjectProfile`**

| Parameter | Type | Description |
|-----------|------|-------------|
| report_id | int | Source report ID |
| subject_data | dict | Subject data from report |

**Returns:** Created or existing SubjectProfile

**Business Logic:**
1. Extract identifiers from subject_data
2. Normalize identifiers for matching
3. Search for existing profile by identifiers (exact match)
4. If found: create subject_report_link to existing profile
5. If not found: create new profile, identifiers, attributes
6. Update/create subject_statistics
7. Return profile

---

### 8.2 SubjectAccessControlService

**Purpose:** Enforce CTR access control rules based on user role and STR assignments.

#### Methods

**`filter_reports_by_access(reports: List[Report], user: User, profile_id: int) -> List[Tuple[Report, str]]`**

| Parameter | Type | Description |
|-----------|------|-------------|
| reports | List[Report] | Reports to filter |
| user | User | Current authenticated user |
| profile_id | int | Subject profile ID |

**Returns:** List of (Report, access_level) tuples

**Business Logic:**
```python
def filter_reports_by_access(reports, user, profile_id):
    result = []
    
    # Compliance officers have full access
    if user.role in ['compliance_officer', 'compliance_officer_supervisor', 'head_of_compliance']:
        return [(r, 'full') for r in reports]
    
    # For analysts, check each report
    if user.role == 'analyst':
        # Get STRs assigned to this analyst
        assigned_str_ids = get_analyst_assigned_strs(user.id)
        
        # Get subjects from assigned STRs
        subjects_in_assigned_strs = get_subjects_from_reports(assigned_str_ids)
        
        for report in reports:
            if report.report_type == 'STR':
                # Analysts can always see STRs
                result.append((report, 'full'))
            elif report.report_type == 'CTR':
                # Check CTR access conditions
                if report.escalation_status == 'escalated':
                    # Escalated CTRs are visible
                    result.append((report, 'full'))
                elif profile_id in subjects_in_assigned_strs:
                    # Subject appears in assigned STR
                    result.append((report, 'full'))
                else:
                    # Restricted access
                    result.append((report, 'restricted'))
    
    return result
```

---

**`check_ctr_access(user: User, report: Report, profile_id: int) -> bool`**

| Parameter | Type | Description |
|-----------|------|-------------|
| user | User | Current authenticated user |
| report | Report | CTR report to check |
| profile_id | int | Subject profile ID |

**Returns:** True if user can access CTR details

**Business Logic:**
1. If user is compliance officer → return True
2. If CTR is escalated → return True
3. If subject (profile_id) appears in STR assigned to analyst → return True
4. Otherwise → return False

---

### 8.3 SubjectStatisticsService

**Purpose:** Calculate and manage subject profile statistics.

#### Methods

**`get_statistics(profile_id: int) -> SubjectStatisticsResponse`**

| Parameter | Type | Description |
|-----------|------|-------------|
| profile_id | int | Subject profile ID |

**Returns:** SubjectStatisticsResponse

**Business Logic:**
1. Query subject_statistics by profile_id
2. If not found or stale, recalculate
3. Calculate activity_span_days from dates
4. Return formatted response

---

**`recalculate_statistics(profile_id: int) -> SubjectStatistics`**

| Parameter | Type | Description |
|-----------|------|-------------|
| profile_id | int | Subject profile ID |

**Returns:** Updated SubjectStatistics

**Business Logic:**
1. Query all reports linked to profile
2. Count STRs, CTRs, escalated CTRs
3. Sum transaction values from linked transactions
4. Find min/max report dates
5. Upsert subject_statistics record
6. Return updated statistics

---

## 9. Controller Classes

### 9.1 SubjectRouter

**Router Name:** SubjectRouter  
**Base Path:** `/api/v1/subjects`

#### Route Handlers

**GET `/search`**
```python
@router.get("/search", response_model=SubjectSearchResponse)
async def search_subjects(
    q: str = Query(..., min_length=2),
    subject_type: Optional[SubjectType] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    service: SubjectProfileService = Depends()
) -> SubjectSearchResponse:
    """Search subject profiles by name or identifier."""
    return await service.search_profiles(q, subject_type, page, page_size)
```

---

**GET `/{uuid}`**
```python
@router.get("/{uuid}", response_model=SubjectProfileResponse)
async def get_subject_profile(
    uuid: UUID,
    current_user: User = Depends(get_current_user),
    service: SubjectProfileService = Depends()
) -> SubjectProfileResponse:
    """Get subject profile details with attributes."""
    return await service.get_profile_by_uuid(uuid)
```

---

**GET `/{uuid}/reports`**
```python
@router.get("/{uuid}/reports", response_model=SubjectReportsResponse)
async def get_subject_reports(
    uuid: UUID,
    report_type: Optional[str] = Query("ALL", pattern="^(STR|CTR|ALL)$"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    service: SubjectProfileService = Depends()
) -> SubjectReportsResponse:
    """Get reports linked to subject with access control filtering."""
    return await service.get_profile_reports(
        uuid, current_user, report_type, page, page_size
    )
```

---

**GET `/{uuid}/statistics`**
```python
@router.get("/{uuid}/statistics", response_model=SubjectStatisticsResponse)
async def get_subject_statistics(
    uuid: UUID,
    current_user: User = Depends(get_current_user),
    profile_service: SubjectProfileService = Depends(),
    stats_service: SubjectStatisticsService = Depends()
) -> SubjectStatisticsResponse:
    """Get summary statistics for subject profile."""
    profile = await profile_service.get_profile_by_uuid(uuid)
    return await stats_service.get_statistics(profile.id)
```

---

## 10. Middleware and Guards

### 10.1 Authentication Dependency

Uses existing `get_current_user` dependency from Feature 1:

```python
from dependencies import get_current_user

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: AsyncSession = Depends(get_session)
) -> User:
    """Validate JWT and return current user."""
    # Existing implementation from Feature 1
    pass
```

---

### 10.2 Role-Based Access (Optional Enhancement)

For MVP, access control is handled at the service layer. Future enhancement could add middleware:

```python
class SubjectAccessMiddleware:
    """
    Future enhancement: Middleware for subject-level access control.
    Currently, access control is implemented in SubjectAccessControlService.
    """
    pass
```

---

## 11. Utilities and Helpers

### 11.1 SubjectMatcher

**Purpose:** Normalize and match subject identifiers for automatic linking.

#### Functions

**`normalize_identifier(value: str, identifier_type: IdentifierType) -> str`**

| Parameter | Type | Description |
|-----------|------|-------------|
| value | str | Original identifier value |
| identifier_type | IdentifierType | Type of identifier |

**Returns:** Normalized identifier string

**Logic:**
```python
def normalize_identifier(value: str, identifier_type: IdentifierType) -> str:
    """Normalize identifier for matching."""
    # Remove whitespace and convert to uppercase
    normalized = value.strip().upper()
    
    # Remove common punctuation
    normalized = re.sub(r'[.\-\s]', '', normalized)
    
    # Type-specific normalization
    if identifier_type == IdentifierType.ACCOUNT_NUMBER:
        # Remove leading zeros for account numbers
        normalized = normalized.lstrip('0') or '0'
    
    return normalized
```

---

**`normalize_name(name: str) -> str`**

| Parameter | Type | Description |
|-----------|------|-------------|
| name | str | Original name |

**Returns:** Normalized name for matching

**Logic:**
```python
def normalize_name(name: str) -> str:
    """Normalize name for case-insensitive matching."""
    # Lowercase and trim
    normalized = name.strip().lower()
    
    # Normalize whitespace (multiple spaces to single)
    normalized = ' '.join(normalized.split())
    
    return normalized
```

---

**`find_matching_profile(identifiers: List[dict], session: AsyncSession) -> Optional[int]`**

| Parameter | Type | Description |
|-----------|------|-------------|
| identifiers | List[dict] | Identifiers to match |
| session | AsyncSession | Database session |

**Returns:** Profile ID if match found, None otherwise

**Logic:**
1. Normalize all provided identifiers
2. Query subject_identifiers for exact matches
3. Return first matching profile_id (if any)

---

### 11.2 SubjectExtractor

**Purpose:** Extract subject data from validated reports.

#### Functions

**`extract_subjects_from_report(report: Report, transactions: List[Transaction]) -> List[dict]`**

| Parameter | Type | Description |
|-----------|------|-------------|
| report | Report | Source report |
| transactions | List[Transaction] | Report transactions |

**Returns:** List of subject data dictionaries

**Logic:**
1. Extract unique subjects from transactions
2. Collect identifiers (name, ID, account)
3. Collect attributes (address, phone, etc.)
4. Deduplicate by identifier
5. Return list of subject data

---

## 12. Configuration and Settings

### 12.1 SubjectSettings

```python
class SubjectSettings(BaseSettings):
    """Configuration for Subject Profiling feature."""
    
    # Search settings
    SUBJECT_SEARCH_MIN_LENGTH: int = 2
    SUBJECT_SEARCH_MAX_RESULTS: int = 100
    SUBJECT_SEARCH_DEFAULT_PAGE_SIZE: int = 20
    
    # Matching settings
    SUBJECT_MATCH_CASE_SENSITIVE: bool = False
    
    # Statistics settings
    SUBJECT_STATS_CACHE_TTL_SECONDS: int = 300  # 5 minutes
    
    # Pagination
    SUBJECT_REPORTS_MAX_PAGE_SIZE: int = 100
    
    class Config:
        env_prefix = "SUBJECT_"
```

### 12.2 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SUBJECT_SEARCH_MIN_LENGTH` | 2 | Minimum search query length |
| `SUBJECT_SEARCH_MAX_RESULTS` | 100 | Maximum search results |
| `SUBJECT_SEARCH_DEFAULT_PAGE_SIZE` | 20 | Default page size |
| `SUBJECT_STATS_CACHE_TTL_SECONDS` | 300 | Statistics cache duration |

---

## 13. Database Migrations

### 13.1 Initial Migration: `001_create_subject_profiling_tables`

**Tables Created:**
- `subject_profiles`
- `subject_identifiers`
- `subject_report_links`
- `subject_attributes`
- `subject_statistics`

**Enum Types Created:**
- `subject_type_enum`: PERSON, COMPANY, ACCOUNT
- `identifier_type_enum`: NATIONAL_ID, PASSPORT, COMPANY_REG, ACCOUNT_NUMBER, TAX_ID
- `attribute_type_enum`: ADDRESS, PHONE, EMAIL, DATE_OF_BIRTH, NATIONALITY, OCCUPATION
- `link_source_enum`: AUTOMATIC, MANUAL

**Indexes Created:**
- `idx_subject_profiles_uuid` (UNIQUE)
- `idx_subject_profiles_normalized_name`
- `idx_subject_profiles_subject_type`
- `idx_subject_identifiers_profile_id`
- `idx_subject_identifiers_normalized_value`
- `idx_subject_report_links_profile_id`
- `idx_subject_report_links_report_id`
- `idx_subject_attributes_profile_id`
- `idx_subject_statistics_profile_id` (UNIQUE)

**Foreign Keys:**
- `subject_identifiers.profile_id` → `subject_profiles.id` (ON DELETE CASCADE)
- `subject_identifiers.source_report_id` → `reports.id` (ON DELETE SET NULL)
- `subject_report_links.profile_id` → `subject_profiles.id` (ON DELETE CASCADE)
- `subject_report_links.report_id` → `reports.id` (ON DELETE CASCADE)
- `subject_report_links.linked_by` → `users.id` (ON DELETE SET NULL)
- `subject_attributes.profile_id` → `subject_profiles.id` (ON DELETE CASCADE)
- `subject_attributes.source_report_id` → `reports.id` (ON DELETE SET NULL)
- `subject_statistics.profile_id` → `subject_profiles.id` (ON DELETE CASCADE)

---

## 14. Error Handling

### 14.1 Custom Exceptions

#### ProfileNotFoundError
```python
class ProfileNotFoundError(Exception):
    """Raised when subject profile is not found."""
    
    def __init__(self, uuid: UUID):
        self.uuid = uuid
        self.message = f"Subject profile not found: {uuid}"
        super().__init__(self.message)
```

**HTTP Status:** 404 Not Found

**Error Response:**
```json
{
  "error_code": "PROFILE_NOT_FOUND",
  "error_message": "Subject profile not found",
  "details": {"uuid": "550e8400-e29b-41d4-a716-446655440000"},
  "timestamp": "2026-02-01T10:30:00Z"
}
```

---

#### CTRAccessDeniedError
```python
class CTRAccessDeniedError(Exception):
    """Raised when analyst attempts to access restricted CTR."""
    
    def __init__(self, report_id: int, reason: str):
        self.report_id = report_id
        self.reason = reason
        self.message = f"CTR access denied: {reason}"
        super().__init__(self.message)
```

**HTTP Status:** 403 Forbidden

**Error Response:**
```json
{
  "error_code": "CTR_ACCESS_DENIED",
  "error_message": "Access Restricted - This CTR is available to Compliance Officers only",
  "details": {
    "report_id": 1234,
    "reason": "CTR not escalated and subject not in assigned STR"
  },
  "timestamp": "2026-02-01T10:30:00Z"
}
```

---

#### InvalidSearchQueryError
```python
class InvalidSearchQueryError(Exception):
    """Raised when search query is invalid."""
    
    def __init__(self, query: str, reason: str):
        self.query = query
        self.reason = reason
        self.message = f"Invalid search query: {reason}"
        super().__init__(self.message)
```

**HTTP Status:** 400 Bad Request

---

### 14.2 Exception Handlers

```python
@app.exception_handler(ProfileNotFoundError)
async def profile_not_found_handler(request: Request, exc: ProfileNotFoundError):
    return JSONResponse(
        status_code=404,
        content={
            "error_code": "PROFILE_NOT_FOUND",
            "error_message": exc.message,
            "details": {"uuid": str(exc.uuid)},
            "timestamp": datetime.utcnow().isoformat()
        }
    )

@app.exception_handler(CTRAccessDeniedError)
async def ctr_access_denied_handler(request: Request, exc: CTRAccessDeniedError):
    return JSONResponse(
        status_code=403,
        content={
            "error_code": "CTR_ACCESS_DENIED",
            "error_message": exc.message,
            "details": {
                "report_id": exc.report_id,
                "reason": exc.reason
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    )
```

---

## 15. Testing Considerations

### 15.1 Unit Tests

**SubjectProfileService Tests:**
- `test_search_profiles_by_name`: Search returns matching profiles
- `test_search_profiles_by_identifier`: Search by ID number
- `test_search_profiles_no_results`: Empty results for no match
- `test_get_profile_by_uuid`: Returns profile with attributes
- `test_get_profile_not_found`: Raises ProfileNotFoundError
- `test_create_or_link_new_subject`: Creates new profile
- `test_create_or_link_existing_subject`: Links to existing profile

**SubjectAccessControlService Tests:**
- `test_compliance_officer_full_access`: All CTRs visible
- `test_analyst_str_access`: STRs always visible
- `test_analyst_escalated_ctr_access`: Escalated CTRs visible
- `test_analyst_restricted_ctr`: Non-escalated CTR restricted
- `test_analyst_ctr_via_assigned_str`: CTR visible if subject in assigned STR

**SubjectStatisticsService Tests:**
- `test_get_statistics`: Returns correct counts
- `test_recalculate_statistics`: Updates statistics correctly

### 15.2 Integration Tests

**API Endpoint Tests:**
- `test_search_endpoint_success`: GET /search returns results
- `test_search_endpoint_validation`: Invalid query rejected
- `test_profile_endpoint_success`: GET /{uuid} returns profile
- `test_profile_endpoint_not_found`: 404 for invalid UUID
- `test_reports_endpoint_analyst_filtering`: Reports filtered for analyst
- `test_reports_endpoint_compliance_full_access`: All reports for compliance
- `test_statistics_endpoint`: Statistics calculated correctly

### 15.3 Test Fixtures

```python
@pytest.fixture
def sample_person_profile():
    return {
        "subject_type": "PERSON",
        "primary_name": "John Mensah",
        "identifiers": [
            {"type": "NATIONAL_ID", "value": "LIB123456"}
        ]
    }

@pytest.fixture
def sample_company_profile():
    return {
        "subject_type": "COMPANY",
        "primary_name": "ABC Trading Co",
        "identifiers": [
            {"type": "COMPANY_REG", "value": "REG789012"}
        ]
    }

@pytest.fixture
def analyst_user():
    return User(id=1, role="analyst", username="analyst1")

@pytest.fixture
def compliance_user():
    return User(id=2, role="compliance_officer", username="compliance1")
```

---

## 16. Security Considerations

### 16.1 Access Control

**Role-Based Access:**
- All endpoints require JWT authentication
- CTR data filtered based on user role (analyst vs. compliance)
- Access control enforced at service layer, not just API layer

**Data Isolation:**
- Users can only view profiles related to their workflow
- Restricted CTRs show limited metadata only (reference number, date)
- No sensitive transaction details exposed for restricted CTRs

### 16.2 Audit Logging

**Events to Log:**
- Profile search queries (user, query, result count)
- Profile views (user, profile_id)
- Report list views (user, profile_id, access_summary)
- Access denied events (user, report_id, reason)

**Log Format:**
```python
{
    "event_type": "SUBJECT_PROFILE_VIEW",
    "user_id": 123,
    "profile_uuid": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2026-02-01T10:30:00Z",
    "ip_address": "192.168.1.100"
}
```

### 16.3 Data Protection

**Encryption:**
- All data encrypted at rest (PostgreSQL encryption)
- All API communication over TLS 1.2+
- Sensitive identifiers stored securely

**Input Validation:**
- All inputs validated via Pydantic schemas
- SQL injection prevented via ORM parameterized queries
- Search queries sanitized before database operations

---

## 17. Dependencies Between Components

### 17.1 Component Interaction Diagram

```
┌─────────────────┐
│  SubjectRouter  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  SubjectProfileService  │
└────────┬────────────────┘
         │
         ├──────────────────────────┐
         │                          │
         ▼                          ▼
┌─────────────────────────┐  ┌─────────────────────────┐
│SubjectAccessControlSvc  │  │ SubjectStatisticsService│
└─────────────────────────┘  └─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│    SubjectMatcher       │
│    (Utility)            │
└─────────────────────────┘
```

### 17.2 External Dependencies

| Dependency | Source | Usage |
|------------|--------|-------|
| User model | Feature 1 | Current user context, role checking |
| Report model | Feature 2/3 | Report linking, report details |
| Task Assignment | Feature 6 | Analyst STR assignments for access control |

### 17.3 Service Dependencies

```python
# SubjectProfileService dependencies
class SubjectProfileService:
    def __init__(
        self,
        session: AsyncSession,
        access_control: SubjectAccessControlService,
        matcher: SubjectMatcher
    ):
        self.session = session
        self.access_control = access_control
        self.matcher = matcher
```

---

## 18. Implementation Order

### 18.1 Recommended Sequence

**Sprint 1: Foundation (Week 1-2)**
1. Database migrations (create all tables)
2. SQLModel entity definitions
3. SubjectMatcher utility
4. Basic SubjectProfileService (create, get by UUID)

**Sprint 2: Core Features (Week 3-4)**
5. Search functionality (SubjectProfileService.search_profiles)
6. Automatic linking logic (create_or_link_subject)
7. SubjectStatisticsService
8. SubjectRouter endpoints (search, profile, statistics)

**Sprint 3: Access Control (Week 5-6)**
9. SubjectAccessControlService
10. Report listing with access filtering
11. Integration with Feature 6 (task assignments)
12. Error handling and validation

**Sprint 4: Integration & Testing (Week 7-8)**
13. Integration with validation pipeline (Feature 4)
14. Unit tests for all services
15. Integration tests for all endpoints
16. Security review and audit logging

### 18.2 Component Dependencies

```
Database Migrations
       ↓
Entity Models
       ↓
SubjectMatcher (Utility)
       ↓
SubjectProfileService (Basic)
       ↓
SubjectStatisticsService
       ↓
SubjectAccessControlService
       ↓
SubjectRouter
       ↓
Integration with Validation Pipeline
```

---

## 19. Business Logic Specifications

### 19.1 Profile Creation Workflow

```
Report Validated (Feature 4)
       ↓
Extract Subjects from Report
       ↓
For Each Subject:
  ├── Normalize Identifiers
  ├── Search for Existing Profile (by identifier)
  │     ├── Found → Create subject_report_link
  │     └── Not Found → Create new profile
  │           ├── Create subject_profile
  │           ├── Create subject_identifiers
  │           └── Create subject_attributes
  └── Update subject_statistics
       ↓
Profile(s) Created/Linked
```

### 19.2 Access Control Logic (BR-7.4)

```
User Requests Reports for Subject
       ↓
Get User Role
       ↓
If Compliance Officer/Supervisor/Head:
  └── Return ALL reports with access_level = "full"
       ↓
If Analyst:
  ├── Get STRs assigned to analyst
  ├── Get subjects from those STRs
  └── For each report:
        ├── If STR → access_level = "full"
        ├── If CTR:
        │     ├── If escalated → access_level = "full"
        │     ├── If subject in assigned STR → access_level = "full"
        │     └── Else → access_level = "restricted"
        └── Return filtered list
```

### 19.3 Identifier Matching Logic (BR-7.2)

```
New Report with Subject Data
       ↓
Extract Identifiers (name, ID, account)
       ↓
For Each Identifier:
  ├── Normalize value (uppercase, remove punctuation)
  ├── Query subject_identifiers.normalized_value
  └── If exact match found → Return profile_id
       ↓
If Any Match → Link to existing profile
If No Match → Create new profile
```

---

## 20. Approval

**Prepared by:** Senior Technical Designer  
**Reviewed by:** [To be filled]  
**Approved by:** [To be filled]  
**Date:** [To be filled]

---

## 21. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | February 2026 | Senior Technical Designer | Initial FDD-BE for MVF |

---

**Document End**
