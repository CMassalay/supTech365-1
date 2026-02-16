# Frontend Feature Design Document (FDD-FE)
## Feature 7: Subject Profiling Tool (MVF)

**Document Version:** 1.0  
**Date:** February 2026  
**Feature Name:** Subject Profiling Tool (MVF)  
**Product/System Name:** SupTech365  
**Related FRD Version:** frd_mvf_subject_profiling_tool.md v1.0  
**Related Backend FDD:** fdd_be_subject_profiling_tool_mvf.md v1.0  
**Status:** Draft  
**Last Updated Date:** February 2026

---

## 1. Feature Context

### 1.1 Feature Name
Subject Profiling Tool - Frontend (MVF)

### 1.2 Feature Description
The frontend provides FIA analysts and compliance officers with an interface to search, view, and analyze subject profiles. Users can search for subjects by name or identifier, view consolidated profiles with all associated reports, and see summary statistics. The interface enforces role-based access control, showing analysts restricted access indicators for non-escalated CTRs.

### 1.3 Feature Purpose
Enable FIA staff to:
- Search and discover subject profiles across the database
- View consolidated subject information (identifiers, attributes, statistics)
- Review all reports associated with a subject in one place
- Understand access restrictions for CTR data (analysts vs. compliance officers)
- Identify patterns and repeated behaviors through summary statistics

### 1.4 Related Features
- **Feature 1 (Authentication)**: User authentication and role-based access control
- **Feature 2 (Excel Submission)**: Source of reports linked to subjects
- **Feature 3 (API Submission)**: Source of reports linked to subjects
- **Feature 4 (Automated Validation)**: Triggers subject profile creation
- **Feature 6 (Task Assignment)**: Provides STR assignment context for access control

### 1.5 User Types
- **Analyst**: Searches/views profiles with restricted CTR access
- **Compliance Officer**: Searches/views profiles with full report access

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

- **State Management**: Client-side state with React Query for server state (profiles, reports, statistics), Zustand for UI state (search filters, view preferences)
- **Routing**: React Router with client-side routing, route guards for authentication
- **API Integration**: Fetch API with React Query for data fetching, caching, and synchronization
- **State Persistence**: URL parameters for search state (shareable links), localStorage for preferences
- **Navigation**: Programmatic navigation, no page refreshes, deep linking support

---

## 4. Architecture Pattern

### 4.1 Component-Based Architecture

```
App
├── Layout Components
│   ├── MainLayout
│   ├── Sidebar
│   └── TopNav
├── Feature Components (Subject Profiling)
│   ├── Pages
│   │   ├── SubjectSearchPage
│   │   ├── SubjectProfilePage
│   │   └── SubjectReportsPage
│   ├── Search Components
│   │   ├── SubjectSearchBar
│   │   ├── SubjectTypeFilter
│   │   ├── SubjectSearchResults
│   │   └── SubjectSearchResultCard
│   ├── Profile Components
│   │   ├── SubjectProfileHeader
│   │   ├── SubjectIdentifiersList
│   │   ├── SubjectAttributesList
│   │   ├── SubjectStatisticsCard
│   │   └── SubjectReportsPreview
│   ├── Reports Components
│   │   ├── SubjectReportsFilter
│   │   ├── SubjectReportsTable
│   │   ├── SubjectReportRow
│   │   └── AccessRestrictedBadge
│   └── Shared Components
│       ├── SubjectTypeBadge
│       ├── EscalationStatusBadge
│       └── AccessLevelIndicator
└── Shared Components
    ├── DataTable
    ├── Pagination
    ├── LoadingSpinner
    ├── ErrorMessage
    └── EmptyState
```

### 4.2 State Management Pattern

| State Type | Library | Purpose |
|------------|---------|---------|
| **Server State** | React Query | Profiles, reports, statistics from API with caching |
| **UI State** | Zustand | Search filters, selected items, view preferences |
| **Form State** | React Hook Form | Search form state and validation |
| **URL State** | React Router | Search query, pagination (shareable URLs) |

### 4.3 Routing Pattern

- Client-side routing with React Router v6
- Protected routes requiring authentication
- URL parameters for search state persistence
- Nested routes for profile sub-pages

---

## 5. Screen List + Wireframes

### 5.1 Subject Search Screen

**Screen Name:** Subject Search  
**Route:** `/subjects`  
**Purpose:** Search and browse subject profiles by name, identifier, or account number.

#### Wireframe

```
┌────────────────────────────────────────────────────────────────────┐
│ [Sidebar]  │  Subject Profiles                                     │
│            │  ─────────────────────────────────────────────────── │
│ Dashboard  │                                                       │
│ Reports    │  ┌─────────────────────────────────────────────────┐ │
│ Subjects ◄─│  │ 🔍 Search subjects by name, ID, or account...   │ │
│ Analysis   │  └─────────────────────────────────────────────────┘ │
│            │                                                       │
│            │  Filter by:  [All ▼] [Person] [Company] [Account]    │
│            │                                                       │
│            │  ┌─────────────────────────────────────────────────┐ │
│            │  │ ┌─────────────────────────────────────────────┐ │ │
│            │  │ │ 👤 John Mensah                    PERSON    │ │ │
│            │  │ │ ID: LIB123456 · 5 reports · Last: Jan 2026  │ │ │
│            │  │ └─────────────────────────────────────────────┘ │ │
│            │  │ ┌─────────────────────────────────────────────┐ │ │
│            │  │ │ 🏢 ABC Trading Co.                COMPANY   │ │ │
│            │  │ │ Reg: REG789 · 3 reports · Last: Dec 2025    │ │ │
│            │  │ └─────────────────────────────────────────────┘ │ │
│            │  │ ┌─────────────────────────────────────────────┐ │ │
│            │  │ │ 💳 ACC-001-2026                   ACCOUNT   │ │ │
│            │  │ │ Owner: Sarah Konneh · 2 reports             │ │ │
│            │  │ └─────────────────────────────────────────────┘ │ │
│            │  └─────────────────────────────────────────────────┘ │
│            │                                                       │
│            │  Showing 1-20 of 42 results    [< Prev] [Next >]     │
└────────────────────────────────────────────────────────────────────┘
```

#### Inputs/Fields

| Field | Type | Required | Placeholder | Description |
|-------|------|----------|-------------|-------------|
| Search Query | text | Yes (min 2 chars) | "Search subjects by name, ID, or account..." | Main search input |
| Subject Type Filter | button group | No | All selected | Filter by PERSON, COMPANY, ACCOUNT |

#### Buttons/Actions

| Button | Action | States |
|--------|--------|--------|
| Search Icon | Submit search | Enabled when query ≥ 2 chars |
| Clear Search | Clear query and reset | Enabled when query present |
| Type Filter Buttons | Filter results by type | Toggle active state |
| Result Card | Navigate to profile | Clickable always |
| Pagination Controls | Navigate pages | Disabled at boundaries |

#### Validation Messages

| Condition | Message | Location |
|-----------|---------|----------|
| Query too short | "Enter at least 2 characters to search" | Below search input |
| No results | "No subjects match your search" | Results area |
| API error | "Unable to load subjects. Please try again." | Results area |

#### Navigation

| Action | Destination |
|--------|-------------|
| Click result card | `/subjects/:uuid` (Profile Detail) |
| Press Enter in search | Trigger search |
| Click pagination | Update results (stay on page) |

---

### 5.2 Subject Profile Detail Screen

**Screen Name:** Subject Profile Detail  
**Route:** `/subjects/:uuid`  
**Purpose:** Display comprehensive subject profile with identifiers, attributes, and statistics.

#### Wireframe

```
┌────────────────────────────────────────────────────────────────────┐
│ [Sidebar]  │  ← Back to Search                                     │
│            │  ─────────────────────────────────────────────────── │
│            │                                                       │
│            │  ┌─────────────────────────────────────────────────┐ │
│            │  │ 👤 John Mensah                         PERSON   │ │
│            │  │ Created: Jun 15, 2025 · Updated: Jan 20, 2026   │ │
│            │  └─────────────────────────────────────────────────┘ │
│            │                                                       │
│            │  ┌──────────────────┐ ┌──────────────────────────┐  │
│            │  │ Identifiers      │ │ Summary Statistics       │  │
│            │  │ ────────────────│ │ ────────────────────────│  │
│            │  │ National ID:     │ │ STRs:        2           │  │
│            │  │ LIB123456        │ │ CTRs:        3           │  │
│            │  │                  │ │ Escalated:   1           │  │
│            │  │ Passport:        │ │ ────────────────────────│  │
│            │  │ P789012          │ │ Total Value: $125,000    │  │
│            │  │                  │ │ Activity:    219 days    │  │
│            │  │                  │ │ First: Jun 2025          │  │
│            │  │                  │ │ Last:  Jan 2026          │  │
│            │  └──────────────────┘ └──────────────────────────┘  │
│            │                                                       │
│            │  ┌─────────────────────────────────────────────────┐ │
│            │  │ Attributes                                      │ │
│            │  │ ───────────────────────────────────────────────│ │
│            │  │ 📍 Address (Primary): 123 Main St, Monrovia    │ │
│            │  │ 📞 Phone (Primary): +231-555-1234              │ │
│            │  │ ✉️ Email: john.mensah@email.com                 │ │
│            │  └─────────────────────────────────────────────────┘ │
│            │                                                       │
│            │  ┌─────────────────────────────────────────────────┐ │
│            │  │ Recent Reports (5)              [View All →]    │ │
│            │  │ ───────────────────────────────────────────────│ │
│            │  │ FIA-001-20260115-0001  STR    Jan 15, 2026     │ │
│            │  │ FIA-001-20260110-0002  CTR🔒  Jan 10, 2026     │ │
│            │  │ FIA-001-20251201-0003  CTR✓   Dec 01, 2025     │ │
│            │  └─────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
```

#### Inputs/Fields

None - Read-only display screen.

#### Buttons/Actions

| Button | Action | States |
|--------|--------|--------|
| Back to Search | Navigate to search | Always enabled |
| View All Reports | Navigate to reports list | Always enabled |
| Report Row (accessible) | Navigate to report detail | Enabled for accessible reports |
| Report Row (restricted) | Show tooltip | Disabled link, shows restriction info |

#### Validation Messages

Not applicable - Read-only screen.

#### Navigation

| Action | Destination |
|--------|-------------|
| Back to Search | `/subjects` |
| View All Reports | `/subjects/:uuid/reports` |
| Click accessible report | Report detail page |
| Click restricted report | Shows tooltip (no navigation) |

---

### 5.3 Subject Reports Screen

**Screen Name:** Subject Reports List  
**Route:** `/subjects/:uuid/reports`  
**Purpose:** Display all reports linked to subject with access control filtering.

#### Wireframe

```
┌────────────────────────────────────────────────────────────────────┐
│ [Sidebar]  │  ← Back to Profile                                    │
│            │  ─────────────────────────────────────────────────── │
│            │                                                       │
│            │  Reports for: John Mensah                             │
│            │                                                       │
│            │  Filter: [All ▼] [STR] [CTR]                         │
│            │                                                       │
│            │  ┌─────────────────────────────────────────────────┐ │
│            │  │ Access Summary                                  │ │
│            │  │ Total: 5 · Accessible: 3 · Restricted: 2       │ │
│            │  └─────────────────────────────────────────────────┘ │
│            │                                                       │
│            │  ┌─────────────────────────────────────────────────┐ │
│            │  │ Reference          Type    Status    Date       │ │
│            │  │ ───────────────────────────────────────────────│ │
│            │  │ FIA-001-...-0001   STR     Validated Jan 15 →  │ │
│            │  │ FIA-001-...-0002   CTR 🔒  Archived  Jan 10    │ │
│            │  │                    ↳ Compliance Only            │ │
│            │  │ FIA-001-...-0003   CTR ✓   Escalated Dec 01 →  │ │
│            │  │ FIA-001-...-0004   CTR 🔒  Monitoring Nov 15   │ │
│            │  │                    ↳ Compliance Only            │ │
│            │  │ FIA-001-...-0005   STR     Validated Oct 20 →  │ │
│            │  └─────────────────────────────────────────────────┘ │
│            │                                                       │
│            │  Showing 1-5 of 5 reports                            │
└────────────────────────────────────────────────────────────────────┘
```

#### Inputs/Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| Report Type Filter | button group | No | ALL | Filter by STR, CTR, or ALL |

#### Buttons/Actions

| Button | Action | States |
|--------|--------|--------|
| Back to Profile | Navigate to profile | Always enabled |
| Type Filter Buttons | Filter reports | Toggle active state |
| Accessible Report Row | Navigate to report | Enabled (shows arrow) |
| Restricted Report Row | Show restriction info | Disabled (shows lock + message) |
| Pagination | Navigate pages | Disabled at boundaries |

#### Validation Messages

| Condition | Message | Location |
|-----------|---------|----------|
| No reports | "No reports linked to this subject" | Table area |
| All restricted | "All reports for this subject are restricted" | Table area |
| API error | "Unable to load reports. Please try again." | Table area |

#### Navigation

| Action | Destination |
|--------|-------------|
| Back to Profile | `/subjects/:uuid` |
| Click accessible report | Report detail page (external feature) |
| Click restricted report | No navigation (shows tooltip) |

---

## 6. User Flow Diagrams

### 6.1 Subject Search Flow

```
┌─────────────┐
│   Start     │
│ /subjects   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Subject Search  │
│    Screen       │
└───────┬─────────┘
        │
        ▼
┌─────────────────┐     No      ┌─────────────────┐
│ Enter Search    │────────────►│ Show Validation │
│ Query (≥2 char) │             │ Error Message   │
└───────┬─────────┘             └─────────────────┘
        │ Yes
        ▼
┌─────────────────┐
│ Loading State   │
│ (Show Spinner)  │
└───────┬─────────┘
        │
        ▼
┌─────────────────┐     Error   ┌─────────────────┐
│ Fetch Results   │────────────►│ Show Error      │
│ from API        │             │ with Retry      │
└───────┬─────────┘             └─────────────────┘
        │ Success
        ▼
┌─────────────────┐     No      ┌─────────────────┐
│ Results Found?  │────────────►│ Show Empty      │
│                 │             │ State           │
└───────┬─────────┘             └─────────────────┘
        │ Yes
        ▼
┌─────────────────┐
│ Display Results │
│ with Pagination │
└───────┬─────────┘
        │
        ▼
┌─────────────────┐
│ Click on Result │
│     Card        │
└───────┬─────────┘
        │
        ▼
┌─────────────────┐
│ Navigate to     │
│ Profile Detail  │
└─────────────────┘
```

### 6.2 Profile Viewing Flow

```
┌──────────────────┐
│ Profile Detail   │
│ /subjects/:uuid  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Fetch Profile    │
│ & Statistics     │
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────────┐
│Success │ │ Error      │
└───┬────┘ │ 404 → Back │
    │      │ to Search  │
    │      └────────────┘
    ▼
┌──────────────────┐
│ Display Profile  │
│ - Header         │
│ - Identifiers    │
│ - Attributes     │
│ - Statistics     │
│ - Report Preview │
└────────┬─────────┘
         │
    ┌────┴────────────┐
    │                 │
    ▼                 ▼
┌──────────┐    ┌──────────────┐
│ Click    │    │ View All     │
│ Report   │    │ Reports      │
└────┬─────┘    └──────┬───────┘
     │                 │
     ▼                 ▼
┌──────────────┐  ┌──────────────┐
│ If Accessible│  │ Navigate to  │
│ → Report     │  │ Reports Page │
│ Detail       │  └──────────────┘
│              │
│ If Restricted│
│ → Show       │
│ Tooltip      │
└──────────────┘
```

### 6.3 Access Control Display Flow

```
┌───────────────────────┐
│ User Views Reports    │
│ for Subject           │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ Check User Role       │
└───────────┬───────────┘
            │
     ┌──────┴──────┐
     │             │
     ▼             ▼
┌─────────┐   ┌──────────────┐
│Compliance│   │ Analyst      │
│Officer   │   └──────┬───────┘
└────┬────┘          │
     │               ▼
     │    ┌───────────────────────┐
     │    │ For Each CTR:         │
     │    │ - Check escalated?    │
     │    │ - Check subject in    │
     │    │   assigned STR?       │
     │    └───────────┬───────────┘
     │                │
     │         ┌──────┴──────┐
     │         │             │
     ▼         ▼             ▼
┌──────────────────┐  ┌──────────────────┐
│ Show ALL Reports │  │ Show with Access │
│ - Full details   │  │ Level Indicator  │
│ - All clickable  │  │ - "full" → link  │
└──────────────────┘  │ - "restricted"   │
                      │   → lock + msg   │
                      └──────────────────┘
```

---

## 7. UI Element Specifications

### 7.1 Component Hierarchy

```
subjects/
├── pages/
│   ├── SubjectSearchPage.tsx
│   ├── SubjectProfilePage.tsx
│   └── SubjectReportsPage.tsx
├── components/
│   ├── search/
│   │   ├── SubjectSearchBar.tsx
│   │   ├── SubjectTypeFilter.tsx
│   │   ├── SubjectSearchResults.tsx
│   │   └── SubjectSearchResultCard.tsx
│   ├── profile/
│   │   ├── SubjectProfileHeader.tsx
│   │   ├── SubjectIdentifiersList.tsx
│   │   ├── SubjectAttributesList.tsx
│   │   ├── SubjectStatisticsCard.tsx
│   │   └── SubjectReportsPreview.tsx
│   ├── reports/
│   │   ├── SubjectReportsFilter.tsx
│   │   ├── SubjectReportsTable.tsx
│   │   ├── SubjectReportRow.tsx
│   │   └── AccessRestrictedBadge.tsx
│   └── shared/
│       ├── SubjectTypeBadge.tsx
│       ├── EscalationStatusBadge.tsx
│       └── AccessLevelIndicator.tsx
├── hooks/
│   ├── useSubjectSearch.ts
│   ├── useSubjectProfile.ts
│   ├── useSubjectReports.ts
│   └── useSubjectStatistics.ts
├── stores/
│   └── subjectStore.ts
└── types/
    └── subject.types.ts
```

### 7.2 Component Specifications

#### SubjectSearchPage

**Purpose:** Main search page for subject profiles.

**Props:** None (route component)

**State:**
| Property | Type | Initial Value | Description |
|----------|------|---------------|-------------|
| searchQuery | string | "" (from URL) | Current search query |
| subjectType | SubjectType \| null | null | Type filter |
| page | number | 1 | Current page |

**Responsibilities:**
- Render search bar, filters, and results
- Manage URL state for search parameters
- Handle loading and error states
- Navigate to profile on result click

---

#### SubjectSearchBar

**Purpose:** Search input with debounced query.

**Props:**
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| value | string | Yes | - | Current search value |
| onChange | (value: string) => void | Yes | - | Value change handler |
| onSearch | () => void | Yes | - | Search trigger handler |
| isLoading | boolean | No | false | Loading state |

**State:**
| Property | Type | Initial Value | Description |
|----------|------|---------------|-------------|
| localValue | string | props.value | Debounced local value |

**Responsibilities:**
- Render search input with icon
- Debounce input changes (300ms)
- Show clear button when value present
- Trigger search on Enter key

---

#### SubjectSearchResultCard

**Purpose:** Display single search result.

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| subject | SubjectSearchResult | Yes | Subject data |
| onClick | () => void | Yes | Click handler |

**Responsibilities:**
- Display subject name with type icon
- Show primary identifier
- Display report count and last activity
- Handle click for navigation

---

#### SubjectProfileHeader

**Purpose:** Display profile header with name and type.

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| profile | SubjectProfile | Yes | Profile data |

**Responsibilities:**
- Display subject name prominently
- Show type badge
- Display created/updated timestamps

---

#### SubjectIdentifiersList

**Purpose:** Display list of subject identifiers.

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| identifiers | SubjectIdentifier[] | Yes | Identifier list |

**Responsibilities:**
- Render identifiers in organized list
- Show identifier type labels
- Format values appropriately

---

#### SubjectStatisticsCard

**Purpose:** Display summary statistics for subject.

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| statistics | SubjectStatistics | Yes | Statistics data |
| isLoading | boolean | No | Loading state |

**Responsibilities:**
- Display report counts (STR, CTR, Escalated)
- Show total transaction value (formatted)
- Display activity date range
- Calculate and show activity span

---

#### SubjectReportRow

**Purpose:** Display single report in reports table.

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| report | SubjectReportItem | Yes | Report data |
| onNavigate | (reportId: number) => void | Yes | Navigation handler |

**Responsibilities:**
- Display report reference, type, status, date
- Show access level indicator
- Handle click (navigate if accessible, tooltip if restricted)
- Display escalation status for CTRs

---

#### AccessRestrictedBadge

**Purpose:** Visual indicator for restricted CTR access.

**Props:**
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| reason | string | No | "Compliance Only" | Restriction reason |

**Responsibilities:**
- Render lock icon
- Show "Compliance Only" text
- Display tooltip with full explanation on hover

---

#### SubjectTypeBadge

**Purpose:** Badge showing subject type (PERSON/COMPANY/ACCOUNT).

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| type | SubjectType | Yes | Subject type |
| size | "sm" \| "md" | No | Badge size |

**Responsibilities:**
- Render colored badge based on type
- Show appropriate icon (person, building, credit-card)
- Display type label

---

#### EscalationStatusBadge

**Purpose:** Badge showing CTR escalation status.

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| status | EscalationStatus | Yes | Escalation status |

**Responsibilities:**
- Render status badge with color coding
- Archived: Gray
- Monitoring: Yellow
- Escalated: Green

---

## 8. State Management

### 8.1 Server State (React Query)

#### Query Keys
```typescript
const subjectKeys = {
  all: ['subjects'] as const,
  search: (query: string, type?: SubjectType, page?: number) => 
    [...subjectKeys.all, 'search', { query, type, page }] as const,
  profile: (uuid: string) => 
    [...subjectKeys.all, 'profile', uuid] as const,
  reports: (uuid: string, reportType?: string, page?: number) => 
    [...subjectKeys.all, 'reports', uuid, { reportType, page }] as const,
  statistics: (uuid: string) => 
    [...subjectKeys.all, 'statistics', uuid] as const,
};
```

#### Query Configuration
```typescript
// Search query - short stale time for fresh results
useSubjectSearch: {
  staleTime: 30 * 1000, // 30 seconds
  cacheTime: 5 * 60 * 1000, // 5 minutes
}

// Profile query - longer cache
useSubjectProfile: {
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 30 * 60 * 1000, // 30 minutes
}

// Statistics query - medium cache
useSubjectStatistics: {
  staleTime: 60 * 1000, // 1 minute
  cacheTime: 10 * 60 * 1000, // 10 minutes
}
```

### 8.2 UI State (Zustand)

```typescript
interface SubjectUIState {
  // Search state
  searchQuery: string;
  searchType: SubjectType | null;
  
  // View preferences
  reportsViewMode: 'table' | 'cards';
  
  // Actions
  setSearchQuery: (query: string) => void;
  setSearchType: (type: SubjectType | null) => void;
  setReportsViewMode: (mode: 'table' | 'cards') => void;
  resetSearch: () => void;
}

const useSubjectStore = create<SubjectUIState>((set) => ({
  searchQuery: '',
  searchType: null,
  reportsViewMode: 'table',
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchType: (type) => set({ searchType: type }),
  setReportsViewMode: (mode) => set({ reportsViewMode: mode }),
  resetSearch: () => set({ searchQuery: '', searchType: null }),
}));
```

### 8.3 URL State

Search parameters stored in URL for shareability:

```typescript
// URL structure: /subjects?q=john&type=PERSON&page=1

interface SubjectSearchParams {
  q?: string;      // Search query
  type?: string;   // Subject type filter
  page?: string;   // Page number
}
```

---

## 9. Form Handling

### 9.1 Search Form

**Form Schema (Zod):**
```typescript
const searchSchema = z.object({
  query: z.string().min(2, "Enter at least 2 characters"),
});
```

**Form State:**
| Property | Type | Description |
|----------|------|-------------|
| query | string | Search query |

**Validation Rules:**
| Field | Rule | Message |
|-------|------|---------|
| query | min length 2 | "Enter at least 2 characters to search" |

**Submission Flow:**
1. User types in search input
2. Debounce input (300ms)
3. Validate minimum length
4. Update URL parameters
5. Trigger React Query fetch
6. Display results or error

---

## 10. API Integration

### 10.1 API Client Setup

```typescript
// Base API configuration
const subjectApi = {
  baseUrl: '/api/v1/subjects',
  
  search: async (params: SubjectSearchParams): Promise<SubjectSearchResponse> => {
    const response = await fetch(
      `${subjectApi.baseUrl}/search?${new URLSearchParams(params)}`
    );
    if (!response.ok) throw new ApiError(response);
    return response.json();
  },
  
  getProfile: async (uuid: string): Promise<SubjectProfileResponse> => {
    const response = await fetch(`${subjectApi.baseUrl}/${uuid}`);
    if (!response.ok) throw new ApiError(response);
    return response.json();
  },
  
  getReports: async (uuid: string, params: ReportParams): Promise<SubjectReportsResponse> => {
    const response = await fetch(
      `${subjectApi.baseUrl}/${uuid}/reports?${new URLSearchParams(params)}`
    );
    if (!response.ok) throw new ApiError(response);
    return response.json();
  },
  
  getStatistics: async (uuid: string): Promise<SubjectStatisticsResponse> => {
    const response = await fetch(`${subjectApi.baseUrl}/${uuid}/statistics`);
    if (!response.ok) throw new ApiError(response);
    return response.json();
  },
};
```

### 10.2 React Query Hooks

#### useSubjectSearch
```typescript
function useSubjectSearch(
  query: string,
  subjectType?: SubjectType,
  page: number = 1
) {
  return useQuery({
    queryKey: subjectKeys.search(query, subjectType, page),
    queryFn: () => subjectApi.search({ q: query, type: subjectType, page }),
    enabled: query.length >= 2,
    staleTime: 30 * 1000,
  });
}
```

#### useSubjectProfile
```typescript
function useSubjectProfile(uuid: string) {
  return useQuery({
    queryKey: subjectKeys.profile(uuid),
    queryFn: () => subjectApi.getProfile(uuid),
    enabled: !!uuid,
    staleTime: 5 * 60 * 1000,
  });
}
```

#### useSubjectReports
```typescript
function useSubjectReports(
  uuid: string,
  reportType?: string,
  page: number = 1
) {
  return useQuery({
    queryKey: subjectKeys.reports(uuid, reportType, page),
    queryFn: () => subjectApi.getReports(uuid, { report_type: reportType, page }),
    enabled: !!uuid,
  });
}
```

#### useSubjectStatistics
```typescript
function useSubjectStatistics(uuid: string) {
  return useQuery({
    queryKey: subjectKeys.statistics(uuid),
    queryFn: () => subjectApi.getStatistics(uuid),
    enabled: !!uuid,
    staleTime: 60 * 1000,
  });
}
```

### 10.3 Error Handling

| Error Type | HTTP Status | User Message | Recovery Action |
|------------|-------------|--------------|-----------------|
| Not Found | 404 | "Subject profile not found" | Navigate to search |
| Unauthorized | 401 | "Please log in to continue" | Redirect to login |
| Forbidden | 403 | "You don't have access to this resource" | Show restricted view |
| Server Error | 500 | "Something went wrong. Please try again." | Retry button |
| Network Error | - | "Unable to connect. Check your connection." | Retry button |

---

## 11. Routing and Navigation

### 11.1 Route Definitions

```typescript
const subjectRoutes = [
  {
    path: '/subjects',
    element: <SubjectSearchPage />,
    meta: { 
      title: 'Subject Profiles',
      requiresAuth: true,
      roles: ['analyst', 'compliance_officer', 'compliance_officer_supervisor', 'head_of_compliance']
    }
  },
  {
    path: '/subjects/:uuid',
    element: <SubjectProfilePage />,
    meta: {
      title: 'Subject Profile',
      requiresAuth: true,
      roles: ['analyst', 'compliance_officer', 'compliance_officer_supervisor', 'head_of_compliance']
    }
  },
  {
    path: '/subjects/:uuid/reports',
    element: <SubjectReportsPage />,
    meta: {
      title: 'Subject Reports',
      requiresAuth: true,
      roles: ['analyst', 'compliance_officer', 'compliance_officer_supervisor', 'head_of_compliance']
    }
  }
];
```

### 11.2 Navigation Guards

```typescript
// Authentication guard - existing implementation
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
}

// Role guard - existing implementation
function RequireRole({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode;
  allowedRoles: string[];
}) {
  const { user } = useAuth();
  
  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
}
```

### 11.3 Navigation Patterns

| From | Action | To |
|------|--------|-----|
| Sidebar | Click "Subjects" | `/subjects` |
| Search Results | Click result card | `/subjects/:uuid` |
| Profile | Click "View All Reports" | `/subjects/:uuid/reports` |
| Profile | Click Back | `/subjects` (with preserved search) |
| Reports | Click Back | `/subjects/:uuid` |
| Reports | Click accessible report | External report detail page |

---

## 12. Error Handling

### 12.1 Error Boundary

```typescript
function SubjectErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      FallbackComponent={SubjectErrorFallback}
      onReset={() => window.location.reload()}
    >
      {children}
    </ErrorBoundary>
  );
}

function SubjectErrorFallback({ error, resetErrorBoundary }) {
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

### 12.2 API Error Handling

```typescript
function useApiErrorHandler() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleError = (error: ApiError) => {
    switch (error.status) {
      case 401:
        navigate('/login');
        break;
      case 403:
        toast({
          title: "Access Denied",
          description: "You don't have permission to view this resource",
          variant: "destructive"
        });
        break;
      case 404:
        toast({
          title: "Not Found",
          description: "The requested subject profile was not found",
          variant: "destructive"
        });
        navigate('/subjects');
        break;
      default:
        toast({
          title: "Error",
          description: error.message || "Something went wrong",
          variant: "destructive"
        });
    }
  };
  
  return { handleError };
}
```

### 12.3 User-Facing Error Messages

| Scenario | Title | Description | Action |
|----------|-------|-------------|--------|
| Profile not found | "Subject Not Found" | "The subject profile you're looking for doesn't exist." | "Back to Search" button |
| Search error | "Search Failed" | "Unable to search subjects. Please try again." | "Retry" button |
| Network error | "Connection Error" | "Unable to connect to server. Check your connection." | "Retry" button |
| Empty results | "No Results" | "No subjects match your search criteria." | Modify search suggestion |

---

## 13. Testing Considerations

### 13.1 Component Tests

**SubjectSearchBar Tests:**
- Renders search input correctly
- Debounces input changes
- Shows clear button when value present
- Triggers onSearch on Enter key
- Validates minimum length

**SubjectSearchResultCard Tests:**
- Renders subject data correctly
- Displays correct type icon
- Shows report count
- Handles click event

**SubjectReportRow Tests:**
- Renders accessible report with link
- Renders restricted report with badge
- Shows correct escalation status
- Handles navigation for accessible reports
- Shows tooltip for restricted reports

**AccessRestrictedBadge Tests:**
- Renders lock icon
- Shows restriction message
- Displays tooltip on hover

### 13.2 Integration Tests

**Search Flow:**
- User can type search query
- Results load after debounce
- Clicking result navigates to profile
- Pagination works correctly
- Type filter filters results

**Profile Viewing:**
- Profile loads with all sections
- Statistics display correctly
- Reports preview shows access levels
- Navigation to full reports works

**Access Control Display:**
- Analyst sees restricted CTRs
- Compliance officer sees all CTRs
- Restricted reports show lock icon
- Accessible reports are clickable

### 13.3 Test Utilities

```typescript
// Mock subject data
const mockSubjectProfile: SubjectProfile = {
  uuid: '550e8400-e29b-41d4-a716-446655440000',
  subject_type: 'PERSON',
  primary_name: 'John Mensah',
  identifiers: [
    { type: 'NATIONAL_ID', value: 'LIB123456' }
  ],
  attributes: [
    { type: 'ADDRESS', value: '123 Main St', is_primary: true }
  ],
  created_at: '2025-06-15T10:30:00Z',
  updated_at: '2026-01-20T14:45:00Z'
};

const mockSubjectReports: SubjectReportItem[] = [
  {
    report_id: 1,
    reference_number: 'FIA-001-20260115-0001',
    report_type: 'STR',
    status: 'validated',
    submitted_at: '2026-01-15T10:30:00Z',
    entity_name: 'Bank of Liberia',
    access_level: 'full'
  },
  {
    report_id: 2,
    reference_number: 'FIA-001-20260110-0002',
    report_type: 'CTR',
    escalation_status: 'archived',
    submitted_at: '2026-01-10T14:45:00Z',
    entity_name: 'Bank of Liberia',
    access_level: 'restricted'
  }
];
```

---

## 14. Security Considerations

### 14.1 Authentication

- All subject routes require authentication
- JWT token included in API requests via existing AuthContext
- Automatic redirect to login on 401 responses
- Session timeout handling (existing implementation)

### 14.2 Authorization

- Role-based route access (analyst, compliance officers)
- Access control enforced server-side (API returns filtered data)
- Frontend displays access level indicators based on API response
- No client-side access control bypass possible

### 14.3 Data Protection

- No sensitive data stored in localStorage
- Search queries in URL (shareable but not sensitive)
- API responses cached in memory only (React Query)
- No subject data persisted client-side

### 14.4 XSS Prevention

- React's built-in escaping for rendered content
- No dangerouslySetInnerHTML usage
- User input sanitized before display
- Content Security Policy headers (server-side)

---

## 15. Dependencies Between Components

### 15.1 Component Dependency Graph

```
SubjectSearchPage
├── SubjectSearchBar
├── SubjectTypeFilter
├── SubjectSearchResults
│   └── SubjectSearchResultCard
│       └── SubjectTypeBadge
└── Pagination (shared)

SubjectProfilePage
├── SubjectProfileHeader
│   └── SubjectTypeBadge
├── SubjectIdentifiersList
├── SubjectAttributesList
├── SubjectStatisticsCard
└── SubjectReportsPreview
    └── SubjectReportRow
        ├── EscalationStatusBadge
        └── AccessRestrictedBadge

SubjectReportsPage
├── SubjectReportsFilter
├── SubjectReportsTable
│   └── SubjectReportRow
│       ├── EscalationStatusBadge
│       └── AccessRestrictedBadge
└── Pagination (shared)
```

### 15.2 Data Flow

```
API Response
    │
    ▼
React Query Cache
    │
    ├─────────────────────────┐
    │                         │
    ▼                         ▼
useSubjectSearch         useSubjectProfile
    │                         │
    ▼                         ├──────────────────┐
SubjectSearchPage             │                  │
    │                         ▼                  ▼
    ▼               SubjectProfilePage    useSubjectStatistics
SubjectSearchResults          │                  │
    │                         ▼                  │
    ▼               SubjectProfileHeader         │
SubjectSearchResultCard       │                  │
                              ▼                  │
                    SubjectStatisticsCard ◄──────┘
```

### 15.3 External Dependencies

| Component | External Dependency | Purpose |
|-----------|---------------------|---------|
| All pages | AuthContext | User authentication state |
| Reports | Report Detail Pages | Navigation to report details |
| Search | React Router | URL state management |

---

## 16. Implementation Order

### 16.1 Recommended Sequence

**Sprint 1: Foundation (Week 1-2)**
1. Type definitions (`subject.types.ts`)
2. API hooks (`useSubjectSearch`, `useSubjectProfile`, `useSubjectReports`, `useSubjectStatistics`)
3. Zustand store (`subjectStore.ts`)
4. Shared components (`SubjectTypeBadge`, `EscalationStatusBadge`, `AccessRestrictedBadge`)

**Sprint 2: Search Screen (Week 3-4)**
5. `SubjectSearchBar` component
6. `SubjectTypeFilter` component
7. `SubjectSearchResultCard` component
8. `SubjectSearchResults` component
9. `SubjectSearchPage` page
10. Route configuration

**Sprint 3: Profile Screen (Week 5-6)**
11. `SubjectProfileHeader` component
12. `SubjectIdentifiersList` component
13. `SubjectAttributesList` component
14. `SubjectStatisticsCard` component
15. `SubjectReportsPreview` component
16. `SubjectProfilePage` page

**Sprint 4: Reports Screen & Polish (Week 7-8)**
17. `SubjectReportsFilter` component
18. `SubjectReportRow` component
19. `SubjectReportsTable` component
20. `SubjectReportsPage` page
21. Error handling improvements
22. Component tests
23. Integration tests

### 16.2 Component Dependencies

```
Types (subject.types.ts)
    │
    ▼
API Hooks (hooks/)
    │
    ▼
Zustand Store (stores/)
    │
    ▼
Shared Components (SubjectTypeBadge, etc.)
    │
    ├──────────────────────────────┐
    │                              │
    ▼                              ▼
Search Components              Profile Components
    │                              │
    ▼                              ▼
SubjectSearchPage             SubjectProfilePage
                                   │
                                   ▼
                            SubjectReportsPage
```

---

## 17. User Experience Specifications

### 17.1 Loading States

| Component | Loading Indicator | Behavior |
|-----------|-------------------|----------|
| Search Results | Skeleton cards (3) | Show while fetching |
| Profile Page | Skeleton sections | Show while fetching profile |
| Statistics Card | Skeleton numbers | Show while fetching stats |
| Reports Table | Skeleton rows (5) | Show while fetching reports |

### 17.2 Empty States

| Scenario | Icon | Message | Action |
|----------|------|---------|--------|
| No search results | Search icon | "No subjects match your search" | "Try different keywords" |
| No reports | FileText icon | "No reports linked to this subject" | None |
| All restricted | Lock icon | "All reports are restricted to Compliance" | None |

### 17.3 Success States

| Action | Feedback | Duration |
|--------|----------|----------|
| Search complete | Results displayed | Immediate |
| Profile loaded | Content displayed | Immediate |
| Navigate to report | Page transition | Immediate |

### 17.4 Error States

| Error | Display | Action |
|-------|---------|--------|
| Search failed | Inline error message | "Retry" button |
| Profile not found | Full-page error | "Back to Search" button |
| Network error | Toast notification | "Retry" button |

### 17.5 Accessibility Requirements

| Requirement | Implementation |
|-------------|----------------|
| Keyboard navigation | All interactive elements focusable, Enter/Space to activate |
| Screen reader | ARIA labels on badges, alt text on icons, semantic HTML |
| Focus management | Focus moves to results after search, to content after navigation |
| Color contrast | WCAG AA compliance for all text and badges |
| Skip links | Skip to main content, skip to search results |

### 17.6 Responsive Design

| Breakpoint | Layout Changes |
|------------|----------------|
| Mobile (<640px) | Stack search bar and filters, single-column results, collapse statistics |
| Tablet (640-1024px) | Two-column profile layout, compact table |
| Desktop (>1024px) | Full sidebar, three-column statistics, full table |

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
| 1.0 | February 2026 | Technical Design Team | Initial FDD-FE for MVF |

---

**Document End**
