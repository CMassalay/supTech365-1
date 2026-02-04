# API Integration & Auth Flow Plan

## 1. API Contract Alignment

| Frontend (current) | Backend (Render API) | Action |
|--------------------|----------------------|--------|
| `POST /auth/login` body `{ username, password, rememberMe }` | `POST /auth/login` body `{ username_or_email, password, remember_me }` | Use snake_case, correct field names |
| Response: cookies / session | Response: `access_token` (JWT), `token_type: "bearer"` | Store JWT; send `Authorization: Bearer <token>` on all authenticated requests |
| `GET /auth/me` | `GET /auth/user/profile` | Use `/auth/user/profile` for current user |
| `POST /auth/logout` | `POST /auth/logout` | Same; send Bearer token in header |
| `POST /auth/refresh` | `POST /auth/refresh` | Returns new `access_token`; update stored token |
| `POST /auth/forgot-password` body `{ email }` | `POST /auth/password/forgot` body `{ email }` | Use `/auth/password/forgot` |
| `POST /auth/reset-password` body `{ token, newPassword, confirmPassword }` | `POST /auth/password/reset` body `{ token, new_password, confirm_password }` | Use snake_case |
| `POST /auth/change-password` body `{ currentPassword, newPassword, confirmPassword }` | `POST /auth/password/change` body `{ current_password, new_password, confirm_password }` | Use snake_case |
| Nested entity payload | Flat payload: `entity_name`, `entity_type`, `registration_number`, etc. | Flatten body for `POST /admin/entities/register` |
| `user.requiresPasswordChange` | Top-level `password_change_required` | Map in frontend |

**Base URL:** `https://liberia-suptech.onrender.com` (default in `src/lib/api.ts`). Override with `VITE_API_BASE_URL` in `.env` if needed.

---

## 2. Auth Flow (UX)

### 2.1 Unauthenticated users
- **All app routes** (except `/login`, `/forgot-password`, `/reset-password/:token`) are protected.
- If user is not logged in → redirect to `/login?returnUrl=<current path>`.
- After successful login → redirect to `returnUrl` if valid and allowed, else role-based default.

### 2.2 Login flow
1. User submits `username_or_email`, `password`, `remember_me`.
2. On success: store `access_token` (and optionally `session_id`); store user in context.
3. If `password_change_required === true` → redirect to `/change-password-required` (modal/page).
4. Else → redirect to `returnUrl` or role-based default.

### 2.3 Token storage
- **In-memory only** for security (no localStorage by default). Optional: use **sessionStorage** when `remember_me === false` so token survives refresh but not new tab; use **localStorage** when `remember_me === true` so token persists across tabs (per product decision).
- Recommendation: use **sessionStorage** so that closing the tab logs the user out unless "Remember me" is checked; if checked, use **localStorage** for persistence.

### 2.4 Session refresh
- Call `POST /auth/refresh` before token expiry (e.g. when `GET /auth/session/status` returns `requires_refresh: true` or on a timer).
- On success: replace stored `access_token` with new one.
- On 401: clear token and user; redirect to `/login?returnUrl=...`.

### 2.5 Logout
- Call `POST /auth/logout` with Bearer token.
- Clear token and user from storage and context; redirect to `/login`.

---

## 3. Role Mapping (Backend → Frontend)

Backend may return roles like `SUPER_ADMIN`, `TECH_ADMIN`, etc. (uppercase with underscores).

- Map to app `UserRole`: e.g. `SUPER_ADMIN` → `tech_admin`, `TECH_ADMIN` → `tech_admin`.
- Normalize to lowercase with underscores for routing and UI (e.g. `tech_admin`, `compliance_officer`).

---

## 4. Error Handling

- **401 Unauthorized:** Clear token and user; redirect to `/login?returnUrl=...`.
- **422 Validation Error:** Backend returns `{ detail: [{ loc, msg, type }] }`. Map to field-level errors and toast.
- **Network errors:** Show generic "Connection error" message and allow retry.

---

## 5. Admin & Protected Routes

- **Admin routes** (e.g. `/admin/entities/register`, `/admin/users/create`): require role `tech_admin` or `super_admin` (mapped).
- **ProtectedRoute** checks: (1) has valid token/user, (2) if `password_change_required` then redirect to change-password, (3) if route requires role, user role must be in allowed list.

---

## 6. Entity Registration API

- **Endpoint:** `POST /admin/entities/register`
- **Body (flat):**  
  `entity_name`, `entity_type`, `registration_number`, `contact_email`, `contact_phone`,  
  `primary_contact_name`, `primary_contact_email`, `primary_contact_phone`,  
  `username`, `email`, `password`
- **Response:** `{ entity, user, message }` (no nested `data`; entity/user at top level).
- Frontend: build flat object from form; map response to success dialog (entity id/name, user credentials).

---

## 7. Implementation Order

1. **api.ts:** Set base URL; add JWT storage (get/set token); add `Authorization: Bearer` to authenticated requests; align all auth endpoints and body/response types with backend (snake_case, correct paths).
2. **AuthContext:** On init, if token exists call `GET /auth/user/profile` to restore user; map `password_change_required`; clear token on 401.
3. **Login page:** Send `username_or_email`, `password`, `remember_me`; on success store token and user; handle `password_change_required` redirect.
4. **ProtectedRoute & App:** Protect all routes except login, forgot-password, reset-password; redirect unauthenticated to `/login?returnUrl=...`.
5. **Roles:** Add `super_admin` to types; map backend role names to frontend roles.
6. **Entity registration:** Flatten request body; map response to UI.
7. **Password endpoints:** Use `/auth/password/forgot`, `/auth/password/reset`, `/auth/password/change` with snake_case bodies; optional: call `GET /auth/password/reset/{token}` to validate token before showing reset form.

---

## 8. Implemented (Summary)

- **api.ts:** JWT stored in sessionStorage (or localStorage when "Remember me"); `Authorization: Bearer` on all non-public requests; base URL `https://liberia-suptech.onrender.com`; login uses `username_or_email`, `remember_me`; profile via `GET /auth/user/profile`; 422 detail parsed for validation errors.
- **AuthContext:** Restores user via token + `getProfile()`; `login()` stores token and user; `logout()` clears token and calls API; `requiresPasswordChange` from login/profile.
- **ProtectedLayout:** All routes except `/login`, `/forgot-password`, `/reset-password/:token` require auth; redirect to `/login?returnUrl=...` when unauthenticated; redirect to `/change-password-required` when `password_change_required` is true.
- **Roles:** `mapBackendRole()` maps backend roles (e.g. `SUPER_ADMIN`) to app `UserRole`; admin routes allow `tech_admin` and `super_admin`.
- **Entity registration:** Flat payload sent to `POST /admin/entities/register`; response `{ entity, user, message }` used in success dialog.
