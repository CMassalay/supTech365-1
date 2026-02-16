# Frontend Feature Design Document (FDD-FE)
## Feature 8: Rule-Based Analysis & Alert Generation

**Document Version:** 1.0  
**Date:** February 2026  
**Feature Name:** Rule-Based Analysis & Alert Generation  
**Product/System Name:** SupTech365  
**Related FRD Version:** frd_rule_based_analysis_alert_generation.md v1.0  
**Related Backend FDD:** fdd_be_rule_based_analysis_alert_generation.md v1.0  
**Status:** Draft  
**Last Updated Date:** February 2026

---

## 1. Feature Context

### 1.1 Feature Name
Rule-Based Analysis & Alert Generation - Frontend

### 1.2 Feature Description
The frontend provides authorized users with interfaces to define and manage alert rules, view generated alerts on role-specific dashboards, and set alert dispositions. Compliance Officer Supervisors manage compliance-level rules, while Heads of Analysis manage analysis-level rules. Officers and analysts view alerts filtered to their domain and can review triggering rule logic and set dispositions.

### 1.3 Feature Purpose
Enable FIA staff to:
- Define, modify, deactivate, and delete alert rules through a non-technical interface (NFR-USAB-8.1)
- View generated alerts on role-specific dashboards (compliance vs. analysis)
- Review alert detail including the rule logic that triggered each alert (FR-8.8)
- Mark alert dispositions (True Positive, False Positive, Under Investigation)
- Browse and filter rules and alerts by risk level, status, and domain

### 1.4 Related Features
- **Feature 1 (Authentication)**: User authentication and role-based access control
- **Feature 4 (Automated Validation)**: CTR validation triggers compliance-level rule execution
- **Feature 5 (Manual Validation)**: STR validation triggers analysis-level rule execution
- **Feature 6 (Task Assignment)**: CTR escalation triggers analysis-level rule execution
- **Feature 8 BE (This feature's backend)**: All API endpoints for rules and alerts

### 1.5 User Types
- **Compliance Officer Supervisor**: Defines, modifies, deactivates, deletes compliance-level rules
- **Head of Analysis**: Defines, modifies, deactivates, deletes analysis-level rules
- **Compliance Officers / Head of Compliance**: View compliance-level alerts, set dispositions
- **Analysts**: View analysis-level alerts, set dispositions

---

## 2. Technology Stack Reference

| Category | Selection |
|----------|-----------|
| **Framework** | React 18 with TypeScript |
| **State Management** | React Query (TanStack Query) + Zustand |
| **UI Library** | Tailwind CSS + shadcn/ui |
| **Build Tool** | Vite |
| **Testing Framework** | Vitest + React Testing Library |
| **Rendering Paradigm** | Client-Side Rendering (SPA) |
| **Form Management** | React Hook Form + Zod |
| **Routing** | React Router v6 |
| **Icons** | Lucide React |

---

## 3. Rendering Paradigm Selection

### 3.1 Selected Paradigm
**Client-Side Rendering (SPA)**

### 3.2 Paradigm Implications

- **State Management**: React Query for server state (rules, alerts, execution results), Zustand for UI state (filters, selected items, modal state)
- **Routing**: React Router v6 with client-side routing, route guards for authentication and role-based access
- **API Integration**: Fetch API with React Query for data fetching, caching, mutations with optimistic updates
- **State Persistence**: URL parameters for filter/pagination state (shareable), localStorage for view preferences
- **Navigation**: Programmatic navigation, no page refreshes, deep linking for alert detail

---

## 4. Architecture Pattern

### 4.1 Component-Based Architecture

```
App
├── Layout Components
│   ├── MainLayout
│   ├── Sidebar
│   └── TopNav
├── Feature Components (Rule-Based Analysis & Alerts)
│   ├── Pages
│   │   ├── RuleListPage
│   │   ├── RuleCreatePage
│   │   ├── RuleEditPage
│   │   ├── RuleDetailPage
│   │   ├── AlertListPage
│   │   └── AlertDetailPage
│   ├── Rule Components
│   │   ├── RuleTable
│   │   ├── RuleTableRow
│   │   ├── RuleForm
│   │   ├── RuleConditionBuilder
│   │   ├── RuleConditionRow
│   │   ├── RuleStatusBadge
│   │   ├── RuleDetailCard
│   │   ├── RuleConditionsList
│   │   ├── RuleActionBar
│   │   └── JustificationModal
│   ├── Alert Components
│   │   ├── AlertTable
│   │   ├── AlertTableRow
│   │   ├── AlertDetailCard
│   │   ├── AlertRuleLogicCard
│   │   ├── AlertReportCard
│   │   ├── AlertExecutionDetailsCard
│   │   ├── AlertDispositionForm
│   │   ├── AlertDispositionHistory
│   │   └── AlertFilters
│   └── Shared Components
│       ├── RiskLevelBadge
│       ├── DomainBadge
│       ├── DispositionBadge
│       └── ConditionOperatorLabel
├── Hooks
│   ├── useRules
│   ├── useRuleDetail
│   ├── useCreateRule
│   ├── useUpdateRule
│   ├── useRuleActions (deactivate/activate/delete)
│   ├── useAlerts
│   ├── useAlertDetail
│   └── useUpdateDisposition
├── Stores
│   └── ruleAlertStore.ts
└── Types
    └── ruleAlert.types.ts
```

### 4.2 State Management Pattern

| State Type | Library | Purpose |
|------------|---------|---------|
| **Server State** | React Query | Rules, alerts, rule detail, alert detail with caching + mutations |
| **UI State** | Zustand | Active filters, modal visibility, selected items |
| **Form State** | React Hook Form | Rule create/edit forms, disposition form, justification modals |
| **URL State** | React Router | Filter params, pagination, sort order (shareable URLs) |

### 4.3 Routing Pattern

- Client-side routing with React Router v6
- Protected routes requiring authentication
- Role-based route guards (rule management restricted to supervisors)
- URL parameters for filter/sort/pagination state
- Nested routes for rule and alert detail pages

---

## 5. Screen List + Wireframes

### 5.1 Rule List Screen

**Screen Name:** Rule List  
**Route:** `/rules`  
**Purpose:** Browse and manage alert rules within the user's authorized domain.

#### Wireframe

```
┌──────────────────────────────────────────────────────────────────────┐
│ [Sidebar]  │  Alert Rules                          [+ Create Rule]   │
│            │  ────────────────────────────────────────────────────── │
│ Dashboard  │                                                         │
│ Rules    ◄─│  Domain: COMPLIANCE          (auto-set by role)        │
│ Alerts     │                                                         │
│ Reports    │  Filter: [All Statuses ▼] [All Risk Levels ▼]          │
│            │                                                         │
│            │  ┌────────────────────────────────────────────────────┐ │
│            │  │ Name              Risk   Conditions  Alerts  Status│ │
│            │  │ ─────────────────────────────────────────────────│ │
│            │  │ Structuring       CRIT   2           15      ● Act│ │
│            │  │  Pattern  ⚙                                       │ │
│            │  │ Threshold         HIGH   1           18      ● Act│ │
│            │  │  Proximity ⚙                                      │ │
│            │  │ High Freq CTR     MED    1            8      ● Act│ │
│            │  │  Detection ⚙                                      │ │
│            │  │ Custom Rule 1     LOW    3            2      ○ Off│ │
│            │  │  ⚙                                                │ │
│            │  └────────────────────────────────────────────────────┘ │
│            │                                                         │
│            │  Showing 1-4 of 4 rules          [< Prev] [Next >]     │
└──────────────────────────────────────────────────────────────────────┘
```

#### Inputs/Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| Status Filter | dropdown | No | All | Filter: Active, Inactive, All |
| Risk Level Filter | dropdown | No | All | Filter: Low, Medium, High, Critical |

#### Buttons/Actions

| Button | Action | States |
|--------|--------|--------|
| + Create Rule | Navigate to rule creation | Visible only to authorized roles |
| Rule Row | Navigate to rule detail | Always clickable |
| ⚙ Actions Menu | Show edit/deactivate/delete options | Visible only to domain owner |
| Pagination Controls | Navigate pages | Disabled at boundaries |

#### Validation Messages

| Condition | Message | Location |
|-----------|---------|----------|
| No rules | "No rules defined yet. Create your first rule." | Table area |
| API error | "Unable to load rules. Please try again." | Table area |

#### Navigation

| Action | Destination |
|--------|-------------|
| + Create Rule | `/rules/create` |
| Click rule row | `/rules/:uuid` |
| ⚙ → Edit | `/rules/:uuid/edit` |

---

### 5.2 Rule Create / Edit Screen

**Screen Name:** Rule Create / Rule Edit  
**Route:** `/rules/create` or `/rules/:uuid/edit`  
**Purpose:** Define or modify an alert rule with conditions using a non-technical form (NFR-USAB-8.1).

#### Wireframe

```
┌──────────────────────────────────────────────────────────────────────┐
│ [Sidebar]  │  ← Back to Rules                                       │
│            │                                                         │
│            │  Create New Rule  /  Edit Rule                          │
│            │  ────────────────────────────────────────────────────── │
│            │                                                         │
│            │  Rule Name *                                            │
│            │  ┌──────────────────────────────────────────────────┐  │
│            │  │ High-Value CTR Detection                         │  │
│            │  └──────────────────────────────────────────────────┘  │
│            │                                                         │
│            │  Description                                            │
│            │  ┌──────────────────────────────────────────────────┐  │
│            │  │ Flag CTRs with transaction amounts exceeding...   │  │
│            │  └──────────────────────────────────────────────────┘  │
│            │                                                         │
│            │  Risk Level *               Combine Conditions *        │
│            │  ┌────────────────┐         ┌────────────────┐         │
│            │  │ HIGH         ▼ │         │ ALL (AND)    ▼ │         │
│            │  └────────────────┘         └────────────────┘         │
│            │                                                         │
│            │  Conditions                                             │
│            │  ┌──────────────────────────────────────────────────┐  │
│            │  │ ┌────────────┐ ┌──────────┐ ┌──────────┐  [✕]  │  │
│            │  │ │ Field    ▼ │ │ Oper.  ▼ │ │ Value    │       │  │
│            │  │ │trans_amount│ │ >        │ │ 50000    │       │  │
│            │  │ └────────────┘ └──────────┘ └──────────┘       │  │
│            │  │                                                    │  │
│            │  │ ┌────────────┐ ┌──────────┐ ┌──────────┐  [✕]  │  │
│            │  │ │ subject_   │ │ EQUALS   │ │ true     │       │  │
│            │  │ │ is_pep   ▼ │ │        ▼ │ │          │       │  │
│            │  │ └────────────┘ └──────────┘ └──────────┘       │  │
│            │  │                                                    │  │
│            │  │                              [+ Add Condition]     │  │
│            │  └──────────────────────────────────────────────────┘  │
│            │                                                         │
│            │  ┌─── Edit only ──────────────────────────────────┐    │
│            │  │ Justification *                                 │    │
│            │  │ ┌──────────────────────────────────────────┐   │    │
│            │  │ │ Reason for this change...                 │   │    │
│            │  │ └──────────────────────────────────────────┘   │    │
│            │  └─────────────────────────────────────────────────┘    │
│            │                                                         │
│            │               [Cancel]  [Save Rule]                     │
└──────────────────────────────────────────────────────────────────────┘
```

#### Inputs/Fields

| Field | Type | Required | Placeholder | Description |
|-------|------|----------|-------------|-------------|
| Rule Name | text | Yes | "Enter rule name" | 3-255 chars |
| Description | textarea | No | "Describe rule purpose..." | Up to 2000 chars |
| Risk Level | select | Yes | - | LOW, MEDIUM, HIGH, CRITICAL |
| Logical Operator | select | Yes | AND | ALL (AND) or ANY (OR) |
| Condition: Field | select | Yes | "Select field" | Evaluable report fields |
| Condition: Operator | select | Yes | "Operator" | EQUALS, >, <, >=, <=, CONTAINS, IN, etc. |
| Condition: Value | text | Yes | "Enter value" | Comparison value |
| Justification | textarea | Yes (edit) | "Reason for this change..." | Min 10 chars (edit/modify only, BR-8.7) |

#### Buttons/Actions

| Button | Action | States |
|--------|--------|--------|
| Save Rule | Submit form | Disabled when invalid |
| Cancel | Navigate back | Always enabled |
| + Add Condition | Add condition row | Disabled at max (20) |
| ✕ Remove Condition | Remove condition row | Disabled when only 1 condition |
| Back to Rules | Navigate to rule list | Always enabled |

#### Validation Messages

| Condition | Message | Location |
|-----------|---------|----------|
| Name missing | "Rule name is required" | Below name field |
| Name too short | "Rule name must be at least 3 characters" | Below name field |
| No conditions | "At least one condition is required" | Conditions section |
| Missing condition field | "Select a field for this condition" | Inline on condition |
| Missing condition value | "Enter a value for this condition" | Inline on condition |
| Justification missing (edit) | "Justification is required for rule modifications" | Below justification |
| Justification too short | "Justification must be at least 10 characters" | Below justification |
| Version conflict (ERR-RULE-005) | "Rule was modified by another user. Please reload." | Toast notification |
| Cross-domain error (ERR-RULE-003) | "Permission Denied" message | Toast notification |

#### Navigation

| Action | Destination |
|--------|-------------|
| Save (success) | `/rules/:uuid` (detail) |
| Cancel | `/rules` (list) |
| Back | `/rules` (list) |

---

### 5.3 Rule Detail Screen

**Screen Name:** Rule Detail  
**Route:** `/rules/:uuid`  
**Purpose:** Display full rule configuration with conditions and alert statistics.

#### Wireframe

```
┌──────────────────────────────────────────────────────────────────────┐
│ [Sidebar]  │  ← Back to Rules                                       │
│            │                                                         │
│            │  High-Value CTR Detection                    [Edit] [⋮]│
│            │  ● Active  │  COMPLIANCE  │  HIGH                      │
│            │  ────────────────────────────────────────────────────── │
│            │                                                         │
│            │  ┌──────────────────────────────────────────────────┐  │
│            │  │ Description                                      │  │
│            │  │ Flag CTRs with transaction amounts exceeding     │  │
│            │  │ $50,000 for immediate review.                    │  │
│            │  └──────────────────────────────────────────────────┘  │
│            │                                                         │
│            │  ┌──────────────────────────────────────────────────┐  │
│            │  │ Conditions (ALL must match)                       │  │
│            │  │ ────────────────────────────────────────────────│  │
│            │  │ 1. transaction_amount  GREATER THAN  50000       │  │
│            │  │ 2. subject_country     IN             [LR, SL]   │  │
│            │  └──────────────────────────────────────────────────┘  │
│            │                                                         │
│            │  ┌──────────────────┐  ┌────────────────────────────┐ │
│            │  │ Statistics       │  │ Metadata                   │ │
│            │  │ ──────────────  │  │ ──────────────────────────│ │
│            │  │ Alerts: 15      │  │ Created by: supervisor1    │ │
│            │  │ Version: 2      │  │ Created: Feb 10, 2026      │ │
│            │  │                  │  │ Updated: Feb 11, 2026      │ │
│            │  │                  │  │ Preconfigured: No          │ │
│            │  └──────────────────┘  └────────────────────────────┘ │
│            │                                                         │
│            │                    [View Generated Alerts →]            │
└──────────────────────────────────────────────────────────────────────┘
```

#### Buttons/Actions

| Button | Action | States |
|--------|--------|--------|
| Edit | Navigate to edit page | Visible to domain owner only |
| ⋮ Actions Menu | Show deactivate/activate/delete | Visible to domain owner only |
| Deactivate | Open justification modal | Visible when rule is active |
| Activate | Open justification modal | Visible when rule is inactive |
| Delete | Open justification modal + confirm | Always visible to owner |
| View Generated Alerts | Navigate to alerts filtered by this rule | Always visible |
| Back to Rules | Navigate to rule list | Always enabled |

#### Navigation

| Action | Destination |
|--------|-------------|
| Edit | `/rules/:uuid/edit` |
| View Generated Alerts | `/alerts?rule_uuid=:uuid` |
| Back | `/rules` |

---

### 5.4 Alert List Screen

**Screen Name:** Alert List  
**Route:** `/alerts`  
**Purpose:** Display alerts in the user's domain with filtering and sorting.

#### Wireframe

```
┌──────────────────────────────────────────────────────────────────────┐
│ [Sidebar]  │  Alerts                     Domain: COMPLIANCE          │
│            │  ────────────────────────────────────────────────────── │
│ Dashboard  │                                                         │
│ Rules      │  Filters:                                               │
│ Alerts   ◄─│  [All Risk Levels ▼] [All Dispositions ▼]             │
│ Reports    │  Sort: [Most Recent ▼]                                  │
│            │                                                         │
│            │  ┌────────────────────────────────────────────────────┐ │
│            │  │ Rule              Report     Risk   Disp.   Time  │ │
│            │  │ ─────────────────────────────────────────────────│ │
│            │  │ Structuring       FIA-0156   ● CRIT  —      2h   │ │
│            │  │  Pattern                                          │ │
│            │  │ Threshold         FIA-0178   ● HIGH  —      5h   │ │
│            │  │  Proximity                                        │ │
│            │  │ High Freq CTR     FIA-0189   ● MED   TP     1d   │ │
│            │  │  Detection                                        │ │
│            │  │ High-Risk         FIA-0192   ● HIGH  FP     1d   │ │
│            │  │  Jurisdiction                                     │ │
│            │  └────────────────────────────────────────────────────┘ │
│            │                                                         │
│            │  Showing 1-20 of 45 alerts       [< Prev] [Next >]     │
└──────────────────────────────────────────────────────────────────────┘
```

#### Inputs/Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| Risk Level Filter | dropdown | No | All | LOW, MEDIUM, HIGH, CRITICAL |
| Disposition Filter | dropdown | No | All | Unresolved, True Positive, False Positive, Under Investigation |
| Sort By | dropdown | No | Most Recent | generated_at, risk_level |
| Rule UUID Filter | hidden | No | null | Set when navigating from rule detail |

#### Buttons/Actions

| Button | Action | States |
|--------|--------|--------|
| Alert Row | Navigate to alert detail | Always clickable |
| Pagination Controls | Navigate pages | Disabled at boundaries |

#### Navigation

| Action | Destination |
|--------|-------------|
| Click alert row | `/alerts/:uuid` |

---

### 5.5 Alert Detail Screen

**Screen Name:** Alert Detail  
**Route:** `/alerts/:uuid`  
**Purpose:** Display full alert with triggering rule logic, report info, execution details, and disposition form (FR-8.8, FR-8.9).

#### Wireframe

```
┌──────────────────────────────────────────────────────────────────────┐
│ [Sidebar]  │  ← Back to Alerts                                      │
│            │                                                         │
│            │  Alert: Structuring Pattern Detection                    │
│            │  ● CRITICAL  │  COMPLIANCE  │  Generated: 2h ago       │
│            │  ────────────────────────────────────────────────────── │
│            │                                                         │
│            │  ┌──────────────────────────────────────────────────┐  │
│            │  │ Report Information                                │  │
│            │  │ ────────────────────────────────────────────────│  │
│            │  │ Reference: FIA-0156    Type: CTR                 │  │
│            │  │ Entity: Bank of Liberia  Submitted: Feb 10, 2026 │  │
│            │  └──────────────────────────────────────────────────┘  │
│            │                                                         │
│            │  ┌──────────────────────────────────────────────────┐  │
│            │  │ Triggering Rule Logic                             │  │
│            │  │ ────────────────────────────────────────────────│  │
│            │  │ Rule: Structuring Pattern Detection   CRITICAL   │  │
│            │  │ Logic: ALL conditions must match (AND)           │  │
│            │  │                                                    │  │
│            │  │  ✅ transaction_count_30d >= 3   (actual: 5)     │  │
│            │  │  ✅ total_value_30d > 50000      (actual: 78500) │  │
│            │  └──────────────────────────────────────────────────┘  │
│            │                                                         │
│            │  ┌──────────────────────────────────────────────────┐  │
│            │  │ Set Disposition                                   │  │
│            │  │ ────────────────────────────────────────────────│  │
│            │  │ Current: None                                    │  │
│            │  │                                                    │  │
│            │  │ [True Positive] [False Positive] [Under Invest.] │  │
│            │  │                                                    │  │
│            │  │ Notes (optional):                                 │  │
│            │  │ ┌──────────────────────────────────────────────┐ │  │
│            │  │ │                                              │ │  │
│            │  │ └──────────────────────────────────────────────┘ │  │
│            │  │                                    [Save]        │  │
│            │  └──────────────────────────────────────────────────┘  │
│            │                                                         │
│            │  ┌──────────────────────────────────────────────────┐  │
│            │  │ Disposition History                               │  │
│            │  │ ────────────────────────────────────────────────│  │
│            │  │ (No previous dispositions)                       │  │
│            │  └──────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

#### Inputs/Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| Disposition | button group | Yes | Current value or null | TRUE_POSITIVE, FALSE_POSITIVE, UNDER_INVESTIGATION |
| Notes | textarea | No | "" | Optional notes for disposition |

#### Buttons/Actions

| Button | Action | States |
|--------|--------|--------|
| Disposition Buttons | Select disposition type | One active at a time |
| Save Disposition | Submit disposition | Disabled when no selection |
| Back to Alerts | Navigate to alert list | Always enabled |

#### Validation Messages

| Condition | Message | Location |
|-----------|---------|----------|
| No disposition selected | "Select a disposition before saving" | Below disposition buttons |
| Save error | "Unable to save disposition. Please try again." | Toast notification |
| Save success | "Disposition saved successfully" | Toast notification |

#### Navigation

| Action | Destination |
|--------|-------------|
| Back to Alerts | `/alerts` (preserves filters) |

---

### 5.6 Justification Modal (Shared)

**Screen Name:** Justification Modal  
**Type:** Modal dialog (overlay)  
**Purpose:** Capture required justification for rule deactivation, activation, or deletion (BR-8.7).

#### Wireframe

```
┌──────────────────────────────────────────┐
│  Deactivate Rule                    [✕]  │
│  ──────────────────────────────────────  │
│                                          │
│  Are you sure you want to deactivate     │
│  "High-Value CTR Detection"?             │
│                                          │
│  Justification *                         │
│  ┌──────────────────────────────────┐   │
│  │ Reason for this action...         │   │
│  │                                    │   │
│  └──────────────────────────────────┘   │
│                                          │
│              [Cancel]  [Confirm]         │
└──────────────────────────────────────────┘
```

#### Inputs/Fields

| Field | Type | Required | Placeholder | Description |
|-------|------|----------|-------------|-------------|
| Justification | textarea | Yes | "Reason for this action..." | Min 10 chars |

#### Buttons/Actions

| Button | Action | States |
|--------|--------|--------|
| Confirm | Execute action with justification | Disabled when justification < 10 chars |
| Cancel | Close modal | Always enabled |
| ✕ Close | Close modal | Always enabled |

---

## 6. User Flow Diagrams

### 6.1 Rule Management Flow

```
┌───────────────┐
│   Start       │
│   /rules      │
└──────┬────────┘
       │
       ▼
┌───────────────────┐
│  Rule List Page   │
│  (domain auto-set)│
└───────┬───────────┘
        │
   ┌────┴──────────────┐
   │                    │
   ▼                    ▼
┌──────────────┐  ┌──────────────────┐
│ Click        │  │ + Create Rule    │
│ Existing Rule│  └────────┬─────────┘
└──────┬───────┘           │
       │                   ▼
       ▼           ┌──────────────────┐
┌──────────────┐   │ Rule Create Form │
│ Rule Detail  │   │ - Name, Desc     │
│   Page       │   │ - Risk Level     │
└──────┬───────┘   │ - Conditions     │
       │           └────────┬─────────┘
  ┌────┼──────┐             │
  │    │      │        ┌────┴────┐
  ▼    ▼      ▼        │         │
┌────┐┌───┐┌──────┐   ▼         ▼
│Edit││Act││Delete│ ┌────────┐┌────────┐
│    ││/De││      │ │Validate││ Error  │
└─┬──┘│act│└──┬───┘ │ OK     ││ Show   │
  │   └─┬─┘   │     └───┬────┘│ Msgs   │
  │     │      │         │     └────────┘
  ▼     ▼      ▼         │
┌────────────────┐       │
│  Justification │       │
│  Modal         │       │
│  (required)    │       │
└───────┬────────┘       │
        │                │
   ┌────┴────┐           │
   │         │           │
   ▼         ▼           ▼
┌───────┐ ┌───────┐ ┌──────────┐
│Success│ │ Error │ │ Created  │
│Toast  │ │ Toast │ │ → Detail │
│→ List │ │→ Stay │ └──────────┘
└───────┘ └───────┘
```

### 6.2 Alert Review Flow

```
┌───────────────┐
│   Start       │
│   /alerts     │
└──────┬────────┘
       │
       ▼
┌───────────────────┐
│  Alert List Page  │
│  (domain auto-set)│
└───────┬───────────┘
        │
        ▼
┌───────────────────┐
│ Apply Filters     │
│ (risk, disp, sort)│
└───────┬───────────┘
        │
        ▼
┌───────────────────┐     Error    ┌──────────────┐
│ Fetch Alerts      │─────────────►│ Show Error   │
│ from API          │              │ with Retry   │
└───────┬───────────┘              └──────────────┘
        │ Success
        ▼
┌───────────────────┐     No       ┌──────────────┐
│ Results Found?    │─────────────►│ Show Empty   │
│                   │              │ State        │
└───────┬───────────┘              └──────────────┘
        │ Yes
        ▼
┌───────────────────┐
│ Click Alert Row   │
└───────┬───────────┘
        │
        ▼
┌───────────────────┐
│ Alert Detail Page │
│ - Report Info     │
│ - Rule Logic      │
│ - Condition Eval  │
└───────┬───────────┘
        │
        ▼
┌───────────────────┐
│ Review & Decide   │
│ Disposition       │
└───────┬───────────┘
        │
   ┌────┴──────────────────┐
   │          │             │
   ▼          ▼             ▼
┌───────┐ ┌────────┐ ┌──────────────┐
│ True  │ │ False  │ │ Under        │
│ Pos.  │ │ Pos.   │ │ Investigation│
└───┬───┘ └───┬────┘ └──────┬───────┘
    │         │              │
    └─────────┴──────────────┘
              │
              ▼
┌───────────────────┐
│ Save Disposition  │
│ (+ optional notes)│
└───────┬───────────┘
        │
   ┌────┴────┐
   │         │
   ▼         ▼
┌───────┐ ┌───────┐
│Success│ │ Error │
│Toast  │ │ Toast │
│Update │ │→ Stay │
│ Badge │ └───────┘
└───────┘
```

### 6.3 Rule Condition Builder Flow

```
┌───────────────────┐
│ Condition Builder  │
│ (in create/edit)   │
└───────┬───────────┘
        │
        ▼
┌───────────────────┐
│ Initial: 1 empty  │
│ condition row      │
└───────┬───────────┘
        │
   ┌────┴──────────────┐
   │                    │
   ▼                    ▼
┌──────────────┐  ┌──────────────┐
│ Select Field │  │ + Add        │
│ (dropdown)   │  │ Condition    │
└──────┬───────┘  │ (up to 20)  │
       │          └──────────────┘
       ▼
┌──────────────┐
│ Select       │
│ Operator     │
│ (filtered by │
│  field type) │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Enter Value  │
│ (type-aware  │
│  input)      │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ Condition Valid   │
│ ✅ shows green   │
│ border           │
└──────────────────┘
```

---

## 7. UI Element Specifications

### 7.1 Component Hierarchy

```
rule-alerts/
├── pages/
│   ├── RuleListPage.tsx
│   ├── RuleCreatePage.tsx
│   ├── RuleEditPage.tsx
│   ├── RuleDetailPage.tsx
│   ├── AlertListPage.tsx
│   └── AlertDetailPage.tsx
├── components/
│   ├── rules/
│   │   ├── RuleTable.tsx
│   │   ├── RuleTableRow.tsx
│   │   ├── RuleForm.tsx
│   │   ├── RuleConditionBuilder.tsx
│   │   ├── RuleConditionRow.tsx
│   │   ├── RuleStatusBadge.tsx
│   │   ├── RuleDetailCard.tsx
│   │   ├── RuleConditionsList.tsx
│   │   ├── RuleActionBar.tsx
│   │   └── JustificationModal.tsx
│   ├── alerts/
│   │   ├── AlertTable.tsx
│   │   ├── AlertTableRow.tsx
│   │   ├── AlertDetailCard.tsx
│   │   ├── AlertRuleLogicCard.tsx
│   │   ├── AlertReportCard.tsx
│   │   ├── AlertExecutionDetailsCard.tsx
│   │   ├── AlertDispositionForm.tsx
│   │   ├── AlertDispositionHistory.tsx
│   │   └── AlertFilters.tsx
│   └── shared/
│       ├── RiskLevelBadge.tsx
│       ├── DomainBadge.tsx
│       ├── DispositionBadge.tsx
│       └── ConditionOperatorLabel.tsx
├── hooks/
│   ├── useRules.ts
│   ├── useRuleDetail.ts
│   ├── useCreateRule.ts
│   ├── useUpdateRule.ts
│   ├── useRuleActions.ts
│   ├── useAlerts.ts
│   ├── useAlertDetail.ts
│   └── useUpdateDisposition.ts
├── stores/
│   └── ruleAlertStore.ts
├── api/
│   ├── ruleApi.ts
│   └── alertApi.ts
└── types/
    └── ruleAlert.types.ts
```

### 7.2 Component Specifications

#### RuleListPage

**Purpose:** Main page for browsing alert rules.

**Props:** None (route component)

**State:**

| Property | Type | Initial Value | Description |
|----------|------|---------------|-------------|
| isActive | boolean \| null | null | Active filter |
| riskLevel | RiskLevel \| null | null | Risk level filter |
| page | number | 1 | Current page |

**Responsibilities:**
- Determine domain from user role
- Render rule table with filters
- Show create button for authorized users
- Handle loading, error, and empty states

---

#### RuleForm

**Purpose:** Shared form component for rule creation and editing.

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| initialData | RuleFormData \| null | No | null | Pre-fill for edit mode |
| isEdit | boolean | No | false | Edit mode flag |
| onSubmit | (data: RuleFormData) => void | Yes | - | Submit handler |
| isSubmitting | boolean | No | false | Loading state |

**State:**

| Property | Type | Initial Value | Description |
|----------|------|---------------|-------------|
| conditions | ConditionInput[] | [empty] | Condition rows |

**Responsibilities:**
- Render form fields with validation
- Manage dynamic condition rows
- Show justification field in edit mode
- Validate all fields before submission
- Display inline validation errors

---

#### RuleConditionBuilder

**Purpose:** Dynamic condition builder allowing users to add/remove conditions (NFR-USAB-8.1).

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| conditions | ConditionInput[] | Yes | Current conditions |
| onChange | (conditions: ConditionInput[]) => void | Yes | Change handler |
| maxConditions | number | No | Max conditions (default 20) |

**Responsibilities:**
- Render condition rows dynamically
- Add/remove conditions
- Filter operator options based on field type
- Show condition count
- Enforce maximum condition limit

---

#### RuleConditionRow

**Purpose:** Single condition row in the condition builder.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| condition | ConditionInput | Yes | Condition data |
| onChange | (condition: ConditionInput) => void | Yes | Change handler |
| onRemove | () => void | Yes | Remove handler |
| canRemove | boolean | Yes | Whether removal is allowed |
| index | number | Yes | Row index |

**Responsibilities:**
- Render field selector, operator selector, value input
- Filter operators based on selected field's value type
- Adapt value input type (number, text, date) based on value_type
- Show remove button

---

#### JustificationModal

**Purpose:** Modal dialog for capturing justification text (BR-8.7).

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| isOpen | boolean | Yes | Modal visibility |
| onClose | () => void | Yes | Close handler |
| onConfirm | (justification: string) => void | Yes | Confirm handler |
| title | string | Yes | Modal title |
| description | string | Yes | Description text |
| isLoading | boolean | No | Loading state |

**Responsibilities:**
- Render modal with justification textarea
- Validate minimum length (10 chars)
- Disable confirm when invalid or loading
- Clear state on close

---

#### AlertTable

**Purpose:** Table component for displaying alerts.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| alerts | AlertSummary[] | Yes | Alert data |
| isLoading | boolean | No | Loading state |
| onRowClick | (uuid: string) => void | Yes | Row click handler |

**Responsibilities:**
- Render alert rows with risk level badge, rule name, report reference
- Show disposition badge
- Handle row click navigation
- Show skeleton loading state

---

#### AlertRuleLogicCard

**Purpose:** Display the triggering rule logic with condition evaluation results (FR-8.8).

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| rule | RuleDetail | Yes | Triggering rule |
| executionDetails | ExecutionDetails | Yes | Condition results |

**Responsibilities:**
- Display rule name, risk level, logical operator
- Show each condition with pass/fail indicator (✅/❌)
- Display actual vs expected values
- Explain what triggered the alert in plain language

---

#### AlertDispositionForm

**Purpose:** Form for setting alert disposition (FR-8.9).

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| currentDisposition | DispositionType \| null | Yes | Current value |
| onSubmit | (data: DispositionInput) => void | Yes | Submit handler |
| isSubmitting | boolean | No | Loading state |

**Responsibilities:**
- Render disposition button group
- Show optional notes textarea
- Submit disposition update
- Disable while submitting

---

#### RiskLevelBadge

**Purpose:** Colored badge for risk levels.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| level | RiskLevel | Yes | Risk level |
| size | "sm" \| "md" | No | Badge size |

**Responsibilities:**
- Render colored badge: CRITICAL=red, HIGH=orange, MEDIUM=yellow, LOW=blue
- Show risk level text

---

#### DispositionBadge

**Purpose:** Badge for alert disposition status.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| disposition | DispositionType \| null | Yes | Disposition value |

**Responsibilities:**
- TRUE_POSITIVE: Green badge with "TP" or "True Positive"
- FALSE_POSITIVE: Gray badge with "FP" or "False Positive"
- UNDER_INVESTIGATION: Yellow badge with "UI" or "Under Investigation"
- null: Dash or "Unresolved"

---

## 8. State Management

### 8.1 Server State (React Query)

#### Query Keys
```typescript
const ruleKeys = {
  all: ['rules'] as const,
  list: (domain?: RuleDomain, isActive?: boolean, riskLevel?: RiskLevel, page?: number) =>
    [...ruleKeys.all, 'list', { domain, isActive, riskLevel, page }] as const,
  detail: (uuid: string) =>
    [...ruleKeys.all, 'detail', uuid] as const,
};

const alertKeys = {
  all: ['alerts'] as const,
  list: (params: AlertListParams) =>
    [...alertKeys.all, 'list', params] as const,
  detail: (uuid: string) =>
    [...alertKeys.all, 'detail', uuid] as const,
};
```

#### Query Configuration
```typescript
// Rule list - moderate cache
useRules: {
  staleTime: 60 * 1000, // 1 minute
  cacheTime: 10 * 60 * 1000, // 10 minutes
}

// Rule detail - longer cache
useRuleDetail: {
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 30 * 60 * 1000, // 30 minutes
}

// Alert list - short cache (alerts appear in real-time)
useAlerts: {
  staleTime: 15 * 1000, // 15 seconds
  cacheTime: 5 * 60 * 1000, // 5 minutes
  refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
}

// Alert detail - moderate cache
useAlertDetail: {
  staleTime: 60 * 1000, // 1 minute
  cacheTime: 10 * 60 * 1000, // 10 minutes
}
```

#### Mutation Configuration
```typescript
// Create rule mutation
useCreateRule: {
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ruleKeys.all });
  }
}

// Update rule mutation
useUpdateRule: {
  onSuccess: (data, variables) => {
    queryClient.invalidateQueries({ queryKey: ruleKeys.detail(variables.uuid) });
    queryClient.invalidateQueries({ queryKey: ruleKeys.all });
  }
}

// Rule action mutations (deactivate/activate/delete)
useRuleActions: {
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ruleKeys.all });
  }
}

// Update disposition mutation
useUpdateDisposition: {
  onSuccess: (data, variables) => {
    queryClient.invalidateQueries({ queryKey: alertKeys.detail(variables.uuid) });
    queryClient.invalidateQueries({ queryKey: alertKeys.all });
  }
}
```

### 8.2 UI State (Zustand)

```typescript
interface RuleAlertUIState {
  // Rule filters
  ruleStatusFilter: boolean | null;
  ruleRiskFilter: RiskLevel | null;

  // Alert filters
  alertRiskFilter: RiskLevel | null;
  alertDispositionFilter: DispositionType | null;
  alertSortBy: 'generated_at' | 'risk_level';
  alertSortOrder: 'ASC' | 'DESC';

  // Modal state
  justificationModalOpen: boolean;
  justificationAction: 'deactivate' | 'activate' | 'delete' | null;
  justificationTarget: string | null; // rule UUID

  // Actions
  setRuleStatusFilter: (status: boolean | null) => void;
  setRuleRiskFilter: (level: RiskLevel | null) => void;
  setAlertRiskFilter: (level: RiskLevel | null) => void;
  setAlertDispositionFilter: (disp: DispositionType | null) => void;
  setAlertSort: (sortBy: string, sortOrder: string) => void;
  openJustificationModal: (action: string, uuid: string) => void;
  closeJustificationModal: () => void;
  resetFilters: () => void;
}
```

### 8.3 URL State

```typescript
// Rule list: /rules?is_active=true&risk_level=HIGH&page=1
// Alert list: /alerts?risk_level=CRITICAL&disposition=&rule_uuid=xxx&sort_by=generated_at&sort_order=DESC&page=1

interface RuleListParams {
  is_active?: string;
  risk_level?: string;
  page?: string;
}

interface AlertListParams {
  risk_level?: string;
  disposition?: string;
  rule_uuid?: string;
  sort_by?: string;
  sort_order?: string;
  page?: string;
}
```

---

## 9. Form Handling

### 9.1 Rule Create/Edit Form

**Form Schema (Zod):**
```typescript
const conditionSchema = z.object({
  field: z.string().min(1, "Select a field"),
  operator: z.nativeEnum(ConditionOperator),
  value: z.string().min(1, "Enter a value"),
  value_type: z.nativeEnum(ValueType),
});

const ruleFormSchema = z.object({
  name: z.string().min(3, "Minimum 3 characters").max(255, "Maximum 255 characters"),
  description: z.string().max(2000).optional(),
  risk_level: z.nativeEnum(RiskLevel),
  logical_operator: z.nativeEnum(LogicalOperator),
  conditions: z.array(conditionSchema).min(1, "At least one condition required").max(20, "Maximum 20 conditions"),
  justification: z.string().min(10, "Minimum 10 characters").max(2000).optional(),
  expected_version: z.number().optional(),
});
```

**Field-Level Validation:**

| Field | Rule | Message |
|-------|------|---------|
| name | required, min 3, max 255 | "Rule name is required" / "Minimum 3 characters" |
| risk_level | required | "Risk level is required" |
| logical_operator | required | "Select how conditions combine" |
| conditions | min 1, max 20 | "At least one condition required" |
| condition.field | required | "Select a field" |
| condition.operator | required | "Select an operator" |
| condition.value | required | "Enter a value" |
| justification (edit) | required, min 10 | "Justification is required" / "Minimum 10 characters" |

**Submission Flow:**
1. User fills form fields
2. React Hook Form validates on blur/submit
3. Show inline errors for invalid fields
4. On valid submit → loading state
5. Call API (create or update)
6. On success → toast + navigate to detail
7. On 409 conflict → toast "Rule modified by another user"
8. On 400 validation → show API errors inline
9. On 403 → toast "Permission denied"

### 9.2 Disposition Form

**Form Schema (Zod):**
```typescript
const dispositionFormSchema = z.object({
  disposition: z.nativeEnum(DispositionType),
  notes: z.string().max(2000).optional(),
});
```

**Submission Flow:**
1. User selects disposition button
2. Optionally enters notes
3. Click Save
4. Call API to update disposition
5. On success → toast + update badge
6. On error → toast with retry

### 9.3 Justification Form (Modal)

**Form Schema (Zod):**
```typescript
const justificationSchema = z.object({
  justification: z.string().min(10, "Minimum 10 characters").max(2000, "Maximum 2000 characters"),
});
```

---

## 10. API Integration

### 10.1 API Client Setup

```typescript
const ruleApi = {
  baseUrl: '/api/v1/rules',

  list: async (params: RuleListParams): Promise<RuleListResponse> => {
    const response = await fetch(`${ruleApi.baseUrl}?${new URLSearchParams(params)}`);
    if (!response.ok) throw new ApiError(response);
    return response.json();
  },

  getDetail: async (uuid: string): Promise<RuleDetailResponse> => {
    const response = await fetch(`${ruleApi.baseUrl}/${uuid}`);
    if (!response.ok) throw new ApiError(response);
    return response.json();
  },

  create: async (data: RuleCreateRequest): Promise<RuleCreateResponse> => {
    const response = await fetch(ruleApi.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new ApiError(response);
    return response.json();
  },

  update: async (uuid: string, data: RuleUpdateRequest): Promise<RuleDetailResponse> => {
    const response = await fetch(`${ruleApi.baseUrl}/${uuid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new ApiError(response);
    return response.json();
  },

  deactivate: async (uuid: string, justification: string): Promise<void> => {
    const response = await fetch(`${ruleApi.baseUrl}/${uuid}/deactivate`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ justification }),
    });
    if (!response.ok) throw new ApiError(response);
    return response.json();
  },

  activate: async (uuid: string, justification: string): Promise<void> => {
    const response = await fetch(`${ruleApi.baseUrl}/${uuid}/activate`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ justification }),
    });
    if (!response.ok) throw new ApiError(response);
    return response.json();
  },

  delete: async (uuid: string, justification: string): Promise<void> => {
    const response = await fetch(`${ruleApi.baseUrl}/${uuid}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ justification }),
    });
    if (!response.ok) throw new ApiError(response);
    return response.json();
  },
};

const alertApi = {
  baseUrl: '/api/v1/alerts',

  list: async (params: AlertListParams): Promise<AlertListResponse> => {
    const response = await fetch(`${alertApi.baseUrl}?${new URLSearchParams(params)}`);
    if (!response.ok) throw new ApiError(response);
    return response.json();
  },

  getDetail: async (uuid: string): Promise<AlertDetailResponse> => {
    const response = await fetch(`${alertApi.baseUrl}/${uuid}`);
    if (!response.ok) throw new ApiError(response);
    return response.json();
  },

  updateDisposition: async (uuid: string, data: DispositionRequest): Promise<DispositionResponse> => {
    const response = await fetch(`${alertApi.baseUrl}/${uuid}/disposition`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new ApiError(response);
    return response.json();
  },
};
```

### 10.2 React Query Hooks

#### useRules
```typescript
function useRules(params: RuleListParams) {
  return useQuery({
    queryKey: ruleKeys.list(params.domain, params.is_active, params.risk_level, params.page),
    queryFn: () => ruleApi.list(params),
    staleTime: 60 * 1000,
  });
}
```

#### useRuleDetail
```typescript
function useRuleDetail(uuid: string) {
  return useQuery({
    queryKey: ruleKeys.detail(uuid),
    queryFn: () => ruleApi.getDetail(uuid),
    enabled: !!uuid,
    staleTime: 5 * 60 * 1000,
  });
}
```

#### useCreateRule
```typescript
function useCreateRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RuleCreateRequest) => ruleApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ruleKeys.all });
    },
  });
}
```

#### useUpdateRule
```typescript
function useUpdateRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: RuleUpdateRequest }) =>
      ruleApi.update(uuid, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ruleKeys.detail(variables.uuid) });
      queryClient.invalidateQueries({ queryKey: ruleKeys.all });
    },
  });
}
```

#### useRuleActions
```typescript
function useRuleActions() {
  const queryClient = useQueryClient();

  const deactivate = useMutation({
    mutationFn: ({ uuid, justification }: { uuid: string; justification: string }) =>
      ruleApi.deactivate(uuid, justification),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ruleKeys.all }),
  });

  const activate = useMutation({
    mutationFn: ({ uuid, justification }: { uuid: string; justification: string }) =>
      ruleApi.activate(uuid, justification),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ruleKeys.all }),
  });

  const deleteRule = useMutation({
    mutationFn: ({ uuid, justification }: { uuid: string; justification: string }) =>
      ruleApi.delete(uuid, justification),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ruleKeys.all }),
  });

  return { deactivate, activate, deleteRule };
}
```

#### useAlerts
```typescript
function useAlerts(params: AlertListParams) {
  return useQuery({
    queryKey: alertKeys.list(params),
    queryFn: () => alertApi.list(params),
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000,
  });
}
```

#### useAlertDetail
```typescript
function useAlertDetail(uuid: string) {
  return useQuery({
    queryKey: alertKeys.detail(uuid),
    queryFn: () => alertApi.getDetail(uuid),
    enabled: !!uuid,
    staleTime: 60 * 1000,
  });
}
```

#### useUpdateDisposition
```typescript
function useUpdateDisposition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: DispositionRequest }) =>
      alertApi.updateDisposition(uuid, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: alertKeys.detail(variables.uuid) });
      queryClient.invalidateQueries({ queryKey: alertKeys.all });
    },
  });
}
```

### 10.3 API Error Handling

| Error Type | HTTP Status | User Message | Recovery Action |
|------------|-------------|--------------|-----------------|
| Validation Error | 400 | Show field-specific errors inline | Fix fields and resubmit |
| Unauthorized | 401 | "Session expired. Please log in." | Redirect to login |
| Domain Access Denied | 403 | ERR-RULE-003 message | Show toast, stay on page |
| Not Found | 404 | "Rule/Alert not found" | Navigate to list |
| Version Conflict | 409 | "Rule modified by another user. Reload." | Offer reload button |
| Server Error | 500 | "Something went wrong. Please try again." | Retry button |
| Network Error | - | "Unable to connect. Check your connection." | Retry button |

### 10.4 API Endpoint Mapping

| Component | Endpoint | Method | Purpose |
|-----------|----------|--------|---------|
| RuleListPage | `/api/v1/rules` | GET | Fetch rules |
| RuleDetailPage | `/api/v1/rules/:uuid` | GET | Fetch rule detail |
| RuleCreatePage | `/api/v1/rules` | POST | Create rule |
| RuleEditPage | `/api/v1/rules/:uuid` | PUT | Update rule |
| RuleDetailPage | `/api/v1/rules/:uuid/deactivate` | PATCH | Deactivate rule |
| RuleDetailPage | `/api/v1/rules/:uuid/activate` | PATCH | Activate rule |
| RuleDetailPage | `/api/v1/rules/:uuid` | DELETE | Delete rule |
| AlertListPage | `/api/v1/alerts` | GET | Fetch alerts |
| AlertDetailPage | `/api/v1/alerts/:uuid` | GET | Fetch alert detail |
| AlertDetailPage | `/api/v1/alerts/:uuid/disposition` | PATCH | Update disposition |

---

## 11. Routing and Navigation

### 11.1 Route Definitions

```typescript
const ruleAlertRoutes = [
  {
    path: '/rules',
    element: <RuleListPage />,
    meta: {
      title: 'Alert Rules',
      requiresAuth: true,
      roles: ['compliance_officer_supervisor', 'head_of_analysis']
    }
  },
  {
    path: '/rules/create',
    element: <RuleCreatePage />,
    meta: {
      title: 'Create Rule',
      requiresAuth: true,
      roles: ['compliance_officer_supervisor', 'head_of_analysis']
    }
  },
  {
    path: '/rules/:uuid',
    element: <RuleDetailPage />,
    meta: {
      title: 'Rule Detail',
      requiresAuth: true,
      roles: ['compliance_officer_supervisor', 'head_of_analysis']
    }
  },
  {
    path: '/rules/:uuid/edit',
    element: <RuleEditPage />,
    meta: {
      title: 'Edit Rule',
      requiresAuth: true,
      roles: ['compliance_officer_supervisor', 'head_of_analysis']
    }
  },
  {
    path: '/alerts',
    element: <AlertListPage />,
    meta: {
      title: 'Alerts',
      requiresAuth: true,
      roles: [
        'compliance_officer', 'compliance_officer_supervisor', 'head_of_compliance',
        'analyst', 'head_of_analysis'
      ]
    }
  },
  {
    path: '/alerts/:uuid',
    element: <AlertDetailPage />,
    meta: {
      title: 'Alert Detail',
      requiresAuth: true,
      roles: [
        'compliance_officer', 'compliance_officer_supervisor', 'head_of_compliance',
        'analyst', 'head_of_analysis'
      ]
    }
  },
];
```

### 11.2 Navigation Guards

```typescript
// Reuse existing guards from Feature 1
// Authentication guard
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// Role guard for rule management (supervisors only)
function RequireRuleManager({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const allowedRoles = ['compliance_officer_supervisor', 'head_of_analysis'];

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

// Role guard for alert viewing
function RequireAlertViewer({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const allowedRoles = [
    'compliance_officer', 'compliance_officer_supervisor', 'head_of_compliance',
    'analyst', 'head_of_analysis'
  ];

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
```

### 11.3 Navigation Patterns

| From | Action | To |
|------|--------|-----|
| Sidebar | Click "Rules" | `/rules` |
| Sidebar | Click "Alerts" | `/alerts` |
| Rule List | Click "+ Create Rule" | `/rules/create` |
| Rule List | Click rule row | `/rules/:uuid` |
| Rule Detail | Click "Edit" | `/rules/:uuid/edit` |
| Rule Detail | Click "View Generated Alerts" | `/alerts?rule_uuid=:uuid` |
| Rule Create/Edit | Cancel or Back | `/rules` |
| Rule Create/Edit | Save (success) | `/rules/:uuid` |
| Alert List | Click alert row | `/alerts/:uuid` |
| Alert Detail | Back to Alerts | `/alerts` (preserves filters) |

---

## 12. Error Handling

### 12.1 Error Boundary

```typescript
function RuleAlertErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      FallbackComponent={RuleAlertErrorFallback}
      onReset={() => window.location.reload()}
    >
      {children}
    </ErrorBoundary>
  );
}

function RuleAlertErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
      <p className="text-muted-foreground mb-4">{error.message}</p>
      <Button onClick={resetErrorBoundary}>Try Again</Button>
    </div>
  );
}
```

### 12.2 API Error Handler

```typescript
function useRuleAlertErrorHandler() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleError = (error: ApiError, context: string) => {
    switch (error.status) {
      case 400:
        // Validation errors - handled inline by form
        if (error.details?.errors) {
          return error.details.errors;
        }
        toast({
          title: "Validation Error",
          description: error.message,
          variant: "destructive",
        });
        break;
      case 401:
        navigate('/login');
        break;
      case 403:
        toast({
          title: "Permission Denied",
          description: error.message || "You don't have access to this resource",
          variant: "destructive",
        });
        break;
      case 404:
        toast({
          title: "Not Found",
          description: `The ${context} was not found`,
          variant: "destructive",
        });
        navigate(context === 'rule' ? '/rules' : '/alerts');
        break;
      case 409:
        toast({
          title: "Conflict",
          description: "This rule was modified by another user. Please reload and try again.",
          variant: "destructive",
          action: <Button onClick={() => window.location.reload()}>Reload</Button>,
        });
        break;
      default:
        toast({
          title: "Error",
          description: error.message || "Something went wrong",
          variant: "destructive",
        });
    }
  };

  return { handleError };
}
```

### 12.3 User-Facing Error Messages

| Scenario | Title | Description | Action |
|----------|-------|-------------|--------|
| Rule not found | "Rule Not Found" | "The rule you're looking for doesn't exist." | "Back to Rules" |
| Alert not found | "Alert Not Found" | "The alert you're looking for doesn't exist." | "Back to Alerts" |
| Cross-domain access | "Permission Denied" | Domain-specific error per ERR-RULE-003 | Stay on page |
| Version conflict | "Modification Conflict" | "Rule was modified by another user." | "Reload" button |
| Rule validation failed | "Invalid Rule" | Specific field errors | Fix and retry |
| Network error | "Connection Error" | "Unable to connect to server." | "Retry" button |
| Empty rules | "No Rules Yet" | "Create your first rule to get started." | "+ Create Rule" button |
| Empty alerts | "No Alerts" | "No alerts match your filter criteria." | Adjust filters |

---

## 13. Testing Considerations

### 13.1 Component Tests

**RuleForm Tests:**
- Renders all fields correctly
- Validates name minimum length
- Validates at least one condition required
- Shows justification field in edit mode only
- Disables submit when invalid
- Handles condition add/remove

**RuleConditionBuilder Tests:**
- Renders initial empty condition
- Adds condition on "Add Condition" click
- Removes condition on "Remove" click
- Cannot remove last condition
- Enforces maximum 20 conditions
- Filters operators by field type

**RuleConditionRow Tests:**
- Renders field, operator, value inputs
- Updates field type filters operators
- Updates value input type based on value_type

**AlertDispositionForm Tests:**
- Renders all three disposition buttons
- Highlights currently selected disposition
- Enables save when disposition selected
- Includes optional notes field
- Handles submission loading state

**AlertRuleLogicCard Tests:**
- Displays rule name and risk level
- Shows logical operator (AND/OR) in plain language
- Renders conditions with pass/fail indicators
- Shows actual values from execution

**RiskLevelBadge Tests:**
- Renders correct color per level
- Displays level text

**DispositionBadge Tests:**
- Renders correct badge per disposition
- Shows dash for null disposition

**JustificationModal Tests:**
- Opens and closes correctly
- Validates minimum 10 characters
- Disables confirm when invalid
- Calls onConfirm with justification text

### 13.2 Integration Tests

**Rule Management Flow:**
- User can create a rule with conditions
- User can edit a rule and provide justification
- User can deactivate/activate a rule with justification
- User can delete a rule with justification
- Domain filtering works correctly
- Version conflict shows error toast

**Alert Review Flow:**
- Alert list loads with domain filtering
- Alert filters work (risk level, disposition)
- Alert detail shows rule logic with condition results
- User can set disposition and save
- Disposition badge updates after save
- Auto-refresh brings new alerts

**Access Control:**
- Rule management pages blocked for non-supervisor roles
- Alert pages blocked for unauthorized roles
- Domain separation enforced in UI

### 13.3 Test Utilities

```typescript
// Mock rule data
const mockRule: RuleSummary = {
  uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  name: 'High-Value CTR Detection',
  domain: 'COMPLIANCE',
  risk_level: 'HIGH',
  is_active: true,
  is_preconfigured: false,
  conditions_count: 1,
  alerts_generated: 15,
  created_at: '2026-02-10T10:00:00Z',
};

const mockRuleDetail: RuleDetail = {
  ...mockRule,
  description: 'Flag CTRs with transaction amounts exceeding $50,000',
  logical_operator: 'AND',
  version: 1,
  conditions: [
    { field: 'transaction_amount', operator: 'GREATER_THAN', value: '50000', value_type: 'NUMBER', order_index: 0 }
  ],
  created_by: 'user-uuid',
  updated_at: '2026-02-10T10:00:00Z',
};

const mockAlert: AlertSummary = {
  uuid: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  rule_name: 'Structuring Pattern Detection',
  rule_uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  report_reference: 'FIA-0156',
  report_id: 156,
  domain: 'COMPLIANCE',
  risk_level: 'CRITICAL',
  disposition: null,
  generated_at: '2026-02-10T12:00:00Z',
};

const mockAlertDetail: AlertDetail = {
  ...mockAlert,
  report: {
    id: 156,
    reference_number: 'FIA-0156',
    report_type: 'CTR',
    submitted_at: '2026-02-10T10:00:00Z',
    entity_name: 'Bank of Liberia',
  },
  rule: mockRuleDetail,
  execution_details: {
    conditions_evaluated: [
      { field: 'transaction_count_30d', result: true, actual_value: '5' },
      { field: 'total_value_30d', result: true, actual_value: '78500' },
    ],
    executed_at: '2026-02-10T12:00:00Z',
  },
  disposition_history: [],
};

// Mock API handlers (for MSW or similar)
const mockHandlers = [
  rest.get('/api/v1/rules', (req, res, ctx) =>
    res(ctx.json({ results: [mockRule], total: 1, page: 1, page_size: 20, total_pages: 1 }))
  ),
  rest.get('/api/v1/rules/:uuid', (req, res, ctx) =>
    res(ctx.json(mockRuleDetail))
  ),
  rest.get('/api/v1/alerts', (req, res, ctx) =>
    res(ctx.json({ results: [mockAlert], total: 1, page: 1, page_size: 20, total_pages: 1 }))
  ),
  rest.get('/api/v1/alerts/:uuid', (req, res, ctx) =>
    res(ctx.json(mockAlertDetail))
  ),
];
```

---

## 14. Security Considerations

### 14.1 Authentication

- All rule and alert routes require authentication
- JWT token included in API requests via existing AuthContext
- Automatic redirect to login on 401 responses
- Session timeout handling (existing implementation)

### 14.2 Authorization

- **Rule management** pages restricted to `compliance_officer_supervisor` and `head_of_analysis`
- **Alert viewing** pages accessible to all compliance and analysis roles
- Domain separation enforced server-side (API auto-filters by role)
- Frontend hides management actions (edit, deactivate, delete) for unauthorized users
- No client-side bypass possible — all operations validated server-side

### 14.3 Data Protection

- No sensitive rule data stored in localStorage
- Filter state in URL (shareable, not sensitive)
- API responses cached in memory only (React Query)
- No alert data persisted client-side
- Justification text only sent to server, not stored locally

### 14.4 XSS Prevention

- React's built-in escaping for all rendered content
- No `dangerouslySetInnerHTML` usage
- User-entered rule names, descriptions, and notes sanitized before display
- Condition values treated as data, not executable code
- Content Security Policy headers (server-side)

### 14.5 CSRF Protection

- JWT stored in httpOnly cookies or Authorization header (existing implementation)
- API requests include authentication token
- Same-origin policy enforced

---

## 15. Dependencies Between Components

### 15.1 Component Dependency Graph

```
RuleListPage
├── AlertFilters (shared filter component)
├── RuleTable
│   └── RuleTableRow
│       ├── RiskLevelBadge
│       ├── RuleStatusBadge
│       └── DomainBadge
└── Pagination (shared)

RuleCreatePage / RuleEditPage
├── RuleForm
│   ├── RuleConditionBuilder
│   │   └── RuleConditionRow
│   │       └── ConditionOperatorLabel
│   └── JustificationModal (edit only)
└── BackButton

RuleDetailPage
├── RuleDetailCard
│   ├── RiskLevelBadge
│   ├── RuleStatusBadge
│   └── DomainBadge
├── RuleConditionsList
│   └── ConditionOperatorLabel
├── RuleActionBar
│   └── JustificationModal
└── BackButton

AlertListPage
├── AlertFilters
│   ├── RiskLevelBadge
│   └── DispositionBadge
├── AlertTable
│   └── AlertTableRow
│       ├── RiskLevelBadge
│       └── DispositionBadge
└── Pagination (shared)

AlertDetailPage
├── AlertDetailCard
│   ├── RiskLevelBadge
│   └── DomainBadge
├── AlertReportCard
├── AlertRuleLogicCard
│   ├── RiskLevelBadge
│   └── ConditionOperatorLabel
├── AlertExecutionDetailsCard
├── AlertDispositionForm
│   └── DispositionBadge
├── AlertDispositionHistory
│   └── DispositionBadge
└── BackButton
```

### 15.2 Data Flow

```
API Response
    │
    ▼
React Query Cache
    │
    ├──────────────────────┐
    │                      │
    ▼                      ▼
useRules               useAlerts
    │                      │
    ▼                      ▼
RuleListPage          AlertListPage
    │                      │
    ▼                      ▼
RuleTable             AlertTable
    │                      │
    ▼                      ▼
RuleTableRow          AlertTableRow

useRuleDetail         useAlertDetail
    │                      │
    ▼                      ▼
RuleDetailPage        AlertDetailPage
    │                      │
    ├── RuleDetailCard     ├── AlertReportCard
    ├── RuleConditionsList ├── AlertRuleLogicCard
    └── RuleActionBar      ├── AlertDispositionForm
                           └── AlertDispositionHistory
```

### 15.3 External Dependencies

| Component | External Dependency | Purpose |
|-----------|---------------------|---------|
| All pages | AuthContext (Feature 1) | User authentication state and role |
| All pages | ProtectedRoute (Feature 1) | Route guards |
| Alert Detail | Report Detail Pages | Navigation to report detail |
| Rule/Alert lists | Shared Pagination | Reusable pagination component |
| All modals | shadcn/ui Dialog | Modal rendering |
| All toasts | shadcn/ui Toast | Notification rendering |

---

## 16. Implementation Order

### 16.1 Recommended Sequence

**Sprint 1: Foundation (Week 1-2)**
1. Type definitions (`ruleAlert.types.ts`)
2. API client functions (`ruleApi.ts`, `alertApi.ts`)
3. React Query hooks (all `use*` hooks)
4. Zustand store (`ruleAlertStore.ts`)
5. Shared components (`RiskLevelBadge`, `DomainBadge`, `DispositionBadge`, `ConditionOperatorLabel`)

**Sprint 2: Rule Management (Week 3-4)**
6. `RuleConditionRow` component
7. `RuleConditionBuilder` component
8. `RuleForm` component
9. `JustificationModal` component
10. `RuleCreatePage` page
11. `RuleTable` + `RuleTableRow` components
12. `RuleListPage` page
13. Route configuration for rules

**Sprint 3: Rule Detail & Actions (Week 5-6)**
14. `RuleDetailCard` component
15. `RuleConditionsList` component
16. `RuleActionBar` component
17. `RuleDetailPage` page
18. `RuleEditPage` page (reuses RuleForm)
19. Rule deactivate/activate/delete integration

**Sprint 4: Alert Views (Week 7-8)**
20. `AlertFilters` component
21. `AlertTable` + `AlertTableRow` components
22. `AlertListPage` page
23. `AlertReportCard` component
24. `AlertRuleLogicCard` component
25. `AlertExecutionDetailsCard` component
26. `AlertDispositionForm` component
27. `AlertDispositionHistory` component
28. `AlertDetailPage` page
29. Route configuration for alerts
30. Error handling improvements
31. Component tests
32. Integration tests

### 16.2 Component Dependencies

```
Types (ruleAlert.types.ts)
    │
    ▼
API Client (ruleApi.ts, alertApi.ts)
    │
    ▼
React Query Hooks (hooks/)
    │
    ▼
Zustand Store (stores/)
    │
    ▼
Shared Components (RiskLevelBadge, etc.)
    │
    ├──────────────────────────────┐
    │                              │
    ▼                              ▼
Rule Components               Alert Components
    │                              │
    ├── RuleConditionRow          ├── AlertFilters
    ├── RuleConditionBuilder      ├── AlertTable
    ├── RuleForm                  ├── AlertRuleLogicCard
    ├── JustificationModal        ├── AlertDispositionForm
    ├── RuleTable                 └── AlertDispositionHistory
    └── RuleActionBar
    │                              │
    ▼                              ▼
Rule Pages                    Alert Pages
    │                              │
    ├── RuleListPage              ├── AlertListPage
    ├── RuleCreatePage            └── AlertDetailPage
    ├── RuleEditPage
    └── RuleDetailPage
```

---

## 17. User Experience Specifications

### 17.1 Loading States

| Component | Loading Indicator | Behavior |
|-----------|-------------------|----------|
| Rule List | Skeleton table rows (5) | Show while fetching |
| Rule Detail | Skeleton card sections | Show while fetching |
| Rule Form Submit | Button spinner + disabled | During API call |
| Alert List | Skeleton table rows (5) | Show while fetching |
| Alert Detail | Skeleton card sections | Show while fetching |
| Disposition Save | Button spinner + disabled | During API call |
| Justification Modal | Button spinner + disabled | During action |

### 17.2 Empty States

| Scenario | Icon | Message | Action |
|----------|------|---------|--------|
| No rules (first time) | ShieldAlert | "No rules defined yet" | "+ Create Rule" button |
| No rules matching filter | Filter | "No rules match your filters" | "Clear Filters" link |
| No alerts | Bell | "No alerts in your domain" | None |
| No alerts matching filter | Filter | "No alerts match your filter criteria" | "Clear Filters" link |
| No disposition history | Clock | "No previous dispositions" | None |

### 17.3 Success States

| Action | Feedback | Duration |
|--------|----------|----------|
| Rule created | Toast: "Rule created successfully" | 5 seconds |
| Rule updated | Toast: "Rule updated successfully" | 5 seconds |
| Rule deactivated | Toast: "Rule deactivated" | 5 seconds |
| Rule activated | Toast: "Rule activated" | 5 seconds |
| Rule deleted | Toast: "Rule deleted" + navigate to list | 5 seconds |
| Disposition saved | Toast: "Disposition saved" + badge update | 5 seconds |

### 17.4 Error States

| Error | Display | Action |
|-------|---------|--------|
| Form validation | Inline red text below fields | Fix fields |
| API error | Toast notification | "Retry" or "Reload" |
| Not found | Full-page error state | "Back to List" |
| Permission denied | Toast notification | Stay on current page |
| Version conflict | Toast with reload button | "Reload" button |
| Network error | Toast notification | "Retry" button |

### 17.5 Accessibility Requirements

| Requirement | Implementation |
|-------------|----------------|
| Keyboard navigation | All interactive elements focusable, Enter/Space to activate |
| Screen reader | ARIA labels on badges, form fields, buttons; semantic HTML |
| Focus management | Focus moves to first field on form load, to error on validation fail |
| Color contrast | WCAG AA for all text and badge colors |
| Form labels | All inputs have associated labels |
| Error announcements | Validation errors announced to screen readers via aria-live |
| Modal focus trap | JustificationModal traps focus while open |

### 17.6 Responsive Design

| Breakpoint | Layout Changes |
|------------|----------------|
| Mobile (<640px) | Stack form fields, single-column rule/alert cards, compact table |
| Tablet (640-1024px) | Two-column layout for detail pages, compact table |
| Desktop (>1024px) | Full sidebar, multi-column detail layout, full table |

---

## 18. Approval

**Prepared by:** Senior Technical Designer  
**Reviewed by:** [To be filled]  
**Approved by:** [To be filled]  
**Date:** [To be filled]

---

## 19. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | February 2026 | Senior Technical Designer | Initial FDD-FE for Rule-Based Analysis & Alert Generation |

---

**Document End**
