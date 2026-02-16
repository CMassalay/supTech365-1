# Frontend Feature Design Document (FDD-FE)
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
Manual Validation Workflow - Frontend

### 1.2 Feature Description
The frontend provides Compliance Officers (for CTRs) and Analysts (for STRs) with a validation queue interface to review reports that passed automated validation, view full report content, and submit validation decisions (Accept, Return for Correction, Reject) with mandatory justification for non-acceptance decisions.

### 1.3 Feature Purpose
Enable FIA Compliance Officers (for CTRs) and Analysts (for STRs) to efficiently review and validate reports through a user-friendly interface, ensuring quality control before reports proceed to downstream workflows.

### 1.4 Related Features
- **Feature 4:** Automated Validation Engine - Source of validated reports entering queue
- **Feature 2:** Digital Report Submission Portal - Original submission interface
- **Feature 1:** Authentication - Provides user authentication and role-based access

### 1.5 User Types
- **Compliance Officer (FIA)** - Primary user who reviews and validates CTRs
- **Analyst (FIA)** - Primary user who reviews and validates STRs

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
| **Form Management** | React Hook Form + Zod |

---

## 3. Rendering Paradigm Selection

### 3.1 Selected Paradigm
**Client-Side Rendering (SPA)**

### 3.2 Paradigm Implications

- **State Management:** Client-side state with React Query for server state, Zustand for UI state
- **Routing:** React Router with client-side routing, route guards for authentication and role authorization
- **API Integration:** Fetch API with React Query for data fetching, caching, and synchronization
- **State Persistence:** Browser localStorage for user preferences and filter state
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
├── Feature Components (Manual Validation)
│   ├── ValidationQueue
│   ├── ValidationQueueItem
│   ├── ReportReviewPanel
│   ├── ReportMetadataCard
│   ├── TransactionTable
│   ├── ValidationDecisionForm
│   ├── ValidationDecisionModal
│   └── ValidationAuditLog
└── Shared Components
    ├── DataTable
    ├── StatusBadge
    ├── LoadingSpinner
    ├── ErrorMessage
    ├── Pagination
    └── FilterBar
```

### 4.2 State Management Pattern

- **Server State:** React Query for API data (validation queue, report content, audit logs)
- **UI State:** Zustand for local UI state (filters, selected report, modal visibility)
- **Form State:** React Hook Form for decision form state and validation
- **Component State:** React useState for ephemeral component state

### 4.3 Routing Pattern

- Client-side routing with React Router
- Protected routes with authentication guards
- Role-based route access (COMPLIANCE_OFFICER or ANALYST role required)
- Nested routes for report review within validation module

---

## 5. Screen List + Wireframes

### 5.1 Screen: Validation Queue

**Screen Name:** Validation Queue Screen

**Screen Purpose:** Display list of reports pending manual validation, ordered by submission timestamp (oldest first)

**Route:** `/compliance/validation-queue`

**Wireframe:**
```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo]  SupTech365                    [User: Compliance Officer ▼]     │
├─────────────────────────────────────────────────────────────────┤
│  [Sidebar]         │                                            │
│  Dashboard         │  Manual Validation Queue                   │
│  > Validation ←    │                                            │
│    Queue           │  Pending Reviews: 45                       │
│    Audit Logs      │                                            │
│  Reports           │  Filters:                                  │
│  Settings          │  [Report Type ▼] [Date Range ▼] [Search..]│
│                    │                                            │
│                    │  ┌─────────────────────────────────────────┐│
│                    │  │ Reference     │Type│ Entity    │Date│Act││
│                    │  ├───────────────┼────┼───────────┼────┼───┤│
│                    │  │ FIA-2026-0001 │CTR │ First Bank│02-03│[→]││
│                    │  │ FIA-2026-0002 │STR │ Unity Corp│02-03│[→]││
│                    │  │ FIA-2026-0003 │CTR │ Trust Bank│02-03│[→]││
│                    │  │ FIA-2026-0004 │STR │ First Bank│02-04│[→]││
│                    │  │ FIA-2026-0005 │CTR │ Metro Bank│02-04│[→]││
│                    │  └─────────────────────────────────────────┘│
│                    │                                            │
│                    │  Showing 1-20 of 45  [<Prev][1][2][3][Next>]│
│                    │                                            │
└─────────────────────────────────────────────────────────────────┘
```

**Inputs/Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Report Type Filter | Dropdown | No | Filter by CTR or STR |
| Date Range Filter | Date Range | No | Filter by submission date |
| Search | Text | No | Search by reference number or entity name |

**Buttons/Actions:**

| Button | Action | States |
|--------|--------|--------|
| View Details [→] | Navigate to Report Review | Always enabled |
| Filter Apply | Apply selected filters | Enabled when filters changed |
| Filter Reset | Clear all filters | Enabled when filters applied |
| Refresh | Reload queue data | Always enabled |

**Validation Messages:** N/A (read-only display)

**Navigation:**
- On "View Details" button click → Report Review Screen
- On "Audit Logs" sidebar link → Audit Logs Screen

---

### 5.2 Screen: Report Review

**Screen Name:** Report Review Screen

**Screen Purpose:** Display full report content and enable validation decision

**Route:** `/compliance/validation-queue/:submissionId`

**Wireframe:**
```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo]  SupTech365                    [User: Compliance Officer ▼]     │
├─────────────────────────────────────────────────────────────────┤
│  [Sidebar]         │                                            │
│                    │  [← Back to Queue]                         │
│                    │                                            │
│                    │  Report Review: FIA-2026-001234            │
│                    │                                            │
│                    │  ┌─────────────────────────────────────┐   │
│                    │  │ Report Metadata                     │   │
│                    │  │ Reference: FIA-2026-001234          │   │
│                    │  │ Type: CTR                           │   │
│                    │  │ Entity: First Bank of Liberia       │   │
│                    │  │ Submitted: 2026-02-03 10:30:00      │   │
│                    │  │ Submitted By: compliance_officer    │   │
│                    │  │ Reporting Period: Jan 1-31, 2026    │   │
│                    │  │ Status: [Pending Validation]        │   │
│                    │  └─────────────────────────────────────┘   │
│                    │                                            │
│                    │  Transactions (5)                          │
│                    │  ┌─────────────────────────────────────┐   │
│                    │  │ # │Date      │Type    │Amount  │Name│   │
│                    │  ├───┼──────────┼────────┼────────┼────┤   │
│                    │  │ 1 │2026-01-15│Deposit │25,000  │John│   │
│                    │  │ 2 │2026-01-16│Withdraw│15,000  │Jane│   │
│                    │  │ 3 │2026-01-18│Transfer│50,000  │Corp│   │
│                    │  │ 4 │2026-01-22│Deposit │35,000  │John│   │
│                    │  │ 5 │2026-01-25│Deposit │25,000  │Mike│   │
│                    │  └─────────────────────────────────────┘   │
│                    │                                            │
│                    │  [Accept] [Return for Correction] [Reject] │
│                    │                                            │
└─────────────────────────────────────────────────────────────────┘
```

**Inputs/Fields:** None (read-only display until decision action)

**Buttons/Actions:**

| Button | Action | States |
|--------|--------|--------|
| Back to Queue | Navigate to Validation Queue | Always enabled |
| Accept | Open Accept confirmation dialog | Enabled if status is PENDING |
| Return for Correction | Open Return decision modal | Enabled if status is PENDING |
| Reject | Open Reject decision modal | Enabled if status is PENDING |
| Expand Transaction | Show full transaction details | Always enabled |

**Validation Messages:** N/A

**Navigation:**
- On "Back to Queue" → Validation Queue Screen
- On decision submit success → Validation Queue Screen (with success toast)

---

### 5.3 Screen: Validation Decision Modal

**Screen Name:** Validation Decision Modal

**Screen Purpose:** Capture validation decision with mandatory reason for Return/Reject

**Wireframe (Return/Reject Modal):**
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Return Report for Correction                            │   │
│  │                                                          │   │
│  │  Reference: FIA-2026-001234                             │   │
│  │  Report Type: CTR                                        │   │
│  │                                                          │   │
│  │  Reason for Return *                                     │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │                                                    │ │   │
│  │  │ Please explain why this report is being returned  │ │   │
│  │  │ for correction...                                  │ │   │
│  │  │                                                    │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  │  Minimum 10 characters required                          │   │
│  │  [Error: Reason is mandatory for Return decisions]       │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │ ⚠️ This action cannot be undone. The reporting   │   │   │
│  │  │ entity will be notified of your decision.        │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  │                                                          │   │
│  │                         [Cancel]  [Confirm Return]       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Wireframe (Accept Confirmation):**
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Accept Report                                           │   │
│  │                                                          │   │
│  │  Reference: FIA-2026-001234                             │   │
│  │  Report Type: CTR                                        │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │ ✓ This report will be accepted and routed to:    │   │   │
│  │  │   Compliance Officer Queue                        │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  │                                                          │   │
│  │  Are you sure you want to accept this report?           │   │
│  │                                                          │   │
│  │                            [Cancel]  [Confirm Accept]    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Inputs/Fields:**

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| Reason | Textarea | Yes (Return/Reject) | Min 10 chars, max 2000 chars | Reason for Return or Reject decision |

**Buttons/Actions:**

| Button | Action | States |
|--------|--------|--------|
| Cancel | Close modal without action | Always enabled |
| Confirm Accept | Submit Accept decision | Always enabled |
| Confirm Return | Submit Return decision | Enabled when reason >= 10 chars |
| Confirm Reject | Submit Reject decision | Enabled when reason >= 10 chars |

**Validation Messages:**

| Condition | Message | Location |
|-----------|---------|----------|
| Reason empty | "Reason is mandatory for Return/Reject decisions" | Below textarea |
| Reason < 10 chars | "Reason must be at least 10 characters" | Below textarea |
| Reason > 2000 chars | "Reason cannot exceed 2000 characters" | Below textarea |
| API error | "Failed to submit decision. Please try again." | Toast notification |

**Navigation:**
- On Cancel → Close modal, stay on Report Review
- On Confirm success → Validation Queue Screen (with success toast)
- On Confirm error → Stay on modal, show error toast

---

### 5.4 Screen: Validation Audit Logs

**Screen Name:** Validation Audit Logs Screen

**Screen Purpose:** Display audit trail of validation decisions for compliance reporting

**Route:** `/compliance/validation-audit-logs`

**Wireframe:**
```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo]  SupTech365                    [User: Compliance Officer ▼]     │
├─────────────────────────────────────────────────────────────────┤
│  [Sidebar]         │                                            │
│  Dashboard         │  Validation Audit Logs                     │
│  > Validation      │                                            │
│    Queue           │  Filters:                                  │
│    Audit Logs ←    │  [Decision ▼] [Date From] [Date To] [User]│
│  Reports           │                                            │
│                    │  ┌─────────────────────────────────────────┐│
│                    │  │Reference    │Decision│User    │Date │Act││
│                    │  ├─────────────┼────────┼────────┼─────┼───┤│
│                    │  │FIA-2026-001 │Accept  │J.Smith │02-03│[👁]││
│                    │  │FIA-2026-002 │Return  │M.Jones │02-03│[👁]││
│                    │  │FIA-2026-003 │Reject  │J.Smith │02-04│[👁]││
│                    │  │FIA-2026-004 │Accept  │K.Brown │02-04│[👁]││
│                    │  └─────────────────────────────────────────┘│
│                    │                                            │
│                    │  Showing 1-20 of 150  [<Prev][1][2][Next>] │
│                    │                                            │
└─────────────────────────────────────────────────────────────────┘
```

**Inputs/Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Decision Filter | Dropdown | No | Filter by ACCEPT, RETURN, REJECT |
| Date From | Date | No | Filter from date |
| Date To | Date | No | Filter to date |
| User Filter | Dropdown | No | Filter by reviewer |
| Reference Search | Text | No | Search by reference number |

**Buttons/Actions:**

| Button | Action | States |
|--------|--------|--------|
| View [👁] | Show full audit entry details in modal | Always enabled |
| Apply Filters | Apply selected filters | Enabled when filters changed |
| Export | Export audit logs to CSV | Always enabled |

**Navigation:**
- On "View" button click → Audit detail modal (show full reason text)

---

## 6. User Flow Diagram

### 6.1 Manual Validation Flow

```
┌─────────────────┐
│  Compliance Officer │
│  Logs In        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Navigate to    │
│  Validation     │
│  Queue          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  View Queue     │
│  (FIFO Order)   │
│  Apply Filters  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Select Report  │
│  to Review      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Review Report  │
│  Content        │
│  - Metadata     │
│  - Transactions │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│              Make Decision                   │
├─────────────┬─────────────┬─────────────────┤
│   Accept    │   Return    │     Reject      │
└──────┬──────┴──────┬──────┴────────┬────────┘
       │             │               │
       ▼             ▼               ▼
┌──────────┐  ┌────────────┐  ┌────────────┐
│ Confirm  │  │ Enter      │  │ Enter      │
│ Dialog   │  │ Reason     │  │ Reason     │
│          │  │ (min 10)   │  │ (min 10)   │
└────┬─────┘  └─────┬──────┘  └─────┬──────┘
     │              │               │
     └──────────────┴───────────────┘
                    │
                    ▼
           ┌───────────────┐
           │ Submit        │
           │ Decision      │
           └───────┬───────┘
                   │
         ┌─────────┴─────────┐
         │                   │
         ▼                   ▼
┌─────────────────┐  ┌─────────────────┐
│   Success       │  │   Error         │
│   - Toast msg   │  │   - Toast msg   │
│   - Return to   │  │   - Stay on     │
│     Queue       │  │     modal       │
└─────────────────┘  └─────────────────┘
```

### 6.2 Workflow Routing (Post-Accept)

```
┌─────────────────┐
│  Report         │
│  Accepted       │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  Check Report Type      │
└─────────┬───────────────┘
          │
    ┌─────┴─────┐
    │           │
    ▼           ▼
┌───────┐   ┌───────┐
│  CTR  │   │  STR  │
└───┬───┘   └───┬───┘
    │           │
    ▼           ▼
┌───────────┐ ┌───────────┐
│Compliance │ │ Analyst   │
│Officer    │ │ Queue     │
│Queue      │ │ (Bypass   │
│           │ │ Compliance│
└───────────┘ └───────────┘
```

---

## 7. UI Component Specifications

### 7.1 Component Hierarchy

```
ValidationModule/
├── ValidationQueue/
│   ├── ValidationQueue.tsx
│   ├── ValidationQueueFilters.tsx
│   ├── ValidationQueueTable.tsx
│   └── ValidationQueueItem.tsx
├── ReportReview/
│   ├── ReportReviewPage.tsx
│   ├── ReportMetadataCard.tsx
│   ├── TransactionTable.tsx
│   └── ValidationDecisionBar.tsx
├── ValidationDecision/
│   ├── ValidationDecisionModal.tsx
│   ├── ValidationDecisionForm.tsx
│   ├── AcceptConfirmDialog.tsx
│   └── DecisionReasonInput.tsx
└── ValidationAuditLog/
    ├── ValidationAuditLogPage.tsx
    ├── AuditLogFilters.tsx
    └── AuditLogTable.tsx
```

### 7.2 Component: ValidationQueue

**Component Name:** ValidationQueue

**Component Purpose:** Display paginated list of reports pending manual validation

**Props:**
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| - | - | - | - | No props (uses React Query for data) |

**State:**
| State | Type | Initial | Description |
|-------|------|---------|-------------|
| filters | QueueFilters | {} | Active filter values |
| page | number | 1 | Current page number |
| pageSize | number | 20 | Items per page |

**Responsibilities:**
- Fetch validation queue via React Query
- Display queue items in data table with action column
- Handle filter changes
- Handle pagination
- Navigate to report review on "View Details" button click

**Dependencies:**
- `ValidationQueueFilters` component
- `ValidationQueueTable` component
- `useValidationQueue` hook (React Query)
- `useValidationFiltersStore` (Zustand)

---

### 7.2.1 Component: ValidationQueueItem

**Component Name:** ValidationQueueItem

**Component Purpose:** Render a single queue item row with View Details action button

**Props:**
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| item | QueueItem | Yes | - | Queue item data |
| onViewDetails | (id: string) => void | Yes | - | View details click handler |

**Responsibilities:**
- Display queue item fields (reference, type, entity, date)
- Render "View Details" button in action column
- Call onViewDetails handler on button click

**Dependencies:**
- `Button` component (shadcn/ui)
- `TableRow`, `TableCell` components (shadcn/ui)
- `StatusBadge` component (for report type)

---

### 7.3 Component: ReportReviewPage

**Component Name:** ReportReviewPage

**Component Purpose:** Display full report content for reviewer (Compliance Officer or Analyst) review

**Props:**
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| submissionId | string | Yes | - | From route params |

**State:**
| State | Type | Initial | Description |
|-------|------|---------|-------------|
| decisionModalOpen | boolean | false | Modal visibility |
| decisionType | DecisionType | null | Selected decision type |

**Responsibilities:**
- Fetch report content via React Query
- Display report metadata
- Display transaction table
- Handle decision button clicks
- Open decision modal with selected type

**Dependencies:**
- `ReportMetadataCard` component
- `TransactionTable` component
- `ValidationDecisionBar` component
- `ValidationDecisionModal` component
- `useReportContent` hook (React Query)

---

### 7.4 Component: ValidationDecisionModal

**Component Name:** ValidationDecisionModal

**Component Purpose:** Modal for submitting validation decisions with mandatory reason

**Props:**
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| open | boolean | Yes | - | Modal visibility |
| onOpenChange | (open: boolean) => void | Yes | - | Toggle modal |
| submissionId | string | Yes | - | Report submission ID |
| referenceNumber | string | Yes | - | Report reference |
| reportType | 'CTR' \| 'STR' | Yes | - | Report type |
| decisionType | 'ACCEPT' \| 'RETURN' \| 'REJECT' | Yes | - | Decision type |
| onSuccess | () => void | Yes | - | Callback on success |

**State:**
| State | Type | Initial | Description |
|-------|------|---------|-------------|
| reason | string | '' | Reason text (for RETURN/REJECT) |
| isSubmitting | boolean | false | Submission loading state |

**Responsibilities:**
- Display decision confirmation UI
- Capture reason for RETURN/REJECT
- Validate reason (min 10 chars)
- Submit decision via mutation
- Show success/error feedback
- Call onSuccess callback on success

**Dependencies:**
- `Dialog` component (shadcn/ui)
- `ValidationDecisionForm` component
- `useSubmitDecision` hook (React Query mutation)

---

### 7.5 Component: ValidationDecisionForm

**Component Name:** ValidationDecisionForm

**Component Purpose:** Form for entering validation decision reason

**Props:**
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| decisionType | 'RETURN' \| 'REJECT' | Yes | - | Decision type |
| onSubmit | (reason: string) => void | Yes | - | Form submit handler |
| isSubmitting | boolean | No | false | Loading state |

**State:**
| State | Type | Initial | Description |
|-------|------|---------|-------------|
| Managed by React Hook Form | - | - | - |

**Form Fields:**
| Field | Validation | Error Messages |
|-------|------------|----------------|
| reason | required, minLength(10), maxLength(2000) | "Reason is mandatory", "Minimum 10 characters", "Maximum 2000 characters" |

**Responsibilities:**
- Render reason textarea
- Validate reason input
- Display validation errors
- Handle form submission

**Dependencies:**
- `Form` components (shadcn/ui)
- `Textarea` component (shadcn/ui)
- React Hook Form + Zod schema

---

### 7.6 Component: TransactionTable

**Component Name:** TransactionTable

**Component Purpose:** Display report transactions in readable table format

**Props:**
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| transactions | Transaction[] | Yes | - | Transaction data |
| isLoading | boolean | No | false | Loading state |

**State:**
| State | Type | Initial | Description |
|-------|------|---------|-------------|
| expandedRows | Set<number> | new Set() | Expanded row indices |

**Responsibilities:**
- Display transactions in data table
- Handle row expansion for details
- Format currency amounts
- Format dates

**Dependencies:**
- `Table` components (shadcn/ui)
- `formatCurrency` utility
- `formatDate` utility

---

## 8. State Management

### 8.1 Server State (React Query)

**Query: useValidationQueue**
```typescript
const useValidationQueue = (filters: QueueFilters, page: number, pageSize: number) => {
  return useQuery({
    queryKey: ['validationQueue', filters, page, pageSize],
    queryFn: () => fetchValidationQueue(filters, page, pageSize),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });
};
```

**Query: useReportContent**
```typescript
const useReportContent = (submissionId: string) => {
  return useQuery({
    queryKey: ['reportContent', submissionId],
    queryFn: () => fetchReportContent(submissionId),
    enabled: !!submissionId,
  });
};
```

**Query: useAuditLogs**
```typescript
const useAuditLogs = (filters: AuditLogFilters, page: number, pageSize: number) => {
  return useQuery({
    queryKey: ['auditLogs', filters, page, pageSize],
    queryFn: () => fetchAuditLogs(filters, page, pageSize),
  });
};
```

**Mutation: useSubmitDecision**
```typescript
const useSubmitDecision = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { submissionId: string; decision: string; reason?: string }) =>
      submitValidationDecision(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['validationQueue'] });
      toast.success('Decision submitted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit decision');
    },
  });
};
```

### 8.2 UI State (Zustand)

**Store: useValidationStore**
```typescript
interface ValidationStore {
  // Filters
  queueFilters: QueueFilters;
  setQueueFilters: (filters: Partial<QueueFilters>) => void;
  resetQueueFilters: () => void;
  
  // Modal state
  decisionModalOpen: boolean;
  selectedDecisionType: DecisionType | null;
  openDecisionModal: (type: DecisionType) => void;
  closeDecisionModal: () => void;
  
  // Selected report
  selectedSubmissionId: string | null;
  setSelectedSubmission: (id: string | null) => void;
}
```

### 8.3 Form State (React Hook Form)

**Schema: ValidationDecisionSchema**
```typescript
const validationDecisionSchema = z.object({
  decision: z.enum(['ACCEPT', 'RETURN', 'REJECT']),
  reason: z.string()
    .min(10, 'Reason must be at least 10 characters')
    .max(2000, 'Reason cannot exceed 2000 characters')
    .optional()
    .refine((val, ctx) => {
      const decision = ctx.parent.decision;
      if ((decision === 'RETURN' || decision === 'REJECT') && (!val || val.trim().length < 10)) {
        return false;
      }
      return true;
    }, 'Reason is mandatory for Return/Reject decisions'),
});
```

---

## 9. Form Handling

### 9.1 Validation Decision Form

**Form Fields:**

| Field | Type | Validation | Error Messages |
|-------|------|------------|----------------|
| decision | select | Required, enum | "Please select a decision" |
| reason | textarea | Conditional required, min 10, max 2000 | See below |

**Validation Rules:**

| Rule | Condition | Error Message |
|------|-----------|---------------|
| Required | decision is RETURN or REJECT | "Reason is mandatory for Return/Reject decisions" |
| Min Length | reason.length < 10 | "Reason must be at least 10 characters" |
| Max Length | reason.length > 2000 | "Reason cannot exceed 2000 characters" |
| Whitespace | reason contains only whitespace | "Please provide a meaningful reason" |

**Error Display:**
- Inline errors below textarea field
- Error border on textarea when invalid
- Character count indicator

**Submission Flow:**
1. User selects decision (Accept/Return/Reject)
2. If RETURN/REJECT, reason form displayed
3. User enters reason (min 10 chars)
4. Form validates on blur and submit
5. If valid, API call triggered
6. Loading spinner shown on submit button
7. On success: close modal, show toast, navigate to queue
8. On error: show error toast, keep modal open

### 9.2 Filter Forms

**Queue Filters:**
```typescript
interface QueueFilters {
  reportType?: 'CTR' | 'STR';
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}
```

**Audit Log Filters:**
```typescript
interface AuditLogFilters {
  decision?: 'ACCEPT' | 'RETURN' | 'REJECT';
  dateFrom?: string;
  dateTo?: string;
  decidedBy?: string;
  submissionReference?: string;
}
```

---

## 10. API Integration

### 10.1 API Client Structure

**Base Configuration:**
```typescript
const apiClient = {
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  // JWT token attached via interceptor
};
```

### 10.2 Endpoint Mapping

**GET /api/v1/manual-validation/queue**
```typescript
interface GetQueueParams {
  page?: number;
  page_size?: number;
  report_type?: 'CTR' | 'STR';
}

interface QueueResponse {
  items: QueueItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

const fetchValidationQueue = async (params: GetQueueParams): Promise<QueueResponse> => {
  const response = await apiClient.get('/manual-validation/queue', { params });
  return response.data;
};
```

**GET /api/v1/manual-validation/reports/{submissionId}**
```typescript
interface ReportContentResponse {
  submission_id: string;
  reference_number: string;
  report_type: 'CTR' | 'STR';
  submission_method: string;
  entity: { id: string; name: string; entity_type: string };
  submitted_by: { id: string; username: string };
  submitted_at: string;
  metadata: Record<string, unknown>;
  transactions: Transaction[];
  validation_status: string;
  automated_validation_passed_at: string;
}

const fetchReportContent = async (submissionId: string): Promise<ReportContentResponse> => {
  const response = await apiClient.get(`/manual-validation/reports/${submissionId}`);
  return response.data;
};
```

**POST /api/v1/manual-validation/reports/{submissionId}/decision**
```typescript
interface SubmitDecisionRequest {
  decision: 'ACCEPT' | 'RETURN' | 'REJECT';
  reason?: string;
}

interface SubmitDecisionResponse {
  submission_id: string;
  reference_number: string;
  decision: string;
  decided_at: string;
  routed_to_queue?: string;
  message: string;
}

const submitValidationDecision = async (
  submissionId: string,
  data: SubmitDecisionRequest
): Promise<SubmitDecisionResponse> => {
  const response = await apiClient.post(
    `/manual-validation/reports/${submissionId}/decision`,
    data
  );
  return response.data;
};
```

**GET /api/v1/manual-validation/audit-logs**
```typescript
interface GetAuditLogsParams {
  page?: number;
  page_size?: number;
  decision?: 'ACCEPT' | 'RETURN' | 'REJECT';
  from_date?: string;
  to_date?: string;
  decided_by?: string;
  submission_reference?: string;
}

interface AuditLogResponse {
  items: AuditLogItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

const fetchAuditLogs = async (params: GetAuditLogsParams): Promise<AuditLogResponse> => {
  const response = await apiClient.get('/manual-validation/audit-logs', { params });
  return response.data;
};
```

### 10.3 Error Handling

**Error Response Structure:**
```typescript
interface ApiError {
  error_code: string;
  error_message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}
```

**Error Handling Patterns:**
```typescript
const handleApiError = (error: unknown): string => {
  if (isAxiosError(error) && error.response?.data) {
    const apiError = error.response.data as ApiError;
    
    switch (apiError.error_code) {
      case 'VALIDATION_REASON_REQUIRED':
        return 'Please provide a reason for this decision';
      case 'QUEUE_ACCESS_VIOLATION':
        return 'You do not have permission to access this queue';
      case 'SUBMISSION_NOT_IN_QUEUE':
        return 'This report is no longer in the validation queue';
      case 'DECISION_ALREADY_MADE':
        return 'A decision has already been made for this report';
      default:
        return apiError.error_message || 'An unexpected error occurred';
    }
  }
  return 'Network error. Please check your connection.';
};
```

---

## 11. Routing and Navigation

### 11.1 Route Definitions

```typescript
const validationRoutes = [
  {
    path: '/compliance/validation-queue',
    element: <ValidationQueuePage />,
    meta: {
      requiresAuth: true,
      allowedRoles: ['COMPLIANCE_OFFICER', 'ANALYST'],
      title: 'Validation Queue',
    },
  },
  {
    path: '/compliance/validation-queue/:submissionId',
    element: <ReportReviewPage />,
    meta: {
      requiresAuth: true,
      allowedRoles: ['COMPLIANCE_OFFICER', 'ANALYST'],
      title: 'Report Review',
    },
  },
  {
    path: '/compliance/validation-audit-logs',
    element: <ValidationAuditLogPage />,
    meta: {
      requiresAuth: true,
      allowedRoles: ['COMPLIANCE_OFFICER', 'ANALYST', 'ADMIN'],
      title: 'Validation Audit Logs',
    },
  },
];
```

### 11.2 Navigation Guards

**Role Guard:**
```typescript
const RoleGuard: React.FC<{ allowedRoles: string[]; children: React.ReactNode }> = ({
  allowedRoles,
  children,
}) => {
  const { user } = useAuth();
  
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};
```

### 11.3 Navigation Patterns

**Programmatic Navigation:**
```typescript
const navigate = useNavigate();

// Navigate to report review on "View Details" button click
const handleViewDetails = (submissionId: string) => {
  navigate(`/compliance/validation-queue/${submissionId}`);
};

// Navigate back to queue after decision
const handleDecisionSuccess = () => {
  navigate('/compliance/validation-queue');
  toast.success('Decision submitted successfully');
};

// Navigate to audit logs
const handleViewAuditLogs = () => {
  navigate('/compliance/validation-audit-logs');
};
```

---

## 12. Error Handling

### 12.1 Error Boundary

```typescript
const ValidationErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary
      fallback={
        <ErrorFallback
          title="Something went wrong"
          message="We encountered an error loading the validation module. Please try again."
          onRetry={() => window.location.reload()}
        />
      }
    >
      {children}
    </ErrorBoundary>
  );
};
```

### 12.2 User-Facing Error Messages

| Error Code | User Message | Action |
|------------|--------------|--------|
| VALIDATION_REASON_REQUIRED | "Reason is mandatory for Return/Reject decisions. Please provide a detailed reason." | Focus reason field |
| QUEUE_ACCESS_VIOLATION | "You do not have permission to access this queue." | Redirect to dashboard |
| SUBMISSION_NOT_IN_QUEUE | "This report is no longer in the validation queue. It may have been processed by another user." | Redirect to queue |
| DECISION_ALREADY_MADE | "A decision has already been made for this report." | Redirect to queue |
| NETWORK_ERROR | "Unable to connect. Please check your internet connection." | Show retry button |
| SERVER_ERROR | "Something went wrong on our end. Please try again later." | Show retry button |

### 12.3 Error Display Patterns

**Form Errors:**
- Inline error messages below fields
- Red border on invalid fields
- Error icon indicator

**API Errors:**
- Toast notification for non-blocking errors
- Full-page error state for blocking errors
- Retry button for transient errors

**Loading Errors:**
- Skeleton loading during fetch
- Error state with retry option on failure

---

## 13. Testing Considerations

### 13.1 Component Tests

**ValidationQueue Tests:**
- Renders queue items correctly
- Renders action column with View Details button
- Applies filters correctly
- Handles pagination
- Navigates on View Details button click
- Shows loading state
- Shows error state
- Shows empty state

**ValidationDecisionModal Tests:**
- Opens with correct decision type
- Shows reason field for RETURN/REJECT
- Hides reason field for ACCEPT
- Validates reason minimum length
- Disables submit when invalid
- Shows loading state on submit
- Calls onSuccess callback
- Shows error on failure

**ReportReviewPage Tests:**
- Fetches report content
- Displays metadata correctly
- Displays transactions correctly
- Opens decision modal on button click
- Navigates back to queue

### 13.2 Integration Tests

**Validation Decision Flow:**
```typescript
test('submits RETURN decision with reason', async () => {
  // Render report review page
  // Click "Return for Correction" button
  // Enter reason (>= 10 chars)
  // Click "Confirm Return"
  // Verify API call with correct payload
  // Verify navigation to queue
  // Verify success toast
});

test('prevents REJECT without reason', async () => {
  // Render report review page
  // Click "Reject" button
  // Attempt to submit without reason
  // Verify error message displayed
  // Verify API not called
});
```

### 13.3 Test Fixtures

**Mock Queue Data:**
```typescript
const mockQueueItems: QueueItem[] = [
  {
    submission_id: 'uuid-1',
    reference_number: 'FIA-2026-001234',
    report_type: 'CTR',
    entity_name: 'First Bank',
    submitted_at: '2026-02-03T10:30:00Z',
    entered_queue_at: '2026-02-03T10:31:00Z',
    transaction_count: 5,
    total_amount: 150000,
  },
  // ... more items
];
```

**Mock Report Content:**
```typescript
const mockReportContent: ReportContentResponse = {
  submission_id: 'uuid-1',
  reference_number: 'FIA-2026-001234',
  report_type: 'CTR',
  // ... full content
};
```

---

## 14. Security Considerations

### 14.1 Client-Side Validation

- Validate reason length before submission
- Sanitize user input to prevent XSS
- Validate decision enum values

### 14.2 Authentication

- JWT token attached to all API requests
- Token refresh on expiration
- Redirect to login on 401 response

### 14.3 Authorization

- Role-based route guards (COMPLIANCE_OFFICER or ANALYST required)
- Server-side authorization enforced
- UI adapts based on user role

### 14.4 Secure Storage

- No sensitive data stored in localStorage
- JWT stored in httpOnly cookie (handled by auth)
- Filter preferences only stored locally

---

## 15. User Experience Specifications

### 15.1 Loading States

| Context | Loading Indicator | Placement |
|---------|-------------------|-----------|
| Queue loading | Table skeleton | In table area |
| Report loading | Card skeleton | In content area |
| Decision submitting | Button spinner | On submit button |
| Filter applying | Subtle spinner | In filter bar |

### 15.2 Success States

| Action | Feedback | Duration |
|--------|----------|----------|
| Decision submitted | Toast: "Decision submitted successfully" | 3 seconds |
| Filters applied | Queue refreshes | Immediate |
| Export completed | Toast: "Export downloaded" | 3 seconds |

### 15.3 Empty States

| Context | Message | Action |
|---------|---------|--------|
| Empty queue | "No reports pending validation" | None |
| Empty audit logs | "No audit logs found" | Adjust filters |
| No filter results | "No reports match your filters" | Clear filters |

### 15.4 Accessibility Requirements

- Keyboard navigation for all actions
- Screen reader labels for all interactive elements
- Focus management in modals
- Color contrast WCAG AA compliant
- Error announcements for screen readers

### 15.5 Responsive Design

**Desktop (≥1024px):**
- Full sidebar navigation
- Multi-column table layout
- Side-by-side metadata display

**Tablet (768-1024px):**
- Collapsible sidebar
- Responsive table
- Stacked metadata cards

**Mobile (< 768px):**
- Hidden sidebar (hamburger menu)
- Card-based queue items
- Full-width forms

---

## 16. Implementation Order

### 16.1 Recommended Sequence

**Phase 1: Foundation**
1. Route setup and navigation guards
2. API client setup with React Query
3. Zustand store setup
4. Base layout components

**Phase 2: Core Components**
5. ValidationQueue component
6. ValidationQueueFilters component
7. ValidationQueueTable component
8. Queue pagination

**Phase 3: Report Review**
9. ReportReviewPage component
10. ReportMetadataCard component
11. TransactionTable component
12. ValidationDecisionBar component

**Phase 4: Decision Flow**
13. ValidationDecisionModal component
14. ValidationDecisionForm component
15. Form validation with Zod
16. Decision submission mutation

**Phase 5: Audit Logs**
17. ValidationAuditLogPage component
18. AuditLogFilters component
19. AuditLogTable component

**Phase 6: Polish**
20. Loading states and skeletons
21. Error handling and recovery
22. Empty states
23. Responsive adaptations
24. Accessibility testing

### 16.2 Component Dependencies

```
ValidationQueuePage
├── ValidationQueueFilters (no deps)
├── ValidationQueueTable
│   └── ValidationQueueItem
│       └── Button (View Details action)
└── Pagination (shared)

ReportReviewPage
├── ReportMetadataCard (no deps)
├── TransactionTable (no deps)
├── ValidationDecisionBar (no deps)
└── ValidationDecisionModal
    └── ValidationDecisionForm (no deps)
```

---

**Document End**
