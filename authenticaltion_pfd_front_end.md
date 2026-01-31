# Authentication & Registration - Frontend Implementation Specification

## Document Purpose

This document provides complete specifications for the frontend engineer to implement the authentication and registration UI components. It consolidates all requirements from the Product Design Documents (PDD) and includes missing specifications identified during architecture review.

---

## 1. UI Specifications

### 1.1 Login Page

**Route:** `/login`  
**Access:** Public (not behind authentication)

**Visual Layout:**
```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│              [Logo] FIA SupTech365                           │
│                                                              │
│              Welcome Back                                    │
│              Sign in to your account                        │
│                                                              │
│              Username/Email: [________________]             │
│                                                              │
│              Password:        [________________]            │
│                                                              │
│              ☐ Remember me                                   │
│              [Forgot Password?]                             │
│                                                              │
│              [Sign In]                                       │
│                                                              │
│              ─────────────────────────────────              │
│                                                              │
│              Need help? Contact: support@fia.gov.lr         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Form Fields:**
- **Username/Email Input:**
  - Accepts either username or email address
  - Required field
  - Auto-focus on page load
  - Email format validation (if email pattern detected)
  
- **Password Input:**
  - Required field
  - Masked input (show/hide toggle button recommended)
  - Minimum length: 1 character (validation happens server-side)
  
- **Remember Me Checkbox:**
  - Optional checkbox
  - Label: "Remember me"
  - When checked: Extends session to 7 days (or configurable duration)
  - When unchecked: Standard 30-minute session timeout
  - Default: Unchecked

**Buttons:**
- **Sign In Button:**
  - Primary action button
  - Disabled state: When form is invalid or during submission
  - Loading state: Show spinner + "Signing in..." text during API call
  - Full width on mobile, auto-width on desktop

- **Forgot Password Link:**
  - Text link below password field
  - Navigates to `/forgot-password`
  - Styled as secondary link

**Error Message Display:**
- Position: Below form fields, above Sign In button
- Background: Light red/pink background
- Text color: Dark red
- Icon: Warning icon (⚠️) before error message
- Auto-dismiss: No (user must acknowledge)
- Dismissible: Yes (X button in top-right corner)

**Error Messages:**
- Invalid credentials: "Invalid username or password. Please try again."
- Account locked: "Account locked due to multiple failed login attempts. Please try again in {X} minutes." (with countdown timer)
- Account disabled: "Your account has been disabled. Please contact support at support@fia.gov.lr"
- Session expired: "Your session has expired. Please log in again."
- Network error: "Connection error. Please check your internet connection and try again."
- Rate limit exceeded: "Too many login attempts. Please try again in {X} seconds."

**Loading States:**
- During login submission:
  - Disable all form fields
  - Disable Sign In button
  - Show spinner on Sign In button
  - Change button text to "Signing in..."
  - Prevent form resubmission

**Success Behavior:**
- On successful login:
  - Show success toast notification: "Welcome back, {username}!"
  - Check if `requiresPasswordChange` flag is true in response
  - If true: Show password change modal (see Section 1.4)
  - If false: Redirect to role-based landing page (see Section 2.1)

---

### 1.2 Forgot Password Page

**Route:** `/forgot-password`  
**Access:** Public

**Visual Layout:**
```
┌──────────────────────────────────────────────────────────────┐
│ Reset Password                                               │
├──────────────────────────────────────────────────────────────┤
│ Enter your email address and we'll send you a link to        │
│ reset your password.                                         │
│                                                              │
│ Email: [________________________________]                    │
│                                                              │
│ [Send Reset Link]                                           │
│                                                              │
│ [← Back to Login]                                            │
└──────────────────────────────────────────────────────────────┘
```

**Form Fields:**
- **Email Input:**
  - Required field
  - Email format validation (client-side)
  - Auto-focus on page load
  - Placeholder: "Enter your email address"

**Buttons:**
- **Send Reset Link Button:**
  - Primary action button
  - Disabled when email is invalid or empty
  - Loading state: Show spinner + "Sending..." during API call
  - After successful submission: Change to "Link Sent!" (disabled state)

- **Back to Login Link:**
  - Text link below form
  - Navigates to `/login`
  - Styled as secondary link

**Success State:**
- After successful submission:
  - Show success message: "If an account with that email exists, a password reset link has been sent. Please check your email."
  - Hide email input field
  - Hide Send Reset Link button
  - Show "Resend Email" link (rate-limited, see API spec)
  - Show countdown: "Resend available in {X} seconds"

**Error Messages:**
- Invalid email format: "Please enter a valid email address"
- Network error: "Connection error. Please try again."
- Rate limit exceeded: "Too many requests. Please try again in {X} seconds."

**Loading States:**
- During submission:
  - Disable email input
  - Disable Send Reset Link button
  - Show spinner on button
  - Change button text to "Sending..."

---

### 1.3 Reset Password Page

**Route:** `/reset-password/:token`  
**Access:** Public  
**URL Parameter:** `token` (password reset token from email link)

**Visual Layout:**
```
┌──────────────────────────────────────────────────────────────┐
│ Set New Password                                             │
├──────────────────────────────────────────────────────────────┤
│ New Password:     [________________]                        │
│                   (Min 8 chars, mixed case, numbers,       │
│                    special characters)                       │
│                                                              │
│ Confirm Password: [________________]                        │
│                                                              │
│ Password Requirements:                                       │
│ ✓ Minimum 8 characters                                     │
│ ✓ Uppercase and lowercase letters                           │
│ ✓ At least one number                                       │
│ ✓ At least one special character                            │
│                                                              │
│ [Reset Password]                                             │
│                                                              │
│ Token expires in: 15:23                                     │
│                                                              │
│ [← Back to Login]                                            │
└──────────────────────────────────────────────────────────────┘
```

**Form Fields:**
- **New Password Input:**
  - Required field
  - Masked input (show/hide toggle button)
  - Real-time validation (see Section 3.1)
  - Password strength indicator (optional but recommended)
  
- **Confirm Password Input:**
  - Required field
  - Masked input (show/hide toggle button)
  - Real-time validation: Must match New Password
  - Show error if passwords don't match

**Password Requirements Display:**
- Show checklist of requirements
- Update in real-time as user types:
  - ✓ (green checkmark) when requirement met
  - ✗ (red X) when requirement not met
- Requirements:
  - Minimum 8 characters
  - At least one uppercase letter (A-Z)
  - At least one lowercase letter (a-z)
  - At least one number (0-9)
  - At least one special character (@$!%*?&)

**Token Expiration Display:**
- Show countdown timer: "Token expires in: MM:SS"
- Update every second
- When timer reaches 00:00:
  - Show error: "Reset token has expired. Please request a new password reset."
  - Disable form fields
  - Show "Request New Reset Link" button (links to `/forgot-password`)

**Buttons:**
- **Reset Password Button:**
  - Primary action button
  - Disabled when:
    - Form is invalid
    - Passwords don't match
    - Password requirements not met
    - Token expired
    - During submission
  - Loading state: Show spinner + "Resetting password..." during API call

- **Back to Login Link:**
  - Text link below form
  - Navigates to `/login`
  - Styled as secondary link

**Error Messages:**
- Invalid token: "Invalid or expired reset token. Please request a new password reset link."
- Expired token: "Reset token has expired. Please request a new password reset."
- Weak password: "Password does not meet requirements. Please check the requirements above."
- Password mismatch: "Passwords do not match."
- Network error: "Connection error. Please try again."

**Success Behavior:**
- On successful password reset:
  - Show success message: "Password reset successfully!"
  - After 2 seconds: Redirect to `/login`
  - Show toast on login page: "Password reset successful. Please log in with your new password."

**Loading States:**
- During submission:
  - Disable all form fields
  - Disable Reset Password button
  - Show spinner on button
  - Change button text to "Resetting password..."

---

### 1.4 First-Time Login Password Change Modal

**Trigger:** After successful login when `requiresPasswordChange` is `true` in login response

**Visual Layout:**
```
┌──────────────────────────────────────────────────────────────┐
│ 🔐 Change Your Password                                      │
├──────────────────────────────────────────────────────────────┤
│ For security reasons, you must change your password         │
│ before accessing the system.                                 │
│                                                              │
│ Current Password: [________________]                         │
│                                                              │
│ New Password:     [________________]                        │
│                   (Min 8 chars, mixed case, numbers,        │
│                    special characters)                       │
│                                                              │
│ Confirm Password: [________________]                         │
│                                                              │
│ Password Requirements:                                       │
│ ✓ Minimum 8 characters                                     │
│ ✓ Uppercase and lowercase letters                           │
│ ✓ At least one number                                       │
│ ✓ At least one special character                            │
│                                                              │
│ [Change Password]                                            │
│                                                              │
│ Note: You cannot access the system until you change         │
│ your password.                                               │
└──────────────────────────────────────────────────────────────┘
```

**Modal Behavior:**
- **Non-dismissible:** No close button (X), cannot click outside to close, cannot press Escape
- **Blocking:** User cannot navigate away or access any other part of the application
- **Full-screen overlay:** Dark overlay behind modal (opacity 0.8)
- **Centered:** Modal centered both horizontally and vertically

**Form Fields:**
- **Current Password Input:**
  - Required field
  - Masked input (show/hide toggle button)
  - Auto-focus on modal open
  
- **New Password Input:**
  - Required field
  - Masked input (show/hide toggle button)
  - Real-time validation (see Section 3.1)
  - Password strength indicator (optional but recommended)
  
- **Confirm Password Input:**
  - Required field
  - Masked input (show/hide toggle button)
  - Real-time validation: Must match New Password

**Password Requirements Display:**
- Same as Reset Password Page (Section 1.3)
- Show checklist that updates in real-time

**Buttons:**
- **Change Password Button:**
  - Primary action button
  - Disabled when:
    - Form is invalid
    - Passwords don't match
    - Password requirements not met
    - During submission
  - Loading state: Show spinner + "Changing password..." during API call

**Error Messages:**
- Invalid current password: "Current password is incorrect. Please try again."
- Weak password: "Password does not meet requirements. Please check the requirements above."
- Password mismatch: "Passwords do not match."
- Password reuse: "You cannot reuse your last 5 passwords. Please choose a different password."
- Network error: "Connection error. Please try again."

**Success Behavior:**
- On successful password change:
  - Show success message: "Password changed successfully!"
  - After 2 seconds:
    - Close password change modal
    - Show welcome modal/tour option (if first-time user)
    - Redirect to role-based landing page (see Section 2.1)

**Loading States:**
- During submission:
  - Disable all form fields
  - Disable Change Password button
  - Show spinner on button
  - Change button text to "Changing password..."

---

### 1.5 Session Timeout Warning Modal

**Trigger:** After 25 minutes of user inactivity (5 minutes before 30-minute session expiration)

**Visual Layout:**
```
┌──────────────────────────────────────────────────────────────┐
│ ⏱️ Session Expiring Soon                                    │
├──────────────────────────────────────────────────────────────┤
│ Your session will expire in 5 minutes due to inactivity.     │
│                                                              │
│ Any unsaved changes will be lost.                           │
│                                                              │
│ [Stay Logged In]  [Save & Logout]                           │
└──────────────────────────────────────────────────────────────┘
```

**Modal Behavior:**
- **Dismissible:** Can be closed by clicking outside or pressing Escape
- **Auto-dismiss:** No (user must take action)
- **Countdown Timer:** Shows remaining time in MM:SS format, updates every second
- **Position:** Centered on screen

**Buttons:**
- **Stay Logged In Button:**
  - Primary action button
  - Action: Extends session by 30 minutes
  - Closes modal on click
  - Shows loading state during API call: "Extending session..."

- **Save & Logout Button:**
  - Secondary action button
  - Action:
    1. Auto-save any unsaved form data to localStorage
    2. Logout user
    3. Redirect to `/login`
    4. Show toast: "Your session has been saved. Please log in to continue."

**Auto-Save Behavior:**
- Before session expires (if user doesn't respond):
  - Auto-save form data to localStorage
  - Key format: `draft_{formId}_{timestamp}`
  - Show banner after re-login: "✓ Your draft has been restored" (if draft exists)

**Session Expired State:**
- If user doesn't respond and session expires:
  - Show modal: "🔒 Session Expired - Your session has expired for security reasons. Please log in again to continue."
  - Single button: "[Log In]"
  - Redirect to `/login` with return URL preserved
  - After re-login: Redirect to original page user was on

---

### 1.6 Re-Authentication Modal

**Trigger:** When user attempts sensitive actions (see Section 4.3 for trigger conditions)

**Visual Layout:**
```
┌──────────────────────────────────────────────────────────────┐
│ 🔐 Confirm Your Identity                                     │
├──────────────────────────────────────────────────────────────┤
│ This action requires re-authentication for security.          │
│                                                              │
│ Username: {username} (read-only)                             │
│ Password: [________________]                                  │
│                                                              │
│ Time remaining: 0:28                                         │
│                                                              │
│ [Cancel]  [Confirm]                                           │
└──────────────────────────────────────────────────────────────┘
```

**Modal Behavior:**
- **Non-dismissible:** No close button, cannot click outside to close
- **Timeout:** 30 seconds countdown timer
- **Auto-cancel:** If timer reaches 0:00, modal closes and action is cancelled
- **Blocking:** User cannot interact with page behind modal

**Form Fields:**
- **Username Display:**
  - Read-only text field
  - Shows current logged-in username
  - Pre-filled, cannot be edited

- **Password Input:**
  - Required field
  - Masked input (show/hide toggle button)
  - Auto-focus on modal open

**Countdown Timer:**
- Display: "Time remaining: MM:SS"
- Updates every second
- When timer reaches 0:00:
  - Close modal
  - Cancel the sensitive action
  - Show toast: "Re-authentication timed out. Please try again."

**Attempt Counter:**
- Show below password field: "Attempt {X} of 3"
- Increment on each failed attempt
- After 3 failed attempts:
  - Force logout
  - Redirect to `/login`
  - Show error: "Too many failed re-authentication attempts. Please log in again."

**Buttons:**
- **Cancel Button:**
  - Secondary action button
  - Closes modal
  - Cancels the sensitive action
  - No confirmation required

- **Confirm Button:**
  - Primary action button
  - Disabled when password is empty or during submission
  - Loading state: Show spinner + "Verifying..." during API call

**Error Messages:**
- Invalid password: "Incorrect password. Attempt {X} of 3."
- Network error: "Connection error. Please try again."

**Success Behavior:**
- On successful re-authentication:
  - Close modal
  - Proceed with the sensitive action
  - Show grace period indicator in top navigation: "🔓 Elevated Session (14:32 remaining)"
  - Grace period: 15 minutes
  - Within grace period: No re-authentication required for other sensitive actions

**Grace Period Indicator:**
- Position: Top navigation bar, right side (near user menu)
- Display: "🔓 Elevated Session (MM:SS remaining)"
- Updates every second
- Disappears when grace period expires
- Clickable: Shows tooltip "Re-authenticated for sensitive actions"

---

## 2. Routing & Navigation

### 2.1 Post-Login Redirect Logic

**Default Landing Pages by Role:**

| Role | Default Route |
|------|---------------|
| Reporting Entity User | `/reporting-entity/submissions` |
| Compliance Officer | `/compliance/validation/assigned` |
| Head of Compliance | `/compliance/dashboards` |
| Analyst | `/analysis/queue/assigned` |
| Head of Analysis | `/analysis/dashboards` |
| Director of Operations | `/audit/dashboards/director-ops` |
| OIC | `/audit/dashboards/oic` |
| Tech Admin | `/admin/users` |

**Redirect Priority:**
1. If `requiresPasswordChange` is `true`: Show password change modal first, then redirect
2. If return URL exists (from session expiry): Redirect to return URL
3. Otherwise: Redirect to role-based default route

**Return URL Preservation:**
- When session expires: Store current route in `returnUrl` query parameter
- Format: `/login?returnUrl=/compliance/validation/123`
- After successful login: Redirect to `returnUrl` if valid and accessible
- If `returnUrl` is invalid or user lacks permission: Redirect to default route

### 2.2 Public Routes

**Routes accessible without authentication:**
- `/login` - Login page
- `/forgot-password` - Password reset request
- `/reset-password/:token` - Password reset with token
- `/logout` - Logout endpoint (redirects to login)

**Route Protection:**
- All other routes require authentication
- If unauthenticated user accesses protected route:
  - Redirect to `/login?returnUrl={currentRoute}`
  - After login: Redirect to original route

### 2.3 Logout Behavior

**Route:** `/logout`  
**Access:** Authenticated users only

**Logout Flow:**
1. User clicks logout (from user menu or direct navigation)
2. Show confirmation dialog: "Are you sure you want to log out?"
3. On confirm:
   - Call logout API endpoint
   - Clear all client-side session data
   - Clear localStorage (except drafts)
   - Clear sessionStorage
   - Redirect to `/login`
   - Show toast: "You have been logged out successfully."

**Logout All Devices:**
- Available in user profile menu
- Confirmation dialog: "This will log you out of all devices. Are you sure?"
- On confirm:
   - Call logout-all API endpoint
   - Clear all client-side data
   - Redirect to `/login`
   - Show toast: "You have been logged out of all devices."

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

### 3.3 Username/Email Input Validation

**Acceptable Input:**
- Username: Alphanumeric characters, may include underscores or hyphens
- Email: Standard email format

**Validation:**
- If input contains "@": Validate as email format
- Otherwise: Validate as username format
- Show error if format invalid

### 3.4 Confirm Password Validation

**Validation Rules:**
- Must match "New Password" field exactly
- Case-sensitive comparison
- Validate in real-time as user types
- Show error if passwords don't match: "Passwords do not match"

---

## 4. API Contract Specifications

### 4.1 Authentication Endpoints

#### POST /auth/login

**Request Headers:**
- `Content-Type: application/json`
- Include CSRF token in header (see Section 5.2)

**Request Body:**
```json
{
  "username": "string (username or email)",
  "password": "string",
  "rememberMe": "boolean (optional, default: false)"
}
```

**Success Response (200):**
```json
{
  "user": {
    "id": "string (user ID)",
    "username": "string",
    "email": "string",
    "role": "string (role name)",
    "requiresPasswordChange": "boolean",
    "entityId": "string (optional, for reporting entity users)",
    "entityName": "string (optional, for reporting entity users)"
  },
  "session": {
    "expiresAt": "string (ISO 8601 timestamp)",
    "ipAddress": "string",
    "userAgent": "string"
  },
  "activeSessions": "number (current active sessions, max 3)"
}
```

**Error Responses:**

**401 Unauthorized - Invalid Credentials:**
```json
{
  "error": "INVALID_CREDENTIALS",
  "message": "Invalid username or password. Please try again.",
  "attemptsRemaining": "number (optional, if not locked yet)"
}
```

**401 Unauthorized - Account Locked:**
```json
{
  "error": "ACCOUNT_LOCKED",
  "message": "Account locked due to multiple failed login attempts.",
  "lockoutExpiresAt": "string (ISO 8601 timestamp)",
  "remainingMinutes": "number"
}
```

**403 Forbidden - Account Disabled:**
```json
{
  "error": "ACCOUNT_DISABLED",
  "message": "Your account has been disabled. Please contact support."
}
```

**429 Too Many Requests - Rate Limited:**
```json
{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many login attempts. Please try again later.",
  "retryAfter": "number (seconds)"
}
```

**500 Internal Server Error:**
```json
{
  "error": "INTERNAL_SERVER_ERROR",
  "message": "An unexpected error occurred. Please try again later."
}
```

**Network Error Handling:**
- If request fails due to network error:
  - Show error: "Connection error. Please check your internet connection and try again."
  - Allow user to retry

#### POST /auth/logout

**Request Headers:**
- Include authentication cookie (automatically sent by browser)
- Include CSRF token in header

**Request Body:**
```json
{}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Error Responses:**
- Same as other endpoints (401, 500, network errors)

#### POST /auth/logout-all

**Request Headers:**
- Include authentication cookie
- Include CSRF token in header

**Request Body:**
```json
{}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out of all devices successfully"
}
```

**Error Responses:**
- Same as other endpoints

#### POST /auth/refresh

**Request Headers:**
- Include authentication cookie
- Include CSRF token in header

**Request Body:**
```json
{}
```

**Success Response (200):**
```json
{
  "session": {
    "expiresAt": "string (ISO 8601 timestamp)",
    "ipAddress": "string",
    "userAgent": "string"
  }
}
```

**Error Responses:**

**401 Unauthorized - Session Expired:**
```json
{
  "error": "SESSION_EXPIRED",
  "message": "Your session has expired. Please log in again."
}
```

**Usage:**
- Frontend should call this endpoint automatically 5 minutes before session expires
- Silent refresh (no UI interruption)
- If refresh fails: Show session expiry modal

#### GET /auth/me

**Request Headers:**
- Include authentication cookie
- Include CSRF token in header

**Request Body:**
None (GET request)

**Success Response (200):**
```json
{
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "role": "string",
    "requiresPasswordChange": "boolean",
    "entityId": "string (optional)",
    "entityName": "string (optional)"
  },
  "session": {
    "expiresAt": "string (ISO 8601 timestamp)",
    "ipAddress": "string",
    "userAgent": "string"
  },
  "activeSessions": "number",
  "sessions": [
    {
      "id": "string",
      "ipAddress": "string",
      "userAgent": "string",
      "lastActivity": "string (ISO 8601 timestamp)",
      "isCurrent": "boolean"
    }
  ]
}
```

**Error Responses:**
- 401 Unauthorized: Session expired or invalid
- 500 Internal Server Error

**Usage:**
- Call on app initialization to verify session
- Call to get current user info
- Call to check active sessions

### 4.2 Password Reset Endpoints

#### POST /auth/forgot-password

**Request Headers:**
- `Content-Type: application/json`
- Include CSRF token in header

**Request Body:**
```json
{
  "email": "string (email address)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

**Note:** Response is always success (200) regardless of whether email exists (security best practice)

**Error Responses:**

**400 Bad Request - Invalid Email:**
```json
{
  "error": "INVALID_EMAIL",
  "message": "Please enter a valid email address"
}
```

**429 Too Many Requests - Rate Limited:**
```json
{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Please try again later.",
  "retryAfter": "number (seconds)"
}
```

#### POST /auth/reset-password

**Request Headers:**
- `Content-Type: application/json`
- Include CSRF token in header

**Request Body:**
```json
{
  "token": "string (reset token from URL)",
  "newPassword": "string",
  "confirmPassword": "string"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Error Responses:**

**400 Bad Request - Invalid Token:**
```json
{
  "error": "INVALID_TOKEN",
  "message": "Invalid or expired reset token. Please request a new password reset link."
}
```

**400 Bad Request - Expired Token:**
```json
{
  "error": "EXPIRED_TOKEN",
  "message": "Reset token has expired. Please request a new password reset."
}
```

**400 Bad Request - Weak Password:**
```json
{
  "error": "WEAK_PASSWORD",
  "message": "Password does not meet requirements.",
  "requirements": [
    "Minimum 8 characters",
    "Uppercase and lowercase letters",
    "At least one number",
    "At least one special character"
  ]
}
```

**400 Bad Request - Password Mismatch:**
```json
{
  "error": "PASSWORD_MISMATCH",
  "message": "Passwords do not match."
}
```

**400 Bad Request - Password Reuse:**
```json
{
  "error": "PASSWORD_REUSE",
  "message": "You cannot reuse your last 5 passwords. Please choose a different password."
}
```

#### POST /auth/change-password

**Request Headers:**
- Include authentication cookie
- Include CSRF token in header

**Request Body:**
```json
{
  "currentPassword": "string",
  "newPassword": "string",
  "confirmPassword": "string"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Responses:**

**400 Bad Request - Invalid Current Password:**
```json
{
  "error": "INVALID_PASSWORD",
  "message": "Current password is incorrect. Please try again."
}
```

**400 Bad Request - Weak Password:**
Same as reset-password endpoint

**400 Bad Request - Password Reuse:**
Same as reset-password endpoint

**400 Bad Request - Password Mismatch:**
Same as reset-password endpoint

### 4.3 Re-Authentication Endpoint

#### POST /auth/reauthenticate

**Request Headers:**
- Include authentication cookie
- Include CSRF token in header

**Request Body:**
```json
{
  "password": "string"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "gracePeriodExpiresAt": "string (ISO 8601 timestamp, 15 minutes from now)"
}
```

**Error Responses:**

**401 Unauthorized - Invalid Password:**
```json
{
  "error": "INVALID_PASSWORD",
  "message": "Incorrect password.",
  "attemptsRemaining": "number (remaining attempts before force logout)"
}
```

**401 Unauthorized - Too Many Failed Attempts:**
```json
{
  "error": "TOO_MANY_ATTEMPTS",
  "message": "Too many failed re-authentication attempts. Please log in again."
}
```

**Sensitive Actions Requiring Re-Authentication:**
- Case approval
- Report dissemination
- User management (create/edit/delete users)
- Escalation approvals
- Rule changes
- Break-glass activation
- Intelligence approval

**Grace Period:**
- After successful re-authentication: 15 minutes
- Within grace period: No re-authentication required for other sensitive actions
- Show indicator in UI: "🔓 Elevated Session (MM:SS remaining)"

### 4.4 Session Management Endpoints

#### POST /auth/session/extend

**Request Headers:**
- Include authentication cookie
- Include CSRF token in header

**Request Body:**
```json
{}
```

**Success Response (200):**
```json
{
  "success": true,
  "session": {
    "expiresAt": "string (ISO 8601 timestamp, 30 minutes from now)"
  }
}
```

**Usage:**
- Called when user clicks "Stay Logged In" in session timeout warning modal
- Extends session by 30 minutes

---

## 5. Security Specifications

### 5.1 Cookie Configuration

**Authentication Cookie:**
- Name: `auth_token` (or as specified by backend)
- Type: HttpOnly, Secure, SameSite=Strict
- HttpOnly: Yes (prevents JavaScript access)
- Secure: Yes (HTTPS only)
- SameSite: Strict (prevents CSRF attacks)
- Path: `/` (available to all routes)
- Max-Age: 30 minutes (or 7 days if "Remember Me" checked)

**CSRF Token Cookie:**
- Name: `csrf_token` (or as specified by backend)
- Type: HttpOnly, Secure, SameSite=Strict
- HttpOnly: Yes
- Secure: Yes
- SameSite: Strict
- Path: `/`
- Max-Age: Session duration

**Cookie Storage:**
- Frontend should NOT store authentication tokens in localStorage or sessionStorage
- All authentication tokens managed via secure cookies (set by backend)
- Frontend only reads user info from `/auth/me` endpoint

### 5.2 CSRF Protection

**CSRF Token Requirements:**
- Backend provides CSRF token in cookie (automatically sent with requests)
- Frontend must include CSRF token in request header for all state-changing operations (POST, PUT, PATCH, DELETE)
- Header name: `X-CSRF-Token` (or as specified by backend)
- Token value: Read from cookie (if accessible) or from response header

**Request Flow:**
1. On app initialization: Call `/auth/me` to get CSRF token (in response header or cookie)
2. Store CSRF token in memory (not localStorage)
3. Include CSRF token in all POST/PUT/PATCH/DELETE requests
4. If CSRF token expires: Backend returns 403, frontend should refresh token and retry

**CSRF Token Refresh:**
- Backend may rotate CSRF token periodically
- Frontend should handle 403 responses by:
  1. Fetching new CSRF token
  2. Retrying the original request with new token

### 5.3 CORS Configuration

**CORS Origin Clarification:**
- **Origin** = **Frontend server URL** (where the web application is hosted)
  - Production example: `https://app.suptech365.gov.lr`
  - Development example: `http://localhost:3000` or `http://localhost:5173`
- **Backend server** sets CORS headers to allow requests from the frontend origin
- The backend must configure `Access-Control-Allow-Origin` to match the frontend's origin URL

**Expected CORS Headers from Backend:**
- `Access-Control-Allow-Origin`: Specific frontend origin URL (not `*`)
  - Must be the exact frontend server URL (e.g., `https://app.suptech365.gov.lr`)
  - Cannot use wildcard `*` when `Access-Control-Allow-Credentials` is `true`
  - For multiple environments: Backend should allow both production and development origins
- `Access-Control-Allow-Credentials`: `true` (required for cookies)
- `Access-Control-Allow-Methods`: `GET, POST, PUT, PATCH, DELETE, OPTIONS`
- `Access-Control-Allow-Headers`: `Content-Type, X-CSRF-Token, Authorization` (or as specified)
- `Access-Control-Expose-Headers`: Headers frontend needs to read (e.g., CSRF token)

**Frontend Requirements:**
- Include `credentials: 'include'` in all fetch/axios requests
- This ensures cookies are sent with cross-origin requests
- Example: `fetch(url, { credentials: 'include', ... })`
- Frontend engineer should confirm the frontend origin URL with backend team for CORS configuration

**Preflight Requests:**
- Backend must handle OPTIONS requests for CORS preflight
- Frontend should not need to handle preflight manually (browser handles automatically)

### 5.4 Session Security

**Session Timeout:**
- Default: 30 minutes of inactivity
- Warning: Show modal 5 minutes before expiration (at 25 minutes)
- "Remember Me": Extends to 7 days (or configurable duration)

**Concurrent Session Limit:**
- Maximum 3 active sessions per user
- When limit exceeded: Backend terminates oldest session
- Frontend should show notification: "You have been logged out of another device due to session limit."

**IP Address Tracking:**
- Backend tracks IP address for each session
- If new session created from different IP:
  - Backend may send notification
  - Frontend should show alert: "New login detected from {IP address}. If this wasn't you, please change your password."

**Session Refresh:**
- Frontend should automatically refresh session 5 minutes before expiration
- Silent refresh (no UI interruption)
- If refresh fails: Show session expiry modal

---

## 6. Error Handling

### 6.1 Error Code Mapping

**Complete Error Code List:**

| Error Code | HTTP Status | User Message | Action Required |
|------------|-------------|--------------|-----------------|
| `INVALID_CREDENTIALS` | 401 | "Invalid username or password. Please try again." | User retry |
| `ACCOUNT_LOCKED` | 401 | "Account locked due to multiple failed attempts. Please try again in {X} minutes." | Show countdown, wait |
| `ACCOUNT_DISABLED` | 403 | "Your account has been disabled. Please contact support at support@fia.gov.lr" | Contact support |
| `SESSION_EXPIRED` | 401 | "Your session has expired. Please log in again." | Redirect to login |
| `INVALID_TOKEN` | 400 | "Invalid or expired reset token. Please request a new password reset link." | Request new token |
| `EXPIRED_TOKEN` | 400 | "Reset token has expired. Please request a new password reset." | Request new token |
| `WEAK_PASSWORD` | 400 | "Password does not meet requirements. Please check the requirements above." | Fix password |
| `PASSWORD_REUSE` | 400 | "You cannot reuse your last 5 passwords. Please choose a different password." | Choose new password |
| `PASSWORD_MISMATCH` | 400 | "Passwords do not match." | Fix password match |
| `RATE_LIMIT_EXCEEDED` | 429 | "Too many attempts. Please try again in {X} seconds." | Wait and retry |
| `INVALID_EMAIL` | 400 | "Please enter a valid email address" | Fix email format |
| `INVALID_PASSWORD` | 400 | "Current password is incorrect. Please try again." | Enter correct password |
| `TOO_MANY_ATTEMPTS` | 401 | "Too many failed re-authentication attempts. Please log in again." | Force logout |
| `NETWORK_ERROR` | N/A | "Connection error. Please check your internet connection and try again." | Check connection |
| `INTERNAL_SERVER_ERROR` | 500 | "An unexpected error occurred. Please try again later." | Retry or contact support |

### 6.2 Error Display Patterns

**Toast Notifications:**
- Position: Top-right corner
- Duration: 5 seconds (auto-dismiss)
- Type: Error (red), Success (green), Warning (yellow), Info (blue)
- Dismissible: Yes (X button)

**Inline Errors:**
- Position: Below form field
- Style: Red text, small font
- Icon: Warning icon (⚠️)
- Persist until user fixes error

**Modal Errors:**
- For critical errors (session expired, account locked)
- Non-dismissible until resolved
- Clear call-to-action button

**Error Recovery:**
- Network errors: Allow retry
- Validation errors: Highlight field, show message
- Server errors: Show generic message, allow retry
- Authentication errors: Redirect to login

---

## 7. Loading States

### 7.1 Form Submission Loading

**Login Form:**
- Disable all inputs during submission
- Disable Sign In button
- Show spinner on button
- Change button text to "Signing in..."
- Prevent form resubmission

**Password Reset Form:**
- Disable all inputs during submission
- Disable Reset Password button
- Show spinner on button
- Change button text to "Resetting password..."

**Password Change Modal:**
- Disable all inputs during submission
- Disable Change Password button
- Show spinner on button
- Change button text to "Changing password..."

**Forgot Password Form:**
- Disable email input during submission
- Disable Send Reset Link button
- Show spinner on button
- Change button text to "Sending..."

### 7.2 Page Load Loading

**Login Page:**
- Show loading spinner on initial load (if checking existing session)
- Hide spinner once page is ready

**Reset Password Page:**
- Show loading spinner while validating token
- If token invalid: Show error immediately
- If token valid: Show form

### 7.3 Session Refresh Loading

**Silent Refresh:**
- No UI indication (happens in background)
- If refresh fails: Show session expiry modal

**Manual Refresh (Stay Logged In):**
- Show loading state on "Stay Logged In" button
- Disable button during API call
- Show "Extending session..." text

---

## 8. Accessibility Requirements

### 8.1 Form Accessibility

**ARIA Labels:**
- All form inputs must have `aria-label` or associated `<label>` elements
- Error messages must have `aria-live="polite"` or `aria-live="assertive"`
- Required fields must have `aria-required="true"`

**Error Announcements:**
- Screen readers must announce errors when they occur
- Use `aria-describedby` to associate error messages with inputs
- Error messages must be announced immediately (use `aria-live="assertive"` for critical errors)

**Focus Management:**
- Auto-focus first input on page load
- After error: Focus first field with error
- After successful submission: Focus appropriate element (e.g., success message)

**Keyboard Navigation:**
- Tab order: Logical flow through form fields
- Enter key: Submit form (when valid)
- Escape key: Close modals (if dismissible)

### 8.2 Modal Accessibility

**Modal Focus:**
- When modal opens: Focus first interactive element
- Trap focus within modal (prevent tabbing to background)
- When modal closes: Return focus to trigger element

**Modal ARIA:**
- Modal must have `role="dialog"`
- Modal must have `aria-labelledby` pointing to title
- Modal must have `aria-describedby` pointing to description (if applicable)
- Background overlay must have `aria-hidden="true"`

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
- Links: 44px × 44px minimum
- Checkboxes: 44px × 44px minimum
- Input fields: 44px height minimum

**Mobile Optimization:**
- All interactive elements must meet minimum touch target size
- Adequate spacing between interactive elements (minimum 8px)

---

## 9. Multi-Tab & Session Management

### 9.1 Multiple Tab Detection

**Detection:**
- When user opens app in new tab while already logged in:
  - Show warning modal: "Multiple Tabs Detected - FIA SupTech365 is already open in another tab/window. Working in multiple tabs may cause data conflicts. We recommend using a single tab for the best experience."
  - Options: "[Continue Anyway]" or "[Close This Tab]"

**Tab Synchronization:**
- Navigation state: Independent per tab
- Data cache: Shared across tabs (via localStorage)
- Notifications: Appear in all tabs
- Actions in one tab: Trigger data refresh in other tabs

**Conflict Resolution:**
- If user performs action in Tab 1 that conflicts with Tab 2:
  - Tab 2 shows: "⚠️ Action Conflict - This {resource} was already {action} in another tab. Current status: {status}. Action by: You ({time} ago)."
  - Options: "[Reload Page]" or "[View Updated {Resource}]"

### 9.2 Session Management UI

**Active Sessions Display:**
- Available in user profile menu
- Show: "Active Sessions (X of 3)"
- List all active sessions with:
  - IP address
  - User agent (browser/device)
  - Last activity time
  - Current session indicator

**Logout All Devices:**
- Button in active sessions menu
- Confirmation required: "This will log you out of all devices. Are you sure?"
- On confirm: Call `/auth/logout-all` endpoint

**New Session Alert:**
- If new session created from different IP:
  - Show notification: "🔔 New login detected from {IP address} on {device}. If this wasn't you, please change your password."
  - Link to password change page

---

## 10. Notification Patterns

### 10.1 Toast Notifications

**Login Success:**
- Message: "Welcome back, {username}!"
- Type: Success (green)
- Duration: 5 seconds
- Position: Top-right

**Password Change Success:**
- Message: "Password changed successfully!"
- Type: Success (green)
- Duration: 5 seconds

**Password Reset Success:**
- Message: "Password reset successfully!"
- Type: Success (green)
- Duration: 5 seconds

**Logout Success:**
- Message: "You have been logged out successfully."
- Type: Info (blue)
- Duration: 5 seconds

**Session Expired:**
- Message: "Your session has expired. Please log in again."
- Type: Warning (yellow)
- Duration: Until dismissed (persistent)

### 10.2 Error Notifications

**Account Locked:**
- Show persistent banner at top of login page
- Message: "Account locked. Please try again in {X} minutes."
- Include countdown timer
- Cannot be dismissed until lockout expires

**Rate Limit:**
- Toast notification
- Message: "Too many attempts. Please try again in {X} seconds."
- Include countdown timer
- Auto-dismiss when timer expires

---

## 11. Missing Requirements - Recommendations

### 11.1 "Remember Me" Behavior Clarification

**Recommendation:**
- When checked: Extend session to 7 days (or configurable duration)
- When unchecked: Standard 30-minute session timeout
- Store preference in secure cookie (not localStorage)
- Show indicator in UI: "Remember me for 7 days" (tooltip on checkbox)

### 11.2 Password Reset Token Expiration

**Recommendation:**
- Token expires in 1 hour from generation
- Show countdown timer in UI: "Token expires in: MM:SS"
- Auto-refresh countdown every second
- On expiration: Show error and link to request new token

### 11.3 Account Lockout Countdown

**Recommendation:**
- Show remaining lockout time: "Account locked. Please try again in {X} minutes."
- Display countdown timer: Updates every second
- Show attempts remaining (if not yet locked): "3 attempts remaining before account lockout"

### 11.4 Password Strength Indicator

**Recommendation:**
- Optional but recommended feature
- Visual indicator (progress bar) showing password strength:
  - Weak: Red (0-40% of requirements met)
  - Medium: Yellow (60-80% of requirements met)
  - Strong: Green (100% of requirements met)
- Update in real-time as user types

### 11.5 Post-Login Welcome Flow

**Recommendation:**
- After first-time password change:
  1. Show success message: "Password changed successfully!"
  2. After 2 seconds: Show welcome modal/tour option
  3. After welcome modal: Redirect to role-based landing page
- For returning users: Direct redirect to role-based landing page

### 11.6 Session Refresh Mechanism

**Recommendation:**
- Auto-refresh session 5 minutes before expiration
- Silent refresh (no UI interruption)
- If refresh fails: Show session expiry modal
- Track refresh attempts: After 3 failures, force logout

### 11.7 Re-Authentication Grace Period Indicator

**Recommendation:**
- Show in top navigation: "🔓 Elevated Session (MM:SS remaining)"
- Updates every second
- Disappears when grace period expires
- Clickable: Shows tooltip "Re-authenticated for sensitive actions"

---

## 12. Implementation Checklist

### 12.1 Login Page
- [ ] Implement login form with username/email and password fields
- [ ] Add "Remember me" checkbox
- [ ] Add "Forgot Password?" link
- [ ] Implement form validation
- [ ] Add loading states
- [ ] Implement error message display
- [ ] Handle account lockout with countdown
- [ ] Implement post-login redirect logic
- [ ] Add accessibility features (ARIA labels, keyboard navigation)
- [ ] Test with screen reader

### 12.2 Forgot Password Page
- [ ] Implement email input form
- [ ] Add form validation
- [ ] Implement success state
- [ ] Add loading states
- [ ] Implement error handling
- [ ] Add rate limiting feedback
- [ ] Add accessibility features

### 12.3 Reset Password Page
- [ ] Extract token from URL
- [ ] Validate token on page load
- [ ] Implement password form with requirements checklist
- [ ] Add real-time password validation
- [ ] Implement token expiration countdown
- [ ] Add loading states
- [ ] Implement error handling
- [ ] Add accessibility features

### 12.4 First-Time Login Password Change Modal
- [ ] Implement non-dismissible modal
- [ ] Add password form with requirements checklist
- [ ] Implement real-time validation
- [ ] Add loading states
- [ ] Implement error handling
- [ ] Handle success flow (welcome modal, redirect)
- [ ] Add accessibility features (focus trap, ARIA)

### 12.5 Session Timeout Warning
- [ ] Implement inactivity detection (25 minutes)
- [ ] Show warning modal with countdown
- [ ] Implement "Stay Logged In" functionality
- [ ] Implement "Save & Logout" functionality
- [ ] Add auto-save for form data
- [ ] Handle session expiry
- [ ] Preserve return URL

### 12.6 Re-Authentication Modal
- [ ] Identify sensitive actions requiring re-auth
- [ ] Implement non-dismissible modal with timeout
- [ ] Add attempt counter
- [ ] Implement grace period indicator
- [ ] Handle force logout after 3 failures
- [ ] Add accessibility features

### 12.7 API Integration
- [ ] Implement all authentication endpoints
- [ ] Add CSRF token handling
- [ ] Configure CORS with credentials
- [ ] Implement cookie-based authentication
- [ ] Add error handling for all error codes
- [ ] Implement session refresh mechanism
- [ ] Add network error handling

### 12.8 Security
- [ ] Ensure no tokens in localStorage/sessionStorage
- [ ] Implement CSRF protection
- [ ] Configure CORS properly
- [ ] Add secure cookie handling
- [ ] Implement session timeout
- [ ] Add concurrent session limit handling
- [ ] Implement IP address change detection

### 12.9 Accessibility
- [ ] Add ARIA labels to all form fields
- [ ] Implement error announcements for screen readers
- [ ] Ensure keyboard navigation works
- [ ] Add focus management
- [ ] Verify color contrast ratios
- [ ] Ensure touch target sizes meet requirements
- [ ] Test with screen reader

### 12.10 Multi-Tab Handling
- [ ] Implement multiple tab detection
- [ ] Add tab synchronization
- [ ] Implement conflict resolution
- [ ] Add active sessions display
- [ ] Implement "Logout all devices" functionality

---

## 13. Testing Requirements

### 13.1 Functional Testing
- Test all login scenarios (success, invalid credentials, locked account)
- Test password reset flow (valid token, expired token, invalid token)
- Test first-time login password change
- Test session timeout and refresh
- Test re-authentication flow
- Test multi-tab behavior
- Test error handling for all error codes

### 13.2 Security Testing
- Verify no tokens stored in localStorage/sessionStorage
- Test CSRF protection
- Test session timeout enforcement
- Test concurrent session limits
- Test account lockout mechanism
- Test rate limiting

### 13.3 Accessibility Testing
- Test with screen reader (NVDA, JAWS, VoiceOver)
- Test keyboard navigation
- Test color contrast
- Test touch target sizes
- Test error announcements

### 13.4 Browser Testing
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

### 13.5 Responsive Testing
- Desktop (1366x768 minimum)
- Tablet (768-1024px)
- Mobile (320-767px)

---

## 14. Dependencies & Prerequisites

### 14.1 Backend Requirements
- All authentication endpoints must be implemented and tested
- CSRF token mechanism must be in place
- CORS must be configured correctly
- Secure cookies must be configured
- Session management must be implemented
- Rate limiting must be implemented

### 14.2 Frontend Requirements
- React/Next.js or equivalent framework
- HTTP client library (axios, fetch) with cookie support
- Form validation library (optional but recommended)
- Toast notification library
- Modal/dialog component library
- Accessibility library (optional but recommended)

### 14.3 Design System
- UI component library (buttons, inputs, modals)
- Design tokens (colors, spacing, typography)
- Icon library
- Loading spinner component

---

## Document Version

**Version:** 1.0  
**Last Updated:** 2026-01-15  
**Author:** Senior Software Architect  
**Status:** Ready for Implementation

---

## Notes

- This document consolidates requirements from PDD Section 6 (Authentication & Registration UI) and includes missing specifications identified during architecture review.
- All API contracts are based on backend endpoint specifications. Frontend engineer should confirm exact endpoint URLs and response formats with backend team before implementation.
- Security specifications (CSRF, CORS, cookies) are based on secure cookie implementation. Any changes to authentication mechanism should be reflected in this document.
- Accessibility requirements must be met to ensure WCAG AA compliance.
- All recommendations in Section 11 should be discussed with product owner and backend team before implementation.
