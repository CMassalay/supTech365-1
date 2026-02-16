# Backend Feature Design Document (FDD)
## Feature 8: Rule-Based Analysis & Alert Generation

**Document Version:** 1.0  
**Date:** February 2026  
**Feature Name:** Rule-Based Analysis & Alert Generation  
**Product/System Name:** SupTech365  
**Related FRD Version:** frd_rule_based_analysis_alert_generation.md v1.0  
**Status:** Draft  
**Last Updated Date:** February 2026

---

## 1. Document Header

**Document Title:** Backend Feature Design Document  
**Feature Name:** Rule-Based Analysis & Alert Generation  
**Product/System Name:** SupTech365  
**Version:** 1.0  
**Author:** Senior Technical Designer  
**Related FRD Version:** frd_rule_based_analysis_alert_generation.md v1.0  
**Status:** Draft  
**Last Updated Date:** February 2026

---

## 2. Feature Context

### Feature Name
Rule-Based Analysis & Alert Generation

### Feature Description
The system automatically flags reports matching predefined suspicious patterns to enable risk-based prioritization. Compliance officers and analysts can define rules, view generated alerts on role-specific dashboards, and mark alert dispositions. The system supports two rule domains: compliance-level rules for CTR processing and analysis-level rules for STR and escalated CTR investigation.

### Feature Purpose
Enable automated risk-based prioritization of reports by:
- Allowing authorized users to define, manage, and deactivate alert rules within their domain
- Automatically executing active rules against validated reports
- Generating alerts with risk levels (Low, Medium, High, Critical)
- Displaying alerts on role-specific dashboards with disposition tracking
- Maintaining an immutable audit trail for all rule executions and changes

### Related Features
- **Feature 1 (Authentication)**: User authentication, role management, and RBAC enforcement
- **Feature 2 (Excel Submission)**: Source of CTR/STR reports that rules evaluate
- **Feature 3 (API Submission)**: Source of CTR/STR reports that rules evaluate
- **Feature 4 (Automated Validation)**: Validation triggers compliance-level rule execution on CTRs
- **Feature 5 (Manual Validation)**: Manual validation triggers analysis-level rule execution on STRs
- **Feature 6 (Task Assignment)**: CTR escalation triggers analysis-level rule execution on escalated CTRs

### User Types
- **Compliance Officer Supervisor**: Defines, modifies, deactivates, and deletes compliance-level rules
- **Head of Analysis**: Defines, modifies, deactivates, and deletes analysis-level rules
- **Compliance Officers**: View compliance-level alerts, mark dispositions
- **Analysts**: View analysis-level alerts, mark dispositions
- **System Process**: Executes rules, generates alerts, logs audit events

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
- Define AlertRule, AlertRuleCondition, Alert, AlertDisposition, RuleExecutionLog, RuleChangeAuditLog entities
- Handle database queries and relationships
- Manage data integrity constraints and enum types

**Service Layer:**
- RuleManagementService: Rule CRUD, validation, domain separation enforcement
- RuleExecutionService: Evaluate rules against reports, generate alerts
- AlertService: Alert queries, disposition updates, dashboard data
- RuleAuditService: Log rule executions and rule changes

**Controller Layer:**
- RuleRouter: Handle HTTP requests for rule management endpoints
- AlertRouter: Handle HTTP requests for alert viewing and disposition endpoints
- Request validation, response formatting, and error handling

---

## 5. Data Model

### 5.1 Entity Relationship Overview

```
┌─────────────────────┐
│    alert_rules      │
│    (PK: id)         │
└─────────┬───────────┘
          │
          ├──────────────────────────────────────┐
          │                                      │
          ▼                                      ▼
┌─────────────────────────┐          ┌─────────────────────────┐
│  alert_rule_conditions  │          │        alerts           │
│  (FK: rule_id)          │          │  (FK: rule_id,          │
└─────────────────────────┘          │       report_id)        │
                                     └─────────┬───────────────┘
                                               │
                                               ▼
                                     ┌─────────────────────────┐
                                     │   alert_dispositions    │
                                     │   (FK: alert_id)        │
                                     └─────────────────────────┘

┌─────────────────────────┐          ┌─────────────────────────┐
│  rule_execution_logs    │          │  rule_change_audit_logs │
│  (FK: rule_id,          │          │  (FK: rule_id)          │
│       report_id)        │          └─────────────────────────┘
└─────────────────────────┘
```

### 5.2 Table Specifications

#### Table: `alert_rules`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PK, AUTO_INCREMENT | Unique rule identifier |
| `uuid` | UUID | NOT NULL, UNIQUE | Public unique identifier |
| `name` | VARCHAR(255) | NOT NULL | Human-readable rule name |
| `description` | TEXT | NULL | Rule description/purpose |
| `domain` | ENUM | NOT NULL | 'COMPLIANCE' or 'ANALYSIS' |
| `risk_level` | ENUM | NOT NULL | 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL' |
| `logical_operator` | ENUM | NOT NULL, DEFAULT 'AND' | 'AND' or 'OR' for combining conditions |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | Whether rule is currently active |
| `is_preconfigured` | BOOLEAN | NOT NULL, DEFAULT FALSE | Whether rule is system-provided |
| `version` | INTEGER | NOT NULL, DEFAULT 1 | Rule version for optimistic locking |
| `created_by` | UUID | FK → users.id, NOT NULL | User who created the rule |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |
| `deactivated_at` | TIMESTAMP | NULL | When rule was deactivated |
| `deactivated_by` | UUID | FK → users.id, NULL | User who deactivated the rule |

**Indexes:**
- `idx_alert_rules_uuid` on `uuid` (UNIQUE)
- `idx_alert_rules_domain` on `domain`
- `idx_alert_rules_is_active` on `is_active`
- `idx_alert_rules_domain_active` on (`domain`, `is_active`)

---

#### Table: `alert_rule_conditions`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PK, AUTO_INCREMENT | Unique condition identifier |
| `rule_id` | INTEGER | FK → alert_rules.id, NOT NULL | Parent rule |
| `field` | VARCHAR(100) | NOT NULL | Report/transaction field to evaluate (e.g., 'transaction_amount', 'subject_country') |
| `operator` | ENUM | NOT NULL | 'EQUALS', 'NOT_EQUALS', 'GREATER_THAN', 'LESS_THAN', 'GREATER_THAN_OR_EQUAL', 'LESS_THAN_OR_EQUAL', 'CONTAINS', 'IN', 'NOT_IN', 'BETWEEN' |
| `value` | TEXT | NOT NULL | Comparison value (JSON-encoded for complex types) |
| `value_type` | ENUM | NOT NULL | 'STRING', 'NUMBER', 'BOOLEAN', 'DATE', 'LIST' |
| `order_index` | INTEGER | NOT NULL, DEFAULT 0 | Display/evaluation order |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Indexes:**
- `idx_alert_rule_conditions_rule_id` on `rule_id`

**Constraints:**
- FK `rule_id` → `alert_rules.id` ON DELETE CASCADE

---

#### Table: `alerts`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PK, AUTO_INCREMENT | Unique alert identifier |
| `uuid` | UUID | NOT NULL, UNIQUE | Public unique identifier |
| `rule_id` | INTEGER | FK → alert_rules.id, NOT NULL | Rule that generated this alert |
| `rule_version` | INTEGER | NOT NULL | Version of rule at time of alert generation |
| `report_id` | INTEGER | FK → reports.id, NOT NULL | Report that triggered the alert |
| `domain` | ENUM | NOT NULL | 'COMPLIANCE' or 'ANALYSIS' |
| `risk_level` | ENUM | NOT NULL | 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL' |
| `disposition` | ENUM | NULL | 'TRUE_POSITIVE', 'FALSE_POSITIVE', 'UNDER_INVESTIGATION' |
| `disposition_by` | UUID | FK → users.id, NULL | User who set disposition |
| `disposition_at` | TIMESTAMP | NULL | When disposition was set |
| `disposition_notes` | TEXT | NULL | Notes on disposition decision |
| `generated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | When alert was generated |

**Indexes:**
- `idx_alerts_uuid` on `uuid` (UNIQUE)
- `idx_alerts_rule_id` on `rule_id`
- `idx_alerts_report_id` on `report_id`
- `idx_alerts_domain` on `domain`
- `idx_alerts_risk_level` on `risk_level`
- `idx_alerts_disposition` on `disposition`
- `idx_alerts_domain_disposition` on (`domain`, `disposition`)
- `idx_alerts_generated_at` on `generated_at`

**Constraints:**
- UNIQUE (`rule_id`, `report_id`) — one alert per rule per report

---

#### Table: `alert_dispositions`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PK, AUTO_INCREMENT | Unique record identifier |
| `alert_id` | INTEGER | FK → alerts.id, NOT NULL | Parent alert |
| `disposition` | ENUM | NOT NULL | 'TRUE_POSITIVE', 'FALSE_POSITIVE', 'UNDER_INVESTIGATION' |
| `notes` | TEXT | NULL | Justification/notes |
| `set_by` | UUID | FK → users.id, NOT NULL | User who set this disposition |
| `set_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Timestamp |

**Indexes:**
- `idx_alert_dispositions_alert_id` on `alert_id`

**Constraints:**
- FK `alert_id` → `alerts.id` ON DELETE CASCADE

**Note:** This table provides disposition history. The current disposition is stored directly on the `alerts` table for query performance.

---

#### Table: `rule_execution_logs`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PK, AUTO_INCREMENT | Unique log identifier |
| `rule_id` | INTEGER | FK → alert_rules.id, NOT NULL | Rule that was executed |
| `report_id` | INTEGER | FK → reports.id, NOT NULL | Report evaluated |
| `rule_version` | INTEGER | NOT NULL | Rule version at execution time |
| `conditions_evaluated` | JSON | NOT NULL | Snapshot of conditions evaluated |
| `condition_results` | JSON | NOT NULL | Result of each condition evaluation |
| `overall_result` | BOOLEAN | NOT NULL | Whether rule matched (alert generated) |
| `alert_id` | INTEGER | FK → alerts.id, NULL | Generated alert (NULL if no match) |
| `execution_duration_ms` | INTEGER | NULL | Execution time in milliseconds |
| `error_message` | TEXT | NULL | Error details if execution failed |
| `executed_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Execution timestamp |

**Indexes:**
- `idx_rule_execution_logs_rule_id` on `rule_id`
- `idx_rule_execution_logs_report_id` on `report_id`
- `idx_rule_execution_logs_executed_at` on `executed_at`

---

#### Table: `rule_change_audit_logs`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PK, AUTO_INCREMENT | Unique log identifier |
| `rule_id` | INTEGER | FK → alert_rules.id, NOT NULL | Affected rule |
| `change_type` | ENUM | NOT NULL | 'CREATED', 'MODIFIED', 'DEACTIVATED', 'REACTIVATED', 'DELETED' |
| `changed_by` | UUID | FK → users.id, NOT NULL | User who made the change |
| `justification` | TEXT | NOT NULL | Reason for change (required by BR-8.7) |
| `previous_config` | JSON | NULL | Snapshot of rule before change |
| `new_config` | JSON | NULL | Snapshot of rule after change |
| `changed_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Change timestamp |

**Indexes:**
- `idx_rule_change_audit_logs_rule_id` on `rule_id`
- `idx_rule_change_audit_logs_changed_by` on `changed_by`
- `idx_rule_change_audit_logs_changed_at` on `changed_at`

**Note:** This table is append-only and immutable per NFR-SEC-8.2. No UPDATE or DELETE operations permitted.

---

### 5.3 Relationship Summary

| Relationship | Type | Description |
|--------------|------|-------------|
| alert_rules → alert_rule_conditions | One-to-Many | Rule has multiple conditions |
| alert_rules → alerts | One-to-Many | Rule generates multiple alerts |
| alert_rules → rule_execution_logs | One-to-Many | Rule has execution history |
| alert_rules → rule_change_audit_logs | One-to-Many | Rule has change history |
| alerts → alert_dispositions | One-to-Many | Alert has disposition history |
| alerts → reports (existing) | Many-to-One | Alert references a report |
| alert_rules → users (existing) | Many-to-One | Rule created by a user |

---

## 6. API Contract

### 6.1 Endpoint Summary

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| POST | `/api/v1/rules` | Create a new alert rule | JWT | Compliance Officer Supervisor, Head of Analysis |
| GET | `/api/v1/rules` | List rules (filtered by domain) | JWT | Compliance Officer Supervisor, Head of Analysis |
| GET | `/api/v1/rules/{uuid}` | Get rule details | JWT | Compliance Officer Supervisor, Head of Analysis |
| PUT | `/api/v1/rules/{uuid}` | Update a rule | JWT | Compliance Officer Supervisor, Head of Analysis |
| PATCH | `/api/v1/rules/{uuid}/deactivate` | Deactivate a rule | JWT | Compliance Officer Supervisor, Head of Analysis |
| PATCH | `/api/v1/rules/{uuid}/activate` | Reactivate a rule | JWT | Compliance Officer Supervisor, Head of Analysis |
| DELETE | `/api/v1/rules/{uuid}` | Delete a rule | JWT | Compliance Officer Supervisor, Head of Analysis |
| GET | `/api/v1/alerts` | List alerts (filtered by domain) | JWT | Compliance Officers, Analysts, Supervisors |
| GET | `/api/v1/alerts/{uuid}` | Get alert detail with rule logic | JWT | Compliance Officers, Analysts |
| PATCH | `/api/v1/alerts/{uuid}/disposition` | Update alert disposition | JWT | Compliance Officers, Analysts |
| POST | `/api/v1/rules/execute` | Trigger rule execution for a report (internal) | JWT/System | System Process |

---

### 6.2 Endpoint Details

#### POST `/api/v1/rules`

**Description:** Create a new alert rule within the user's authorized domain.

**Request Body:**
```json
{
  "name": "High-Value CTR Detection",
  "description": "Flag CTRs with transaction amounts exceeding $50,000",
  "domain": "COMPLIANCE",
  "risk_level": "HIGH",
  "logical_operator": "AND",
  "conditions": [
    {
      "field": "transaction_amount",
      "operator": "GREATER_THAN",
      "value": "50000",
      "value_type": "NUMBER"
    }
  ]
}
```

**Success Response (201):**
```json
{
  "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "High-Value CTR Detection",
  "domain": "COMPLIANCE",
  "risk_level": "HIGH",
  "is_active": true,
  "conditions_count": 1,
  "created_at": "2026-02-10T10:00:00Z",
  "created_by": "user-uuid"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid rule definition (ERR-RULE-001)
- `401 Unauthorized`: Missing or invalid JWT
- `403 Forbidden`: User role does not match rule domain (ERR-RULE-003)

---

#### GET `/api/v1/rules`

**Description:** List alert rules filtered by domain. Domain is enforced by user role.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `domain` | string | No | Filter: COMPLIANCE, ANALYSIS (auto-filtered by role) |
| `is_active` | boolean | No | Filter by active status |
| `risk_level` | string | No | Filter by risk level |
| `page` | integer | No | Page number (default: 1) |
| `page_size` | integer | No | Results per page (default: 20, max: 100) |

**Success Response (200):**
```json
{
  "results": [
    {
      "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "name": "High-Value CTR Detection",
      "domain": "COMPLIANCE",
      "risk_level": "HIGH",
      "is_active": true,
      "is_preconfigured": false,
      "conditions_count": 1,
      "alerts_generated": 15,
      "created_at": "2026-02-10T10:00:00Z"
    }
  ],
  "total": 12,
  "page": 1,
  "page_size": 20,
  "total_pages": 1
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid JWT
- `403 Forbidden`: User cannot access rules in this domain

---

#### GET `/api/v1/rules/{uuid}`

**Description:** Get full rule details including all conditions.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uuid` | UUID | Yes | Rule UUID |

**Success Response (200):**
```json
{
  "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "High-Value CTR Detection",
  "description": "Flag CTRs with transaction amounts exceeding $50,000",
  "domain": "COMPLIANCE",
  "risk_level": "HIGH",
  "logical_operator": "AND",
  "is_active": true,
  "is_preconfigured": false,
  "version": 1,
  "conditions": [
    {
      "field": "transaction_amount",
      "operator": "GREATER_THAN",
      "value": "50000",
      "value_type": "NUMBER",
      "order_index": 0
    }
  ],
  "alerts_generated": 15,
  "created_by": "user-uuid",
  "created_at": "2026-02-10T10:00:00Z",
  "updated_at": "2026-02-10T10:00:00Z"
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid JWT
- `403 Forbidden`: Domain mismatch (ERR-RULE-003)
- `404 Not Found`: Rule not found

---

#### PUT `/api/v1/rules/{uuid}`

**Description:** Update an existing rule. Requires justification (BR-8.7). Uses optimistic locking via `version` field.

**Request Body:**
```json
{
  "name": "High-Value CTR Detection (Updated)",
  "description": "Updated threshold to $40,000",
  "risk_level": "HIGH",
  "logical_operator": "AND",
  "conditions": [
    {
      "field": "transaction_amount",
      "operator": "GREATER_THAN",
      "value": "40000",
      "value_type": "NUMBER"
    }
  ],
  "justification": "Lowering threshold based on 3-month review of false negatives",
  "expected_version": 1
}
```

**Success Response (200):**
```json
{
  "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "High-Value CTR Detection (Updated)",
  "version": 2,
  "updated_at": "2026-02-11T14:30:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid rule definition (ERR-RULE-001)
- `401 Unauthorized`: Missing or invalid JWT
- `403 Forbidden`: Domain mismatch (ERR-RULE-003)
- `404 Not Found`: Rule not found
- `409 Conflict`: Version mismatch — concurrent modification (ERR-RULE-005)

---

#### PATCH `/api/v1/rules/{uuid}/deactivate`

**Description:** Deactivate a rule. Requires justification (BR-8.7).

**Request Body:**
```json
{
  "justification": "Rule causing excessive false positives, under review"
}
```

**Success Response (200):**
```json
{
  "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "is_active": false,
  "deactivated_at": "2026-02-11T15:00:00Z"
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid JWT
- `403 Forbidden`: Domain mismatch
- `404 Not Found`: Rule not found

---

#### PATCH `/api/v1/rules/{uuid}/activate`

**Description:** Reactivate a previously deactivated rule. Requires justification.

**Request Body:**
```json
{
  "justification": "Rule reviewed and thresholds adjusted, reactivating"
}
```

**Success Response (200):**
```json
{
  "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "is_active": true,
  "updated_at": "2026-02-11T16:00:00Z"
}
```

**Error Responses:**
- `401 Unauthorized`, `403 Forbidden`, `404 Not Found`

---

#### DELETE `/api/v1/rules/{uuid}`

**Description:** Soft-delete a rule. Requires justification (BR-8.7). Historical alerts are preserved.

**Request Body:**
```json
{
  "justification": "Rule replaced by updated version with broader scope"
}
```

**Success Response (200):**
```json
{
  "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "deleted": true
}
```

**Error Responses:**
- `401 Unauthorized`, `403 Forbidden`, `404 Not Found`

---

#### GET `/api/v1/alerts`

**Description:** List alerts filtered by domain (auto-filtered by user role). Supports filtering and sorting.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `domain` | string | No | COMPLIANCE or ANALYSIS (auto-filtered by role) |
| `risk_level` | string | No | Filter by risk level |
| `disposition` | string | No | Filter by disposition status |
| `rule_uuid` | string | No | Filter by triggering rule |
| `sort_by` | string | No | Sort field: generated_at, risk_level (default: generated_at) |
| `sort_order` | string | No | ASC or DESC (default: DESC) |
| `page` | integer | No | Page number (default: 1) |
| `page_size` | integer | No | Results per page (default: 20, max: 100) |

**Success Response (200):**
```json
{
  "results": [
    {
      "uuid": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "rule_name": "Structuring Pattern Detection",
      "rule_uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "report_reference": "FIA-0156",
      "report_id": 156,
      "domain": "COMPLIANCE",
      "risk_level": "CRITICAL",
      "disposition": null,
      "generated_at": "2026-02-10T12:00:00Z"
    }
  ],
  "total": 45,
  "page": 1,
  "page_size": 20,
  "total_pages": 3
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid JWT

---

#### GET `/api/v1/alerts/{uuid}`

**Description:** Get alert detail including the full rule logic that triggered it (FR-8.8).

**Success Response (200):**
```json
{
  "uuid": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "domain": "COMPLIANCE",
  "risk_level": "CRITICAL",
  "disposition": null,
  "generated_at": "2026-02-10T12:00:00Z",
  "report": {
    "id": 156,
    "reference_number": "FIA-0156",
    "report_type": "CTR",
    "submitted_at": "2026-02-10T10:00:00Z",
    "entity_name": "Bank of Liberia"
  },
  "rule": {
    "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Structuring Pattern Detection",
    "description": "Detects potential structuring patterns in CTR transactions",
    "risk_level": "CRITICAL",
    "logical_operator": "AND",
    "conditions": [
      {
        "field": "transaction_count_30d",
        "operator": "GREATER_THAN_OR_EQUAL",
        "value": "3",
        "value_type": "NUMBER"
      },
      {
        "field": "total_value_30d",
        "operator": "GREATER_THAN",
        "value": "50000",
        "value_type": "NUMBER"
      }
    ]
  },
  "execution_details": {
    "conditions_evaluated": [
      {"field": "transaction_count_30d", "result": true, "actual_value": "5"},
      {"field": "total_value_30d", "result": true, "actual_value": "78500"}
    ],
    "executed_at": "2026-02-10T12:00:00Z"
  },
  "disposition_history": []
}
```

**Error Responses:**
- `401 Unauthorized`, `403 Forbidden`, `404 Not Found`

---

#### PATCH `/api/v1/alerts/{uuid}/disposition`

**Description:** Update alert disposition (BR-8.6).

**Request Body:**
```json
{
  "disposition": "TRUE_POSITIVE",
  "notes": "Confirmed structuring pattern across 5 transactions"
}
```

**Success Response (200):**
```json
{
  "uuid": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "disposition": "TRUE_POSITIVE",
  "disposition_by": "user-uuid",
  "disposition_at": "2026-02-11T09:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid disposition value
- `401 Unauthorized`, `403 Forbidden`, `404 Not Found`

---

#### POST `/api/v1/rules/execute`

**Description:** Trigger rule execution for a specific report. Called internally after report validation or escalation (BR-8.4).

**Request Body:**
```json
{
  "report_id": 156,
  "trigger_type": "VALIDATION",
  "report_type": "CTR"
}
```

**Success Response (200):**
```json
{
  "report_id": 156,
  "rules_evaluated": 8,
  "alerts_generated": 2,
  "execution_duration_ms": 450,
  "alerts": [
    {
      "uuid": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "rule_name": "Structuring Pattern Detection",
      "risk_level": "CRITICAL"
    }
  ]
}
```

**Error Responses:**
- `400 Bad Request`: Invalid report_id or report_type
- `401 Unauthorized`
- `404 Not Found`: Report not found

---

## 7. Data Transfer Objects (DTOs)

### 7.1 Request Schemas

#### RuleCreateRequest
```python
class RuleConditionInput(BaseModel):
    field: str = Field(..., max_length=100)
    operator: ConditionOperator
    value: str = Field(..., max_length=1000)
    value_type: ValueType

class RuleCreateRequest(BaseModel):
    name: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    domain: RuleDomain
    risk_level: RiskLevel
    logical_operator: LogicalOperator = LogicalOperator.AND
    conditions: List[RuleConditionInput] = Field(..., min_length=1, max_length=20)
```

#### RuleUpdateRequest
```python
class RuleUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    risk_level: Optional[RiskLevel] = None
    logical_operator: Optional[LogicalOperator] = None
    conditions: Optional[List[RuleConditionInput]] = Field(None, min_length=1, max_length=20)
    justification: str = Field(..., min_length=10, max_length=2000)
    expected_version: int = Field(..., ge=1)
```

#### RuleActionRequest
```python
class RuleActionRequest(BaseModel):
    justification: str = Field(..., min_length=10, max_length=2000)
```

#### AlertDispositionRequest
```python
class AlertDispositionRequest(BaseModel):
    disposition: DispositionType
    notes: Optional[str] = Field(None, max_length=2000)
```

#### RuleExecutionRequest
```python
class RuleExecutionRequest(BaseModel):
    report_id: int
    trigger_type: str = Field(..., pattern="^(VALIDATION|ESCALATION)$")
    report_type: str = Field(..., pattern="^(CTR|STR)$")
```

#### RuleListRequest
```python
class RuleListRequest(BaseModel):
    domain: Optional[RuleDomain] = None
    is_active: Optional[bool] = None
    risk_level: Optional[RiskLevel] = None
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)
```

#### AlertListRequest
```python
class AlertListRequest(BaseModel):
    domain: Optional[RuleDomain] = None
    risk_level: Optional[RiskLevel] = None
    disposition: Optional[DispositionType] = None
    rule_uuid: Optional[UUID] = None
    sort_by: str = Field("generated_at", pattern="^(generated_at|risk_level)$")
    sort_order: str = Field("DESC", pattern="^(ASC|DESC)$")
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)
```

---

### 7.2 Response Schemas

#### RuleConditionResponse
```python
class RuleConditionResponse(BaseModel):
    field: str
    operator: ConditionOperator
    value: str
    value_type: ValueType
    order_index: int
```

#### RuleSummaryResponse
```python
class RuleSummaryResponse(BaseModel):
    uuid: UUID
    name: str
    domain: RuleDomain
    risk_level: RiskLevel
    is_active: bool
    is_preconfigured: bool
    conditions_count: int
    alerts_generated: int
    created_at: datetime
```

#### RuleListResponse
```python
class RuleListResponse(BaseModel):
    results: List[RuleSummaryResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
```

#### RuleDetailResponse
```python
class RuleDetailResponse(BaseModel):
    uuid: UUID
    name: str
    description: Optional[str]
    domain: RuleDomain
    risk_level: RiskLevel
    logical_operator: LogicalOperator
    is_active: bool
    is_preconfigured: bool
    version: int
    conditions: List[RuleConditionResponse]
    alerts_generated: int
    created_by: UUID
    created_at: datetime
    updated_at: datetime
```

#### RuleCreateResponse
```python
class RuleCreateResponse(BaseModel):
    uuid: UUID
    name: str
    domain: RuleDomain
    risk_level: RiskLevel
    is_active: bool
    conditions_count: int
    created_at: datetime
    created_by: UUID
```

#### AlertReportInfo
```python
class AlertReportInfo(BaseModel):
    id: int
    reference_number: str
    report_type: str
    submitted_at: datetime
    entity_name: str
```

#### ConditionEvaluationResult
```python
class ConditionEvaluationResult(BaseModel):
    field: str
    result: bool
    actual_value: Optional[str]
```

#### AlertSummaryResponse
```python
class AlertSummaryResponse(BaseModel):
    uuid: UUID
    rule_name: str
    rule_uuid: UUID
    report_reference: str
    report_id: int
    domain: RuleDomain
    risk_level: RiskLevel
    disposition: Optional[DispositionType]
    generated_at: datetime
```

#### AlertListResponse
```python
class AlertListResponse(BaseModel):
    results: List[AlertSummaryResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
```

#### DispositionHistoryItem
```python
class DispositionHistoryItem(BaseModel):
    disposition: DispositionType
    notes: Optional[str]
    set_by: UUID
    set_at: datetime
```

#### AlertDetailResponse
```python
class AlertDetailResponse(BaseModel):
    uuid: UUID
    domain: RuleDomain
    risk_level: RiskLevel
    disposition: Optional[DispositionType]
    generated_at: datetime
    report: AlertReportInfo
    rule: RuleDetailResponse
    execution_details: dict
    disposition_history: List[DispositionHistoryItem]
```

#### AlertDispositionResponse
```python
class AlertDispositionResponse(BaseModel):
    uuid: UUID
    disposition: DispositionType
    disposition_by: UUID
    disposition_at: datetime
```

#### RuleExecutionResultResponse
```python
class RuleExecutionResultResponse(BaseModel):
    report_id: int
    rules_evaluated: int
    alerts_generated: int
    execution_duration_ms: int
    alerts: List[dict]
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
class RuleDomain(str, Enum):
    COMPLIANCE = "COMPLIANCE"
    ANALYSIS = "ANALYSIS"

class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class ConditionOperator(str, Enum):
    EQUALS = "EQUALS"
    NOT_EQUALS = "NOT_EQUALS"
    GREATER_THAN = "GREATER_THAN"
    LESS_THAN = "LESS_THAN"
    GREATER_THAN_OR_EQUAL = "GREATER_THAN_OR_EQUAL"
    LESS_THAN_OR_EQUAL = "LESS_THAN_OR_EQUAL"
    CONTAINS = "CONTAINS"
    IN = "IN"
    NOT_IN = "NOT_IN"
    BETWEEN = "BETWEEN"

class ValueType(str, Enum):
    STRING = "STRING"
    NUMBER = "NUMBER"
    BOOLEAN = "BOOLEAN"
    DATE = "DATE"
    LIST = "LIST"

class LogicalOperator(str, Enum):
    AND = "AND"
    OR = "OR"

class DispositionType(str, Enum):
    TRUE_POSITIVE = "TRUE_POSITIVE"
    FALSE_POSITIVE = "FALSE_POSITIVE"
    UNDER_INVESTIGATION = "UNDER_INVESTIGATION"

class RuleChangeType(str, Enum):
    CREATED = "CREATED"
    MODIFIED = "MODIFIED"
    DEACTIVATED = "DEACTIVATED"
    REACTIVATED = "REACTIVATED"
    DELETED = "DELETED"

class TriggerType(str, Enum):
    VALIDATION = "VALIDATION"
    ESCALATION = "ESCALATION"
```

---

## 8. Service Classes

### 8.1 RuleManagementService

**Purpose:** Core service for alert rule CRUD operations, validation, and domain separation enforcement.

#### Methods

**`create_rule(user: User, data: RuleCreateRequest) -> RuleCreateResponse`**

| Parameter | Type | Description |
|-----------|------|-------------|
| user | User | Current authenticated user |
| data | RuleCreateRequest | Rule definition data |

**Returns:** RuleCreateResponse

**Business Logic:**
1. Validate user role matches requested domain (Supervisor → COMPLIANCE, Head of Analysis → ANALYSIS)
2. Validate rule conditions (no contradictions, valid fields/operators)
3. Create alert_rule record
4. Create alert_rule_conditions records
5. Log creation in rule_change_audit_logs
6. Return created rule summary

**Dependencies:** RuleAuditService

---

**`update_rule(user: User, rule_uuid: UUID, data: RuleUpdateRequest) -> RuleDetailResponse`**

| Parameter | Type | Description |
|-----------|------|-------------|
| user | User | Current authenticated user |
| rule_uuid | UUID | Rule to update |
| data | RuleUpdateRequest | Updated rule data with justification |

**Returns:** RuleDetailResponse

**Business Logic:**
1. Fetch rule by UUID, raise RuleNotFoundError if missing
2. Validate user role matches rule domain (ERR-RULE-003)
3. Check optimistic lock: if `data.expected_version != rule.version`, raise RuleModificationConflictError (ERR-RULE-005)
4. Snapshot current rule config as `previous_config`
5. Update rule fields and increment version
6. Replace conditions (delete old, insert new)
7. Log modification in rule_change_audit_logs with justification
8. Return updated rule

**Dependencies:** RuleAuditService

---

**`deactivate_rule(user: User, rule_uuid: UUID, justification: str) -> dict`**

| Parameter | Type | Description |
|-----------|------|-------------|
| user | User | Current authenticated user |
| rule_uuid | UUID | Rule to deactivate |
| justification | str | Reason for deactivation |

**Returns:** Deactivation confirmation dict

**Business Logic:**
1. Fetch rule, validate domain access
2. Set `is_active = False`, `deactivated_at`, `deactivated_by`
3. Log deactivation in rule_change_audit_logs
4. Return confirmation

---

**`activate_rule(user: User, rule_uuid: UUID, justification: str) -> dict`**

| Parameter | Type | Description |
|-----------|------|-------------|
| user | User | Current authenticated user |
| rule_uuid | UUID | Rule to reactivate |
| justification | str | Reason for reactivation |

**Returns:** Activation confirmation dict

**Business Logic:**
1. Fetch rule, validate domain access
2. Set `is_active = True`, clear `deactivated_at`/`deactivated_by`
3. Log reactivation in rule_change_audit_logs
4. Return confirmation

---

**`delete_rule(user: User, rule_uuid: UUID, justification: str) -> dict`**

| Parameter | Type | Description |
|-----------|------|-------------|
| user | User | Current authenticated user |
| rule_uuid | UUID | Rule to delete |
| justification | str | Reason for deletion |

**Returns:** Deletion confirmation dict

**Business Logic:**
1. Fetch rule, validate domain access
2. Snapshot full rule config as `previous_config`
3. Soft-delete: set `is_active = False` and mark as deleted
4. Log deletion in rule_change_audit_logs
5. Historical alerts remain untouched
6. Return confirmation

---

**`get_rule(user: User, rule_uuid: UUID) -> RuleDetailResponse`**

| Parameter | Type | Description |
|-----------|------|-------------|
| user | User | Current authenticated user |
| rule_uuid | UUID | Rule UUID |

**Returns:** RuleDetailResponse with conditions

**Business Logic:**
1. Fetch rule by UUID with conditions
2. Validate user has access to rule domain
3. Count alerts generated by this rule
4. Return formatted response

---

**`list_rules(user: User, filters: RuleListRequest) -> RuleListResponse`**

| Parameter | Type | Description |
|-----------|------|-------------|
| user | User | Current authenticated user |
| filters | RuleListRequest | Filter/pagination parameters |

**Returns:** RuleListResponse with paginated results

**Business Logic:**
1. Determine allowed domain(s) based on user role
2. Apply filters (active status, risk level)
3. Count alerts per rule (subquery)
4. Paginate and return

---

**`validate_rule_conditions(conditions: List[RuleConditionInput]) -> tuple[bool, list[str]]`**

| Parameter | Type | Description |
|-----------|------|-------------|
| conditions | List[RuleConditionInput] | Conditions to validate |

**Returns:** (is_valid, error_messages)

**Business Logic:**
1. Validate each condition's field is a known/supported field
2. Validate operator is compatible with value_type
3. Validate value format matches value_type
4. Check for contradictory conditions
5. Return validation result

---

### 8.2 RuleExecutionService

**Purpose:** Evaluate active rules against validated reports and generate alerts.

#### Methods

**`execute_rules_for_report(report_id: int, trigger_type: TriggerType, report_type: str) -> RuleExecutionResultResponse`**

| Parameter | Type | Description |
|-----------|------|-------------|
| report_id | int | Report to evaluate |
| trigger_type | TriggerType | VALIDATION or ESCALATION |
| report_type | str | CTR or STR |

**Returns:** RuleExecutionResultResponse

**Business Logic:**
```
1. Fetch report with transactions
2. Determine domain:
   - If report_type == 'CTR' and trigger_type == 'VALIDATION' → domain = COMPLIANCE
   - If report_type == 'STR' and trigger_type == 'VALIDATION' → domain = ANALYSIS
   - If trigger_type == 'ESCALATION' → domain = ANALYSIS
3. Fetch all active rules for determined domain
4. For each rule:
   a. Evaluate all conditions against report data
   b. Apply logical_operator (AND/OR) to combine results
   c. Log execution in rule_execution_logs
   d. If rule matches:
      - Generate alert (check for existing alert first: unique rule_id + report_id)
      - Assign risk_level from rule definition
5. Return summary of execution
```

**Dependencies:** RuleConditionEvaluator (utility), RuleAuditService

**Error Handling:**
- If individual rule execution fails: log error, skip rule, continue with remaining rules (ERR-RULE-002)
- If alert generation fails: log error, queue for retry (ERR-RULE-004)

---

**`evaluate_single_rule(rule: AlertRule, report_data: dict) -> tuple[bool, list[dict]]`**

| Parameter | Type | Description |
|-----------|------|-------------|
| rule | AlertRule | Rule to evaluate |
| report_data | dict | Extracted report data for evaluation |

**Returns:** (matched, condition_results)

**Business Logic:**
1. For each condition in rule:
   - Extract actual value from report_data using `condition.field`
   - Compare using `condition.operator` and `condition.value`
   - Record result
2. Combine results using `rule.logical_operator`:
   - AND: all conditions must be True
   - OR: at least one condition must be True
3. Return match result and individual condition outcomes

---

**`extract_report_data(report: Report, transactions: List[Transaction]) -> dict`**

| Parameter | Type | Description |
|-----------|------|-------------|
| report | Report | Source report |
| transactions | List[Transaction] | Report transactions |

**Returns:** Flat dict of evaluable fields

**Business Logic:**
1. Extract direct report fields (report_type, entity_id, submitted_at)
2. Calculate aggregate transaction fields:
   - `transaction_amount`: largest single transaction
   - `total_value`: sum of all transactions
   - `transaction_count`: number of transactions
   - `total_value_30d`: sum of transactions in last 30 days for same subject
   - `transaction_count_30d`: count of transactions in last 30 days for same subject
3. Extract subject fields (subject_name, subject_country, subject_id_number)
4. Flag fields (is_pep, high_risk_jurisdiction)
5. Return flat dict

---

### 8.3 AlertService

**Purpose:** Alert queries, disposition management, and dashboard data.

#### Methods

**`list_alerts(user: User, filters: AlertListRequest) -> AlertListResponse`**

| Parameter | Type | Description |
|-----------|------|-------------|
| user | User | Current authenticated user |
| filters | AlertListRequest | Filter/pagination parameters |

**Returns:** AlertListResponse

**Business Logic:**
1. Determine visible domain based on user role (BR-8.5):
   - Compliance officers/supervisor → COMPLIANCE domain only
   - Analysts/Head of Analysis → ANALYSIS domain only
2. Apply filters (risk_level, disposition, rule_uuid)
3. Join with rules and reports for display data
4. Sort and paginate
5. Return results

---

**`get_alert_detail(user: User, alert_uuid: UUID) -> AlertDetailResponse`**

| Parameter | Type | Description |
|-----------|------|-------------|
| user | User | Current authenticated user |
| alert_uuid | UUID | Alert UUID |

**Returns:** AlertDetailResponse with full rule logic and execution details

**Business Logic:**
1. Fetch alert by UUID with related rule and report
2. Validate user can access alert domain (BR-8.5)
3. Fetch rule conditions (snapshot at rule_version)
4. Fetch execution log for this alert
5. Fetch disposition history
6. Return complete detail

---

**`update_disposition(user: User, alert_uuid: UUID, data: AlertDispositionRequest) -> AlertDispositionResponse`**

| Parameter | Type | Description |
|-----------|------|-------------|
| user | User | Current authenticated user |
| alert_uuid | UUID | Alert UUID |
| data | AlertDispositionRequest | Disposition data |

**Returns:** AlertDispositionResponse

**Business Logic:**
1. Fetch alert, validate domain access
2. Update `alerts.disposition`, `disposition_by`, `disposition_at`, `disposition_notes`
3. Insert record in `alert_dispositions` history table
4. Return confirmation

---

### 8.4 RuleAuditService

**Purpose:** Log all rule executions and rule changes for audit compliance (FR-8.12, NFR-SEC-8.2).

#### Methods

**`log_rule_execution(rule_id: int, report_id: int, rule_version: int, conditions_evaluated: dict, condition_results: dict, overall_result: bool, alert_id: Optional[int], duration_ms: Optional[int], error_message: Optional[str]) -> RuleExecutionLog`**

| Parameter | Type | Description |
|-----------|------|-------------|
| rule_id | int | Executed rule ID |
| report_id | int | Evaluated report ID |
| rule_version | int | Rule version at execution time |
| conditions_evaluated | dict | Snapshot of conditions |
| condition_results | dict | Evaluation results per condition |
| overall_result | bool | Whether rule matched |
| alert_id | Optional[int] | Generated alert ID (if any) |
| duration_ms | Optional[int] | Execution time |
| error_message | Optional[str] | Error if execution failed |

**Returns:** RuleExecutionLog record

---

**`log_rule_change(rule_id: int, change_type: RuleChangeType, changed_by: UUID, justification: str, previous_config: Optional[dict], new_config: Optional[dict]) -> RuleChangeAuditLog`**

| Parameter | Type | Description |
|-----------|------|-------------|
| rule_id | int | Affected rule ID |
| change_type | RuleChangeType | Type of change |
| changed_by | UUID | User who made change |
| justification | str | Required justification |
| previous_config | Optional[dict] | Snapshot before change |
| new_config | Optional[dict] | Snapshot after change |

**Returns:** RuleChangeAuditLog record

**Note:** This method only performs INSERT operations. The audit log table is append-only.

---

## 9. Controller Classes

### 9.1 RuleRouter

**Router Name:** RuleRouter  
**Base Path:** `/api/v1/rules`

#### Route Handlers

**POST `/`**
```python
@router.post("/", response_model=RuleCreateResponse, status_code=201)
async def create_rule(
    data: RuleCreateRequest,
    current_user: User = Depends(get_current_user),
    service: RuleManagementService = Depends()
) -> RuleCreateResponse:
    """Create a new alert rule within the user's authorized domain."""
    return await service.create_rule(current_user, data)
```

**Dependencies:** `get_current_user`, `require_roles(["compliance_officer_supervisor", "head_of_analysis"])`

---

**GET `/`**
```python
@router.get("/", response_model=RuleListResponse)
async def list_rules(
    domain: Optional[RuleDomain] = None,
    is_active: Optional[bool] = None,
    risk_level: Optional[RiskLevel] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    service: RuleManagementService = Depends()
) -> RuleListResponse:
    """List alert rules filtered by domain and user role."""
    filters = RuleListRequest(
        domain=domain, is_active=is_active,
        risk_level=risk_level, page=page, page_size=page_size
    )
    return await service.list_rules(current_user, filters)
```

**Dependencies:** `get_current_user`, `require_roles(["compliance_officer_supervisor", "head_of_analysis"])`

---

**GET `/{uuid}`**
```python
@router.get("/{uuid}", response_model=RuleDetailResponse)
async def get_rule(
    uuid: UUID,
    current_user: User = Depends(get_current_user),
    service: RuleManagementService = Depends()
) -> RuleDetailResponse:
    """Get full rule details including conditions."""
    return await service.get_rule(current_user, uuid)
```

---

**PUT `/{uuid}`**
```python
@router.put("/{uuid}", response_model=RuleDetailResponse)
async def update_rule(
    uuid: UUID,
    data: RuleUpdateRequest,
    current_user: User = Depends(get_current_user),
    service: RuleManagementService = Depends()
) -> RuleDetailResponse:
    """Update an existing rule. Requires justification and version for optimistic locking."""
    return await service.update_rule(current_user, uuid, data)
```

---

**PATCH `/{uuid}/deactivate`**
```python
@router.patch("/{uuid}/deactivate")
async def deactivate_rule(
    uuid: UUID,
    data: RuleActionRequest,
    current_user: User = Depends(get_current_user),
    service: RuleManagementService = Depends()
):
    """Deactivate a rule with justification."""
    return await service.deactivate_rule(current_user, uuid, data.justification)
```

---

**PATCH `/{uuid}/activate`**
```python
@router.patch("/{uuid}/activate")
async def activate_rule(
    uuid: UUID,
    data: RuleActionRequest,
    current_user: User = Depends(get_current_user),
    service: RuleManagementService = Depends()
):
    """Reactivate a deactivated rule with justification."""
    return await service.activate_rule(current_user, uuid, data.justification)
```

---

**DELETE `/{uuid}`**
```python
@router.delete("/{uuid}")
async def delete_rule(
    uuid: UUID,
    data: RuleActionRequest,
    current_user: User = Depends(get_current_user),
    service: RuleManagementService = Depends()
):
    """Soft-delete a rule with justification."""
    return await service.delete_rule(current_user, uuid, data.justification)
```

---

### 9.2 AlertRouter

**Router Name:** AlertRouter  
**Base Path:** `/api/v1/alerts`

#### Route Handlers

**GET `/`**
```python
@router.get("/", response_model=AlertListResponse)
async def list_alerts(
    domain: Optional[RuleDomain] = None,
    risk_level: Optional[RiskLevel] = None,
    disposition: Optional[DispositionType] = None,
    rule_uuid: Optional[UUID] = None,
    sort_by: str = Query("generated_at", pattern="^(generated_at|risk_level)$"),
    sort_order: str = Query("DESC", pattern="^(ASC|DESC)$"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    service: AlertService = Depends()
) -> AlertListResponse:
    """List alerts filtered by domain (auto-filtered by user role)."""
    filters = AlertListRequest(
        domain=domain, risk_level=risk_level, disposition=disposition,
        rule_uuid=rule_uuid, sort_by=sort_by, sort_order=sort_order,
        page=page, page_size=page_size
    )
    return await service.list_alerts(current_user, filters)
```

**Dependencies:** `get_current_user`, `require_roles(["compliance_officer", "compliance_officer_supervisor", "head_of_compliance", "analyst", "head_of_analysis"])`

---

**GET `/{uuid}`**
```python
@router.get("/{uuid}", response_model=AlertDetailResponse)
async def get_alert_detail(
    uuid: UUID,
    current_user: User = Depends(get_current_user),
    service: AlertService = Depends()
) -> AlertDetailResponse:
    """Get alert detail with triggering rule logic and execution details."""
    return await service.get_alert_detail(current_user, uuid)
```

---

**PATCH `/{uuid}/disposition`**
```python
@router.patch("/{uuid}/disposition", response_model=AlertDispositionResponse)
async def update_disposition(
    uuid: UUID,
    data: AlertDispositionRequest,
    current_user: User = Depends(get_current_user),
    service: AlertService = Depends()
) -> AlertDispositionResponse:
    """Update alert disposition (True Positive, False Positive, Under Investigation)."""
    return await service.update_disposition(current_user, uuid, data)
```

---

### 9.3 RuleExecutionRouter

**Router Name:** RuleExecutionRouter  
**Base Path:** `/api/v1/rules`

#### Route Handlers

**POST `/execute`**
```python
@router.post("/execute", response_model=RuleExecutionResultResponse)
async def execute_rules(
    data: RuleExecutionRequest,
    current_user: User = Depends(get_current_user),
    service: RuleExecutionService = Depends()
) -> RuleExecutionResultResponse:
    """Trigger rule execution for a report (internal endpoint)."""
    return await service.execute_rules_for_report(
        data.report_id, TriggerType(data.trigger_type), data.report_type
    )
```

**Dependencies:** `get_current_user` or system-level authentication for internal calls

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

### 10.2 Rule Domain Access Guard

**Purpose:** Enforce domain-level access control (BR-8.2, BR-8.3, ERR-RULE-003).

```python
class RuleDomainAccessGuard:
    """
    Validates that a user can access rules/alerts in a specific domain.
    - Compliance Officer Supervisor, Head of Compliance → COMPLIANCE domain
    - Head of Analysis → ANALYSIS domain
    - Compliance Officers → View COMPLIANCE alerts only
    - Analysts → View ANALYSIS alerts only
    """

    DOMAIN_ROLE_MAP = {
        RuleDomain.COMPLIANCE: [
            "compliance_officer_supervisor",
            "head_of_compliance",
        ],
        RuleDomain.ANALYSIS: [
            "head_of_analysis",
        ],
    }

    ALERT_VIEW_ROLE_MAP = {
        RuleDomain.COMPLIANCE: [
            "compliance_officer",
            "compliance_officer_supervisor",
            "head_of_compliance",
        ],
        RuleDomain.ANALYSIS: [
            "analyst",
            "head_of_analysis",
        ],
    }

    @staticmethod
    def can_manage_rules(user: User, domain: RuleDomain) -> bool:
        """Check if user can create/edit/delete rules in domain."""
        allowed = RuleDomainAccessGuard.DOMAIN_ROLE_MAP.get(domain, [])
        return user.role in allowed

    @staticmethod
    def can_view_alerts(user: User, domain: RuleDomain) -> bool:
        """Check if user can view alerts in domain."""
        allowed = RuleDomainAccessGuard.ALERT_VIEW_ROLE_MAP.get(domain, [])
        return user.role in allowed

    @staticmethod
    def get_user_domain(user: User) -> Optional[RuleDomain]:
        """Determine the domain a user belongs to based on role."""
        for domain, roles in RuleDomainAccessGuard.ALERT_VIEW_ROLE_MAP.items():
            if user.role in roles:
                return domain
        return None
```

---

### 10.3 Role-Based Route Guards

Uses existing `require_roles` helper from Feature 1:

```python
# Rule management endpoints
rule_manager_roles = require_roles(["compliance_officer_supervisor", "head_of_analysis"])

# Alert viewing endpoints
alert_viewer_roles = require_roles([
    "compliance_officer", "compliance_officer_supervisor", "head_of_compliance",
    "analyst", "head_of_analysis"
])
```

---

## 11. Utilities and Helpers

### 11.1 RuleConditionEvaluator

**Purpose:** Evaluate individual rule conditions against report data.

#### Functions

**`evaluate_condition(condition: AlertRuleCondition, report_data: dict) -> tuple[bool, Optional[str]]`**

| Parameter | Type | Description |
|-----------|------|-------------|
| condition | AlertRuleCondition | Condition to evaluate |
| report_data | dict | Extracted report data |

**Returns:** (result, actual_value)

**Logic:**
```python
def evaluate_condition(condition, report_data):
    actual_value = report_data.get(condition.field)
    if actual_value is None:
        return (False, None)  # Field not present, condition not met

    expected = cast_value(condition.value, condition.value_type)
    actual = cast_value(str(actual_value), condition.value_type)

    match condition.operator:
        case "EQUALS":
            return (actual == expected, str(actual_value))
        case "NOT_EQUALS":
            return (actual != expected, str(actual_value))
        case "GREATER_THAN":
            return (actual > expected, str(actual_value))
        case "LESS_THAN":
            return (actual < expected, str(actual_value))
        case "GREATER_THAN_OR_EQUAL":
            return (actual >= expected, str(actual_value))
        case "LESS_THAN_OR_EQUAL":
            return (actual <= expected, str(actual_value))
        case "CONTAINS":
            return (expected in str(actual), str(actual_value))
        case "IN":
            return (actual in json.loads(condition.value), str(actual_value))
        case "NOT_IN":
            return (actual not in json.loads(condition.value), str(actual_value))
        case "BETWEEN":
            bounds = json.loads(condition.value)
            return (bounds[0] <= actual <= bounds[1], str(actual_value))
```

---

**`cast_value(value: str, value_type: ValueType) -> Any`**

| Parameter | Type | Description |
|-----------|------|-------------|
| value | str | Raw string value |
| value_type | ValueType | Target type |

**Returns:** Typed value

**Logic:**
```python
def cast_value(value: str, value_type: ValueType):
    match value_type:
        case "NUMBER":
            return Decimal(value)
        case "BOOLEAN":
            return value.lower() in ("true", "1", "yes")
        case "DATE":
            return datetime.fromisoformat(value).date()
        case "LIST":
            return json.loads(value)
        case _:  # STRING
            return str(value)
```

---

### 11.2 ReportDataExtractor

**Purpose:** Extract evaluable fields from a report and its transactions for rule evaluation.

#### Functions

**`extract_report_fields(report: Report, transactions: List[Transaction]) -> dict`**

| Parameter | Type | Description |
|-----------|------|-------------|
| report | Report | Source report |
| transactions | List[Transaction] | Report transactions |

**Returns:** Flat dict of field name → value

**Supported Fields:**

| Field Name | Source | Type | Description |
|------------|--------|------|-------------|
| `report_type` | report.report_type | STRING | CTR or STR |
| `entity_id` | report.entity_id | NUMBER | Reporting entity |
| `transaction_amount` | max(transactions.amount) | NUMBER | Largest single transaction |
| `total_value` | sum(transactions.amount) | NUMBER | Total transaction value |
| `transaction_count` | len(transactions) | NUMBER | Number of transactions |
| `subject_name` | transactions[0].subject_name | STRING | Primary subject name |
| `subject_id_number` | transactions[0].subject_id_number | STRING | Subject identifier |
| `subject_country` | transactions[0].subject_country | STRING | Subject country |
| `transaction_date` | transactions[0].transaction_date | DATE | Transaction date |
| `is_pep` | derived | BOOLEAN | Subject is PEP |
| `high_risk_jurisdiction` | derived | BOOLEAN | Involves high-risk jurisdiction |
| `transaction_count_30d` | calculated | NUMBER | Subject transactions in last 30 days |
| `total_value_30d` | calculated | NUMBER | Subject total value in last 30 days |

---

### 11.3 PreConfiguredRuleSeeder

**Purpose:** Seed the 10 pre-configured AML rules at deployment (BR-8.8).

#### Functions

**`seed_preconfigured_rules(session: AsyncSession) -> List[AlertRule]`**

**Returns:** List of created pre-configured rules

**Pre-configured Rules:**

**Compliance-Level Rules (5):**

| # | Name | Conditions | Risk Level |
|---|------|-----------|------------|
| 1 | Structuring Pattern Detection | transaction_count_30d >= 3 AND total_value_30d > 50000 | CRITICAL |
| 2 | Threshold Proximity Detection | transaction_amount BETWEEN [8000, 9999] | HIGH |
| 3 | High Frequency CTR Detection | transaction_count_30d >= 5 | MEDIUM |
| 4 | Large Single Transaction | transaction_amount > 100000 | HIGH |
| 5 | Round Amount Pattern | transaction_amount IN [10000, 20000, 50000, 100000] | MEDIUM |

**Analysis-Level Rules (5):**

| # | Name | Conditions | Risk Level |
|---|------|-----------|------------|
| 6 | PEP Involvement Detection | is_pep EQUALS true | CRITICAL |
| 7 | High-Risk Jurisdiction | high_risk_jurisdiction EQUALS true | HIGH |
| 8 | Large Value STR | total_value > 100000 | HIGH |
| 9 | Multiple Subjects STR | transaction_count >= 5 | MEDIUM |
| 10 | Rapid Successive Transactions | transaction_count_30d >= 10 AND total_value_30d > 25000 | HIGH |

---

## 12. Configuration and Settings

### 12.1 RuleEngineSettings

```python
class RuleEngineSettings(BaseSettings):
    """Configuration for Rule-Based Analysis & Alert Generation feature."""

    # Rule execution
    RULE_EXECUTION_TIMEOUT_SECONDS: int = 30
    MAX_CONDITIONS_PER_RULE: int = 20
    MAX_ACTIVE_RULES_PER_DOMAIN: int = 100

    # Alert generation
    ALERT_GENERATION_RETRY_ATTEMPTS: int = 3
    ALERT_GENERATION_RETRY_DELAY_SECONDS: int = 5

    # Audit
    RULE_AUDIT_RETENTION_DAYS: int = 2555  # ~7 years
    EXECUTION_LOG_RETENTION_DAYS: int = 365

    # Performance
    RULE_EXECUTION_BATCH_SIZE: int = 50
    MAX_ALERTS_PER_REPORT: int = 50

    # Pre-configured rules
    SEED_PRECONFIGURED_RULES: bool = True

    class Config:
        env_prefix = "RULE_ENGINE_"
```

### 12.2 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `RULE_ENGINE_EXECUTION_TIMEOUT_SECONDS` | 30 | Max time for single rule evaluation |
| `RULE_ENGINE_MAX_CONDITIONS_PER_RULE` | 20 | Max conditions per combination rule |
| `RULE_ENGINE_MAX_ACTIVE_RULES_PER_DOMAIN` | 100 | Max active rules per domain |
| `RULE_ENGINE_ALERT_GENERATION_RETRY_ATTEMPTS` | 3 | Retry count for failed alert generation |
| `RULE_ENGINE_RULE_AUDIT_RETENTION_DAYS` | 2555 | Audit log retention period |
| `RULE_ENGINE_SEED_PRECONFIGURED_RULES` | True | Whether to seed pre-configured rules |

---

## 13. Database Migrations

### 13.1 Initial Migration: `001_create_rule_engine_tables`

**Tables Created:**
- `alert_rules`
- `alert_rule_conditions`
- `alerts`
- `alert_dispositions`
- `rule_execution_logs`
- `rule_change_audit_logs`

**Enum Types Created:**
- `rule_domain_enum`: COMPLIANCE, ANALYSIS
- `risk_level_enum`: LOW, MEDIUM, HIGH, CRITICAL
- `condition_operator_enum`: EQUALS, NOT_EQUALS, GREATER_THAN, LESS_THAN, GREATER_THAN_OR_EQUAL, LESS_THAN_OR_EQUAL, CONTAINS, IN, NOT_IN, BETWEEN
- `value_type_enum`: STRING, NUMBER, BOOLEAN, DATE, LIST
- `logical_operator_enum`: AND, OR
- `disposition_type_enum`: TRUE_POSITIVE, FALSE_POSITIVE, UNDER_INVESTIGATION
- `rule_change_type_enum`: CREATED, MODIFIED, DEACTIVATED, REACTIVATED, DELETED

**Indexes Created:**
- All indexes defined in Section 5.2

**Foreign Keys:**
- `alert_rule_conditions.rule_id` → `alert_rules.id` (ON DELETE CASCADE)
- `alerts.rule_id` → `alert_rules.id` (ON DELETE RESTRICT)
- `alerts.report_id` → `reports.id` (ON DELETE RESTRICT)
- `alerts.disposition_by` → `users.id` (ON DELETE SET NULL)
- `alert_dispositions.alert_id` → `alerts.id` (ON DELETE CASCADE)
- `alert_dispositions.set_by` → `users.id` (ON DELETE SET NULL)
- `rule_execution_logs.rule_id` → `alert_rules.id` (ON DELETE RESTRICT)
- `rule_execution_logs.report_id` → `reports.id` (ON DELETE RESTRICT)
- `rule_execution_logs.alert_id` → `alerts.id` (ON DELETE SET NULL)
- `rule_change_audit_logs.rule_id` → `alert_rules.id` (ON DELETE RESTRICT)
- `rule_change_audit_logs.changed_by` → `users.id` (ON DELETE RESTRICT)
- `alert_rules.created_by` → `users.id` (ON DELETE RESTRICT)
- `alert_rules.deactivated_by` → `users.id` (ON DELETE SET NULL)

### 13.2 Seed Migration: `002_seed_preconfigured_rules`

**Purpose:** Insert the 10 pre-configured AML rules (BR-8.8).

**Data Inserted:**
- 5 compliance-level rules (see Section 11.3)
- 5 analysis-level rules (see Section 11.3)
- Associated conditions for each rule
- Audit log entries for each creation

**Note:** Pre-configured rules have `is_preconfigured = TRUE` and `created_by` set to a system user UUID.

---

## 14. Error Handling

### 14.1 Custom Exceptions

#### RuleNotFoundError
```python
class RuleNotFoundError(Exception):
    """Raised when alert rule is not found."""
    def __init__(self, uuid: UUID):
        self.uuid = uuid
        self.message = f"Alert rule not found: {uuid}"
        super().__init__(self.message)
```
**HTTP Status:** 404 Not Found  
**Error Code:** `RULE_NOT_FOUND`

---

#### AlertNotFoundError
```python
class AlertNotFoundError(Exception):
    """Raised when alert is not found."""
    def __init__(self, uuid: UUID):
        self.uuid = uuid
        self.message = f"Alert not found: {uuid}"
        super().__init__(self.message)
```
**HTTP Status:** 404 Not Found  
**Error Code:** `ALERT_NOT_FOUND`

---

#### RuleDomainAccessDeniedError
```python
class RuleDomainAccessDeniedError(Exception):
    """Raised when user attempts cross-domain rule access (ERR-RULE-003)."""
    def __init__(self, user_role: str, target_domain: str):
        self.user_role = user_role
        self.target_domain = target_domain
        if target_domain == "ANALYSIS":
            self.message = "Permission Denied - Analysis rules managed by Head of Analysis"
        else:
            self.message = "Permission Denied - Compliance rules managed by Compliance Officer Supervisor"
        super().__init__(self.message)
```
**HTTP Status:** 403 Forbidden  
**Error Code:** `DOMAIN_ACCESS_DENIED`

---

#### RuleValidationError
```python
class RuleValidationError(Exception):
    """Raised when rule definition is invalid (ERR-RULE-001)."""
    def __init__(self, errors: list[str]):
        self.errors = errors
        self.message = f"Rule validation failed: {'; '.join(errors)}"
        super().__init__(self.message)
```
**HTTP Status:** 400 Bad Request  
**Error Code:** `RULE_VALIDATION_ERROR`

---

#### RuleModificationConflictError
```python
class RuleModificationConflictError(Exception):
    """Raised on concurrent rule modification (ERR-RULE-005)."""
    def __init__(self, rule_uuid: UUID):
        self.rule_uuid = rule_uuid
        self.message = "Rule is currently being modified by another user. Please try again in a moment."
        super().__init__(self.message)
```
**HTTP Status:** 409 Conflict  
**Error Code:** `RULE_MODIFICATION_CONFLICT`

---

#### RuleExecutionError
```python
class RuleExecutionError(Exception):
    """Raised when rule execution fails (ERR-RULE-002)."""
    def __init__(self, rule_id: int, report_id: int, reason: str):
        self.rule_id = rule_id
        self.report_id = report_id
        self.reason = reason
        self.message = f"Rule execution failed for rule {rule_id} on report {report_id}: {reason}"
        super().__init__(self.message)
```
**Note:** Not returned to end users. Logged internally.

---

#### AlertGenerationError
```python
class AlertGenerationError(Exception):
    """Raised when alert generation fails after rule match (ERR-RULE-004)."""
    def __init__(self, rule_id: int, report_id: int, reason: str):
        self.rule_id = rule_id
        self.report_id = report_id
        self.reason = reason
        self.message = f"Alert generation failed: {reason}"
        super().__init__(self.message)
```
**Note:** Not returned to end users. Triggers retry logic.

---

### 14.2 Exception Handlers

```python
@app.exception_handler(RuleNotFoundError)
async def rule_not_found_handler(request: Request, exc: RuleNotFoundError):
    return JSONResponse(
        status_code=404,
        content={
            "error_code": "RULE_NOT_FOUND",
            "error_message": exc.message,
            "details": {"uuid": str(exc.uuid)},
            "timestamp": datetime.utcnow().isoformat()
        }
    )

@app.exception_handler(AlertNotFoundError)
async def alert_not_found_handler(request: Request, exc: AlertNotFoundError):
    return JSONResponse(
        status_code=404,
        content={
            "error_code": "ALERT_NOT_FOUND",
            "error_message": exc.message,
            "details": {"uuid": str(exc.uuid)},
            "timestamp": datetime.utcnow().isoformat()
        }
    )

@app.exception_handler(RuleDomainAccessDeniedError)
async def domain_access_denied_handler(request: Request, exc: RuleDomainAccessDeniedError):
    return JSONResponse(
        status_code=403,
        content={
            "error_code": "DOMAIN_ACCESS_DENIED",
            "error_message": exc.message,
            "details": {"target_domain": exc.target_domain},
            "timestamp": datetime.utcnow().isoformat()
        }
    )

@app.exception_handler(RuleValidationError)
async def rule_validation_handler(request: Request, exc: RuleValidationError):
    return JSONResponse(
        status_code=400,
        content={
            "error_code": "RULE_VALIDATION_ERROR",
            "error_message": "Rule definition validation failed",
            "details": {"errors": exc.errors},
            "timestamp": datetime.utcnow().isoformat()
        }
    )

@app.exception_handler(RuleModificationConflictError)
async def rule_conflict_handler(request: Request, exc: RuleModificationConflictError):
    return JSONResponse(
        status_code=409,
        content={
            "error_code": "RULE_MODIFICATION_CONFLICT",
            "error_message": exc.message,
            "details": {"rule_uuid": str(exc.rule_uuid)},
            "timestamp": datetime.utcnow().isoformat()
        }
    )
```

---

## 15. Testing Considerations

### 15.1 Unit Tests

**RuleManagementService Tests:**
- `test_create_rule_compliance_domain`: Supervisor creates compliance rule
- `test_create_rule_analysis_domain`: Head of Analysis creates analysis rule
- `test_create_rule_cross_domain_denied`: Supervisor cannot create analysis rule
- `test_update_rule_with_justification`: Rule updated and audit logged
- `test_update_rule_version_conflict`: Concurrent modification rejected
- `test_deactivate_rule`: Rule deactivated with audit trail
- `test_delete_rule_preserves_alerts`: Soft-delete keeps historical alerts
- `test_validate_conditions_invalid`: Invalid conditions rejected
- `test_list_rules_domain_filtered`: User sees only their domain rules

**RuleExecutionService Tests:**
- `test_execute_compliance_rules_on_ctr`: Compliance rules triggered for CTR validation
- `test_execute_analysis_rules_on_str`: Analysis rules triggered for STR validation
- `test_execute_analysis_rules_on_escalated_ctr`: Analysis rules triggered on escalation
- `test_compliance_rules_not_on_str`: Compliance rules skipped for STRs (BR-8.2)
- `test_analysis_rules_not_on_non_escalated_ctr`: Analysis rules skipped (BR-8.3)
- `test_and_operator_all_conditions_match`: AND requires all conditions true
- `test_or_operator_any_condition_match`: OR requires any condition true
- `test_no_duplicate_alerts`: Same rule+report does not generate duplicate alert
- `test_rule_execution_failure_skips`: Failed rule skipped, others continue (ERR-RULE-002)

**AlertService Tests:**
- `test_list_alerts_compliance_domain`: Compliance officers see only compliance alerts
- `test_list_alerts_analysis_domain`: Analysts see only analysis alerts
- `test_update_disposition_true_positive`: Disposition set and history recorded
- `test_alert_detail_includes_rule_logic`: Detail includes triggering rule conditions
- `test_cross_domain_alert_access_denied`: Users cannot view other domain's alerts

**RuleConditionEvaluator Tests:**
- `test_equals_operator`: String equality check
- `test_greater_than_numeric`: Numeric comparison
- `test_between_operator`: Range check
- `test_in_operator_list`: Value in list check
- `test_contains_operator`: Substring check
- `test_null_field_returns_false`: Missing field does not match

### 15.2 Integration Tests

**API Endpoint Tests:**
- `test_create_rule_endpoint`: POST /rules returns 201
- `test_create_rule_invalid_body`: POST /rules returns 400
- `test_list_rules_pagination`: GET /rules with pagination
- `test_update_rule_optimistic_lock`: PUT /rules/{uuid} with version check
- `test_deactivate_rule_endpoint`: PATCH /rules/{uuid}/deactivate
- `test_list_alerts_endpoint`: GET /alerts with filters
- `test_alert_detail_endpoint`: GET /alerts/{uuid} with full detail
- `test_disposition_endpoint`: PATCH /alerts/{uuid}/disposition
- `test_rule_execution_endpoint`: POST /rules/execute generates alerts
- `test_domain_access_enforcement`: Cross-domain access returns 403

### 15.3 Test Fixtures

```python
@pytest.fixture
def compliance_supervisor_user():
    return User(id=uuid4(), role="compliance_officer_supervisor", username="supervisor1")

@pytest.fixture
def head_of_analysis_user():
    return User(id=uuid4(), role="head_of_analysis", username="analysis_head")

@pytest.fixture
def compliance_officer_user():
    return User(id=uuid4(), role="compliance_officer", username="officer1")

@pytest.fixture
def analyst_user():
    return User(id=uuid4(), role="analyst", username="analyst1")

@pytest.fixture
def sample_compliance_rule():
    return {
        "name": "High-Value CTR Detection",
        "description": "Flag CTRs with high transaction amounts",
        "domain": "COMPLIANCE",
        "risk_level": "HIGH",
        "logical_operator": "AND",
        "conditions": [
            {"field": "transaction_amount", "operator": "GREATER_THAN", "value": "50000", "value_type": "NUMBER"}
        ]
    }

@pytest.fixture
def sample_analysis_rule():
    return {
        "name": "PEP Involvement Detection",
        "description": "Flag reports involving PEPs",
        "domain": "ANALYSIS",
        "risk_level": "CRITICAL",
        "logical_operator": "AND",
        "conditions": [
            {"field": "is_pep", "operator": "EQUALS", "value": "true", "value_type": "BOOLEAN"}
        ]
    }

@pytest.fixture
def sample_ctr_report():
    return Report(id=1, reference_number="FIA-0156", report_type="CTR", status="validated")

@pytest.fixture
def sample_transactions():
    return [
        Transaction(id=1, report_id=1, transaction_amount=Decimal("58500"), subject_name="Sarah K.")
    ]
```

---

## 16. Security Considerations

### 16.1 Access Control

**Role-Based Domain Separation:**
- Compliance Officer Supervisor can only manage COMPLIANCE rules
- Head of Analysis can only manage ANALYSIS rules
- Cross-domain access is denied at both API and service layer (ERR-RULE-003)
- Alert visibility restricted to user's domain (BR-8.5)

**Data Isolation:**
- Users cannot view or modify rules outside their domain
- Alert queries auto-filtered by user role
- No sensitive rule data exposed in public responses

### 16.2 Audit Logging

**Immutable Audit Trail (NFR-SEC-8.2):**
- `rule_change_audit_logs` table is append-only
- No UPDATE or DELETE operations on audit log
- All rule changes require justification (BR-8.7)
- Audit entries include: timestamp, user, rule ID, change type, justification, before/after snapshots

**Rule Execution Logging (FR-8.12):**
- Every rule execution logged with full context
- Includes conditions evaluated, results, alert generated
- Supports forensic investigation and compliance reporting

### 16.3 Data Protection

**Encryption:**
- All data encrypted at rest (PostgreSQL encryption)
- All API communication over TLS 1.2+

**Input Validation:**
- All inputs validated via Pydantic schemas
- SQL injection prevented via ORM parameterized queries
- Rule condition values validated against expected types
- Maximum conditions per rule enforced (prevent DoS via complex rules)

### 16.4 Optimistic Locking

- Rule modifications require `expected_version` matching current `version`
- Prevents concurrent modification conflicts (ERR-RULE-005)
- Version incremented on each successful update

---

## 17. Dependencies Between Components

### 17.1 Component Interaction Diagram

```
┌─────────────────┐     ┌─────────────────┐
│   RuleRouter    │     │   AlertRouter   │
└────────┬────────┘     └────────┬────────┘
         │                       │
         ▼                       ▼
┌─────────────────────────┐  ┌──────────────────┐
│ RuleManagementService   │  │   AlertService   │
└────────┬────────────────┘  └────────┬─────────┘
         │                            │
         ├────────────────────┐       │
         │                    │       │
         ▼                    ▼       │
┌──────────────────┐  ┌─────────────────────────┐
│ RuleAuditService │  │  RuleExecutionService   │
└──────────────────┘  └────────┬────────────────┘
                               │
                      ┌────────┴────────┐
                      │                 │
                      ▼                 ▼
           ┌──────────────────┐  ┌──────────────────┐
           │ConditionEvaluator│  │ReportDataExtractor│
           │   (Utility)      │  │   (Utility)       │
           └──────────────────┘  └──────────────────┘
```

### 17.2 External Dependencies

| Dependency | Source | Usage |
|------------|--------|-------|
| User model | Feature 1 | Current user context, role checking |
| Report model | Feature 2/3 | Report data for rule evaluation |
| Transaction model | Shared | Transaction data for condition evaluation |
| RBAC guards | Feature 1 | `require_roles`, `get_current_user` |
| Validation pipeline | Feature 4/5 | Triggers rule execution after validation |
| Escalation workflow | Feature 6 | Triggers analysis rules on CTR escalation |

### 17.3 Service Dependencies

```python
# RuleManagementService dependencies
class RuleManagementService:
    def __init__(
        self,
        session: AsyncSession,
        audit_service: RuleAuditService,
        domain_guard: RuleDomainAccessGuard
    ):
        self.session = session
        self.audit_service = audit_service
        self.domain_guard = domain_guard

# RuleExecutionService dependencies
class RuleExecutionService:
    def __init__(
        self,
        session: AsyncSession,
        condition_evaluator: RuleConditionEvaluator,
        report_extractor: ReportDataExtractor,
        audit_service: RuleAuditService
    ):
        self.session = session
        self.condition_evaluator = condition_evaluator
        self.report_extractor = report_extractor
        self.audit_service = audit_service

# AlertService dependencies
class AlertService:
    def __init__(
        self,
        session: AsyncSession,
        domain_guard: RuleDomainAccessGuard
    ):
        self.session = session
        self.domain_guard = domain_guard
```

---

## 18. Implementation Order

### 18.1 Recommended Sequence

**Sprint 1: Foundation (Week 1-2)**
1. Database migrations (create all tables and enums)
2. SQLModel entity definitions for all 6 tables
3. Enum definitions and Pydantic DTOs
4. Configuration settings
5. Seed migration for 10 pre-configured rules

**Sprint 2: Core Services (Week 3-4)**
6. RuleConditionEvaluator utility
7. ReportDataExtractor utility
8. RuleDomainAccessGuard middleware
9. RuleAuditService (execution and change logging)
10. RuleManagementService (CRUD, validation)

**Sprint 3: Execution & Alerts (Week 5-6)**
11. RuleExecutionService (evaluation engine, alert generation)
12. AlertService (queries, disposition updates)
13. RuleRouter endpoints
14. AlertRouter endpoints
15. RuleExecutionRouter endpoint

**Sprint 4: Integration & Testing (Week 7-8)**
16. Integration with validation pipeline (Feature 4/5 triggers)
17. Integration with escalation workflow (Feature 6 triggers)
18. Error handling and exception handlers
19. Unit tests for all services and utilities
20. Integration tests for all endpoints
21. Security review and audit compliance verification

### 18.2 Component Dependencies

```
Database Migrations + Seed Data
       ↓
Entity Models + DTOs + Enums
       ↓
RuleDomainAccessGuard (Middleware)
       ↓
RuleAuditService
       ↓
RuleConditionEvaluator + ReportDataExtractor (Utilities)
       ↓
RuleManagementService
       ↓
RuleExecutionService
       ↓
AlertService
       ↓
Routers (RuleRouter, AlertRouter, RuleExecutionRouter)
       ↓
Integration with Features 4, 5, 6
```

---

## 19. Business Logic Specifications

### 19.1 Rule Execution Workflow (BR-8.4)

```
Report Validated / CTR Escalated
       ↓
Determine Domain:
  ├── CTR Validated → COMPLIANCE
  ├── STR Validated → ANALYSIS
  └── CTR Escalated → ANALYSIS
       ↓
Fetch Active Rules for Domain
       ↓
For Each Rule:
  ├── Extract Report Data
  ├── Evaluate Each Condition
  ├── Combine Results (AND/OR)
  ├── Log Execution in rule_execution_logs
  │     ├── If Match → Generate Alert
  │     │     ├── Check for duplicate (rule_id + report_id)
  │     │     ├── Create alert with risk_level from rule
  │     │     └── Log alert in execution log
  │     └── If No Match → Log as non-match
  └── Handle Errors:
        ├── Log error in execution log
        ├── Skip failed rule
        └── Continue with remaining rules
       ↓
Return Execution Summary
```

### 19.2 Domain Separation Logic (BR-8.2, BR-8.3)

```
Rule Execution Triggered
       ↓
Check Report Type + Trigger Type:
       ↓
If report_type == 'CTR' AND trigger_type == 'VALIDATION':
  → Execute COMPLIANCE rules ONLY
  → Do NOT execute ANALYSIS rules
       ↓
If report_type == 'STR' AND trigger_type == 'VALIDATION':
  → Execute ANALYSIS rules ONLY
  → Do NOT execute COMPLIANCE rules (STRs bypass compliance)
       ↓
If trigger_type == 'ESCALATION':
  → Execute ANALYSIS rules ONLY
  → CTR is now in analysis domain
```

### 19.3 Alert Visibility Logic (BR-8.5)

```
User Requests Alerts
       ↓
Determine User Role
       ↓
If compliance_officer / compliance_officer_supervisor / head_of_compliance:
  → Show COMPLIANCE domain alerts ONLY
  → Filter: alerts.domain = 'COMPLIANCE'
       ↓
If analyst / head_of_analysis:
  → Show ANALYSIS domain alerts ONLY
  → Filter: alerts.domain = 'ANALYSIS'
       ↓
No cross-domain visibility permitted
```

### 19.4 Risk Level Assignment (BR-8.1)

```
Rule Condition Met → Generate Alert
       ↓
Alert.risk_level = Rule.risk_level
       ↓
Risk level is defined at rule creation time
Risk level cannot be manually overridden during alert generation
Risk levels: LOW, MEDIUM, HIGH, CRITICAL
```

### 19.5 Alert Disposition Workflow (BR-8.6)

```
Alert Generated (disposition = NULL)
       ↓
User Reviews Alert:
  ├── Views alert detail with rule logic (FR-8.8)
  ├── Reviews report data
  └── Makes determination
       ↓
User Sets Disposition:
  ├── TRUE_POSITIVE: Alert correctly identified suspicious activity
  ├── FALSE_POSITIVE: Alert incorrectly flagged legitimate activity
  └── UNDER_INVESTIGATION: Requires further review
       ↓
System Records:
  ├── Update alerts.disposition
  ├── Insert alert_dispositions history record
  └── Record user, timestamp, notes
       ↓
Disposition can be changed (new history entry created)
```

### 19.6 Rule Modification Audit (BR-8.7)

```
User Requests Rule Change (modify/deactivate/delete)
       ↓
Validate:
  ├── User role matches rule domain
  ├── Justification provided (min 10 chars)
  └── Version matches (for updates)
       ↓
Snapshot:
  ├── Capture previous rule configuration (JSON)
  └── Capture new rule configuration (JSON)
       ↓
Execute Change
       ↓
Log in rule_change_audit_logs:
  ├── rule_id, change_type
  ├── changed_by (user UUID)
  ├── justification (required text)
  ├── previous_config (JSON snapshot)
  ├── new_config (JSON snapshot)
  └── changed_at (timestamp)
       ↓
Audit log is immutable (append-only)
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
| 1.0 | February 2026 | Senior Technical Designer | Initial FDD-BE for Rule-Based Analysis & Alert Generation |

---

**Document End**
