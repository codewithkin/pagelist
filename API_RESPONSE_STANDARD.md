# API Response Standard

This document defines the standardized request/response format for all pagelist API endpoints.

## Response Format

All API responses follow this standardized format:

### Success Response (2xx)
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional human-readable message"
}
```

**Status Codes:**
- `200 OK` - Successful GET, PUT, PATCH, DELETE
- `201 Created` - Successful POST that creates a resource

### Error Response (4xx, 5xx)
```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

**Status Codes:**
- `400 Bad Request` - Invalid input or validation error
- `401 Unauthorized` - Missing or invalid authentication/authorization
- `403 Forbidden` - Authenticated but lacks permission
- `404 Not Found` - Resource not found
- `409 Conflict` - Conflict (e.g., duplicate email)
- `422 Unprocessable Entity` - Validation error with details
- `500 Internal Server Error` - Server error

## Error Message Guidelines

### For Developers (internal messages)
Technical details that help debugging (logged server-side only)

### For Users (frontend display)
**All error messages MUST be:**
- ✅ Clear and conversational
- ✅ Action-oriented ("try again", "check your email", etc.)
- ✅ Avoid jargon (not "409 Conflict", "Invalid token", etc.)
- ✅ Helpful next steps included where appropriate

**Examples:**

| Bad | Good |
|-----|------|
| "409 Conflict" | "This email is already registered. Try signing in instead." |
| "Invalid token" | "Your verification link is invalid or has expired." |
| "Unauthorized" | "You must be signed in to view your workspace." |
| "User not found" | "Your session has expired. Please sign in again." |
| "Failed to load" | "We couldn't load your library. Please try refreshing the page." |

## Frontend Integration

### Using the API Client

```typescript
import { apiMutation, ApiError } from "@/lib/api-client";

// Mutations automatically throw ApiError with user-friendly messages
const { mutate, error, isPending } = useMutation({
  mutationFn: (data) => apiMutation("post", "/api/endpoint", data),
});

// The error message is automatically extracted from the response
if (error instanceof Error) {
  console.log(error.message); // "This email is already registered..."
}
```

### Displaying Errors to Users

Always show the error message from the API:

```tsx
{error && (
  <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs text-destructive">
    {error instanceof Error ? error.message : "Something went wrong. Please try again."}
  </div>
)}
```

## All Endpoints Using This Standard

- ✅ `/api/auth/sign-up` - User-friendly error messages
- ✅ `/api/auth/sign-in` - User-friendly error messages
- ✅ `/api/auth/verify-email` - User-friendly error messages  
- ✅ `/api/auth/sign-out` - User-friendly success/error messages
- ✅ `/api/auth/session` - User-friendly error messages
- ✅ `/api/onboarding/complete` - User-friendly error messages
- ✅ `/api/onboarding/status` - User-friendly error messages
- ✅ `/api/workspace/stats` - User-friendly error messages
- ✅ `/api/library/stats` - User-friendly error messages

## Backend Response Helpers

Located in `apps/server/src/lib/response.ts`:

```typescript
// Success response
ok(c, data, message?, status?)

// Created response (201)
created(c, data, message?)

// Error response
err(c, message, status)
```

All error messages must be customer-facing and understandable by non-technical users.
