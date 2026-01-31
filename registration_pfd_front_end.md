Reviewing the PDD files for registration specifications, then drafting the registration PFD.


[4 tools called]


Checking for user creation specifications:


[2 tools called]


Registration PFD document:

```markdown:pfd/registration_pfd.md
# Registration - Frontend Implementation Specification

## Document Purpose

This document provides complete specifications for the frontend engineer to implement the registration UI components for reporting entities and user accounts. It consolidates all requirements from the Product Design Documents (PDD) and includes missing specifications identified during architecture review.

---

## 1. UI Specifications

### 1.1 Reporting Entity Registration Page

**Route:** `/admin/entities/register`  
**Access:** Tech Admin, OIC (oversight only)  
**Location:** Within authenticated Administration workspace (shows global navigation)

**Visual Layout:**
```
┌──────────────────────────────────────────────────────────────┐
│ [TopNav with Logo, Search, Notifications, User Avatar]       │
├──────────────┬────────────────────────────────────────────────┤
│              │ [Breadcrumb: Administration > Reporting       │
│   Sidebar    │  Entity Management > Register New Entity]      │
│              ├────────────────────────────────────────────────┤
│              │ Register New Reporting Entity                 │
│              ├────────────────────────────────────────────────┤
│              │ Entity Information:                            │
│              │   Entity Name:        [________________]      │
│              │   Entity Type:        [Bank ▼]                │
│              │   Registration Number: [________________]      │
│              │   Contact Email:      [________________]      │
│              │   Contact Phone:      [________________]      │
│              │                                                │
│              │ Primary Contact:                               │
│              │   Full Name:          [________________]      │
│              │   Email:              [________________]      │
│              │   Phone:              [________________]      │
│              │                                                │
│              │ Initial User Account:                          │
│              │   Username:           [________________]      │
│              │   Email:              [________________]      │
│              │   Password:           [________________]      │
│              │   Confirm Password:   [________________]      │
│              │                                                │
│              │   Role: Reporting Entity User (auto-assigned)  │
│              │                                                │
│              │ [Cancel]  [Register Entity & Create User]     │
└──────────────┴────────────────────────────────────────────────┘
```

**Form Sections:**

#### Section 1: Entity Information
- **Entity Name:**
  - Required field
  - Text input
  - Max length: 255 characters
  - Validation: Non-empty, no special characters except hyphens/spaces
  - Placeholder: "e.g., Bank of Monrovia"
  
- **Entity Type:**
  - Required field
  - Dropdown/Select component
  - Options:
    - Bank
    - Microfinance Institution (MFI)
    - FinTech
    - Money Service Business (MSB)
    - Other (with text input for specification)
  - Default: First option (Bank)
  
- **Registration Number:**
  - Required field
  - Text input
  - Format validation: Alphanumeric, may include hyphens
  - Unique validation: Check against existing entities (server-side)
  - Placeholder: "e.g., REG-2024-001"
  
- **Contact Email:**
  - Required field
  - Email input
  - Email format validation (client-side)
  - Unique validation: Check against existing entity emails (server-side)
  - Placeholder: "entity@example.com"
  
- **Contact Phone:**
  - Required field
  - Text input
  - Phone format validation (client-side, flexible format)
  - Placeholder: "+231 XX XXX XXXX"

#### Section 2: Primary Contact
- **Full Name:**
  - Required field
  - Text input
  - Max length: 100 characters
  - Validation: Non-empty, alphabetic characters and spaces only
  - Placeholder: "John Doe"
  
- **Email:**
  - Required field
  - Email input
  - Email format validation (client-side)
  - Can be same as entity contact email
  - Placeholder: "contact@example.com"
  
- **Phone:**
  - Required field
  - Text input
  - Phone format validation (client-side)
  - Placeholder: "+231 XX XXX XXXX"

#### Section 3: Initial User Account
- **Username:**
  - Required field
  - Text input
  - Min length: 3 characters
  - Max length: 50 characters
  - Validation: Alphanumeric, underscores, hyphens only
  - Unique validation: Check against existing usernames (server-side)
  - Real-time availability check (debounced, 500ms)
  - Placeholder: "johndoe"
  - Show indicator: ✓ Available / ✗ Taken (after validation)
  
- **Email:**
  - Required field
  - Email input
  - Email format validation (client-side)
  - Unique validation: Check against existing user emails (server-side)
  - Can be same as primary contact email
  - Placeholder: "user@example.com"
  
- **Password:**
  - Required field
  - Masked input (show/hide toggle button)
  - Real-time validation (see Section 3.1)
  - Password strength indicator (optional but recommended)
  - Minimum requirements displayed below field
  
- **Confirm Password:**
  - Required field
  - Masked input (show/hide toggle button)
  - Real-time validation: Must match Password field
  - Show error if passwords don't match
  
- **Role Display:**
  - Read-only text field
  - Value: "Reporting Entity User"
  - Auto-assigned, cannot be changed
  - Styled as disabled/info field

**Buttons:**
- **Cancel Button:**
  - Secondary action button
  - Navigates back to `/admin/entities/all`
  - Shows confirmation dialog if form has unsaved changes
  - Confirmation: "You have unsaved changes. Are you sure you want to leave?"
  
- **Register Entity & Create User Button:**
  - Primary action button
  - Disabled when:
    - Form is invalid
    - Any required field is empty
    - Passwords don't match
    - Password requirements not met
    - Username/email not available (if checked)
    - During submission
  - Loading state: Show spinner + "Registering..." during API call

**Error Messages:**
- Entity name required: "Entity name is required"
- Entity type required: "Please select an entity type"
- Registration number required: "Registration number is required"
- Registration number exists: "This registration number is already in use. Please use a different number."
- Contact email invalid: "Please enter a valid email address"
- Contact email exists: "This email is already registered to another entity"
- Phone invalid: "Please enter a valid phone number"
- Username required: "Username is required"
- Username invalid format: "Username must be 3-50 characters and contain only letters, numbers, underscores, or hyphens"
- Username taken: "This username is already taken. Please choose another."
- Email invalid: "Please enter a valid email address"
- Email taken: "This email is already registered to another user"
- Password weak: "Password does not meet requirements. Please check the requirements above."
- Password mismatch: "Passwords do not match."
- Network error: "Connection error. Please check your internet connection and try again."
- Server error: "An unexpected error occurred. Please try again later."

**Success Behavior:**
- On successful registration:
  - Show success toast notification: "Entity '{entityName}' and user account '{username}' created successfully!"
  - Show confirmation dialog with details:
    - Entity ID
    - Entity Name
    - Username
    - Temporary password (if generated by system)
    - Note: "User must change password on first login"
  - Options:
    - "[Copy Credentials]" - Copies username and password to clipboard
    - "[Send Welcome Email]" - Triggers welcome email (if configured)
    - "[View Entity]" - Navigates to `/admin/entities/{entityId}`
    - "[Register Another]" - Resets form for another registration
    - "[Done]" - Navigates to `/admin/entities/all`

**Loading States:**
- During submission:
  - Disable all form fields
  - Disable Register button
  - Show spinner on button
  - Change button text to "Registering..."
  - Prevent form resubmission
  - Show progress indicator: "Creating entity... Creating user account..."

**Form Validation:**
- Real-time validation on blur (when field loses focus)
- Final validation on submit
- Show inline errors below each field
- Disable submit button until all validations pass

---

### 1.2 User Creation Page (FIA Staff)

**Route:** `/admin/users/create`  
**Access:** Tech Admin only  
**Location:** Within authenticated Administration workspace (shows global navigation)

**Visual Layout:**
```
┌──────────────────────────────────────────────────────────────┐
│ [TopNav with Logo, Search, Notifications, User Avatar]       │
├──────────────┬────────────────────────────────────────────────┤
│              │ [Breadcrumb: Administration > User Management  │
│   Sidebar    │  > Create User]                               │
│              ├────────────────────────────────────────────────┤
│              │ Create New User                                │
│              ├────────────────────────────────────────────────┤
│              │ User Information:                               │
│              │   Full Name:          [________________]      │
│              │   Username:           [________________]      │
│              │   Email:              [________________]      │
│              │   Phone:              [________________]      │
│              │                                                │
│              │ Account Details:                                │
│              │   Role:              [Compliance Officer ▼]    │
│              │   Entity:           [None ▼] (if Reporting     │
│              │                      Entity User selected)      │
│              │                                                │
│              │ Password:                                      │
│              │   Password:           [________________]      │
│              │   Confirm Password:   [________________]      │
│              │                                                │
│              │   ☐ Require password change on first login     │
│              │                                                │
│              │ [Cancel]  [Create User]                        │
└──────────────┴────────────────────────────────────────────────┘
```

**Form Sections:**

#### Section 1: User Information
- **Full Name:**
  - Required field
  - Text input
  - Max length: 100 characters
  - Validation: Non-empty, alphabetic characters and spaces only
  - Placeholder: "John Doe"
  
- **Username:**
  - Required field
  - Text input
  - Min length: 3 characters
  - Max length: 50 characters
  - Validation: Alphanumeric, underscores, hyphens only
  - Unique validation: Check against existing usernames (server-side)
  - Real-time availability check (debounced, 500ms)
  - Placeholder: "johndoe"
  - Show indicator: ✓ Available / ✗ Taken
  
- **Email:**
  - Required field
  - Email input
  - Email format validation (client-side)
  - Unique validation: Check against existing user emails (server-side)
  - Placeholder: "user@fia.gov.lr"
  
- **Phone:**
  - Optional field
  - Text input
  - Phone format validation (client-side)
  - Placeholder: "+231 XX XXX XXXX"

#### Section 2: Account Details
- **Role:**
  - Required field
  - Dropdown/Select component
  - Options:
    - Reporting Entity User
    - Compliance Officer
    - Head of Compliance
    - Analyst
    - Head of Analysis
    - Director of Operations
    - OIC
    - Tech Admin
  - Default: First option (Compliance Officer)
  - Note: Tech Admin role should require additional confirmation
  
- **Entity (Conditional):**
  - Required only if Role = "Reporting Entity User"
  - Dropdown/Select component
  - Options: List of all active reporting entities
  - Searchable/filterable dropdown
  - Placeholder: "Select reporting entity"
  - Hidden when other roles selected

#### Section 3: Password
- **Password:**
  - Required field
  - Masked input (show/hide toggle button)
  - Real-time validation (see Section 3.1)
  - Password strength indicator (optional but recommended)
  
- **Confirm Password:**
  - Required field
  - Masked input (show/hide toggle button)
  - Real-time validation: Must match Password field
  
- **Require Password Change on First Login:**
  - Checkbox
  - Default: Checked
  - When checked: User must change password on first login
  - When unchecked: User can use password as-is (not recommended for security)

**Buttons:**
- **Cancel Button:**
  - Secondary action button
  - Navigates back to `/admin/users/all`
  - Shows confirmation dialog if form has unsaved changes
  
- **Create User Button:**
  - Primary action button
  - Disabled when:
    - Form is invalid
    - Any required field is empty
    - Passwords don't match
    - Password requirements not met
    - Username/email not available
    - Entity not selected (if Reporting Entity User)
    - During submission
  - Loading state: Show spinner + "Creating user..." during API call

**Error Messages:**
- Full name required: "Full name is required"
- Username required: "Username is required"
- Username invalid format: "Username must be 3-50 characters and contain only letters, numbers, underscores, or hyphens"
- Username taken: "This username is already taken. Please choose another."
- Email required: "Email is required"
- Email invalid: "Please enter a valid email address"
- Email taken: "This email is already registered to another user"
- Role required: "Please select a role"
- Entity required: "Please select a reporting entity" (if Reporting Entity User)
- Password weak: "Password does not meet requirements. Please check the requirements above."
- Password mismatch: "Passwords do not match."
- Network error: "Connection error. Please check your internet connection and try again."
- Server error: "An unexpected error occurred. Please try again later."

**Success Behavior:**
- On successful user creation:
  - Show success toast notification: "User '{username}' created successfully!"
  - Show confirmation dialog with details:
    - User ID
    - Full Name
    - Username
    - Email
    - Role
    - Entity (if applicable)
    - Password (if generated by system)
    - Password change requirement status
  - Options:
    - "[Copy Credentials]" - Copies username and password to clipboard
    - "[Send Welcome Email]" - Triggers welcome email (if configured)
    - "[View User]" - Navigates to `/admin/users/{userId}`
    - "[Create Another]" - Resets form for another user
    - "[Done]" - Navigates to `/admin/users/all`

**Loading States:**
- During submission:
  - Disable all form fields
  - Disable Create User button
  - Show spinner on button
  - Change button text to "Creating user..."
  - Prevent form resubmission

---

## 2. Routing & Navigation

### 2.1 Registration Routes

**Protected Routes (Require Authentication):**
- `/admin/entities/register` - Register new reporting entity (Tech Admin/OIC)
- `/admin/users/create` - Create new user account (Tech Admin only)

**Route Protection:**
- Both routes require authentication
- Role-based access control:
  - Entity registration: Tech Admin (full access), OIC (oversight/read-only)
  - User creation: Tech Admin only
- If unauthorized user accesses route:
  - Redirect to `/login?returnUrl={currentRoute}`
  - Show error: "You do not have permission to access this page."

### 2.2 Navigation Context

**Breadcrumb Navigation:**
- Entity Registration:
  - `Administration > Reporting Entity Management > Register New Entity`
- User Creation:
  - `Administration > User Management > Create User`

**Sidebar Navigation:**
- Both pages accessible from Administration workspace sidebar
- Entity Registration: Under "Reporting Entity Management" section
- User Creation: Under "User Management" section

**Back Navigation:**
- Cancel button navigates to respective list pages:
  - Entity Registration → `/admin/entities/all`
  - User Creation → `/admin/users/all`

---

## 3. Form Validation

### 3.1 Password Validation Rules

**Client-Side Validation Pattern:**
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character from set: @$!%*?&

**Validation Timing:**
- **Real-time:** Validate as user types (after first character entered)
- **On Blur:** Re-validate when field loses focus
- **On Submit:** Final validation before API call

**Validation Feedback:**
- Show requirements checklist that updates in real-time
- Green checkmark (✓) when requirement met
- Red X (✗) when requirement not met
- Inline error message below field if validation fails
- Disable submit button until all requirements met

**Password Strength Indicator (Optional):**
- Weak: Red bar (0-40% of requirements met)
- Medium: Yellow bar (60-80% of requirements met)
- Strong: Green bar (100% of requirements met)

### 3.2 Email Validation

**Client-Side Validation:**
- Must match standard email format: `user@domain.com`
- Validate on blur (when field loses focus)
- Show error if format invalid: "Please enter a valid email address"

**Validation Pattern:**
- Standard email regex pattern
- Allow common email formats
- Reject obviously invalid formats

### 3.3 Username Validation

**Client-Side Validation:**
- Minimum 3 characters
- Maximum 50 characters
- Alphanumeric characters, underscores, and hyphens only
- No spaces or special characters
- Real-time availability check (debounced API call)

**Validation Feedback:**
- Show availability indicator after validation:
  - ✓ Available (green)
  - ✗ Taken (red)
  - ⏳ Checking... (loading state)

### 3.4 Phone Number Validation

**Client-Side Validation:**
- Flexible format acceptance
- Allow international format: +231 XX XXX XXXX
- Allow local format: XX XXX XXXX
- Validate on blur
- Show error if format invalid: "Please enter a valid phone number"

### 3.5 Entity Registration Number Validation

**Client-Side Validation:**
- Alphanumeric characters, hyphens allowed
- No spaces or special characters (except hyphens)
- Format validation on blur
- Server-side uniqueness check on submit

### 3.6 Confirm Password Validation

**Validation Rules:**
- Must match "Password" field exactly
- Case-sensitive comparison
- Validate in real-time as user types
- Show error if passwords don't match: "Passwords do not match"

---

## 4. API Contract Specifications

### 4.1 Entity Registration Endpoint

#### POST /admin/entities/register

**Request Headers:**
- `Content-Type: application/json`
- Include authentication cookie (automatically sent by browser)
- Include CSRF token in header

**Request Body:**
```json
{
  "entity": {
    "name": "string",
    "type": "string (Bank|MFI|FinTech|MSB|Other)",
    "registrationNumber": "string",
    "contactEmail": "string",
    "contactPhone": "string"
  },
  "primaryContact": {
    "fullName": "string",
    "email": "string",
    "phone": "string"
  },
  "initialUser": {
    "username": "string",
    "email": "string",
    "password": "string",
    "confirmPassword": "string"
  }
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Entity and user account created successfully",
  "data": {
    "entity": {
      "id": "string (entity ID)",
      "name": "string",
      "type": "string",
      "registrationNumber": "string",
      "contactEmail": "string",
      "contactPhone": "string",
      "createdAt": "string (ISO 8601 timestamp)"
    },
    "user": {
      "id": "string (user ID)",
      "username": "string",
      "email": "string",
      "role": "reporting_entity_user",
      "entityId": "string",
      "requiresPasswordChange": true,
      "createdAt": "string (ISO 8601 timestamp)"
    },
    "credentials": {
      "username": "string",
      "password": "string (if generated by system, otherwise null)"
    }
  }
}
```

**Error Responses:**

**400 Bad Request - Validation Error:**
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Validation failed",
  "errors": {
    "entity.name": ["Entity name is required"],
    "entity.registrationNumber": ["Registration number already exists"],
    "initialUser.username": ["Username is already taken"],
    "initialUser.password": ["Password does not meet requirements"]
  }
}
```

**400 Bad Request - Registration Number Exists:**
```json
{
  "error": "REGISTRATION_NUMBER_EXISTS",
  "message": "This registration number is already in use. Please use a different number."
}
```

**400 Bad Request - Username Exists:**
```json
{
  "error": "USERNAME_EXISTS",
  "message": "This username is already taken. Please choose another."
}
```

**400 Bad Request - Email Exists:**
```json
{
  "error": "EMAIL_EXISTS",
  "message": "This email is already registered to another user/entity."
}
```

**403 Forbidden - Insufficient Permissions:**
```json
{
  "error": "INSUFFICIENT_PERMISSIONS",
  "message": "You do not have permission to register entities."
}
```

**500 Internal Server Error:**
```json
{
  "error": "INTERNAL_SERVER_ERROR",
  "message": "An unexpected error occurred. Please try again later."
}
```

### 4.2 User Creation Endpoint

#### POST /admin/users/create

**Request Headers:**
- `Content-Type: application/json`
- Include authentication cookie
- Include CSRF token in header

**Request Body:**
```json
{
  "fullName": "string",
  "username": "string",
  "email": "string",
  "phone": "string (optional)",
  "role": "string (role name)",
  "entityId": "string (optional, required if role is reporting_entity_user)",
  "password": "string",
  "confirmPassword": "string",
  "requirePasswordChange": "boolean (default: true)"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": "string (user ID)",
      "username": "string",
      "email": "string",
      "fullName": "string",
      "role": "string",
      "entityId": "string (optional)",
      "requiresPasswordChange": "boolean",
      "createdAt": "string (ISO 8601 timestamp)"
    },
    "credentials": {
      "username": "string",
      "password": "string (if generated by system, otherwise null)"
    }
  }
}
```

**Error Responses:**

**400 Bad Request - Validation Error:**
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Validation failed",
  "errors": {
    "username": ["Username is already taken"],
    "email": ["Email is already registered"],
    "password": ["Password does not meet requirements"],
    "entityId": ["Entity is required for Reporting Entity User role"]
  }
}
```

**400 Bad Request - Username Exists:**
```json
{
  "error": "USERNAME_EXISTS",
  "message": "This username is already taken. Please choose another."
}
```

**400 Bad Request - Email Exists:**
```json
{
  "error": "EMAIL_EXISTS",
  "message": "This email is already registered to another user."
}
```

**403 Forbidden - Insufficient Permissions:**
```json
{
  "error": "INSUFFICIENT_PERMISSIONS",
  "message": "You do not have permission to create users."
}
```

**403 Forbidden - Invalid Role:**
```json
{
  "error": "INVALID_ROLE",
  "message": "You do not have permission to create users with this role."
}
```

**500 Internal Server Error:**
```json
{
  "error": "INTERNAL_SERVER_ERROR",
  "message": "An unexpected error occurred. Please try again later."
}
```

### 4.3 Username Availability Check Endpoint

#### GET /admin/users/check-username/:username

**Request Headers:**
- Include authentication cookie
- Include CSRF token in header

**Success Response (200):**
```json
{
  "available": true,
  "username": "string"
}
```

**Response if Username Taken (200):**
```json
{
  "available": false,
  "username": "string",
  "message": "This username is already taken"
}
```

**Usage:**
- Call on username field blur (debounced, 500ms)
- Show availability indicator in UI
- Do not block form submission if check fails (server will validate)

### 4.4 Entity List Endpoint (for Dropdown)

#### GET /admin/entities/all

**Request Headers:**
- Include authentication cookie
- Include CSRF token in header

**Query Parameters:**
- `status`: "active" | "inactive" | "all" (default: "active")
- `search`: string (optional, search by name or registration number)

**Success Response (200):**
```json
{
  "entities": [
    {
      "id": "string",
      "name": "string",
      "type": "string",
      "registrationNumber": "string",
      "status": "active" | "inactive"
    }
  ],
  "total": "number",
  "page": "number",
  "limit": "number"
}
```

**Usage:**
- Populate entity dropdown in user creation form
- Filter to active entities only
- Searchable/filterable dropdown

---

## 5. Security Specifications

### 5.1 Access Control

**Role-Based Access:**
- Entity Registration:
  - Tech Admin: Full access (create, edit, delete)
  - OIC: Oversight access (view only, no direct edits)
  - All other roles: No access
  
- User Creation:
  - Tech Admin: Full access
  - All other roles: No access

**Route Guards:**
- Check authentication status
- Check user role permissions
- Redirect unauthorized users with appropriate error message

### 5.2 CSRF Protection

**CSRF Token Requirements:**
- Include CSRF token in all POST requests
- Header name: `X-CSRF-Token`
- Token value: Read from cookie or response header
- Handle 403 responses by refreshing token and retrying

### 5.3 Password Security

**Password Handling:**
- Never display passwords in UI after creation (except in confirmation dialog)
- Passwords sent in request body (encrypted in transit via HTTPS)
- Passwords not stored in localStorage or sessionStorage
- Temporary passwords should be shown only once in confirmation dialog

**Password Generation (Optional):**
- If backend generates password, display in confirmation dialog
- Provide "Copy to Clipboard" functionality
- Warn user: "Save this password securely. It will not be shown again."

### 5.4 Audit Logging

**Registration Events:**
- All entity registrations logged with:
  - Admin user who created entity
  - Timestamp
  - Entity details
  - User account details
  
- All user creations logged with:
  - Admin user who created account
  - Timestamp
  - User details
  - Role assigned

**Audit Trail:**
- Frontend should not handle audit logging directly
- Backend automatically logs all registration events
- Admin can view audit logs in `/admin/logs` (if implemented)

---

## 6. Error Handling

### 6.1 Error Code Mapping

**Complete Error Code List:**

| Error Code | HTTP Status | User Message | Action Required |
|------------|-------------|--------------|-----------------|
| `VALIDATION_ERROR` | 400 | "Please check the form for errors" | Fix validation errors |
| `REGISTRATION_NUMBER_EXISTS` | 400 | "This registration number is already in use. Please use a different number." | Use different registration number |
| `USERNAME_EXISTS` | 400 | "This username is already taken. Please choose another." | Choose different username |
| `EMAIL_EXISTS` | 400 | "This email is already registered to another user/entity." | Use different email |
| `WEAK_PASSWORD` | 400 | "Password does not meet requirements. Please check the requirements above." | Fix password |
| `PASSWORD_MISMATCH` | 400 | "Passwords do not match." | Fix password match |
| `INSUFFICIENT_PERMISSIONS` | 403 | "You do not have permission to perform this action." | Contact administrator |
| `INVALID_ROLE` | 403 | "You do not have permission to create users with this role." | Select different role |
| `ENTITY_REQUIRED` | 400 | "Entity is required for Reporting Entity User role." | Select entity |
| `NETWORK_ERROR` | N/A | "Connection error. Please check your internet connection and try again." | Check connection |
| `INTERNAL_SERVER_ERROR` | 500 | "An unexpected error occurred. Please try again later." | Retry or contact support |

### 6.2 Error Display Patterns

**Inline Errors:**
- Position: Below form field
- Style: Red text, small font
- Icon: Warning icon (⚠️)
- Persist until user fixes error

**Toast Notifications:**
- Position: Top-right corner
- Duration: 5 seconds (auto-dismiss)
- Type: Error (red), Success (green)
- Dismissible: Yes (X button)

**Modal Errors:**
- For critical errors (permission denied, server errors)
- Non-dismissible until resolved
- Clear call-to-action button

**Error Recovery:**
- Validation errors: Highlight field, show message
- Network errors: Allow retry
- Server errors: Show generic message, allow retry
- Permission errors: Redirect to appropriate page

---

## 7. Loading States

### 7.1 Form Submission Loading

**Entity Registration:**
- Disable all inputs during submission
- Disable Register button
- Show spinner on button
- Change button text to "Registering..."
- Show progress indicator: "Creating entity... Creating user account..."
- Prevent form resubmission

**User Creation:**
- Disable all inputs during submission
- Disable Create User button
- Show spinner on button
- Change button text to "Creating user..."
- Prevent form resubmission

### 7.2 Real-Time Validation Loading

**Username Availability Check:**
- Show loading indicator: "Checking availability..."
- Debounce API calls (500ms delay)
- Show result: ✓ Available / ✗ Taken
- Do not block form submission (server will validate)

**Email Validation:**
- Client-side validation (no API call needed)
- Show error immediately on blur if invalid

### 7.3 Entity List Loading

**Entity Dropdown (User Creation):**
- Show loading spinner while fetching entities
- Show "No entities found" if list is empty
- Allow search/filter while loading (client-side)

---

## 8. Accessibility Requirements

### 8.1 Form Accessibility

**ARIA Labels:**
- All form inputs must have `aria-label` or associated `<label>` elements
- Error messages must have `aria-live="polite"` or `aria-live="assertive"`
- Required fields must have `aria-required="true"`
- Field groups must have `aria-labelledby` pointing to section header

**Error Announcements:**
- Screen readers must announce errors when they occur
- Use `aria-describedby` to associate error messages with inputs
- Error messages must be announced immediately (use `aria-live="assertive"` for critical errors)

**Focus Management:**
- Auto-focus first input on page load
- After error: Focus first field with error
- After successful submission: Focus appropriate element (e.g., success message or "View Entity" button)

**Keyboard Navigation:**
- Tab order: Logical flow through form fields
- Enter key: Submit form (when valid)
- Escape key: Cancel/close dialogs

### 8.2 Modal/Dialog Accessibility

**Confirmation Dialogs:**
- Modal must have `role="dialog"`
- Modal must have `aria-labelledby` pointing to title
- Modal must have `aria-describedby` pointing to description
- Background overlay must have `aria-hidden="true"`
- Focus trap within modal
- Return focus to trigger element when modal closes

### 8.3 Color Contrast

**Text Contrast:**
- Text on background: Minimum 4.5:1 ratio (WCAG AA)
- Large text (≥18pt): Minimum 3:1 ratio
- Interactive elements: Minimum 3:1 ratio

**Error Messages:**
- Must not rely on color alone
- Include icons and text labels
- Ensure sufficient contrast for error text

### 8.4 Touch Target Sizes

**Minimum Sizes:**
- Buttons: 44px × 44px minimum
- Input fields: 44px height minimum
- Checkboxes: 44px × 44px minimum
- Dropdowns: 44px height minimum

**Mobile Optimization:**
- All interactive elements must meet minimum touch target size
- Adequate spacing between interactive elements (minimum 8px)

---

## 9. Post-Registration Workflow

### 9.1 Entity Registration Post-Flow

**After Successful Registration:**
1. Show success confirmation dialog with credentials
2. Options available:
   - Copy credentials to clipboard
   - Send welcome email (if configured)
   - View entity details
   - Register another entity
   - Return to entity list
3. New user receives welcome email (if configured) with:
   - Login URL
   - Username
   - Temporary password
   - Instructions to change password on first login
4. User must change password on first login (if `requiresPasswordChange` is true)

### 9.2 User Creation Post-Flow

**After Successful User Creation:**
1. Show success confirmation dialog with credentials
2. Options available:
   - Copy credentials to clipboard
   - Send welcome email (if configured)
   - View user profile
   - Create another user
   - Return to user list
3. New user receives welcome email (if configured) with:
   - Login URL
   - Username
   - Password (if not requiring change)
   - Instructions (if password change required)

### 9.3 Welcome Email Integration

**Email Trigger:**
- Optional "Send Welcome Email" button in confirmation dialog
- Calls API endpoint: `POST /admin/users/:userId/send-welcome-email`
- Shows loading state during email send
- Shows success/error toast notification

**Email Content (Handled by Backend):**
- Login URL
- Username
- Password (if applicable)
- Instructions for first login
- Support contact information

---

## 10. Implementation Checklist

### 10.1 Entity Registration Page
- [ ] Implement entity registration form with all sections
- [ ] Add entity type dropdown
- [ ] Implement registration number uniqueness check
- [ ] Add primary contact section
- [ ] Add initial user account section
- [ ] Implement username availability check (real-time)
- [ ] Add password validation with requirements checklist
- [ ] Implement form validation (client-side)
- [ ] Add loading states
- [ ] Implement error handling
- [ ] Add success confirmation dialog
- [ ] Implement credential copying functionality
- [ ] Add welcome email trigger (if configured)
- [ ] Add accessibility features (ARIA labels, keyboard navigation)
- [ ] Test with screen reader

### 10.2 User Creation Page
- [ ] Implement user creation form
- [ ] Add role dropdown
- [ ] Implement conditional entity dropdown (for Reporting Entity User)
- [ ] Add password validation
- [ ] Implement "Require password change" checkbox
- [ ] Add username availability check (real-time)
- [ ] Implement form validation (client-side)
- [ ] Add loading states
- [ ] Implement error handling
- [ ] Add success confirmation dialog
- [ ] Implement credential copying functionality
- [ ] Add welcome email trigger (if configured)
- [ ] Add accessibility features
- [ ] Test with screen reader

### 10.3 API Integration
- [ ] Implement entity registration endpoint integration
- [ ] Implement user creation endpoint integration
- [ ] Implement username availability check endpoint
- [ ] Implement entity list endpoint (for dropdown)
- [ ] Add CSRF token handling
- [ ] Configure CORS with credentials
- [ ] Implement error handling for all error codes
- [ ] Add network error handling

### 10.4 Security
- [ ] Implement role-based access control
- [ ] Add route guards for protected routes
- [ ] Implement CSRF protection
- [ ] Ensure passwords not stored in localStorage/sessionStorage
- [ ] Add secure credential handling in confirmation dialogs

### 10.5 Accessibility
- [ ] Add ARIA labels to all form fields
- [ ] Implement error announcements for screen readers
- [ ] Ensure keyboard navigation works
- [ ] Add focus management
- [ ] Verify color contrast ratios
- [ ] Ensure touch target sizes meet requirements
- [ ] Test with screen reader

---

## 11. Testing Requirements

### 11.1 Functional Testing
- Test entity registration with valid data
- Test entity registration with duplicate registration number
- Test entity registration with duplicate username/email
- Test user creation with all role types
- Test conditional entity dropdown (Reporting Entity User)
- Test password validation
- Test username availability check
- Test form validation (all fields)
- Test error handling for all error codes
- Test success workflows (confirmation dialogs, navigation)

### 11.2 Security Testing
- Verify role-based access control
- Test CSRF protection
- Verify passwords not stored in client storage
- Test unauthorized access attempts
- Test permission boundaries

### 11.3 Accessibility Testing
- Test with screen reader (NVDA, JAWS, VoiceOver)
- Test keyboard navigation
- Test color contrast
- Test touch target sizes
- Test error announcements

### 11.4 Browser Testing
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

### 11.5 Responsive Testing
- Desktop (1366x768 minimum)
- Tablet (768-1024px)
- Mobile (320-767px)

---

## 12. Dependencies & Prerequisites

### 12.1 Backend Requirements
- Entity registration endpoint must be implemented and tested
- User creation endpoint must be implemented and tested
- Username availability check endpoint must be implemented
- Entity list endpoint must be implemented
- CSRF token mechanism must be in place
- CORS must be configured correctly
- Role-based access control must be implemented
- Password validation must match frontend rules

### 12.2 Frontend Requirements
- React/Next.js or equivalent framework
- HTTP client library (axios, fetch) with cookie support
- Form validation library (optional but recommended)
- Toast notification library
- Modal/dialog component library
- Dropdown/select component library
- Accessibility library (optional but recommended)

### 12.3 Design System
- UI component library (buttons, inputs, modals, dropdowns)
- Design tokens (colors, spacing, typography)
- Icon library
- Loading spinner component

---

## Document Version

**Version:** 1.0  
**Last Updated:** 2026-01-15  
**Author:** Caleb Massalay  
**Status:** Ready for Implementation

---

## Notes

- This document consolidates requirements from PDD Section 6.2 (Registration/Onboarding) and includes missing specifications identified during architecture review.
- All API contracts are based on backend endpoint specifications. Frontend engineer should confirm exact endpoint URLs and response formats with backend team before implementation.
- Security specifications (CSRF, CORS, role-based access) are based on secure implementation patterns. Any changes to authentication mechanism should be reflected in this document.
- Accessibility requirements must be met to ensure WCAG AA compliance.
- Registration is admin-initiated only. There is no self-service registration flow for end users.
```