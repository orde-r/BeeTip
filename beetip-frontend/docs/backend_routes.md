# BeeTip Backend Routes for Frontend Integration

This document maps the current `beetip-api` backend surface for frontend implementation.

Source of truth in the backend:

- Routes: `beetip-api/src/routes/*.routes.ts`
- DTOs: `beetip-api/src/dtos/*.dto.ts`
- Auth middleware: `beetip-api/src/middlewares/auth.middleware.ts`
- Socket events: `beetip-api/src/socket.ts`

## Base URLs

| Purpose | URL |
| --- | --- |
| REST API local base | `http://localhost:3000` |
| Swagger UI | `http://localhost:3000/doc` |
| OpenAPI JSON | `http://localhost:3000/openapi.json` |
| Socket.io chat namespace | `http://localhost:3000/chat` |

The server exposes only `GET`, `POST`, and `OPTIONS` through CORS. Frontend requests must include credentials so the backend-managed auth cookie is sent.

## Authentication Model

Protected REST endpoints use the backend-managed `accessToken` cookie.

For the frontend SPA, use credentialed requests and do not store tokens in frontend state or local storage. `POST /auth/login` sets the HttpOnly cookie. Every protected REST request must send credentials:

```ts
fetch("http://localhost:3000/auth/me", {
  credentials: "include",
});
```

Socket.io chat must also send credentials:

```ts
const socket = io("http://localhost:3000/chat", {
  withCredentials: true,
});
```

Every normal error response has this shape:

```json
{
  "message": "Something went wrong"
}
```

Validation errors return HTTP `400` with the first validation issue in `message`.

## Shared DTOs

### UserDTO

```ts
type UserDTO = {
  id: string;
  email: string;
  balance: number;
  current_role: string;
  createdAt?: string;
};
```

Notes:

- `current_role` currently defaults to `"USER"` in the database.
- There is no backend route to toggle or persist Buyer/Kurir context. The frontend does not expose a role toggle; `/home` is Buyer context and `/kurir` is Kurir context.

### OrderDTO

```ts
type OrderDTO = {
  id: string;
  buyer_id: string;
  buyer_email: string | null;
  kurir_id: string | null;
  kurir_email: string | null;
  to_location: string;
  item_desc: string;
  item_price: number | null;
  receipt_image_url: string | null;
  delivery_fee: number;
  status: "PENDING" | "ACCEPTED" | "PRICED" | "PAID" | "COMPLETED" | "CANCELLED";
  createdAt: string;
};
```

Notes:

- `delivery_fee` defaults to `5000.00`.
- `item_price` is `null` until the assigned kurir uploads a price.
- `receipt_image_url` is optional text. The backend does not currently upload files; the frontend must send a string URL or data URL if used.
- Responses do not include `updatedAt` in the current DTO.

### TransactionDTO

```ts
type TransactionDTO = {
  id: string;
  type: "DEPOSIT" | "PAYMENT" | "EARNING" | string;
  amount: number;
  createdAt: string;
};
```

### MessageDTO

```ts
type MessageDTO = {
  id: string;
  order_id: string;
  sender_id: string;
  content: string;
  timestamp: string;
};
```

## Route Summary

| Method | Path | Auth | Frontend use |
| --- | --- | --- | --- |
| `GET` | `/health` | No | API health check |
| `POST` | `/auth/register` | No | Create account |
| `POST` | `/auth/login` | No | Login and set auth cookie |
| `GET` | `/auth/me` | Yes | Refresh current user and balance |
| `POST` | `/auth/logout` | No in route, cookie optional in frontend | Clear auth cookie |
| `GET` | `/orders/my` | Yes | Buyer/Kurir personal order list |
| `POST` | `/orders` | Yes | Buyer creates order |
| `GET` | `/orders/available` | Yes | Kurir available order pool |
| `GET` | `/orders/{id}` | Yes | Order detail for participants |
| `POST` | `/orders/{id}/accept` | Yes | Kurir accepts pending order |
| `POST` | `/orders/{id}/price` | Yes | Kurir uploads price |
| `POST` | `/orders/{id}/pay` | Yes | Buyer pays priced order |
| `POST` | `/orders/{id}/complete` | Yes | Kurir completes paid order |
| `POST` | `/orders/{id}/cancel` | Yes | Buyer or kurir cancels before payment |
| `GET` | `/orders/{id}/messages` | Yes | Load chat history |
| `GET` | `/transactions/history` | Yes | Wallet transaction history |
| `POST` | `/transactions/deposit` | Yes | Mock wallet top up |

## System

### `GET /health`

Checks whether the API process is reachable.

Response `200`:

```json
{
  "status": "ok"
}
```

## Auth Routes

### `POST /auth/register`

Creates a user account.

Auth: public

Request:

```json
{
  "email": "student@binus.ac.id",
  "password": "securePassword123"
}
```

Validation:

- `email` must be a valid email.
- `password` must be at least 8 characters.

Response `201`:

```json
{
  "message": "Registration successful",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "student@binus.ac.id",
    "balance": 0,
    "current_role": "USER",
    "createdAt": "2026-05-25T10:00:00.000Z"
  }
}
```

Errors:

- `400` invalid body
- `409` email already exists

### `POST /auth/login`

Authenticates a user and sets the backend-managed auth cookie.

Auth: public

Request:

```json
{
  "email": "student@binus.ac.id",
  "password": "securePassword123"
}
```

Response `200`:

```json
{
  "message": "Login successful",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "student@binus.ac.id",
    "balance": 100000,
    "current_role": "USER",
    "createdAt": "2026-05-25T10:00:00.000Z"
  }
}
```

Frontend actions:

- Send the login request with `credentials: "include"` so the browser stores the backend cookie.
- Store only the returned user in frontend auth state.
- Do not store an access token in frontend state or local storage.

Errors:

- `400` invalid body
- `401` invalid credentials

### `GET /auth/me`

Returns the authenticated user. Use this after login, after deposit, after payment, after completion, or on app bootstrap. The frontend must send credentials so the auth cookie is included.

Auth: required

Response `200`:

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "student@binus.ac.id",
    "balance": 100000,
    "current_role": "USER",
    "createdAt": "2026-05-25T10:00:00.000Z"
  }
}
```

Errors:

- `401` missing, invalid, expired cookie, or deleted user session

### `POST /auth/logout`

Clears the `accessToken` cookie and returns a success message.

Auth: route is public in the backend. The frontend should still send credentials so the backend can clear the auth cookie.

Response `200`:

```json
{
  "message": "Logout successful"
}
```

Frontend actions:

- Clear local frontend auth state regardless of whether the backend logout request succeeds.

## Order Routes

All `/orders` routes require auth.

### `GET /orders/my`

Lists all orders where the authenticated user is either the buyer or assigned kurir.

Auth: required

Ordering: newest first by `createdAt`.

Response `200`:

```json
{
  "orders": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "buyer_id": "550e8400-e29b-41d4-a716-446655440001",
      "buyer_email": "buyer@binus.ac.id",
      "kurir_id": null,
      "kurir_email": null,
      "to_location": "13th floor room 2",
      "item_desc": "Chicken rice from canteen",
      "item_price": null,
      "receipt_image_url": null,
      "delivery_fee": 5000,
      "status": "PENDING",
      "createdAt": "2026-05-25T10:05:00.000Z"
    }
  ],
  "total": 1
}
```

Errors:

- `401` missing or invalid auth

### `POST /orders`

Creates a proxy buying order as the authenticated buyer.

Auth: required

Request:

```json
{
  "to_location": "13th floor room 2",
  "item_desc": "Chicken rice from canteen, extra sambal"
}
```

Validation:

- `to_location` is required and cannot be empty.
- `item_desc` is required and cannot be empty.

Response `201`:

```json
{
  "message": "Order created successfully",
  "order": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "buyer_id": "550e8400-e29b-41d4-a716-446655440001",
    "buyer_email": "buyer@binus.ac.id",
    "kurir_id": null,
    "kurir_email": null,
    "to_location": "13th floor room 2",
    "item_desc": "Chicken rice from canteen, extra sambal",
    "item_price": null,
    "receipt_image_url": null,
    "delivery_fee": 5000,
    "status": "PENDING",
    "createdAt": "2026-05-25T10:05:00.000Z"
  }
}
```

Frontend actions:

- Add the returned order to the buyer order list or refetch `/orders/my`.
- The order should appear in `/orders/available` for other users.

Errors:

- `400` invalid body
- `401` missing or invalid auth

### `GET /orders/available`

Lists orders in the public kurir pool.

Auth: required

Filter: `status = "PENDING"`

Response `200`:

```json
{
  "orders": [],
  "total": 0
}
```

Frontend actions:

- On Kurir Home, show these as accept-able order cards.
- The backend currently includes the user's own pending orders too. The UI should hide orders where `buyer_id === currentUser.id` because accepting your own order will fail with `403`.

Errors:

- `401` missing or invalid auth

### `GET /orders/{id}`

Returns one order by ID.

Auth: required

Authorization: user must be the buyer or assigned kurir.

Path params:

- `id`: UUID order ID

Response `200`:

```json
{
  "order": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "buyer_id": "550e8400-e29b-41d4-a716-446655440001",
    "buyer_email": "buyer@binus.ac.id",
    "kurir_id": "550e8400-e29b-41d4-a716-446655440002",
    "kurir_email": "kurir@binus.ac.id",
    "to_location": "13th floor room 2",
    "item_desc": "Chicken rice from canteen",
    "item_price": 25000,
    "receipt_image_url": "data:image/jpeg;base64,...",
    "delivery_fee": 5000,
    "status": "PRICED",
    "createdAt": "2026-05-25T10:05:00.000Z"
  }
}
```

Errors:

- `401` missing or invalid auth
- `403` authenticated user is not a participant
- `404` order not found

### `POST /orders/{id}/accept`

Assigns the authenticated user as kurir for a pending order.

Auth: required

Allowed state: `PENDING`

Allowed actor: any authenticated user except the buyer.

Response `200`:

```json
{
  "message": "Order accepted successfully",
  "order": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "buyer_id": "550e8400-e29b-41d4-a716-446655440001",
    "buyer_email": "buyer@binus.ac.id",
    "kurir_id": "550e8400-e29b-41d4-a716-446655440002",
    "kurir_email": "kurir@binus.ac.id",
    "to_location": "13th floor room 2",
    "item_desc": "Chicken rice from canteen",
    "item_price": null,
    "receipt_image_url": null,
    "delivery_fee": 5000,
    "status": "ACCEPTED",
    "createdAt": "2026-05-25T10:05:00.000Z"
  }
}
```

Realtime:

- Emits `order_status_changed` to `room_order_<id>` if clients have already joined that room.

Errors:

- `400` order is not `PENDING`, or it was accepted by someone else first
- `401` missing or invalid auth
- `403` buyer tried to accept their own order
- `404` order not found

### `POST /orders/{id}/price`

Uploads the final item price for an accepted order.

Auth: required

Allowed state: `ACCEPTED`

Allowed actor: assigned kurir only

Request:

```json
{
  "item_price": 25000,
  "receipt_image_url": "data:image/jpeg;base64,..."
}
```

Validation:

- `item_price` must be a positive number.
- `receipt_image_url` is optional.

Response `200`:

```json
{
  "message": "Price updated successfully",
  "order": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "buyer_id": "550e8400-e29b-41d4-a716-446655440001",
    "buyer_email": "buyer@binus.ac.id",
    "kurir_id": "550e8400-e29b-41d4-a716-446655440002",
    "kurir_email": "kurir@binus.ac.id",
    "to_location": "13th floor room 2",
    "item_desc": "Chicken rice from canteen",
    "item_price": 25000,
    "receipt_image_url": "data:image/jpeg;base64,...",
    "delivery_fee": 5000,
    "status": "PRICED",
    "createdAt": "2026-05-25T10:05:00.000Z"
  }
}
```

Frontend actions:

- Buyer UI should show item price, delivery fee, total, and payment action.
- Total due is `item_price + delivery_fee`.

Realtime:

- Emits `order_status_changed`.

Errors:

- `400` invalid body or action not allowed in current state
- `401` missing or invalid auth
- `403` user is not the assigned kurir
- `404` order not found

### `POST /orders/{id}/pay`

Pays for a priced order and generates the buyer security code.

Auth: required

Allowed state: `PRICED`

Allowed actor: buyer only

Balance behavior:

- Deducts `item_price + delivery_fee` from buyer balance.
- Creates a `PAYMENT` transaction.
- Fails if buyer balance is insufficient.

Response `200`:

```json
{
  "message": "Payment successful",
  "security_code": "123456",
  "order": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "buyer_id": "550e8400-e29b-41d4-a716-446655440001",
    "buyer_email": "buyer@binus.ac.id",
    "kurir_id": "550e8400-e29b-41d4-a716-446655440002",
    "kurir_email": "kurir@binus.ac.id",
    "to_location": "13th floor room 2",
    "item_desc": "Chicken rice from canteen",
    "item_price": 25000,
    "receipt_image_url": "data:image/jpeg;base64,...",
    "delivery_fee": 5000,
    "status": "PAID",
    "createdAt": "2026-05-25T10:05:00.000Z"
  }
}
```

Critical frontend note:

- `security_code` is only returned by this route.
- There is no route to fetch it again.
- Store it in local state and show it prominently to the buyer until the order is completed.

Realtime:

- Emits `order_status_changed`.

Errors:

- `400` order is not `PRICED`, action not allowed, or insufficient balance
- `401` missing or invalid auth
- `403` user is not the buyer
- `404` order not found

### `POST /orders/{id}/complete`

Completes delivery after the kurir submits the buyer's security code.

Auth: required

Allowed state: `PAID`

Allowed actor: assigned kurir only

Request:

```json
{
  "security_code": "123456"
}
```

Balance behavior:

- Credits `item_price + delivery_fee` to the kurir balance.
- Creates an `EARNING` transaction.

Response `200`:

```json
{
  "message": "Order completed successfully",
  "order": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "buyer_id": "550e8400-e29b-41d4-a716-446655440001",
    "buyer_email": "buyer@binus.ac.id",
    "kurir_id": "550e8400-e29b-41d4-a716-446655440002",
    "kurir_email": "kurir@binus.ac.id",
    "to_location": "13th floor room 2",
    "item_desc": "Chicken rice from canteen",
    "item_price": 25000,
    "receipt_image_url": "data:image/jpeg;base64,...",
    "delivery_fee": 5000,
    "status": "COMPLETED",
    "createdAt": "2026-05-25T10:05:00.000Z"
  }
}
```

Realtime:

- Emits `order_status_changed`.

Errors:

- `400` order is not `PAID`, action not allowed, or security code is invalid
- `401` missing or invalid auth
- `403` user is not the assigned kurir
- `404` order not found

### `POST /orders/{id}/cancel`

Cancels or releases an order before payment.

Auth: required

Allowed states and actors:

| Current status | Buyer behavior | Kurir behavior |
| --- | --- | --- |
| `PENDING` | Marks order `CANCELLED` | Not allowed because no assigned kurir exists |
| `ACCEPTED` | Marks order `CANCELLED` | Releases assignment and returns order to `PENDING` |
| `PRICED` | Marks order `CANCELLED` | Releases assignment, clears price/receipt, and returns order to `PENDING` |
| `PAID` | Not allowed | Not allowed |
| `COMPLETED` | Not allowed | Not allowed |
| `CANCELLED` | Not allowed | Not allowed |

Buyer cancellation response `200`:

```json
{
  "message": "Order cancelled successfully",
  "order": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "CANCELLED"
  }
}
```

Kurir release response `200`:

```json
{
  "message": "Order returned to available pool",
  "order": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "kurir_id": null,
    "kurir_email": null,
    "item_price": null,
    "receipt_image_url": null,
    "status": "PENDING"
  }
}
```

The examples above are abbreviated. Real responses return the full `OrderDTO`.

Realtime:

- Emits `order_status_changed`.

Errors:

- `400` current status does not allow cancellation
- `401` missing or invalid auth
- `403` user is not allowed to cancel/release this order
- `404` order not found

### `GET /orders/{id}/messages`

Loads historical chat messages for an order.

Auth: required

Authorization: user must be the buyer or assigned kurir.

Ordering: oldest first by `createdAt`.

Response `200`:

```json
{
  "messages": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "order_id": "550e8400-e29b-41d4-a716-446655440000",
      "sender_id": "550e8400-e29b-41d4-a716-446655440001",
      "content": "Hi, please buy extra sambal.",
      "timestamp": "2026-05-25T10:11:00.000Z"
    }
  ]
}
```

Errors:

- `401` missing or invalid auth
- `403` user is not a participant
- `404` order not found

## Transaction Routes

All `/transactions` routes require auth.

### `GET /transactions/history`

Lists wallet transactions for the authenticated user.

Auth: required

Ordering: newest first by `createdAt`.

Response `200`:

```json
{
  "transactions": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440020",
      "type": "DEPOSIT",
      "amount": 100000,
      "createdAt": "2026-05-25T09:00:00.000Z"
    }
  ],
  "total": 1
}
```

Errors:

- `401` missing or invalid auth

### `POST /transactions/deposit`

Mock top-up endpoint. It immediately credits the authenticated user's balance.

Auth: required

Request:

```json
{
  "amount": 100000
}
```

Validation:

- `amount` must be a positive number.

Response `200`:

```json
{
  "message": "Deposit successful",
  "transaction": {
    "id": "550e8400-e29b-41d4-a716-446655440020",
    "type": "DEPOSIT",
    "amount": 100000,
    "createdAt": "2026-05-25T09:00:00.000Z"
  },
  "new_balance": 150000
}
```

Frontend actions:

- Update displayed balance with `new_balance` or refetch `/auth/me`.
- Add/refetch transaction history.

Errors:

- `400` invalid amount
- `401` missing or invalid auth

## Socket.io Chat

Namespace: `/chat`

Authentication:

```ts
const socket = io("http://localhost:3000/chat", {
  withCredentials: true,
});
```

### Client emits `join_room`

Joins the order room after the server verifies the socket user is a participant.

Payload:

```json
{
  "order_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

Success event from server: `room_joined`

```json
{
  "order_id": "550e8400-e29b-41d4-a716-446655440000",
  "room": "room_order_550e8400-e29b-41d4-a716-446655440000"
}
```

Error event from server: `error`

```json
{
  "message": "You are not a participant in this order"
}
```

### Client emits `send_message`

Persists and broadcasts a chat message to everyone in the room, including the sender.

Payload:

```json
{
  "order_id": "550e8400-e29b-41d4-a716-446655440000",
  "content": "I'm on my way."
}
```

Server broadcasts: `receive_message`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440010",
  "order_id": "550e8400-e29b-41d4-a716-446655440000",
  "sender_id": "550e8400-e29b-41d4-a716-446655440002",
  "content": "I'm on my way.",
  "timestamp": "2026-05-25T10:11:00.000Z"
}
```

### Server emits `order_status_changed`

The server emits this event to the order room after these REST mutations:

- `POST /orders/{id}/accept`
- `POST /orders/{id}/price`
- `POST /orders/{id}/pay`
- `POST /orders/{id}/complete`
- `POST /orders/{id}/cancel`

Payload:

```json
{
  "order": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "PAID"
  }
}
```

The example is abbreviated. Real payload includes the full `OrderDTO`.

Recommended frontend flow:

1. Fetch order detail with `GET /orders/{id}`.
2. Fetch chat history with `GET /orders/{id}/messages`.
3. Connect to `/chat` with `withCredentials: true`.
4. Emit `join_room`.
5. Listen for `receive_message`.
6. Listen for `order_status_changed` and replace the local order state with `payload.order`.
7. Remove listeners and disconnect when leaving the chat/order screen.

## Order State and Action Matrix

| Status | Valid action | Route | Actor | Next status |
| --- | --- | --- | --- | --- |
| `PENDING` | Create | `POST /orders` | Buyer | `PENDING` |
| `PENDING` | Accept | `POST /orders/{id}/accept` | Kurir, not buyer | `ACCEPTED` |
| `PENDING` | Cancel | `POST /orders/{id}/cancel` | Buyer | `CANCELLED` |
| `ACCEPTED` | Upload price | `POST /orders/{id}/price` | Assigned kurir | `PRICED` |
| `ACCEPTED` | Cancel | `POST /orders/{id}/cancel` | Buyer | `CANCELLED` |
| `ACCEPTED` | Release | `POST /orders/{id}/cancel` | Assigned kurir | `PENDING` |
| `PRICED` | Pay | `POST /orders/{id}/pay` | Buyer | `PAID` |
| `PRICED` | Cancel | `POST /orders/{id}/cancel` | Buyer | `CANCELLED` |
| `PRICED` | Release | `POST /orders/{id}/cancel` | Assigned kurir | `PENDING` |
| `PAID` | Complete | `POST /orders/{id}/complete` | Assigned kurir | `COMPLETED` |

There is no backend cancellation/refund route after `PAID`.

## Frontend Implementation Notes

- Configure `VITE_API_BASE_URL=http://localhost:3000` for the React app when using `beeTip/src/services/api.ts`.
- Use `credentials: "include"` for every REST request so the backend auth cookie is sent.
- Send JSON bodies with `Content-Type: application/json`.
- Treat all money fields as numbers in the frontend, but format them as Rupiah for display.
- `GET /orders/available` has no pagination or search. Apply client-side filtering/search for now.
- `GET /orders/my` returns both buyer and kurir orders. Split them in UI by comparing `buyer_id` and `kurir_id` with `currentUser.id`.
- Hide self-owned orders from the kurir available feed.
- After `deposit`, `pay`, and `complete`, refresh `/auth/me` if the current user's balance is visible.
- After any order mutation, use the returned `order` as the immediate source of truth, then allow `order_status_changed` events to update other open screens.
- The backend does not currently provide routes for profile updates, role persistence, file upload storage, ratings, disputes, password reset, order edits, or order deletion.
