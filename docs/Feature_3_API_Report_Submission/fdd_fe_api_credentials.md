# Frontend Feature Design Document (FDD)
## Feature: API Credentials Management (Reporting Entity Portal)

**Document Title:** Frontend Feature Design Document  
**Feature Name:** API Credentials Management — Reporting Entity Portal  
**Product/System Name:** SupTech365  
**Version:** 1.0  
**Author:** Senior Product Designer  
**Related Backend FDD:** fdd_api_digital_submission.md (v1.2)  
**Related FE FDD:** Feature 1 — fdd_fe_entity_registration.md (Section 12 addendum)  
**Status:** Draft  
**Last Updated Date:** February 2026

---

## 1. Feature Context

**Feature Name**  
API Credentials Management — Reporting Entity Portal

**Feature Description**  
Allows Reporting Entity Users to view their masked API credentials, reveal plaintext keys (with re-authentication), copy keys to clipboard, and regenerate credentials via a dedicated portal page within the Reporting Entity Workspace.

**Feature Purpose**  
Provide reporting entities with self-service access to their API credentials for integrating core banking systems with the SupTech365 API submission pipeline, without requiring Tech Admin intervention for credential retrieval.

**Related Features**  
- Feature 3 (Backend): API Digital Submission — provides the backend endpoints and credential service
- Feature 1: Authentication and Registration — provides entity registration, re-authentication flow, and JWT authentication
- Feature 0: Foundation FE PDD — provides global navigation, sidebar, design system, and workspace patterns

**User Type**  
- **Reporting Entity User:** View masked credentials, reveal/copy keys, regenerate credentials

---

## 2. Technology Stack

**Framework:** React / Next.js (or equivalent per project standard)  
**State Management:** Component-level state (React `useState`) — no global store needed  
**HTTP Client:** Axios or Fetch with cookie support  
**Auth:** JWT Bearer token (from Feature 1 authentication)  
**Design System:** SupTech365 Design System (Feature 0 — colors, typography, spacing, components)  
**Accessibility:** WCAG 2.1 AA compliant

---

## 3. Screen List

| # | Screen | Route | Access |
|---|--------|-------|--------|
| 1 | API Credentials Page | `/reporting-entity/api-credentials` | Reporting Entity User |
| 2 | Re-Authentication Modal | (overlay) | Reporting Entity User |
| 3 | Regenerate Confirmation Dialog | (overlay) | Reporting Entity User |

---

## 4. Page Specification: API Credentials

### 4.1 Page Layout

**Route:** `/reporting-entity/api-credentials`  
**Access:** Reporting Entity User (JWT role guard)  
**Location:** Within authenticated Reporting Entity Workspace (global TopNav + Reporting Entity sidebar)

**Visual Layout:**
```
┌──────────────────────────────────────────────────────────────────┐
│ [TopNav with Logo, Search, Notifications, User Avatar]           │
├──────────────┬───────────────────────────────────────────────────┤
│              │ [Breadcrumb: Reporting Entity Workspace >          │
│   Sidebar    │  API Credentials]                                 │
│              ├───────────────────────────────────────────────────┤
│  Submit      │ API Credentials                          (H1)    │
│  Report      ├───────────────────────────────────────────────────┤
│              │                                                    │
│  My          │ ┌────────────────────────────────────────────────┐│
│  Submissions │ │ Key              Status  Created    Expires    ││
│              │ │ ••••••••••••     Active  Jan 15 26  Jan 15 27  ││
│  Resubmit.   │ │ [Show] [Copy]    Last used: Feb 10 26          ││
│              │ └────────────────────────────────────────────────┘│
│  Statistics  │                                                    │
│              │ [Regenerate Key]                                   │
│  API         │                                                    │
│  Credentials │ ⓘ API keys are used to submit reports via the     │
│  (active)    │   API. Use "Show" to reveal your key (requires    │
│              │   password re-entry).                              │
│              │                                                    │
└──────────────┴───────────────────────────────────────────────────┘
```

**Sidebar Navigation Item:**
- Label: "API Credentials"
- Icon: Key icon (🔑)
- Active state: highlighted when on `/reporting-entity/api-credentials`
- Position: Last item in the Reporting Entity sidebar (per workspace navigation map)

**Breadcrumb:**  
`Reporting Entity Workspace > API Credentials`

---

### 4.2 Credentials Table

**Columns:**

| Column | Content | Notes |
|--------|---------|-------|
| **Key** | Masked by default (`••••••••••••`) | With "Show" and "Copy" action buttons |
| **Status** | Badge with color coding | Active (green), Revoked (red), Expired (grey) |
| **Created** | Creation date | Formatted: "Jan 15, 2026" |
| **Expires** | Expiration date or "Never" | Formatted: "Jan 15, 2027" |
| **Last Used** | Last API request timestamp | Formatted: "Feb 10, 2026 08:15 AM" or "Never" |

**Key Column — Inline Actions:**

- **"Show" button:**
  1. Triggers re-authentication modal (password re-entry)
  2. On successful re-auth, calls `POST /api/v1/reporting-entity/credentials/reveal` with `{ "credential_id": <id> }`
  3. Replaces masked dots with plaintext key in monospace font
  4. Button label toggles to **"Hide"**
- **"Hide" button:**
  - Replaces plaintext key with `••••••••••••`
  - Button label toggles back to **"Show"**
  - No API call needed (purely client-side mask)
- **"Copy" button:**
  - Copies plaintext key to clipboard using `navigator.clipboard.writeText()`
  - **Disabled** while key is masked (requires reveal first)
  - On success: show "Copied!" toast notification (2 seconds)
  - When revealed: displayed in monospace font, full plaintext key visible

**Table Behavior:**
- Show all credentials (active and revoked) sorted by `created_at` descending
- Active credentials displayed first
- Revoked/expired credentials shown in muted/grey styling
- No pagination needed (typically 1–3 credentials per entity)

**Status Badge Styling:**

| Status | Badge Color | Background | Text |
|--------|-------------|------------|------|
| Active | Green | `#DCFCE7` | `#166534` |
| Revoked | Red | `#FEE2E2` | `#991B1B` |
| Expired | Grey | `#F1F5F9` | `#475569` |

---

### 4.3 Empty State

**When no credentials exist:**
```
┌────────────────────────────────────────────────────┐
│                                                    │
│                    🔑                              │
│          No API Credentials                        │
│                                                    │
│   No API credentials have been issued for your     │
│   entity. Contact your administrator to request    │
│   API access.                                      │
│                                                    │
└────────────────────────────────────────────────────┘
```
- Centered empty state with key icon
- No action button (only Tech Admin can issue initial credentials)

---

### 4.4 Regenerate Key Button

**Visibility:** Only when at least one credential exists (active or revoked)  
**Button Style:** Secondary/warning button  
**Label:** "Regenerate Key"  
**Disabled when:** No active credentials exist (all revoked) or during processing

**Click Flow:**

1. **Confirmation Dialog:**
   ```
   ┌──────────────────────────────────────────┐
   │  Regenerate API Key?                      │
   │                                           │
   │  This will revoke your current API key    │
   │  and generate a new one. Any systems      │
   │  using the current key will immediately   │
   │  lose access.                             │
   │                                           │
   │  ⚠️ This action cannot be undone.          │
   │                                           │
   │         [Cancel]  [Regenerate]            │
   │                   (danger/red)             │
   └──────────────────────────────────────────┘
   ```
   - Title: "Regenerate API Key?"
   - Message: "This will revoke your current API key and generate a new one. Any systems using the current key will immediately lose access."
   - Warning: "⚠️ This action cannot be undone."
   - Buttons: "[Cancel]" (secondary) + "[Regenerate]" (danger/red)

2. **If confirmed:** Trigger re-authentication modal (password re-entry per Feature 1 re-auth flow)

3. **After successful re-auth:** Call `POST /api/v1/reporting-entity/credentials/regenerate` with `{ "confirm": true }`

4. **On success:**
   - Show success toast: "API key regenerated successfully. Your previous key has been revoked."
   - Refresh credentials table (re-fetch from `GET /api/v1/reporting-entity/credentials`)
   - New key is accessible via the standard "Show" button in the table

---

### 4.5 Informational Note

Display below the credentials table / regenerate button:

> ⓘ **API keys** are used to submit reports via the API. Use "Show" to reveal your key (requires password re-entry).

**Style:** Blue info banner (background `#EFF6FF`, border-left `#3B82F6`, text `#1E3A8A`)

---

## 5. Re-Authentication Modal

**Shared component** used by both "Show" (reveal) and "Regenerate" actions.

**Visual Layout:**
```
┌──────────────────────────────────────────┐
│  Re-enter Your Password           [✕]    │
│                                           │
│  For security, please confirm your        │
│  identity to continue.                    │
│                                           │
│  Password: [________________________]    │
│            (auto-focused)                │
│                                           │
│  [error message inline if incorrect]      │
│                                           │
│           [Cancel]  [Confirm]             │
└──────────────────────────────────────────┘
```

**Behavior:**
- `role="dialog"` with `aria-labelledby` and `aria-describedby`
- Password field auto-focused on open
- Escape key closes modal
- Loading spinner on "Confirm" button during verification
- Inline error on failed auth: "Incorrect password. Please try again."
- On success: close modal, proceed with the pending action (reveal or regenerate)

**Re-Auth Mechanism:**
- Uses the Feature 1 re-authentication flow (elevated session / password re-entry)
- Required every time for both reveal and regenerate operations
- Prevents access from unattended sessions

---

## 6. User Flow Diagrams

### 6.1 View Credentials Flow

```
[Page Load]
    │
    ├─ Call GET /api/v1/reporting-entity/credentials
    │
    ├─ 200 OK ──────────────── Render credentials table
    │                           (all keys masked)
    │
    ├─ 401 Unauthorized ────── Redirect to /login
    │
    └─ 403 Forbidden ──────── Show "Access Denied" page
```

### 6.2 Reveal Key Flow

```
[User clicks "Show"]
    │
    ├─ Open Re-Authentication Modal
    │
    ├─ User enters password → [Confirm]
    │   │
    │   ├─ Auth Failed ──── Show inline error, allow retry
    │   │
    │   └─ Auth Success
    │       │
    │       ├─ POST /api/v1/reporting-entity/credentials/reveal
    │       │  Body: { "credential_id": <id> }
    │       │
    │       ├─ 200 OK ──── Replace masked key with plaintext
    │       │               Toggle button to "Hide"
    │       │               Enable "Copy" button
    │       │
    │       ├─ 401 ──────── Re-auth required (show modal again)
    │       ├─ 403 ──────── Show error toast
    │       └─ 404 ──────── Show error toast: "Credential not found"
    │
    └─ User clicks "Cancel" → Close modal, no action
```

### 6.3 Regenerate Key Flow

```
[User clicks "Regenerate Key"]
    │
    ├─ Show Confirmation Dialog
    │   │
    │   ├─ [Cancel] ──── Close dialog, no action
    │   │
    │   └─ [Regenerate]
    │       │
    │       ├─ Open Re-Authentication Modal
    │       │   │
    │       │   ├─ Auth Failed ──── Show inline error
    │       │   │
    │       │   └─ Auth Success
    │       │       │
    │       │       ├─ POST /api/v1/reporting-entity/credentials/regenerate
    │       │       │  Body: { "confirm": true }
    │       │       │
    │       │       ├─ 200 OK ── Success toast
    │       │       │             Refresh credentials table
    │       │       │
    │       │       ├─ 400 ──── Error toast
    │       │       ├─ 401 ──── Re-auth required
    │       │       └─ 403 ──── Error toast: "Access denied"
    │       │
    │       └─ [Cancel] → Close modal
```

---

## 7. API Contracts (Frontend Perspective)

### 7.1 GET /api/v1/reporting-entity/credentials

**Purpose:** Fetch entity's API credentials (masked)

**Request Headers:**
- `Authorization: Bearer {token}` (JWT)
- CSRF token in header

**Response (200 OK):**
```json
{
  "entity_id": 12345,
  "credentials": [
    {
      "id": 1,
      "masked_key": "sk-****...****abcd",
      "status": "active",
      "created_at": "2026-01-15T10:30:00Z",
      "expires_at": "2027-01-15T10:30:00Z",
      "last_used_at": "2026-02-10T08:15:00Z"
    }
  ],
  "total": 1
}
```

**Error Responses:**
- `401 Unauthorized` → redirect to `/login`
- `403 Forbidden` → show "Access Denied" page

---

### 7.2 POST /api/v1/reporting-entity/credentials/reveal

**Purpose:** Reveal plaintext API key (requires re-auth)

**Request Headers:**
- `Authorization: Bearer {token}` (JWT)
- `Content-Type: application/json`
- CSRF token in header

**Request Body:**
```json
{
  "credential_id": 1
}
```

**Response (200 OK):**
```json
{
  "api_key": "a1b2c3d4e5f6...64_char_hex_string",
  "credential_id": 1
}
```

**Error Responses:**
- `400 Bad Request` → `credential_id` missing
- `401 Unauthorized` → re-authentication required
- `403 Forbidden` → credential does not belong to user's entity
- `404 Not Found` → credential not found or not active

---

### 7.3 POST /api/v1/reporting-entity/credentials/regenerate

**Purpose:** Regenerate API credentials (revokes existing, issues new)

**Request Headers:**
- `Authorization: Bearer {token}` (JWT)
- `Content-Type: application/json`
- CSRF token in header

**Request Body:**
```json
{
  "confirm": true
}
```

**Response (200 OK):**
```json
{
  "api_key": "a1b2c3d4e5f6...64_char_hex_string",
  "credential": {
    "id": 2,
    "masked_key": "sk-****...****f6g7",
    "status": "active",
    "created_at": "2026-02-10T09:00:00Z",
    "expires_at": "2027-02-10T09:00:00Z",
    "last_used_at": null
  },
  "message": "API credentials regenerated successfully. Previous credentials have been revoked."
}
```

**Error Responses:**
- `400 Bad Request` → `confirm` field missing or false
- `401 Unauthorized` → not authenticated or re-auth required
- `403 Forbidden` → not a Reporting Entity User

---

## 8. Component Breakdown

### 8.1 Component Tree

```
ApiCredentialsPage
├── Breadcrumb
├── PageHeader ("API Credentials")
├── CredentialsTable
│   ├── CredentialRow (per credential)
│   │   ├── MaskedKeyCell
│   │   │   ├── ShowHideButton
│   │   │   └── CopyButton
│   │   ├── StatusBadge
│   │   ├── DateCell (created)
│   │   ├── DateCell (expires)
│   │   └── DateCell (last used)
│   └── EmptyState (if no credentials)
├── RegenerateKeyButton
├── InfoBanner
├── ReAuthModal (shared)
└── RegenerateConfirmDialog
```

### 8.2 Component Details

#### `ApiCredentialsPage`
- **File:** `pages/reporting-entity/api-credentials.tsx` (or equivalent)
- **State:**
  - `credentials: Credential[]` — list from API
  - `isLoading: boolean` — initial fetch loading
  - `fetchError: string | null` — fetch error message
  - `revealedKeys: Record<number, string>` — map of credential ID → plaintext key
  - `showReAuthModal: boolean` — re-auth modal visibility
  - `pendingAction: { type: 'reveal' | 'regenerate', credentialId?: number } | null` — action waiting on re-auth
  - `isRegenerating: boolean` — regeneration in progress
  - `showConfirmDialog: boolean` — regenerate confirmation dialog
- **On mount:** Call `GET /api/v1/reporting-entity/credentials`

#### `CredentialRow`
- Renders one credential row in the table
- Props: `credential`, `revealedKey`, `onReveal`, `onCopy`
- Key display logic:
  - If `revealedKeys[credential.id]` exists → show plaintext in monospace
  - Else → show `••••••••••••`

#### `ShowHideButton`
- Toggle between "Show" (triggers re-auth → reveal) and "Hide" (client-side mask)
- `aria-label`: "Show API key" / "Hide API key"

#### `CopyButton`
- Copies plaintext key to clipboard
- Disabled when key is masked
- Shows "Copied!" toast on success
- `aria-label`: "Copy API key to clipboard"

#### `StatusBadge`
- Renders colored badge based on status value
- Includes screen-reader text (not color-only)

#### `ReAuthModal`
- Shared modal for password re-entry
- Props: `isOpen`, `onSuccess`, `onCancel`, `isLoading`, `error`
- Auto-focus password field
- Escape to close

#### `RegenerateConfirmDialog`
- Confirmation dialog before regeneration
- Props: `isOpen`, `onConfirm`, `onCancel`
- Danger button styling

#### `EmptyState`
- Centered layout with key icon, heading, description
- No action button

#### `InfoBanner`
- Blue informational banner with API key usage guidance

---

## 9. State Management

**Approach:** Component-level state only (no global store required)

**Key State Rules:**
- Revealed plaintext keys are held **only in component state** (`revealedKeys` map) — never persisted to localStorage or sessionStorage
- On page navigation away, all revealed keys are discarded (component unmount clears state)
- Re-authentication result is not cached — required fresh for every reveal/regenerate action

**Data Flow:**
```
Page Mount → GET /credentials → credentials state → render table
Show Click → Re-Auth Modal → POST /reveal → revealedKeys state → render plaintext
Hide Click → remove from revealedKeys → render masked
Copy Click → read from revealedKeys → clipboard
Regenerate → Confirm Dialog → Re-Auth Modal → POST /regenerate → re-fetch credentials
```

---

## 10. Loading & Error States

### 10.1 Loading States

| Scenario | UI Behavior |
|----------|-------------|
| **Page load** | Skeleton loader for credentials table |
| **Key reveal** | Spinner on "Show" button, button disabled |
| **Regeneration** | Spinner on "Regenerate" button, text changes to "Regenerating...", button disabled |
| **Re-authentication** | Spinner on "Confirm" button in re-auth modal |

### 10.2 Error States

| Scenario | UI Behavior |
|----------|-------------|
| **Fetch error** | Error banner: "Unable to load API credentials. Please try again." with "[Retry]" button |
| **Key reveal error** | Error toast: "Failed to reveal API key. Please try again." |
| **Regeneration error** | Error toast: "Failed to regenerate API key. Please try again." |
| **Re-auth failure** | Inline error in modal: "Incorrect password. Please try again." |
| **401 on page load** | Redirect to `/login` |
| **403 on page load** | Show "Access Denied" full-page error |

---

## 11. Accessibility Requirements

### 11.1 Table Accessibility
- Table must have proper `<th>` headers with `scope="col"`
- Status badges must include screen-reader-friendly text (not color-only)
- Sortable columns must indicate sort direction via `aria-sort`

### 11.2 Interactive Elements
- "Show/Hide" toggle: `aria-label="Show API key"` / `aria-label="Hide API key"`
- "Copy" button: `aria-label="Copy API key to clipboard"`
- "Regenerate Key" button: clear `aria-label`
- Disabled "Copy" button: `aria-disabled="true"` with tooltip explaining why

### 11.3 Modal Accessibility
- Re-auth modal: `role="dialog"`, `aria-labelledby`, `aria-describedby`
- Confirmation dialog: `role="alertdialog"`, `aria-labelledby`, `aria-describedby`
- Focus management: auto-focus password field in re-auth modal
- Keyboard: Escape closes modals
- Focus trap within open modals

### 11.4 General
- All form fields have associated `<label>` elements
- Error messages are announced via `aria-live="polite"` region
- Toast notifications use `role="status"`
- Color contrast: minimum WCAG AA (4.5:1 for normal text, 3:1 for large text)
- Touch targets: minimum 44×44px

---

## 12. Security Considerations

- **No client-side storage of API keys:** Plaintext keys are held only in React component state (`revealedKeys`), never in localStorage, sessionStorage, or cookies
- **Re-authentication required:** Every reveal and regenerate action requires fresh password re-entry — no caching of elevated session
- **CSRF protection:** All POST requests include CSRF token in header
- **JWT auth:** All endpoints require valid Bearer token
- **Auto-clear on unmount:** Revealed keys are discarded when user navigates away from the page (component unmount)
- **Copy to clipboard:** Uses `navigator.clipboard.writeText()` — the plaintext key is briefly in the clipboard; no additional mitigation (standard browser behavior)

---

## 13. Responsive Design

### Desktop (≥1024px)
- Full table layout as specified in Section 4.2
- Sidebar visible (240px)
- Table columns: Key, Status, Created, Expires, Last Used

### Tablet (768–1024px)
- Collapsed sidebar (64px icons only)
- Table columns: Key, Status, Created, Last Used (Expires hidden)

### Mobile (<768px)
- Sidebar replaced with hamburger menu
- Credentials displayed as stacked cards instead of table:
  ```
  ┌──────────────────────────────┐
  │ Status: ● Active             │
  │ Key: ••••••••••••            │
  │ [Show] [Copy]                │
  │ Created: Jan 15, 2026        │
  │ Expires: Jan 15, 2027        │
  │ Last Used: Feb 10, 2026      │
  └──────────────────────────────┘
  ```
- "Regenerate Key" button full-width
- Modals: 90% viewport width

---

## 14. Route Guard & Authorization

**Route Protection:**
- Route `/reporting-entity/api-credentials` requires:
  1. Authenticated user (valid JWT)
  2. Role: `reporting_entity_user`
  3. User must have a linked `entity_id`
- If not authenticated → redirect to `/login`
- If wrong role or no entity → show "Access Denied" page

**Entity ID Derivation:**
- The backend derives `entity_id` from the authenticated user's JWT claims
- Frontend does not send `entity_id` — it is implicit from the auth token

---

## 15. Implementation Checklist

### 15.1 Page & Navigation
- [ ] Create API Credentials page component at `/reporting-entity/api-credentials`
- [ ] Add sidebar navigation item "API Credentials" with key icon
- [ ] Add route guard (auth + role check)
- [ ] Add breadcrumb: "Reporting Entity Workspace > API Credentials"

### 15.2 Credentials Table
- [ ] Implement credentials table with columns: Key, Status, Created, Expires, Last Used
- [ ] Implement masked key display (`••••••••••••`)
- [ ] Implement "Show" button → re-authentication → reveal key flow
- [ ] Implement "Hide" button to re-mask the key (client-side)
- [ ] Implement "Copy" button with clipboard API and "Copied!" toast
- [ ] Implement status badges with color coding
- [ ] Implement date formatting
- [ ] Implement sort: active first, then by `created_at` descending
- [ ] Implement muted styling for revoked/expired credentials

### 15.3 Empty State
- [ ] Implement empty state (no credentials issued) with key icon and message

### 15.4 Regenerate Key
- [ ] Implement "Regenerate Key" button with disabled logic
- [ ] Implement confirmation dialog (title, message, warning, cancel/regenerate buttons)
- [ ] On confirm: trigger re-auth → call regenerate endpoint → refresh table → success toast

### 15.5 Re-Authentication Modal
- [ ] Implement re-auth modal (shared between reveal and regenerate)
- [ ] Auto-focus password field
- [ ] Escape to close
- [ ] Loading state on confirm button
- [ ] Inline error for incorrect password

### 15.6 Loading & Error States
- [ ] Skeleton loader for initial page load
- [ ] Spinner on Show button during reveal
- [ ] Spinner on Regenerate button during regeneration
- [ ] Error banner for fetch failure with Retry button
- [ ] Error toasts for reveal/regenerate failures

### 15.7 API Integration
- [ ] Integrate with `GET /api/v1/reporting-entity/credentials`
- [ ] Integrate with `POST /api/v1/reporting-entity/credentials/reveal`
- [ ] Integrate with `POST /api/v1/reporting-entity/credentials/regenerate`
- [ ] Add CSRF token to all POST requests
- [ ] Handle 401 → redirect to login
- [ ] Handle 403 → Access Denied page

### 15.8 Accessibility
- [ ] Add ARIA labels for Show/Hide/Copy buttons
- [ ] Add proper `<th>` headers with `scope="col"` on table
- [ ] Add `role="dialog"` and `aria-labelledby`/`aria-describedby` on modals
- [ ] Add focus management (auto-focus, focus trap in modals)
- [ ] Add `aria-live` region for toast notifications
- [ ] Screen-reader-friendly status badges
- [ ] Test with screen reader (NVDA, JAWS, VoiceOver)

### 15.9 Responsive Design
- [ ] Desktop: full table layout
- [ ] Tablet: collapsed sidebar, reduced columns
- [ ] Mobile: card layout, hamburger menu, full-width buttons

### 15.10 Security
- [ ] Ensure plaintext keys are stored only in component state (never localStorage/sessionStorage)
- [ ] Ensure re-auth is required on every reveal and regenerate
- [ ] Ensure CSRF token is included in all POST requests
- [ ] Test that keys are cleared on page navigation (component unmount)

---

## 16. Testing Requirements

### 16.1 Functional Testing
- [ ] Credentials list renders correctly with masked keys
- [ ] Empty state displays when no credentials exist
- [ ] "Show" button triggers re-auth modal → reveals plaintext key on success
- [ ] "Hide" button re-masks the key
- [ ] "Copy" button copies plaintext key to clipboard (disabled while masked)
- [ ] "Copied!" toast displays after copy
- [ ] Regenerate flow: confirmation → re-auth → success toast → table refresh
- [ ] Revoked credentials displayed in muted styling
- [ ] Active credentials sorted first

### 16.2 Error Handling Testing
- [ ] Fetch error → error banner with Retry button
- [ ] Reveal endpoint error → error toast
- [ ] Regeneration endpoint error → error toast
- [ ] Re-auth failure → inline error in modal, allow retry
- [ ] 401 → redirect to login
- [ ] 403 → Access Denied page
- [ ] 404 on reveal → error toast "Credential not found"

### 16.3 Security Testing
- [ ] Plaintext keys not in localStorage/sessionStorage (inspect storage)
- [ ] Keys cleared from component state on navigation away
- [ ] Re-auth required for every reveal (not cached)
- [ ] Re-auth required for every regenerate (not cached)
- [ ] CSRF token included on all POST requests

### 16.4 Accessibility Testing
- [ ] Screen reader: table headers announced correctly
- [ ] Screen reader: status badges read correctly (not color-only)
- [ ] Keyboard navigation through table rows and buttons
- [ ] Focus trapped in modals
- [ ] Escape closes modals
- [ ] Toast notifications announced via `role="status"`

### 16.5 Browser Testing
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

### 16.6 Responsive Testing
- Desktop (1366×768 minimum)
- Tablet (768–1024px)
- Mobile (320–767px)

---

## 17. Dependencies & Prerequisites

### 17.1 Backend Endpoints (Feature 3)
- `GET /api/v1/reporting-entity/credentials` — must be implemented
- `POST /api/v1/reporting-entity/credentials/reveal` — must be implemented
- `POST /api/v1/reporting-entity/credentials/regenerate` — must be implemented

### 17.2 Feature 1 Dependencies
- JWT authentication and token management
- Re-authentication flow (password re-entry modal / elevated session)
- Route guards with role-based access control

### 17.3 Feature 0 Dependencies
- Global TopNav component
- Sidebar navigation component (Reporting Entity Workspace variant)
- Breadcrumb component
- Design system tokens (colors, typography, spacing)
- Toast notification system
- Modal/dialog component
- Skeleton loader component

---

## 18. Traceability

| FDD Section | Backend FDD Reference | FRD Requirement |
|-------------|----------------------|-----------------|
| Credentials Table | Endpoint 4: GET /reporting-entity/credentials | FR-API.2 |
| Reveal Key Flow | Endpoint 6: POST /reporting-entity/credentials/reveal | FR-API.2 |
| Regenerate Key Flow | Endpoint 5: POST /reporting-entity/credentials/regenerate | FR-API.2 |
| Re-Auth Requirement | Feature 1 re-auth flow | FR-AUTH (sensitive actions) |
| Sidebar Navigation | Feature 0 Workspace Navigation Map §2.1 | — |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | February 2026 | Senior Product Designer | Initial FE FDD created — extracted from Feature 1 FE addendum (Section 12) and Feature 3 Backend FDD (v1.2) entity-facing endpoints |

---

**Document End**
