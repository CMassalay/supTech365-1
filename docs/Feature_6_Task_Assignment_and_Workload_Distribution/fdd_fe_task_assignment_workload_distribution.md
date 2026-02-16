# Frontend Feature Design Document (FDD-FE)
## Feature 6: Task Assignment and Workload Distribution (MVF)

**Document Version:** 1.0  
**Date:** February 2026  
**Product/System Name:** SupTech365 - FIA Financial Intelligence System  
**Related FRD Version:** FRD-MVF v1.0  
**Related Backend FDD Version:** 1.0  
**Status:** Draft  
**Author:** Technical Design Team

---

## 1. Feature Context

### 1.1 Feature Name
Task Assignment and Workload Distribution - Frontend (MVF)

### 1.2 Feature Description
The frontend provides supervisors and department heads with interfaces to manually assign validated reports (CTRs and STRs) to compliance officers and analysts with deadlines, view workload distribution across team members, and enables officers/analysts to view their assigned reports and receive notifications when new reports are assigned to them.

### 1.3 Feature Purpose
Enable efficient distribution of report processing tasks through a user-friendly interface that allows supervisors to make informed assignment decisions based on visible workload counts, and provides officers/analysts with clear visibility into their assigned work and timely notifications.

### 1.4 Related Features
- **Feature 5:** Manual Validation Workflow - Source of validated reports entering assignment queue
- **Feature 4:** Automated Validation Engine - Validates reports before they enter assignment queue
- **Feature 2:** Digital Report Submission Portal - Original submission interface
- **Feature 1:** Authentication - Provides user authentication and role-based access

### 1.5 User Types
- **Compliance Officer Supervisor** - Assigns CTRs to compliance officers within their team
- **Head of Compliance** - Assigns CTRs to any compliance officer across all teams
- **Head of Analysis** - Assigns STRs and escalated CTRs to analysts
- **Compliance Officer** - Views and works on assigned CTRs
- **Analyst** - Views and works on assigned STRs and escalated CTRs

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
| **Date Handling** | date-fns |
| **Icons** | Lucide React |

---

## 3. Rendering Paradigm Selection

### 3.1 Selected Paradigm
**Client-Side Rendering (SPA)**

### 3.2 Paradigm Implications

- **State Management:** Client-side state with React Query for server state (assignments, workloads, notifications), Zustand for UI state (filters, modals, selected items)
- **Routing:** React Router with client-side routing, route guards for authentication and role-based authorization
- **API Integration:** Fetch API with React Query for data fetching, caching, optimistic updates, and real-time synchronization
- **State Persistence:** Browser localStorage for user preferences and filter states
- **Navigation:** Programmatic navigation, no page refreshes, instant transitions

---

## 4. Architecture Pattern

### 4.1 Component-Based Architecture

```
App
├── Layout Components
│   ├── AppLayout
│   ├── Sidebar
│   ├── Header
│   └── NotificationBell
├── Feature Components (Task Assignment)
│   ├── SupervisorViews/
│   │   ├── AssignmentQueuePage
│   │   ├── AssignmentQueueTable
│   │   ├── AssignmentQueueFilters
│   │   ├── TeamWorkloadPage
│   │   ├── WorkloadTable
│   │   ├── WorkloadCard
│   │   └── CreateAssignmentModal
│   ├── OfficerViews/
│   │   ├── MyAssignmentsPage
│   │   ├── MyAssignmentsTable
│   │   ├── MyAssignmentsFilters
│   │   └── MyWorkloadCard
│   └── Shared/
│       ├── NotificationsPanel
│       ├── NotificationItem
│       ├── AssignmentStatusBadge
│       └── DeadlineBadge
└── Shared Components
    ├── DataTable
    ├── StatusBadge
    ├── LoadingSpinner
    ├── ErrorMessage
    ├── Pagination
    ├── FilterBar
    ├── DatePicker
    └── UserSelect
```

### 4.2 State Management Pattern

- **Server State:** React Query for API data (assignment queue, workloads, my assignments, notifications)
- **UI State:** Zustand for local UI state (filters, selected report, modal visibility, notification panel)
- **Form State:** React Hook Form for assignment form state and validation
- **Component State:** React useState for ephemeral component state

### 4.3 Routing Pattern

- Client-side routing with React Router
- Protected routes with authentication guards
- Role-based route access:
  - Supervisor routes: `COMPLIANCE_OFFICER_SUPERVISOR`, `HEAD_OF_COMPLIANCE`, `HEAD_OF_ANALYSIS`
  - Officer routes: `COMPLIANCE_OFFICER`, `ANALYST`
- Nested routes for assignment details within modules

---

## 5. Screen List + Wireframes

### 5.1 Screen: Assignment Queue (Supervisor View)

**Screen Name:** Assignment Queue Screen

**Screen Purpose:** Display list of validated reports pending assignment, allowing supervisors to select reports and assign them to team members

**Route:** `/supervisor/assignment-queue`

**Roles:** `COMPLIANCE_OFFICER_SUPERVISOR`, `HEAD_OF_COMPLIANCE`, `HEAD_OF_ANALYSIS`

**Wireframe:**
```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo]  SupTech365                    [🔔 3] [User: Supervisor ▼]│
├─────────────────────────────────────────────────────────────────┤
│  [Sidebar]         │                                            │
│  Dashboard         │  Assignment Queue                          │
│  > Assignments ←   │                                            │
│    Queue           │  Pending Assignment: 23                    │
│    Team Workload   │                                            │
│  Reports           │  Filters:                                  │
│  Notifications     │  [Report Type ▼] [Entity ▼] [Search...]    │
│                    │                                            │
│                    │  ┌───────────────────────────────────────┐ │
│                    │  │Reference     │Type│Entity     │Valid. │ │
│                    │  ├──────────────┼────┼───────────┼───────┤ │
│                    │  │FIA-2026-0001 │CTR │First Bank │02-03  │ │
│                    │  │FIA-2026-0002 │STR │Unity Corp │02-03  │ │
│                    │  │FIA-2026-0003 │CTR │Trust Bank │02-04  │ │
│                    │  │FIA-2026-0004 │STR │Metro Bank │02-04  │ │
│                    │  │FIA-2026-0005 │CTR │First Bank │02-05  │ │
│                    │  └───────────────────────────────────────┘ │
│                    │                                            │
│                    │  [Assign Selected] (disabled until select) │
│                    │                                            │
│                    │  Showing 1-20 of 23 [<Prev][1][2][Next>]   │
│                    │                                            │
└─────────────────────────────────────────────────────────────────┘
```

**Inputs/Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Report Type Filter | Dropdown | No | Filter by CTR or STR (based on user role) |
| Entity Filter | Dropdown | No | Filter by reporting entity |
| Search | Text | No | Search by reference number |

**Buttons/Actions:**

| Button | Action | States |
|--------|--------|--------|
| Row Checkbox | Select report for assignment | Always enabled |
| Assign Selected | Open Create Assignment Modal | Enabled when report(s) selected |
| Row Click | View report details | Always enabled |
| Filter Apply | Apply selected filters | Enabled when filters changed |
| Refresh | Reload queue data | Always enabled |

**Validation Messages:** N/A (read-only display)

**Navigation:**
- On "Assign Selected" click → Create Assignment Modal
- On row click → Report Details view
- On "Team Workload" sidebar link → Team Workload Screen

---

### 5.2 Screen: Team Workload (Supervisor View)

**Screen Name:** Team Workload Screen

**Screen Purpose:** Display workload counts for team members to support assignment decision-making

**Route:** `/supervisor/workload`

**Roles:** `COMPLIANCE_OFFICER_SUPERVISOR`, `HEAD_OF_COMPLIANCE`, `HEAD_OF_ANALYSIS`

**Wireframe:**
```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo]  SupTech365                    [🔔 3] [User: Supervisor ▼]│
├─────────────────────────────────────────────────────────────────┤
│  [Sidebar]         │                                            │
│  Dashboard         │  Team Workload                             │
│  > Assignments     │                                            │
│    Queue           │  Total Team Members: 8                     │
│    Team Workload ← │  Total Active Assignments: 45              │
│  Reports           │  Average Workload: 5.6                     │
│  Notifications     │                                            │
│                    │  ┌───────────────────────────────────────┐ │
│                    │  │ Team Member     │ Role    │ Workload  │ │
│                    │  ├─────────────────┼─────────┼───────────┤ │
│                    │  │ Jane Doe        │ Officer │ ████░ 4   │ │
│                    │  │ John Smith      │ Officer │ ██████ 6  │ │
│                    │  │ Mary Johnson    │ Officer │ ███░░ 3   │ │
│                    │  │ Bob Williams    │ Officer │ ████████ 8│ │
│                    │  │ Alice Brown     │ Officer │ █████░ 5  │ │
│                    │  │ Tom Davis       │ Officer │ ████████ 8│ │
│                    │  │ Sarah Wilson    │ Officer │ ██░░░ 2   │ │
│                    │  │ Mike Anderson   │ Officer │ █████████ 9│ │
│                    │  └───────────────────────────────────────┘ │
│                    │                                            │
│                    │  Legend: ░ = Available capacity             │
│                    │                                            │
└─────────────────────────────────────────────────────────────────┘
```

**Inputs/Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Team Filter | Dropdown | No | Filter by team (for Head of Compliance) |
| Sort By | Dropdown | No | Sort by name, workload ascending/descending |

**Buttons/Actions:**

| Button | Action | States |
|--------|--------|--------|
| Row Click | View member's assignments | Always enabled |
| Refresh | Reload workload data | Always enabled |
| Export | Export workload report | Always enabled |

**Navigation:**
- On row click → Member's assignment list (filtered view)

---

### 5.3 Screen: Create Assignment Modal

**Screen Name:** Create Assignment Modal

**Screen Purpose:** Allow supervisor to assign a selected report to a team member with a deadline

**Wireframe:**
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Assign Report                                     [X]   │   │
│  │                                                          │   │
│  │  Report: FIA-2026-001234                                │   │
│  │  Type: CTR                                               │   │
│  │  Entity: First Bank of Liberia                          │   │
│  │                                                          │   │
│  │  ─────────────────────────────────────────────────────  │   │
│  │                                                          │   │
│  │  Assign To *                                             │   │
│  │  ┌────────────────────────────────────────────────┐     │   │
│  │  │ Select team member...                      ▼   │     │   │
│  │  └────────────────────────────────────────────────┘     │   │
│  │                                                          │   │
│  │  Team Member Workloads:                                 │   │
│  │  ┌────────────────────────────────────────────────┐     │   │
│  │  │ Jane Doe (4)  │ John Smith (6)  │ Mary (3) ←  │     │   │
│  │  └────────────────────────────────────────────────┘     │   │
│  │                                                          │   │
│  │  Deadline *                                              │   │
│  │  ┌────────────────────────────────────────────────┐     │   │
│  │  │ 📅 Select deadline date...                     │     │   │
│  │  └────────────────────────────────────────────────┘     │   │
│  │  [Error: Deadline must be a future date]                │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │ ℹ️ The selected team member will receive an      │   │   │
│  │  │ immediate notification about this assignment.    │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  │                                                          │   │
│  │                            [Cancel]  [Assign Report]     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Inputs/Fields:**

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| Assign To | Dropdown | Yes | Must select a team member | Select officer/analyst from team |
| Deadline | Date Picker | Yes | Must be future date | Assignment deadline date |

**Buttons/Actions:**

| Button | Action | States |
|--------|--------|--------|
| Cancel | Close modal without action | Always enabled |
| Assign Report | Submit assignment | Enabled when form is valid |
| Close (X) | Close modal without action | Always enabled |

**Validation Messages:**

| Condition | Message | Location |
|-----------|---------|----------|
| No assignee selected | "Please select a team member" | Below dropdown |
| No deadline selected | "Please select a deadline date" | Below date picker |
| Deadline in past | "Deadline must be a future date" | Below date picker |
| API error | "Failed to create assignment. Please try again." | Toast notification |
| Not authorized | "You are not authorized to assign reports" | Toast notification |
| Assignee not in team | "Assignee is not in your team" | Toast notification |

**Navigation:**
- On Cancel → Close modal, stay on Assignment Queue
- On success → Close modal, refresh queue, show success toast
- On error → Stay on modal, show error message

---

### 5.4 Screen: My Assignments (Officer/Analyst View)

**Screen Name:** My Assignments Screen

**Screen Purpose:** Display list of reports assigned to the current user (compliance officer or analyst)

**Route:** `/my-assignments`

**Roles:** `COMPLIANCE_OFFICER`, `ANALYST`

**Wireframe:**
```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo]  SupTech365                    [🔔 3] [User: Officer ▼] │
├─────────────────────────────────────────────────────────────────┤
│  [Sidebar]         │                                            │
│  Dashboard         │  My Assignments                            │
│  > My Assignments ←│                                            │
│  Notifications     │  ┌─────────────────────────────────────┐   │
│                    │  │ Your Workload: 5 active reports     │   │
│                    │  └─────────────────────────────────────┘   │
│                    │                                            │
│                    │  Filters:                                  │
│                    │  [Status ▼] [Date Range ▼] [Search...]     │
│                    │                                            │
│                    │  ┌───────────────────────────────────────┐ │
│                    │  │Reference     │Type│Deadline │Status   │ │
│                    │  ├──────────────┼────┼─────────┼─────────┤ │
│                    │  │FIA-2026-0012 │CTR │Feb 15   │Active   │ │
│                    │  │FIA-2026-0018 │CTR │Feb 12   │⚠️ Due   │ │
│                    │  │FIA-2026-0023 │CTR │Feb 20   │Active   │ │
│                    │  │FIA-2026-0031 │CTR │Feb 18   │Active   │ │
│                    │  │FIA-2026-0045 │CTR │Feb 25   │Active   │ │
│                    │  └───────────────────────────────────────┘ │
│                    │                                            │
│                    │  Showing 1-5 of 5                          │
│                    │                                            │
└─────────────────────────────────────────────────────────────────┘
```

**Inputs/Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Status Filter | Dropdown | No | Filter by Active, Completed |
| Date Range | Date Range | No | Filter by assignment or deadline date |
| Search | Text | No | Search by reference number |

**Buttons/Actions:**

| Button | Action | States |
|--------|--------|--------|
| Row Click | Open report for review | Always enabled |
| Filter Apply | Apply selected filters | Enabled when filters changed |
| Refresh | Reload assignments | Always enabled |

**Validation Messages:** N/A (read-only display)

**Navigation:**
- On row click → Report Review Screen (from Feature 5 or dedicated view)

---

### 5.5 Component: My Workload Card

**Component Name:** My Workload Card

**Component Purpose:** Display the current user's workload count in sidebar or header

**Location:** Sidebar or Header area

**Wireframe:**
```
┌─────────────────────────────────┐
│  📊 My Workload                 │
│  ┌───────────────────────────┐  │
│  │                           │  │
│  │     5                     │  │
│  │  Active Assignments       │  │
│  │                           │  │
│  │  ──────────────────────   │  │
│  │  CTRs: 5                  │  │
│  │  STRs: 0                  │  │
│  │  Cases: 0                 │  │
│  │                           │  │
│  └───────────────────────────┘  │
│  [View All Assignments →]       │
└─────────────────────────────────┘
```

**For Analyst View:**
```
┌─────────────────────────────────┐
│  📊 My Workload                 │
│  ┌───────────────────────────┐  │
│  │                           │  │
│  │     6                     │  │
│  │  Active Assignments       │  │
│  │                           │  │
│  │  ──────────────────────   │  │
│  │  STRs: 3                  │  │
│  │  Escalated CTRs: 2        │  │
│  │  Active Cases: 1          │  │
│  │                           │  │
│  └───────────────────────────┘  │
│  [View All Assignments →]       │
└─────────────────────────────────┘
```

**Navigation:**
- On "View All Assignments" → My Assignments Screen

---

### 5.6 Screen: Notifications Panel

**Screen Name:** Notifications Panel

**Screen Purpose:** Display assignment notifications and allow users to mark them as read

**Route:** `/notifications` or Dropdown panel from header bell icon

**Wireframe (Dropdown Panel):**
```
┌───────────────────────────────────────┐
│  Notifications                [Mark All Read]  │
│  ─────────────────────────────────────────────  │
│                                                 │
│  ● New CTR Assigned                    2m ago  │
│    CTR FIA-2026-0045 assigned to you           │
│    Deadline: Feb 25, 2026                      │
│    Assigned by: John Smith                     │
│  ─────────────────────────────────────────────  │
│                                                 │
│  ● New CTR Assigned                    1h ago  │
│    CTR FIA-2026-0031 assigned to you           │
│    Deadline: Feb 18, 2026                      │
│    Assigned by: John Smith                     │
│  ─────────────────────────────────────────────  │
│                                                 │
│  ○ New CTR Assigned                    1d ago  │
│    CTR FIA-2026-0023 assigned to you           │
│    Deadline: Feb 20, 2026                      │
│    Assigned by: John Smith                     │
│  ─────────────────────────────────────────────  │
│                                                 │
│  [View All Notifications →]                    │
│                                                 │
└─────────────────────────────────────────────────┘

Legend: ● = Unread, ○ = Read
```

**Wireframe (Full Page):**
```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo]  SupTech365                    [🔔 3] [User: Officer ▼] │
├─────────────────────────────────────────────────────────────────┤
│  [Sidebar]         │                                            │
│  Dashboard         │  Notifications                             │
│  My Assignments    │                                            │
│  > Notifications ← │  Unread: 3                [Mark All Read]  │
│                    │                                            │
│                    │  Filters: [All ▼] [This Week ▼]            │
│                    │                                            │
│                    │  ┌───────────────────────────────────────┐ │
│                    │  │ ● New CTR Assigned          2m ago    │ │
│                    │  │   CTR FIA-2026-0045 assigned to you   │ │
│                    │  │   Deadline: Feb 25, 2026              │ │
│                    │  │   Assigned by: John Smith             │ │
│                    │  ├───────────────────────────────────────┤ │
│                    │  │ ● New STR Assigned          1h ago    │ │
│                    │  │   STR FIA-2026-0031 assigned to you   │ │
│                    │  │   Deadline: Feb 18, 2026              │ │
│                    │  │   Assigned by: Mary Johnson           │ │
│                    │  ├───────────────────────────────────────┤ │
│                    │  │ ○ New CTR Assigned          1d ago    │ │
│                    │  │   CTR FIA-2026-0023 assigned to you   │ │
│                    │  │   Deadline: Feb 20, 2026              │ │
│                    │  │   Assigned by: John Smith             │ │
│                    │  └───────────────────────────────────────┘ │
│                    │                                            │
│                    │  Showing 1-10 of 15 [<Prev][1][2][Next>]   │
│                    │                                            │
└─────────────────────────────────────────────────────────────────┘
```

**Inputs/Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Read Status Filter | Dropdown | No | Filter by All, Unread, Read |
| Date Range Filter | Dropdown | No | Filter by Today, This Week, This Month |

**Buttons/Actions:**

| Button | Action | States |
|--------|--------|--------|
| Notification Click | Navigate to assignment and mark as read | Always enabled |
| Mark All Read | Mark all notifications as read | Enabled when unread exist |
| View All | Navigate to full notifications page | Always enabled (in dropdown) |

**Navigation:**
- On notification click → My Assignments Screen (filtered to that assignment)

---

## 6. User Flow Diagrams

### 6.1 Supervisor Assignment Flow

```
┌─────────────────┐
│  Supervisor     │
│  Logs In        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Navigate to    │
│  Assignment     │
│  Queue          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  View Queue     │
│  Apply Filters  │
│  (CTR/STR)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Select Report  │
│  to Assign      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  (Optional)     │
│  View Team      │◄──────────────┐
│  Workload       │               │
└────────┬────────┘               │
         │                        │
         ▼                        │
┌─────────────────┐               │
│  Click "Assign" │               │
│  Button         │               │
└────────┬────────┘               │
         │                        │
         ▼                        │
┌─────────────────┐               │
│  Assignment     │               │
│  Modal Opens    │               │
│  - See workloads│               │
└────────┬────────┘               │
         │                        │
         ▼                        │
┌─────────────────┐               │
│  Select         │               │
│  Assignee       │───────────────┘
│  (lowest load)  │  (check workload first)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Set Deadline   │
│  (Future Date)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Click          │
│  "Assign Report"│
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐  ┌───────┐
│Success│  │ Error │
└───┬───┘  └───┬───┘
    │          │
    ▼          ▼
┌─────────┐ ┌─────────┐
│ Toast   │ │ Toast   │
│ Success │ │ Error   │
│ Return  │ │ Stay on │
│ to Queue│ │ Modal   │
└─────────┘ └─────────┘
```

### 6.2 Officer/Analyst Notification Flow

```
┌─────────────────┐
│  Officer/       │
│  Analyst        │
│  Logs In        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  See Bell Icon  │
│  with Badge     │
│  [🔔 3]         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Click Bell     │
│  Icon           │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Notification   │
│  Panel Opens    │
│  - New assigns  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Click on       │
│  Notification   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Navigate to My Assignments     │
│  (Notification marked as read)  │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────┐
│  View Report    │
│  Details        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Work on        │
│  Assigned       │
│  Report         │
└─────────────────┘
```

### 6.3 Report Access Control Flow

```
┌─────────────────┐
│  User Attempts  │
│  to Access      │
│  Report         │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  Check: Is report       │
│  assigned to user?      │
└────────────┬────────────┘
             │
       ┌─────┴─────┐
       │           │
       ▼           ▼
   ┌───────┐   ┌───────┐
   │  Yes  │   │  No   │
   └───┬───┘   └───┬───┘
       │           │
       ▼           ▼
┌───────────┐  ┌─────────────────┐
│  Allow    │  │ Check: Is user  │
│  Access   │  │ a supervisor?   │
│  to Report│  └────────┬────────┘
└───────────┘           │
                  ┌─────┴─────┐
                  │           │
                  ▼           ▼
              ┌───────┐   ┌───────┐
              │  Yes  │   │  No   │
              └───┬───┘   └───┬───┘
                  │           │
                  ▼           ▼
           ┌───────────┐  ┌───────────────┐
           │  Allow    │  │ Access Denied │
           │  Access   │  │ ERR-ACCESS-001│
           │  (dept)   │  │ Redirect to   │
           └───────────┘  │ My Assignments│
                          └───────────────┘
```

---

## 7. UI Component Specifications

### 7.1 Component Hierarchy

```
AssignmentModule/
├── SupervisorViews/
│   ├── AssignmentQueuePage.tsx
│   ├── AssignmentQueueTable.tsx
│   ├── AssignmentQueueFilters.tsx
│   ├── TeamWorkloadPage.tsx
│   ├── WorkloadTable.tsx
│   ├── WorkloadProgressBar.tsx
│   └── CreateAssignmentModal.tsx
├── OfficerViews/
│   ├── MyAssignmentsPage.tsx
│   ├── MyAssignmentsTable.tsx
│   ├── MyAssignmentsFilters.tsx
│   └── MyWorkloadCard.tsx
├── Shared/
│   ├── NotificationsPanel.tsx
│   ├── NotificationDropdown.tsx
│   ├── NotificationItem.tsx
│   ├── NotificationBell.tsx
│   ├── AssignmentStatusBadge.tsx
│   ├── DeadlineBadge.tsx
│   └── AssigneeSelect.tsx
└── hooks/
    ├── useAssignmentQueue.ts
    ├── useTeamWorkload.ts
    ├── useMyAssignments.ts
    ├── useMyWorkload.ts
    ├── useCreateAssignment.ts
    ├── useNotifications.ts
    └── useMarkNotificationRead.ts
```

### 7.2 Component: AssignmentQueuePage

**Component Name:** AssignmentQueuePage

**Component Purpose:** Display paginated list of reports pending assignment for supervisors

**Props:**
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| - | - | - | - | No props (uses React Query and router params) |

**State:**
| State | Type | Initial | Description |
|-------|------|---------|-------------|
| selectedReports | string[] | [] | Selected report IDs for batch assignment |
| isModalOpen | boolean | false | Create assignment modal visibility |

**Responsibilities:**
- Fetch assignment queue via React Query
- Display reports in data table with selection
- Handle filter changes
- Handle pagination
- Open create assignment modal with selected report

**Dependencies:**
- `AssignmentQueueTable` component
- `AssignmentQueueFilters` component
- `CreateAssignmentModal` component
- `useAssignmentQueue` hook
- `useAssignmentFiltersStore` (Zustand)

---

### 7.3 Component: TeamWorkloadPage

**Component Name:** TeamWorkloadPage

**Component Purpose:** Display workload distribution across team members

**Props:**
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| - | - | - | - | No props (uses React Query) |

**State:**
| State | Type | Initial | Description |
|-------|------|---------|-------------|
| sortBy | 'name' \| 'workload_asc' \| 'workload_desc' | 'workload_asc' | Sort order |

**Responsibilities:**
- Fetch team workload via React Query (officers or analysts based on role)
- Display workload table with visual indicators
- Calculate and display summary statistics
- Support sorting by workload

**Dependencies:**
- `WorkloadTable` component
- `WorkloadProgressBar` component
- `useOfficerWorkload` or `useAnalystWorkload` hook

---

### 7.4 Component: CreateAssignmentModal

**Component Name:** CreateAssignmentModal

**Component Purpose:** Form modal to create a new assignment

**Props:**
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| isOpen | boolean | Yes | - | Modal visibility |
| onClose | () => void | Yes | - | Close handler |
| report | Report | Yes | - | Report to assign |

**State:**
| State | Type | Initial | Description |
|-------|------|---------|-------------|
| form | CreateAssignmentForm | {} | Form state via React Hook Form |
| isSubmitting | boolean | false | Submission loading state |

**Responsibilities:**
- Display report summary
- Show team member dropdown with workload counts
- Date picker for deadline selection
- Validate form before submission
- Submit assignment via mutation
- Show success/error feedback

**Dependencies:**
- `AssigneeSelect` component
- `DatePicker` component (shadcn/ui)
- `useCreateAssignment` mutation hook
- `useTeamWorkload` hook (for workload display in dropdown)
- React Hook Form + Zod validation

---

### 7.5 Component: MyAssignmentsPage

**Component Name:** MyAssignmentsPage

**Component Purpose:** Display the current user's assigned reports

**Props:**
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| - | - | - | - | No props (uses current user context) |

**State:**
| State | Type | Initial | Description |
|-------|------|---------|-------------|
| filters | MyAssignmentFilters | {} | Active filter values |
| page | number | 1 | Current page |

**Responsibilities:**
- Fetch user's assignments via React Query
- Display workload summary card
- Display assignments in data table
- Handle filters and pagination
- Navigate to report review on row click

**Dependencies:**
- `MyWorkloadCard` component
- `MyAssignmentsTable` component
- `MyAssignmentsFilters` component
- `useMyAssignments` hook
- `useMyWorkload` hook

---

### 7.6 Component: MyWorkloadCard

**Component Name:** MyWorkloadCard

**Component Purpose:** Display current user's workload summary

**Props:**
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| compact | boolean | No | false | Compact mode for sidebar |

**State:**
| State | Type | Initial | Description |
|-------|------|---------|-------------|
| - | - | - | No local state (data from React Query) |

**Responsibilities:**
- Fetch and display user's workload count
- Show breakdown by report type (CTR/STR/Cases)
- Link to full assignments page

**Dependencies:**
- `useMyWorkload` hook

---

### 7.7 Component: NotificationsPanel

**Component Name:** NotificationsPanel

**Component Purpose:** Display and manage assignment notifications

**Props:**
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| isDropdown | boolean | No | false | Render as dropdown vs page |

**State:**
| State | Type | Initial | Description |
|-------|------|---------|-------------|
| filters | NotificationFilters | { isRead: undefined } | Active filters |

**Responsibilities:**
- Fetch notifications via React Query
- Display notification list with read/unread status
- Handle mark as read actions
- Handle mark all as read
- Navigate to assignment on click

**Dependencies:**
- `NotificationItem` component
- `useNotifications` hook
- `useMarkNotificationRead` mutation
- `useMarkAllNotificationsRead` mutation

---

### 7.8 Component: NotificationBell

**Component Name:** NotificationBell

**Component Purpose:** Header bell icon with unread count badge

**Props:**
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| - | - | - | - | No props |

**State:**
| State | Type | Initial | Description |
|-------|------|---------|-------------|
| isOpen | boolean | false | Dropdown visibility |

**Responsibilities:**
- Display bell icon with unread count badge
- Toggle notification dropdown
- Refresh count on new notifications

**Dependencies:**
- `NotificationDropdown` component
- `useNotifications` hook (for unread count)

---

### 7.9 Component: AssigneeSelect

**Component Name:** AssigneeSelect

**Component Purpose:** Dropdown to select assignee with workload display

**Props:**
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| value | string \| undefined | No | undefined | Selected user ID |
| onChange | (userId: string) => void | Yes | - | Change handler |
| workflowType | 'compliance' \| 'analysis' | Yes | - | Determines available users |
| disabled | boolean | No | false | Disable dropdown |

**State:**
| State | Type | Initial | Description |
|-------|------|---------|-------------|
| search | string | '' | Search filter for users |

**Responsibilities:**
- Fetch available assignees based on workflow type
- Display users with workload counts
- Highlight lowest workload users
- Filter users by search term

**Dependencies:**
- `useTeamWorkload` hook (officers or analysts)
- shadcn/ui Select component

---

### 7.10 Component: DeadlineBadge

**Component Name:** DeadlineBadge

**Component Purpose:** Display deadline with visual urgency indicators

**Props:**
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| deadline | Date | Yes | - | Deadline date |
| showRelative | boolean | No | true | Show relative time |

**Responsibilities:**
- Display deadline date
- Show urgency color coding:
  - Green: > 5 days remaining
  - Yellow: 2-5 days remaining
  - Red: < 2 days or overdue
- Show relative time (e.g., "Due in 3 days")

---

## 8. State Management

### 8.1 Server State (React Query)

**Assignment Queue Query:**
```typescript
// useAssignmentQueue.ts
export function useAssignmentQueue(filters: AssignmentQueueFilters) {
  return useQuery({
    queryKey: ['assignmentQueue', filters],
    queryFn: () => assignmentApi.getAssignmentQueue(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
}
```

**Team Workload Query:**
```typescript
// useTeamWorkload.ts
export function useOfficerWorkload(teamId?: string) {
  return useQuery({
    queryKey: ['workload', 'officers', teamId],
    queryFn: () => workloadApi.getOfficerWorkloads(teamId),
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useAnalystWorkload() {
  return useQuery({
    queryKey: ['workload', 'analysts'],
    queryFn: () => workloadApi.getAnalystWorkloads(),
    staleTime: 60 * 1000,
  });
}
```

**My Assignments Query:**
```typescript
// useMyAssignments.ts
export function useMyAssignments(filters: MyAssignmentFilters) {
  return useQuery({
    queryKey: ['myAssignments', filters],
    queryFn: () => assignmentApi.getMyAssignments(filters),
    staleTime: 30 * 1000,
  });
}
```

**My Workload Query:**
```typescript
// useMyWorkload.ts
export function useMyWorkload() {
  return useQuery({
    queryKey: ['myWorkload'],
    queryFn: () => workloadApi.getMyWorkload(),
    staleTime: 60 * 1000,
  });
}
```

**Notifications Query:**
```typescript
// useNotifications.ts
export function useNotifications(filters: NotificationFilters) {
  return useQuery({
    queryKey: ['notifications', filters],
    queryFn: () => notificationApi.getNotifications(filters),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000, // Poll every minute
  });
}
```

**Create Assignment Mutation:**
```typescript
// useCreateAssignment.ts
export function useCreateAssignment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateAssignmentRequest) => 
      assignmentApi.createAssignment(data),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['assignmentQueue'] });
      queryClient.invalidateQueries({ queryKey: ['workload'] });
    },
  });
}
```

### 8.2 UI State (Zustand)

**Assignment UI Store:**
```typescript
// stores/assignmentStore.ts
interface AssignmentUIState {
  // Assignment Queue
  selectedReportId: string | null;
  isAssignmentModalOpen: boolean;
  queueFilters: AssignmentQueueFilters;
  
  // Notifications
  isNotificationPanelOpen: boolean;
  
  // Actions
  setSelectedReport: (id: string | null) => void;
  openAssignmentModal: () => void;
  closeAssignmentModal: () => void;
  setQueueFilters: (filters: AssignmentQueueFilters) => void;
  toggleNotificationPanel: () => void;
}

export const useAssignmentStore = create<AssignmentUIState>((set) => ({
  selectedReportId: null,
  isAssignmentModalOpen: false,
  queueFilters: {},
  isNotificationPanelOpen: false,
  
  setSelectedReport: (id) => set({ selectedReportId: id }),
  openAssignmentModal: () => set({ isAssignmentModalOpen: true }),
  closeAssignmentModal: () => set({ isAssignmentModalOpen: false }),
  setQueueFilters: (filters) => set({ queueFilters: filters }),
  toggleNotificationPanel: () => 
    set((state) => ({ isNotificationPanelOpen: !state.isNotificationPanelOpen })),
}));
```

### 8.3 Form State (React Hook Form + Zod)

**Assignment Form Schema:**
```typescript
// schemas/assignmentSchema.ts
import { z } from 'zod';

export const createAssignmentSchema = z.object({
  report_id: z.string().uuid('Invalid report ID'),
  assignee_id: z.string().uuid('Please select a team member'),
  deadline: z.date({
    required_error: 'Please select a deadline date',
  }).refine(
    (date) => date > new Date(),
    'Deadline must be a future date'
  ),
  workflow_type: z.enum(['compliance', 'analysis']),
});

export type CreateAssignmentFormData = z.infer<typeof createAssignmentSchema>;
```

---

## 9. Form Handling

### 9.1 Create Assignment Form

**Form Component:**
```typescript
// CreateAssignmentForm.tsx
export function CreateAssignmentForm({ report, onSuccess, onCancel }) {
  const { mutate: createAssignment, isPending } = useCreateAssignment();
  
  const form = useForm<CreateAssignmentFormData>({
    resolver: zodResolver(createAssignmentSchema),
    defaultValues: {
      report_id: report.id,
      workflow_type: report.report_type === 'CTR' ? 'compliance' : 'analysis',
      assignee_id: undefined,
      deadline: undefined,
    },
  });
  
  const onSubmit = (data: CreateAssignmentFormData) => {
    createAssignment(data, {
      onSuccess: () => {
        toast.success('Report assigned successfully');
        onSuccess();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };
  
  return (
    <Form {...form}>
      {/* Form fields */}
    </Form>
  );
}
```

**Validation Rules:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| report_id | UUID | Yes | Valid UUID |
| assignee_id | UUID | Yes | Valid UUID, must be team member |
| deadline | Date | Yes | Must be future date |
| workflow_type | Enum | Yes | 'compliance' or 'analysis' |

**Error Display:**

| Error Type | Display Location | Format |
|------------|------------------|--------|
| Field validation | Below field | Inline error text (red) |
| API error | Toast notification | Error toast with message |
| Authorization error | Toast + redirect | Error toast, redirect to queue |

---

## 10. API Integration

### 10.1 API Client Structure

**Base API Configuration:**
```typescript
// api/client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`/api/v1${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
      ...options?.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new ApiError(error.error.code, error.error.message);
  }
  
  return response.json();
}
```

### 10.2 API Endpoint Mapping

| Endpoint | Method | Hook | Component | Request | Response |
|----------|--------|------|-----------|---------|----------|
| `/assignments` | POST | `useCreateAssignment` | CreateAssignmentModal | `CreateAssignmentRequest` | `AssignmentResponse` |
| `/assignments` | GET | `useAssignmentQueue` | AssignmentQueuePage | Query params | `AssignmentListResponse` |
| `/assignments/{id}` | GET | `useAssignment` | AssignmentDetails | - | `AssignmentResponse` |
| `/workload/officers` | GET | `useOfficerWorkload` | TeamWorkloadPage | Query params | `WorkloadListResponse` |
| `/workload/analysts` | GET | `useAnalystWorkload` | TeamWorkloadPage | - | `WorkloadListResponse` |
| `/my-assignments` | GET | `useMyAssignments` | MyAssignmentsPage | Query params | `AssignmentListResponse` |
| `/my-workload` | GET | `useMyWorkload` | MyWorkloadCard | - | `MyWorkloadResponse` |
| `/notifications` | GET | `useNotifications` | NotificationsPanel | Query params | `NotificationListResponse` |
| `/notifications/{id}/read` | PATCH | `useMarkNotificationRead` | NotificationItem | - | `NotificationResponse` |

### 10.3 Request/Response Types

```typescript
// types/assignment.ts

interface CreateAssignmentRequest {
  report_id: string;
  assignee_id: string;
  deadline: string; // ISO 8601
  workflow_type: 'compliance' | 'analysis';
}

interface AssignmentResponse {
  id: string;
  report_id: string;
  report_reference: string;
  report_type: 'CTR' | 'STR';
  assignee_id: string;
  assignee_name: string;
  assigned_by_id: string;
  assigned_by_name: string;
  workflow_type: 'compliance' | 'analysis';
  deadline: string;
  status: 'active' | 'completed' | 'cancelled';
  assigned_at: string;
}

interface WorkloadItemResponse {
  user_id: string;
  user_name: string;
  email: string;
  role: string;
  workload_count: number;
  active_ctrs: number;
  active_strs: number;
  active_escalated_ctrs: number;
  active_cases: number;
}

interface NotificationResponse {
  id: string;
  assignment_id: string;
  notification_type: 'new_assignment' | 'deadline_reminder';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}
```

### 10.4 Error Handling

**API Error Handler:**
```typescript
// api/errorHandler.ts
export class ApiError extends Error {
  constructor(
    public code: string,
    public message: string,
    public details?: Record<string, any>
  ) {
    super(message);
  }
}

export function handleApiError(error: ApiError) {
  switch (error.code) {
    case 'ERR-ASSIGN-PERM-001':
      toast.error('You are not authorized to assign reports');
      break;
    case 'ERR-ASSIGN-VALID-002':
      // Handled by form validation
      break;
    case 'ERR-ASSIGN-TEAM-001':
      toast.error('Assignee is not in your team');
      break;
    case 'ERR-ASSIGN-ACCESS-001':
      toast.error('Access denied - Report not assigned to you');
      router.navigate('/my-assignments');
      break;
    default:
      toast.error('An unexpected error occurred');
  }
}
```

---

## 11. Routing and Navigation

### 11.1 Route Definitions

| Route | Component | Roles | Description |
|-------|-----------|-------|-------------|
| `/supervisor/assignment-queue` | AssignmentQueuePage | COS, HoC, HoA | Assignment queue for supervisors |
| `/supervisor/workload` | TeamWorkloadPage | COS, HoC, HoA | Team workload view |
| `/my-assignments` | MyAssignmentsPage | CO, Analyst | User's assigned reports |
| `/notifications` | NotificationsPage | All | Full notifications page |

**Route Abbreviations:**
- COS: COMPLIANCE_OFFICER_SUPERVISOR
- HoC: HEAD_OF_COMPLIANCE
- HoA: HEAD_OF_ANALYSIS
- CO: COMPLIANCE_OFFICER

### 11.2 Navigation Guards

**Role-Based Guard:**
```typescript
// guards/RoleGuard.tsx
interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user } = useAuth();
  
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
}
```

**Route Configuration:**
```typescript
// routes/assignmentRoutes.tsx
export const assignmentRoutes = [
  {
    path: '/supervisor/assignment-queue',
    element: (
      <RoleGuard allowedRoles={[
        'COMPLIANCE_OFFICER_SUPERVISOR',
        'HEAD_OF_COMPLIANCE',
        'HEAD_OF_ANALYSIS'
      ]}>
        <AssignmentQueuePage />
      </RoleGuard>
    ),
  },
  {
    path: '/supervisor/workload',
    element: (
      <RoleGuard allowedRoles={[
        'COMPLIANCE_OFFICER_SUPERVISOR',
        'HEAD_OF_COMPLIANCE',
        'HEAD_OF_ANALYSIS'
      ]}>
        <TeamWorkloadPage />
      </RoleGuard>
    ),
  },
  {
    path: '/my-assignments',
    element: (
      <RoleGuard allowedRoles={['COMPLIANCE_OFFICER', 'ANALYST']}>
        <MyAssignmentsPage />
      </RoleGuard>
    ),
  },
  {
    path: '/notifications',
    element: <NotificationsPage />,
  },
];
```

### 11.3 Navigation Patterns

**Sidebar Navigation (Supervisor):**
```
Dashboard
▼ Assignments
   Assignment Queue ←
   Team Workload
Reports
Notifications
```

**Sidebar Navigation (Officer/Analyst):**
```
Dashboard
My Assignments ←
Notifications
```

**Navigation Triggers:**
- On assignment success → Navigate to Assignment Queue
- On notification click → Navigate to My Assignments
- On workload row click → Navigate to filtered assignments
- On access denied → Redirect to My Assignments

---

## 12. Error Handling

### 12.1 Error Boundary

```typescript
// components/ErrorBoundary.tsx
export function AssignmentErrorBoundary({ children }) {
  return (
    <ErrorBoundary
      fallback={({ error, resetErrorBoundary }) => (
        <div className="flex flex-col items-center justify-center p-8">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <Button onClick={resetErrorBoundary}>Try Again</Button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
```

### 12.2 User-Facing Error Messages

| Error Code | User Message | Action |
|------------|--------------|--------|
| ERR-ASSIGN-PERM-001 | "You are not authorized to assign reports. Only supervisors can assign reports." | Toast, stay on page |
| ERR-ASSIGN-WORKFLOW-001 | "Invalid workflow type for your role." | Toast, stay on modal |
| ERR-ASSIGN-TEAM-001 | "Assignee is not in your team. You can only assign to officers within your team." | Toast, stay on modal |
| ERR-ASSIGN-VALID-002 | "Deadline must be a future date." | Inline validation |
| ERR-ASSIGN-ACCESS-001 | "Access Denied - This report is not assigned to you." | Toast, redirect |
| NETWORK_ERROR | "Unable to connect. Please check your internet connection." | Toast with retry |
| UNKNOWN_ERROR | "An unexpected error occurred. Please try again." | Toast with retry |

### 12.3 Error Recovery Flows

**API Error Recovery:**
1. Display error toast with message
2. Log error for debugging
3. Provide retry button where applicable
4. Redirect to safe page if necessary

**Form Validation Error Recovery:**
1. Display inline error below field
2. Focus first error field
3. Disable submit until errors resolved

---

## 13. Testing Considerations

### 13.1 Component Tests

**Test Scope:**
- AssignmentQueuePage rendering and interactions
- CreateAssignmentModal form validation
- MyAssignmentsPage data display
- NotificationBell badge count

**Test Cases:**
```typescript
// __tests__/AssignmentQueuePage.test.tsx
describe('AssignmentQueuePage', () => {
  it('renders queue table with data', async () => {
    // Mock API response
    // Render component
    // Assert table rows match data
  });
  
  it('opens assignment modal on button click', async () => {
    // Select a report
    // Click assign button
    // Assert modal is visible
  });
  
  it('filters queue by report type', async () => {
    // Select CTR filter
    // Assert only CTR reports shown
  });
});
```

### 13.2 Integration Tests

**Test Scenarios:**
- Complete assignment flow (select → assign → success)
- Notification click to assignment view
- Access denied redirect flow
- Form submission with validation errors

### 13.3 E2E Tests

**Test Flows:**
1. Supervisor assigns CTR to officer with deadline
2. Officer receives notification and views assignment
3. Invalid deadline shows error
4. Unauthorized user redirected from supervisor routes

---

## 14. Security Considerations

### 14.1 Client-Side Validation

**Validation Requirements:**
- Deadline must be future date
- Assignee must be selected
- All required fields must be filled

**Note:** Server-side validation is the source of truth. Client validation is for UX only.

### 14.2 XSS Prevention

**Prevention Measures:**
- React's automatic escaping of rendered content
- No `dangerouslySetInnerHTML` usage
- Sanitize any user-provided content before display

### 14.3 Authorization

**Client-Side Authorization:**
- Role-based route guards
- Conditional UI rendering based on role
- API endpoints enforce server-side authorization

**Note:** Client-side authorization is for UX. Server enforces actual permissions.

### 14.4 Secure Storage

**Storage Requirements:**
- JWT token in httpOnly cookie (not localStorage)
- No sensitive data in localStorage
- Filter preferences only in localStorage

---

## 15. Dependencies Between Components

### 15.1 Component Dependencies

```
AssignmentQueuePage
├── AssignmentQueueFilters
├── AssignmentQueueTable
│   └── AssignmentStatusBadge
├── CreateAssignmentModal
│   ├── AssigneeSelect
│   │   └── WorkloadProgressBar
│   └── DatePicker (shadcn)
└── hooks/
    ├── useAssignmentQueue
    └── useCreateAssignment

TeamWorkloadPage
├── WorkloadTable
│   └── WorkloadProgressBar
└── hooks/
    ├── useOfficerWorkload
    └── useAnalystWorkload

MyAssignmentsPage
├── MyWorkloadCard
├── MyAssignmentsFilters
├── MyAssignmentsTable
│   ├── AssignmentStatusBadge
│   └── DeadlineBadge
└── hooks/
    ├── useMyAssignments
    └── useMyWorkload

NotificationBell
├── NotificationDropdown
│   └── NotificationItem
└── hooks/
    ├── useNotifications
    └── useMarkNotificationRead
```

### 15.2 Data Flow

```
API Response → React Query Cache → Component Props → UI Rendering

User Input → Form State → Validation → API Request → Cache Invalidation → UI Update
```

### 15.3 Event Flow

```
User clicks "Assign" button
    → AssignmentQueuePage.handleAssign()
    → setSelectedReport(reportId)
    → openAssignmentModal()
    → CreateAssignmentModal renders
    
User submits form
    → form.handleSubmit()
    → createAssignment.mutate(data)
    → API POST /assignments
    → onSuccess callback
    → invalidateQueries(['assignmentQueue'])
    → closeAssignmentModal()
    → toast.success()
```

---

## 16. Implementation Order

### Phase 1: Foundation (Sprint 1)

1. **Routing setup**
   - Add new routes for assignment module
   - Configure role-based guards

2. **API hooks**
   - `useAssignmentQueue`
   - `useTeamWorkload` (officers/analysts)
   - `useCreateAssignment`
   - `useMyAssignments`
   - `useMyWorkload`
   - `useNotifications`

3. **Zustand store**
   - Assignment UI state store

### Phase 2: Supervisor Views (Sprint 1-2)

4. **AssignmentQueuePage**
   - Queue table component
   - Filters component
   - Pagination

5. **TeamWorkloadPage**
   - Workload table
   - Progress bar visualization

6. **CreateAssignmentModal**
   - Form with React Hook Form + Zod
   - Assignee select with workload display
   - Date picker

### Phase 3: Officer/Analyst Views (Sprint 2)

7. **MyAssignmentsPage**
   - Assignments table
   - Filters
   - Pagination

8. **MyWorkloadCard**
   - Sidebar workload display
   - Breakdown by type

### Phase 4: Notifications (Sprint 2)

9. **NotificationBell**
   - Header bell icon
   - Unread count badge

10. **NotificationsPanel**
    - Notification list
    - Mark as read functionality
    - Full page view

### Phase 5: Integration (Sprint 3)

11. **Error handling**
    - Error boundaries
    - Toast notifications
    - API error handling

12. **Testing**
    - Component tests
    - Integration tests
    - E2E tests

---

## 17. User Experience Specifications

### 17.1 Loading States

**Loading Indicators:**

| Component | Loading Type | Description |
|-----------|--------------|-------------|
| AssignmentQueueTable | Skeleton | Table row skeletons |
| WorkloadTable | Skeleton | Table row skeletons |
| MyWorkloadCard | Spinner | Small spinner in card |
| CreateAssignmentModal | Button spinner | Spinner in submit button |
| NotificationBell | None | Badge updates in background |

### 17.2 Empty States

**Empty State Messages:**

| Component | Message | Action |
|-----------|---------|--------|
| AssignmentQueue | "No reports pending assignment" | - |
| AssignmentQueue (filtered) | "No reports match your filters" | Clear filters |
| MyAssignments | "You have no assigned reports" | - |
| Notifications | "No notifications" | - |

### 17.3 Success States

**Success Feedback:**

| Action | Feedback | Duration |
|--------|----------|----------|
| Assignment created | Toast: "Report assigned successfully" | 3 seconds |
| Notification marked read | Visual update (dot removed) | Instant |
| All notifications marked read | Toast: "All notifications marked as read" | 3 seconds |

### 17.4 Accessibility Requirements

**Accessibility Standards:**
- All interactive elements keyboard accessible
- Focus management on modal open/close
- ARIA labels on icon buttons
- Color contrast meets WCAG AA
- Screen reader announcements for toasts
- Skip links for navigation

### 17.5 Responsive Design

**Breakpoints:**

| Breakpoint | Layout Changes |
|------------|----------------|
| Mobile (< 768px) | Single column, collapsible sidebar |
| Tablet (768-1024px) | Two column with narrow sidebar |
| Desktop (> 1024px) | Full layout with expanded sidebar |

**Component Adaptations:**
- Tables become card lists on mobile
- Modal becomes full screen on mobile
- Notification dropdown becomes full page on mobile

---

## 18. Traceability Matrix

| MVF Requirement | Screen/Component | User Flow |
|-----------------|------------------|-----------|
| FR-6.1 (CTR Assignment) | CreateAssignmentModal | Supervisor Assignment Flow |
| FR-6.2 (STR Assignment) | CreateAssignmentModal | Supervisor Assignment Flow |
| FR-6.4 (Officer Workload) | TeamWorkloadPage, WorkloadTable | Workload View |
| FR-6.5 (Analyst Workload) | TeamWorkloadPage, WorkloadTable | Workload View |
| FR-6.7 (Notifications) | NotificationBell, NotificationsPanel | Notification Flow |
| FR-6.8 (Officer Access) | MyAssignmentsPage, RoleGuard | Access Control Flow |
| FR-6.9 (Analyst Access) | MyAssignmentsPage, RoleGuard | Access Control Flow |
| FR-6.15 (Workflow Separation) | AssignmentQueueFilters, RoleGuard | Role-based filtering |

---

**Document End**
