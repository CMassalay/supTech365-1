# Frontend Feature Design Document (FDD-FE)
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
Automated Validation Engine - Frontend

### 1.2 Feature Description
The frontend displays validation results to reporting entities after submission, shows detailed error reports for failed validations, and provides FIA staff with a queue of validated reports pending manual review.

### 1.3 Feature Purpose
Enable reporting entities to immediately see validation results and understand errors to fix, while providing FIA staff with a manageable queue of valid reports ready for manual review.

### 1.4 Related Features
- **Feature 2:** Digital Report Submission Portal - Triggers validation on submission
- **Feature 5:** Manual Validation Workflow - Consumes validation queue

### 1.5 User Types
- **Reporting Entity User** - Views validation results and error reports
- **Compliance Officer (FIA)** - Views CTR validation queue, accesses validated CTRs
- **Analyst (FIA)** - Views STR validation queue, accesses validated STRs
- **Compliance Officer (FIA)** - Views CTR validation queue
- **Analyst (FIA)** - Views STR validation queue

---

## 2. Technology Stack Reference

| Category | Selection |
|----------|-----------|
| **Framework** | React with TypeScript |
| **State Management** | React Query + Zustand |
| **UI Library** | Tailwind CSS + shadcn/ui |
| **Build Tool** | Vite |
| **Testing Framework** | Vitest + React Testing Library |
| **Rendering Paradigm** | Client-Side Rendering (SPA) |

---

## 3. Rendering Paradigm Selection

### 3.1 Selected Paradigm
**Client-Side Rendering (SPA)**

### 3.2 Paradigm Implications

- **State Management:** Client-side state with React Query for server state, Zustand for UI state
- **Routing:** React Router with client-side routing, route guards for authentication
- **API Integration:** Fetch API with React Query for data fetching, caching, and synchronization
- **State Persistence:** Browser localStorage for user preferences
- **Navigation:** Programmatic navigation, no page refreshes

---

## 4. Architecture Pattern

### 4.1 Component-Based Architecture

```
App
├── Layout Components
│   ├── AppLayout
│   ├── Sidebar
│   └── Header
├── Feature Components
│   ├── ValidationResult
│   ├── ValidationErrorReport
│   └── ValidationQueue
└── Shared Components
    ├── StatusBadge
    ├── ErrorList
    ├── DataTable
    └── LoadingSpinner
```

### 4.2 State Management Pattern

- **Server State:** React Query for API data (validation results, queue items)
- **UI State:** Zustand for local UI state (filters, pagination)
- **Component State:** React useState for form state, local component state

### 4.3 Routing Pattern

- Client-side routing with React Router
- Protected routes with authentication guards
- Role-based route access (Reporting Entity vs FIA Staff)

---

## 5. Screen List + Wireframes

### 5.1 Screen: Validation Result (Reporting Entity)

**Screen Name:** Validation Result Screen

**Screen Purpose:** Display validation outcome (pass/fail) after report submission

**Wireframe:**
```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]  SupTech365            [User Menu ▼]                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Validation Result                                   │   │
│  │                                                      │   │
│  │  Reference: REF-2026-00001                          │   │
│  │  Report Type: CTR                                    │   │
│  │  Submitted: 2026-02-05 14:30:00                     │   │
│  │                                                      │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │  ✓ VALIDATION PASSED                         │   │   │
│  │  │  Your report has been submitted successfully │   │   │
│  │  │  and is now in the review queue.             │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  │                                                      │   │
│  │  [View Submission Details]   [Submit Another]        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Inputs/Fields:** None (read-only display)

**Buttons/Actions:**
| Button | Action | States |
|--------|--------|--------|
| View Submission Details | Navigate to submission detail page | Always enabled |
| Submit Another | Navigate to submission form | Always enabled |
| View Errors | Navigate to error report (if failed) | Only if validation failed |

**Validation Messages:** N/A

**Navigation:**
- On "View Submission Details" → Submission Detail Screen
- On "Submit Another" → Submission Form Screen
- On "View Errors" → Validation Error Report Screen

---

### 5.2 Screen: Validation Error Report (Reporting Entity)

**Screen Name:** Validation Error Report Screen

**Screen Purpose:** Display detailed list of validation errors for failed submissions

**Wireframe:**
```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]  SupTech365            [User Menu ▼]                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [← Back to Submissions]                                    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Validation Error Report                             │   │
│  │                                                      │   │
│  │  Reference: REF-2026-00002                          │   │
│  │  Report Type: STR                                    │   │
│  │  Submitted: 2026-02-05 15:45:00                     │   │
│  │                                                      │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │  ✗ VALIDATION FAILED                         │   │   │
│  │  │  5 errors found. Please fix and resubmit.    │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  │                                                      │   │
│  │  Errors (5)                                          │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │ # │ Field          │ Error         │ Row     │   │   │
│  │  ├───┼────────────────┼───────────────┼─────────┤   │   │
│  │  │ 1 │ Transaction    │ Missing       │ Row 3   │   │   │
│  │  │   │ Date           │ mandatory     │         │   │   │
│  │  │   │                │ field         │         │   │   │
│  │  ├───┼────────────────┼───────────────┼─────────┤   │   │
│  │  │ 2 │ Amount         │ Invalid       │ Row 5   │   │   │
│  │  │   │                │ numeric       │         │   │   │
│  │  │   │                │ format        │         │   │   │
│  │  ├───┼────────────────┼───────────────┼─────────┤   │   │
│  │  │ 3 │ Date of Birth  │ Invalid date  │ Row 7   │   │   │
│  │  │   │                │ format        │         │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  │                                                      │   │
│  │  [Download Error Report]   [Resubmit Report]         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Inputs/Fields:** None (read-only display)

**Buttons/Actions:**
| Button | Action | States |
|--------|--------|--------|
| Back to Submissions | Navigate to submission list | Always enabled |
| Download Error Report | Download errors as CSV/PDF | Enabled if errors exist |
| Resubmit Report | Navigate to submission form | Always enabled |

**Validation Messages:** N/A

**Navigation:**
- On "Back" → Submission List Screen
- On "Resubmit Report" → Submission Form Screen

---

### 5.3 Screen: Validation Queue (FIA Staff)

**Screen Name:** Validation Queue Screen

**Screen Purpose:** Display list of validated reports pending manual review

**Wireframe:**
```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]  SupTech365            [User Menu ▼]                │
├─────────────────────────────────────────────────────────────┤
│  [Sidebar]                                                  │
│  Dashboard                                                  │
│  > Validation Queue  ←                                      │
│  Manual Review                                              │
│  Reports                                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Validation Queue                                           │
│                                                             │
│  Filters:                                                   │
│  [Report Type ▼] [Status ▼] [Date Range ▼] [Search...]     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Reference      │ Type │ Entity      │ Validated  │ Act│   │
│  ├────────────────┼──────┼─────────────┼────────────┼────┤   │
│  │ REF-2026-00001 │ CTR  │ First Bank  │ 2026-02-05 │ [→]│   │
│  │ REF-2026-00003 │ STR  │ Trust Corp  │ 2026-02-05 │ [→]│   │
│  │ REF-2026-00004 │ CTR  │ Unity Bank  │ 2026-02-05 │ [→]│   │
│  │ REF-2026-00005 │ STR  │ First Bank  │ 2026-02-05 │ [→]│   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Showing 1-20 of 45    [< Prev] [1] [2] [3] [Next >]       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Inputs/Fields:**
| Field | Type | Required | Default |
|-------|------|----------|---------|
| Report Type Filter | Dropdown | No | All |
| Status Filter | Dropdown | No | Pending |
| Date Range | Date Picker | No | Last 7 days |
| Search | Text | No | Empty |

**Buttons/Actions:**
| Button | Action | States |
|--------|--------|--------|
| [→] View | Navigate to queue item detail | Always enabled |
| Filter dropdowns | Apply filter to list | Always enabled |
| Pagination | Navigate pages | Enabled when multiple pages |

**Validation Messages:** N/A

**Navigation:**
- On row click/view → Queue Item Detail Screen
- Filter changes → Refresh list with filters

---

### 5.4 Screen: Queue Item Detail (FIA Staff)

**Screen Name:** Queue Item Detail Screen

**Screen Purpose:** Display validated report details before manual review

**Wireframe:**
```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]  SupTech365            [User Menu ▼]                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [← Back to Queue]                                          │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Validated Report                                    │   │
│  │                                                      │   │
│  │  Reference: REF-2026-00001                          │   │
│  │  Report Type: CTR                                    │   │
│  │  Reporting Entity: First National Bank              │   │
│  │  Submitted: 2026-02-05 14:30:00                     │   │
│  │  Validated: 2026-02-05 14:30:05                     │   │
│  │                                                      │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │  ✓ AUTOMATED VALIDATION PASSED               │   │   │
│  │  │  Ready for manual review                      │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  │                                                      │   │
│  │  Validation Summary                                  │   │
│  │  • Format: Valid (.xlsx)                            │   │
│  │  • Mandatory Fields: All present                    │   │
│  │  • Data Types: All valid                            │   │
│  │  • Processing Time: 3.2 seconds                     │   │
│  │                                                      │   │
│  │  [View Report Content]   [Begin Manual Review]       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Inputs/Fields:** None (read-only display)

**Buttons/Actions:**
| Button | Action | States |
|--------|--------|--------|
| Back to Queue | Navigate to queue list | Always enabled |
| View Report Content | Open report viewer | Always enabled |
| Begin Manual Review | Start manual validation (Feature 5) | Always enabled |

**Navigation:**
- On "Back" → Validation Queue Screen
- On "View Report Content" → Report Viewer Modal/Screen
- On "Begin Manual Review" → Manual Validation Screen (Feature 5)

---

## 6. User Flow Diagram

### 6.1 Reporting Entity Flow

```
┌─────────────────┐
│ Submit Report   │
│ (Feature 2)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Validation      │
│ Processing      │
│ (Backend)       │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐ ┌───────┐
│ PASS  │ │ FAIL  │
└───┬───┘ └───┬───┘
    │         │
    ▼         ▼
┌───────────┐ ┌───────────────┐
│ Validation│ │ Validation    │
│ Result    │ │ Error Report  │
│ (Success) │ │ Screen        │
└─────┬─────┘ └───────┬───────┘
      │               │
      │               ▼
      │         ┌───────────┐
      │         │ Fix Errors│
      │         │ & Resubmit│
      │         └───────────┘
      │
      ▼
┌─────────────────┐
│ View Submission │
│ Details         │
└─────────────────┘
```

### 6.2 FIA Staff Flow

```
┌─────────────────┐
│ Login           │
│ (Feature 1)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Dashboard       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Validation      │
│ Queue           │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Apply Filters   │◄──────┐
│ (optional)      │       │
└────────┬────────┘       │
         │                │
         ▼                │
┌─────────────────┐       │
│ Select Queue    │       │
│ Item            │       │
└────────┬────────┘       │
         │                │
         ▼                │
┌─────────────────┐       │
│ Queue Item      │       │
│ Detail          │       │
└────────┬────────┘       │
         │                │
    ┌────┴────┐           │
    │         │           │
    ▼         ▼           │
┌───────┐ ┌───────────┐   │
│ Begin │ │ Back to   │───┘
│ Manual│ │ Queue     │
│ Review│ └───────────┘
└───┬───┘
    │
    ▼
┌─────────────────┐
│ Manual Review   │
│ (Feature 5)     │
└─────────────────┘
```

---

## 7. UI Component Specifications

### 7.1 Component Hierarchy

```
ValidationModule/
├── pages/
│   ├── ValidationResultPage
│   ├── ValidationErrorReportPage
│   ├── ValidationQueuePage
│   └── QueueItemDetailPage
├── components/
│   ├── ValidationStatusCard
│   ├── ValidationErrorTable
│   ├── ValidationQueueTable
│   ├── ValidationSummary
│   └── QueueFilters
└── hooks/
    ├── useValidationResult
    ├── useValidationErrors
    └── useValidationQueue
```

### 7.2 Component: ValidationStatusCard

**Component Name:** `ValidationStatusCard`

**Component Purpose:** Display validation pass/fail status with visual indicator

**Props:**
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| status | `'PASSED' \| 'FAILED'` | Yes | - | Validation status |
| message | `string` | Yes | - | Status message |
| errorCount | `number` | No | 0 | Number of errors (if failed) |

**State:** None (stateless component)

**Responsibilities:**
- Render status badge (green checkmark / red X)
- Display status message
- Show error count if failed

**Dependencies:** StatusBadge component

---

### 7.3 Component: ValidationErrorTable

**Component Name:** `ValidationErrorTable`

**Component Purpose:** Display list of validation errors in tabular format

**Props:**
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| errors | `ValidationError[]` | Yes | - | Array of validation errors |
| onDownload | `() => void` | No | - | Download handler |

**State:**
| State | Type | Initial | Description |
|-------|------|---------|-------------|
| sortColumn | `string` | 'row_number' | Current sort column |
| sortDirection | `'asc' \| 'desc'` | 'asc' | Sort direction |

**Responsibilities:**
- Render error table with sortable columns
- Display error details (field, type, row, message)
- Provide download functionality

**Dependencies:** DataTable, SortIcon components

---

### 7.4 Component: ValidationQueueTable

**Component Name:** `ValidationQueueTable`

**Component Purpose:** Display queue of validated reports for FIA staff

**Props:**
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| items | `QueueItem[]` | Yes | - | Array of queue items |
| onRowClick | `(id: string) => void` | Yes | - | Row click handler |
| pagination | `PaginationState` | Yes | - | Pagination state |
| onPageChange | `(page: number) => void` | Yes | - | Page change handler |

**State:**
| State | Type | Initial | Description |
|-------|------|---------|-------------|
| selectedRow | `string \| null` | null | Currently selected row |

**Responsibilities:**
- Render queue items in table format
- Handle row selection and navigation
- Display pagination controls

**Dependencies:** DataTable, Pagination, StatusBadge components

---

### 7.5 Component: QueueFilters

**Component Name:** `QueueFilters`

**Component Purpose:** Provide filtering controls for validation queue

**Props:**
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| filters | `QueueFilters` | Yes | - | Current filter state |
| onChange | `(filters: QueueFilters) => void` | Yes | - | Filter change handler |

**State:** None (controlled component)

**Responsibilities:**
- Render filter dropdowns (Report Type, Status)
- Render date range picker
- Render search input
- Emit filter changes to parent

**Dependencies:** Select, DateRangePicker, SearchInput components

---

### 7.6 Component: ValidationSummary

**Component Name:** `ValidationSummary`

**Component Purpose:** Display summary of validation checks performed

**Props:**
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| result | `ValidationResult` | Yes | - | Validation result object |

**State:** None (stateless component)

**Responsibilities:**
- Display format validation result
- Display mandatory field check result
- Display data type validation result
- Show processing time

**Dependencies:** None

---

## 8. State Management

### 8.1 Server State (React Query)

**Query Keys:**
```typescript
const queryKeys = {
  validationResult: (submissionId: string) => ['validation', submissionId],
  validationErrors: (submissionId: string) => ['validation', submissionId, 'errors'],
  validationQueue: (filters: QueueFilters) => ['validation', 'queue', filters],
  queueItem: (itemId: string) => ['validation', 'queue', itemId]
};
```

**Queries:**

| Query | Key | Endpoint | Stale Time |
|-------|-----|----------|------------|
| useValidationResult | `validationResult(id)` | `GET /api/v1/validation/{id}` | 30s |
| useValidationErrors | `validationErrors(id)` | `GET /api/v1/validation/{id}/errors` | 60s |
| useValidationQueue | `validationQueue(filters)` | `GET /api/v1/validation/queue` | 10s |

### 8.2 UI State (Zustand)

**Store: ValidationUIStore**
```typescript
interface ValidationUIStore {
  // Queue filters
  queueFilters: QueueFilters;
  setQueueFilters: (filters: QueueFilters) => void;
  
  // Pagination
  currentPage: number;
  pageSize: number;
  setPage: (page: number) => void;
  
  // UI state
  selectedQueueItem: string | null;
  setSelectedQueueItem: (id: string | null) => void;
}
```

### 8.3 State Persistence

- Queue filters persisted to localStorage
- Page size preference persisted to localStorage
- No sensitive data stored client-side

---

## 9. Form Handling

### 9.1 Queue Filters Form

**Form Fields:**
| Field | Type | Validation | Default |
|-------|------|------------|---------|
| reportType | Select | Optional, enum | 'ALL' |
| status | Select | Optional, enum | 'PENDING' |
| dateFrom | Date | Optional, valid date | 7 days ago |
| dateTo | Date | Optional, valid date, >= dateFrom | Today |
| search | Text | Optional, max 100 chars | '' |

**Validation Rules:**
- dateFrom must be before or equal to dateTo
- search must be <= 100 characters

**Form Submission:**
- On filter change: Debounce 300ms, then update query params and refetch

---

## 10. API Integration

### 10.1 API Client Structure

```typescript
// Validation API Service
const validationApi = {
  getResult: (submissionId: string) => 
    api.get<ValidationResult>(`/validation/${submissionId}`),
  
  getErrors: (submissionId: string) => 
    api.get<ValidationErrorsResponse>(`/validation/${submissionId}/errors`),
  
  getQueue: (params: QueueParams) => 
    api.get<PaginatedQueue>('/validation/queue', { params }),
};
```

### 10.2 Request/Response Handling

**Authentication:**
- Bearer token in Authorization header
- Token from auth store

**Error Handling:**
- 401: Redirect to login
- 403: Show access denied message
- 404: Show "not found" state
- 500: Show error message with retry option

### 10.3 API Endpoint Mapping

| Component | Endpoint | Method |
|-----------|----------|--------|
| ValidationResultPage | `/api/v1/validation/{id}` | GET |
| ValidationErrorReportPage | `/api/v1/validation/{id}/errors` | GET |
| ValidationQueuePage | `/api/v1/validation/queue` | GET |
| QueueItemDetailPage | `/api/v1/validation/{id}` | GET |

---

## 11. Routing and Navigation

### 11.1 Route Definitions

**Reporting Entity Routes:**
| Path | Component | Auth | Description |
|------|-----------|------|-------------|
| `/submissions/:id/validation` | ValidationResultPage | RE User | View validation result |
| `/submissions/:id/validation/errors` | ValidationErrorReportPage | RE User | View error report |

**FIA Staff Routes:**
| Path | Component | Auth | Description |
|------|-----------|------|-------------|
| `/validation/queue` | ValidationQueuePage | FIA Staff | View validation queue |
| `/validation/queue/:id` | QueueItemDetailPage | FIA Staff | View queue item detail |

### 11.2 Route Parameters

| Parameter | Type | Validation | Description |
|-----------|------|------------|-------------|
| id | UUID | Valid UUID format | Submission/Queue item ID |

### 11.3 Navigation Guards

**ReportingEntityGuard:**
- Check user is authenticated
- Check user has Reporting Entity role
- Check user's entity matches submission's entity

**FIAStaffGuard:**
- Check user is authenticated
- Check user has FIA Staff role (Compliance Officer or Analyst)

### 11.4 Navigation Patterns

| From | To | Trigger |
|------|----|---------| 
| Submission Form | Validation Result | After successful submission |
| Validation Result (Failed) | Error Report | Click "View Errors" |
| Error Report | Submission Form | Click "Resubmit" |
| Dashboard | Validation Queue | Click sidebar menu |
| Validation Queue | Queue Item Detail | Click row |
| Queue Item Detail | Manual Review | Click "Begin Manual Review" |

---

## 12. Error Handling

### 12.1 Error Boundary

**ValidationErrorBoundary:**
- Wraps validation feature components
- Catches React errors
- Displays fallback UI
- Logs error to monitoring service

### 12.2 User-Facing Error Messages

| Error Type | Message | Action |
|------------|---------|--------|
| Network Error | "Unable to connect. Please check your connection and try again." | Retry button |
| 404 Not Found | "Validation result not found." | Back to submissions |
| 403 Forbidden | "You don't have permission to view this validation result." | Back to dashboard |
| 500 Server Error | "Something went wrong. Please try again later." | Retry button |

### 12.3 Error Recovery

- Retry button for transient errors
- Back navigation for permanent errors
- Refresh queue on error recovery

---

## 13. Testing Considerations

### 13.1 Component Tests

**ValidationStatusCard:**
- Renders passed status correctly
- Renders failed status with error count
- Applies correct styling

**ValidationErrorTable:**
- Renders error list
- Sorts by column
- Handles empty state

**ValidationQueueTable:**
- Renders queue items
- Handles pagination
- Handles row click

### 13.2 Integration Tests

**Validation Result Flow:**
- Load validation result
- Display correct status
- Navigate to error report (if failed)

**Queue Flow:**
- Load queue with filters
- Apply filters
- Navigate to detail
- Navigate to manual review

### 13.3 Test Utilities

**Mock Data:**
```typescript
const mockValidationResult = {
  validation_id: 'uuid',
  submission_id: 'uuid',
  status: 'PASSED',
  report_type: 'CTR',
  validated_at: '2026-02-05T14:30:05Z',
  errors: []
};

const mockValidationErrors = [
  {
    error_code: 'ERR-VAL-003',
    error_type: 'MANDATORY_FIELD',
    field_name: 'transaction_date',
    row_number: 3,
    message: "Mandatory field 'Transaction Date' is missing in Row 3"
  }
];
```

---

## 14. Security Considerations

### 14.1 Client-Side Validation

- Validate UUID format for route parameters
- Sanitize search input

### 14.2 XSS Prevention

- Use React's built-in escaping
- Don't use dangerouslySetInnerHTML with user data
- Sanitize error messages from API

### 14.3 Access Control

- Check authorization before rendering sensitive data
- Hide FIA-only components from Reporting Entities
- Don't expose internal IDs in URLs unnecessarily

### 14.4 Secure Storage

- No sensitive data in localStorage
- Tokens handled by auth module
- Clear state on logout

---

## 15. Dependencies Between Components

### 15.1 Component Dependencies

```
ValidationResultPage
├── uses ValidationStatusCard
├── uses ValidationSummary
└── uses Button (shared)

ValidationErrorReportPage
├── uses ValidationStatusCard
├── uses ValidationErrorTable
└── uses Button (shared)

ValidationQueuePage
├── uses QueueFilters
├── uses ValidationQueueTable
├── uses Pagination (shared)
└── uses LoadingSpinner (shared)

QueueItemDetailPage
├── uses ValidationStatusCard
├── uses ValidationSummary
└── uses Button (shared)
```

### 15.2 Data Flow

```
API Response
    │
    ▼
React Query Cache
    │
    ▼
useValidationResult / useValidationQueue
    │
    ▼
Page Component
    │
    ▼
Child Components (via props)
```

---

## 16. Implementation Order

### 16.1 Sprint 1: Foundation

1. Set up routing for validation pages
2. Create React Query hooks for validation API
3. Create Zustand store for UI state
4. Implement shared components (StatusBadge, LoadingSpinner)

### 16.2 Sprint 2: Reporting Entity Views

1. Implement ValidationStatusCard component
2. Implement ValidationResultPage
3. Implement ValidationErrorTable component
4. Implement ValidationErrorReportPage

### 16.3 Sprint 3: FIA Staff Views

1. Implement QueueFilters component
2. Implement ValidationQueueTable component
3. Implement ValidationQueuePage
4. Implement QueueItemDetailPage
5. Implement ValidationSummary component

### 16.4 Sprint 4: Integration & Testing

1. Integration with Feature 2 (Submission)
2. Integration with Feature 5 (Manual Review)
3. Error handling and edge cases
4. Component and integration tests

---

## 17. User Experience Specifications

### 17.1 Loading States

| Screen | Loading Indicator | Placement |
|--------|-------------------|-----------|
| Validation Result | Skeleton card | Center of content area |
| Error Report | Skeleton table | Table area |
| Validation Queue | Skeleton rows | Table body |
| Queue Item Detail | Skeleton card | Center of content area |

### 17.2 Error States

| Screen | Error Display | Recovery Action |
|--------|---------------|-----------------|
| Validation Result | Error card with message | Retry / Back |
| Error Report | Error card with message | Retry / Back |
| Validation Queue | Error banner above table | Retry |
| Queue Item Detail | Error card with message | Retry / Back to queue |

### 17.3 Empty States

| Screen | Empty Message | Action |
|--------|---------------|--------|
| Error Report | "No validation errors" (shouldn't happen) | - |
| Validation Queue | "No reports pending review" | Adjust filters |

### 17.4 Success States

| Action | Feedback |
|--------|----------|
| Validation Passed | Green success card with checkmark |
| Filter Applied | List updates with results count |
| Navigate to Manual Review | Smooth transition |

### 17.5 Accessibility Requirements

- ARIA labels on status badges
- Keyboard navigation for tables
- Focus management on page transitions
- Screen reader announcements for status changes
- Color contrast compliant status indicators

### 17.6 Responsive Design

| Breakpoint | Adaptation |
|------------|------------|
| Mobile (<768px) | Stack filters, single column table, cards |
| Tablet (768-1024px) | Two-column filters, condensed table |
| Desktop (>1024px) | Full layout with sidebar |

---

## 18. Approval

**Prepared by:** Technical Design Team  
**Reviewed by:** [To be filled]  
**Approved by:** [To be filled]  
**Date:** [To be filled]

---

## 19. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | February 2026 | Technical Design Team | Initial FDD-FE based on MVF scope |
