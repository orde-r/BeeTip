# Logout Use Case

An authenticated user logs out by clearing their session cookie.

The server removes the `accessToken` HttpOnly cookie.

## Flow

1. User clicks the logout button.
2. Client sends a POST request to the logout endpoint.
3. Server clears the `accessToken` cookie.
4. Server returns a success response.

## Endpoints

### POST `/auth/logout`

Public endpoint — no authentication required.

#### Response

```json
{
    "message": "Logout successful"
}
```

#### Failure Responses

| Status | Condition |
|--------|-----------|
| None | This endpoint always succeeds. |
