# BeeTip App Specification

Source documents:

- [`NEW_FLOW.md`](./NEW_FLOW.md)
- [`backend_routes.md`](./backend_routes.md)
- [`DESIGN.md`](./DESIGN.md)

Last updated: 2026-05-31

This file is the consolidated app specification and replaces the older product-description docs.

## Product Definition

BeeTip is a mobile-first BINUS campus proxy buying app. A Buyer requests an item from campus shops or canteens, a Kurir accepts the request, buys the item, submits the price, and delivers it. Payment uses a mock wallet balance. Delivery is completed when the Kurir enters the Buyer's one-time security code.

One account can use both Buyer and Kurir features. There is no role toggle in the frontend: Buyer Home is the Buyer context and Kurir Home is the Kurir context.

## Backend Support Summary

The backend supports the core product flow:

- auth: register, login, current user, logout;
- orders: create, list mine, list available, detail, accept, price, pay, complete, cancel/release;
- wallet: deposit and transaction history;
- chat: per-order message history and Socket.io realtime rooms;
- lifecycle: `PENDING -> ACCEPTED -> PRICED -> PAID -> COMPLETED`, with cancellation/release before payment.

Known backend gaps the frontend must design around:

- no profile edit route;
- no file upload storage route for receipts;
- no standalone chat inbox/history endpoint;
- no post-payment cancellation/refund route;
- `security_code` is returned only once by `POST /orders/{id}/pay`.

## App Shell And Navigation

Protected app navigation has five main pages:

| Page | Route | Purpose |
| --- | --- | --- |
| Buyer Home | `/home` | Buyer dashboard, active buyer order, create order, and recent buyer orders. |
| Kurir Home | `/kurir` | Kurir dashboard, active delivery, available order feed, and recent kurir orders. |
| Wallet | `/wallet` | Balance, mock top-up, transaction history. |
| Chat | `/chats` | Chat inbox derived from the user's orders. |
| Profile | `/profile` | User info, balance, logout. |

Child routes:

- `/onboarding`
- `/auth`
- `/orders/new`
- `/orders/:id`
- `/orders/:id/chat`
- `/orders/:id/payment`
- `/kurir/orders`
- `/kurir/orders/:id/security`

Auth entry behavior:

- Unauthenticated users can access onboarding and auth only.
- After login, enter the protected app shell at `/wallet`.
- Buyer Home and Kurir Home are separate main navigation pages and define the current Buyer/Kurir context.

## Data Models

### User

```ts
type UserDTO = {
  id: string
  email: string
  balance: number
  current_role: string
  createdAt?: string
}
```

Frontend rules:

- Use `GET /auth/me` to bootstrap and refresh user data.
- Ignore `current_role` for navigation and UI context. Buyer/Kurir context is route-defined.
- Refresh user after deposit, pay, and complete.

### Order

```ts
type OrderDTO = {
  id: string
  buyer_id: string
  buyer_email: string | null
  kurir_id: string | null
  kurir_email: string | null
  to_location: string
  item_desc: string
  item_price: number | null
  receipt_image_url: string | null
  delivery_fee: number
  status: 'PENDING' | 'ACCEPTED' | 'PRICED' | 'PAID' | 'COMPLETED' | 'CANCELLED'
  createdAt: string
}
```

Frontend rules:

- Fixed delivery fee is `Rp 5.000`.
- Hide self-owned orders from the Kurir available pool.
- Split `/orders/my` into Buyer orders and Kurir orders by comparing `buyer_id` and `kurir_id` with the current user id.

### Transaction

```ts
type TransactionDTO = {
  id: string
  type: 'DEPOSIT' | 'PAYMENT' | 'EARNING' | string
  amount: number
  createdAt: string
}
```

### Message

```ts
type MessageDTO = {
  id: string
  order_id: string
  sender_id: string
  content: string
  timestamp: string
}
```

## Global Requirements

- Use the visual system in [`DESIGN.md`](./DESIGN.md).
- Build mobile-first for a `390px` target viewport.
- Use reusable components for layout, buttons, forms, status chips, order cards, price breakdowns, chat, and wallet rows.
- Use a single global Rupiah formatter for all money display.
- Amount inputs should format or validate as Rupiah but submit numeric values to the backend.
- Drive order screens from `order.status` and the current actor.
- Show loading, empty, and error states for every backend-driven page.
- Do not expose actions that the backend will reject unless the UI is handling a race condition gracefully.

## Authentication

Pages:

- `/onboarding`
- `/auth`

Auth screen:

- login mode: email, password, Login button, Register link;
- register mode: email, password, confirm password, Register button, Login link.

Backend:

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/logout`

Implementation note:

- Auth is backend-managed through the `accessToken` cookie.
- REST requests must use `credentials: "include"` so the cookie is sent.
- The frontend stores user/session state only, not the token.
- Socket.io connects to `/chat` with `withCredentials: true`.

## Buyer Home

Route:

- `/home`

Requirements:

- Act as the Buyer context.
- Show current active Buyer order, or an empty "No active order" state.
- Show Create New Order button.
- Show recent Buyer orders.
- Tapping an order opens `/orders/:id`.

Backend:

- `GET /auth/me`
- `GET /orders/my`, filtered by `buyer_id === currentUser.id`

Active Buyer order statuses:

- `PENDING`
- `ACCEPTED`
- `PRICED`
- `PAID`

## Kurir Home

Route:

- `/kurir`

Requirements:

- Act as the Kurir context.
- Show dashboard totals:
  - accepted/active deliveries;
  - completed deliveries;
  - earning total from `EARNING` transactions when available.
- Show current active Kurir delivery, or an empty "No active order" state.
- Show Accept New Order action that opens the Kurir Order List page.
- Show recent Kurir orders.
- Available order cards show item description, destination, and fixed `Rp 5.000` delivery fee.

Backend:

- `GET /auth/me`
- `GET /orders/available`, filtered to exclude self-owned orders
- `GET /orders/my`, filtered by `kurir_id === currentUser.id`
- `GET /transactions/history` when computing wallet-backed earning totals
- `POST /orders/{id}/accept`

Active Kurir order statuses:

- `ACCEPTED`
- `PRICED`
- `PAID`

## Kurir Order List

Route:

- `/kurir/orders`

Requirements:

- Act as the Kurir context.
- Show available order feed.
- Hide self-owned orders from the available pool.
- Available order cards show item description, destination, and fixed `Rp 5.000` delivery fee.
- Accepting an order calls the backend and then opens `/orders/:id`.

Backend:

- `GET /auth/me`
- `GET /orders/available`, filtered to exclude self-owned orders
- `POST /orders/{id}/accept`

## Create Order

Route:

- `/orders/new`

Fields:

- From Location -> frontend-only, encoded into `item_desc`
- To Location -> `to_location`
- Description -> encoded into `item_desc`

Requirements:

- Show fixed delivery fee `Rp 5.000`.
- Validate non-empty fields.
- Because the backend has no `from_location` field, submit `item_desc` as a combined text value containing the source location and description.
- Submit to backend.
- On success, open `/orders/:id` or return to Buyer Home with refreshed orders.

Backend:

- `POST /orders`

## Order Detail

Route:

- `/orders/:id`

Shared requirements:

- Show item description, destination, delivery fee, status chip, buyer/kurir identity when available, and chat shortcut when chat is allowed.
- Subscribe to realtime `order_status_changed` when the user is in the order context.
- Use returned order data as source of truth after each mutation.

Status behavior:

| Status | Buyer UI | Kurir UI |
| --- | --- | --- |
| `PENDING` | Waiting for Kurir, cancel action. | Usually shown only in available feed. |
| `ACCEPTED` | Kurir accepted, chat, cancel. | Chat, input item price, optional receipt URL/data URL, release. |
| `PRICED` | Item price, delivery fee, total, pay, chat, cancel. | Price submitted, chat, release. |
| `PAID` | Prominent locally saved security code displayed as a handoff code, chat. | Delivering state, security code entry, chat. |
| `COMPLETED` | Completed outcome summary with final total. | Completed outcome summary with earning basis. |
| `CANCELLED` | Cancelled outcome summary without payment metadata unless useful. | Cancelled outcome summary with last known total when available. |

Backend:

- `GET /orders/{id}`
- `POST /orders/{id}/price`
- `POST /orders/{id}/pay`
- `POST /orders/{id}/complete`
- `POST /orders/{id}/cancel`

Security code rule:

- `security_code` is only returned by `POST /orders/{id}/pay`.
- Store it immediately by order id in frontend state.
- In buyer-facing UI, label the displayed value as the handoff code while preserving the backend `security_code` name in API code.
- If the user refreshes and the code is lost, the frontend cannot fetch it again. Show a clear fallback message instead of pretending it is recoverable.

## Payment

Route:

- `/orders/:id/payment`

Requirements:

- Buyer-only.
- Available only when status is `PRICED`.
- Show item price, delivery fee, total, and current balance.
- If balance is insufficient, show top-up path to Wallet.
- On successful pay:
  - store returned `security_code`;
  - refresh user balance;
  - show security code prominently;
  - update local order to `PAID`.

Backend:

- `GET /orders/{id}`
- `POST /orders/{id}/pay`
- `GET /auth/me`

## Kurir Security Code Entry

Route:

- `/kurir/orders/:id/security`

Requirements:

- Assigned-Kurir only.
- Available only when status is `PAID`.
- Show order summary and code input.
- Submit security code to complete delivery.
- Show invalid-code error from backend.
- On success, refresh user balance and show completed state.

Backend:

- `GET /orders/{id}`
- `POST /orders/{id}/complete`
- `GET /auth/me`

## Chat

Routes:

- `/chats`
- `/orders/:id/chat`

Chat inbox requirements:

- Derive chat threads from `GET /orders/my`.
- Include active participant orders and historical orders with chat context.
- Show "No chat history" when there is no active or historical chat.
- Use muted styling for inactive chats:
  - `COMPLETED`;
  - `CANCELLED`;
  - any order not currently active.

Chat thread requirements:

- Fetch order detail.
- Fetch message history.
- Connect to Socket.io `/chat`.
- Join `room_order_<id>` through `join_room`.
- Send messages with `send_message`.
- Append incoming `receive_message`.
- Replace local order with `order_status_changed`.
- Disconnect and remove listeners on unmount.

Backend:

- `GET /orders/my`
- `GET /orders/{id}`
- `GET /orders/{id}/messages`
- Socket.io `/chat`

Backend limitation:

- There is no global chat history endpoint. The inbox is a frontend-derived view over orders.

## Wallet

Route:

- `/wallet`

Requirements:

- Show current balance.
- Show top-up form.
- Show transaction history.
- Format all amounts with the global Rupiah formatter.
- Deposits and earnings use positive/success styling.
- Payments use debit/danger styling.
- After top-up, update displayed balance and refresh transaction history.

Backend:

- `GET /auth/me`
- `GET /transactions/history`
- `POST /transactions/deposit`

## Profile

Route:

- `/profile`

Requirements:

- Show user name parsing from email
- Show user email.
- Show current balance.
- Show Logout button.
- Do not show internal user identifiers or profile editing controls.

Backend:

- `GET /auth/me`
- `POST /auth/logout`

Logout behavior:

- Call backend logout when possible.
- Always clear local frontend auth/session state after logout.

## Order Lifecycle

```text
PENDING -> ACCEPTED -> PRICED -> PAID -> COMPLETED
PENDING -> CANCELLED
ACCEPTED -> CANCELLED
PRICED -> CANCELLED
ACCEPTED -> PENDING when assigned Kurir releases
PRICED -> PENDING when assigned Kurir releases
```

Action matrix:

| Status | Action | Actor | Backend route | Next status |
| --- | --- | --- | --- | --- |
| `PENDING` | Accept | Non-buyer Kurir | `POST /orders/{id}/accept` | `ACCEPTED` |
| `PENDING` | Cancel | Buyer | `POST /orders/{id}/cancel` | `CANCELLED` |
| `ACCEPTED` | Upload price | Assigned Kurir | `POST /orders/{id}/price` | `PRICED` |
| `ACCEPTED` | Cancel | Buyer | `POST /orders/{id}/cancel` | `CANCELLED` |
| `ACCEPTED` | Release | Assigned Kurir | `POST /orders/{id}/cancel` | `PENDING` |
| `PRICED` | Pay | Buyer | `POST /orders/{id}/pay` | `PAID` |
| `PRICED` | Cancel | Buyer | `POST /orders/{id}/cancel` | `CANCELLED` |
| `PRICED` | Release | Assigned Kurir | `POST /orders/{id}/cancel` | `PENDING` |
| `PAID` | Complete | Assigned Kurir | `POST /orders/{id}/complete` | `COMPLETED` |

No UI should offer cancellation after `PAID`.

## Required Shared Components

- `MobileScreenFrame`
- `PageShell`
- `AppTopBar`
- `VelocityBottomNav`
- `BalanceSummary`
- `ActionButton`
- `StatusChip`
- `OrderCard`
- `OrderListSection`
- `RouteSummary`
- `PriceBreakdown`
- `PriceInputPanel`
- `SecurityCodePanel`
- `OrderStateRenderer`
- `ChatPreview`
- `ChatThread`
- `ChatBubble`
- `ChatComposer`
- `TransactionList`
- `AuthFormShell`
- `FormField`
- `Notice`

## Definition Of Done

- Five main pages exist: Buyer Home, Kurir Home, Wallet, Chat, Profile.
- Buyer Home and Kurir Home are separate main navigation destinations.
- User cannot accept their own order from the UI.
- Buyer and Kurir active-order sections have explicit empty states.
- All statuses render intentionally in order detail.
- Security code is saved and shown after pay.
- Chat inbox handles no history, active chats, and inactive chats.
- Wallet uses one global currency formatter for display and input behavior.
- Backend-supported actions match [`backend_routes.md`](./backend_routes.md).
- Unsupported backend features are not represented as working features.
- App follows [`DESIGN.md`](./DESIGN.md) and remains mobile-first.
