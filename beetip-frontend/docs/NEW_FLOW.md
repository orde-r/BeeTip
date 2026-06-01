# BeeTip New Flow

Source documents:

- [`backend_routes.md`](./backend_routes.md)
- [`DESIGN.md`](./DESIGN.md)

Last synced: 2026-05-31

This file consolidates the older product-flow notes and integration guidance.

## Product Flow Summary

BeeTip is a BINUS campus proxy buying app. A Buyer creates an order, a Kurir accepts it, both users chat, the Kurir submits the item price, the Buyer pays from wallet balance, and the Kurir completes delivery by entering the Buyer's security code.

One account can act as both Buyer and Kurir. There is no role toggle: Buyer Home is the Buyer context and Kurir Home is the Kurir context.

## Navigation

Use a protected app shell with five main pages:

| Page | Behavior |
| --- | --- |
| Buyer Home | Buyer dashboard with active buyer order, create order, and recent buyer orders. |
| Kurir Home | Kurir dashboard totals, active delivery, Accept New Order action, and recent kurir orders. |
| Wallet | Balance, mock top-up, transaction history, global currency formatting. |
| Chat | Inbox-style list derived from orders and message history. |
| Profile | User email, balance, logout. |

Important navigation rules:

- Register and login are public.
- After login, enter the protected app shell at Wallet.
- Buyer Home and Kurir Home are separate main pages.
- The current page defines Buyer/Kurir context: `/home` is Buyer and `/kurir` is Kurir.
- Create Order, Accept Order, Order Detail, Payment, Security Code Entry, and Chat Thread are child screens opened from the main tabs.

## Buyer Flow

1. Buyer registers or logs in.
2. Buyer opens Buyer Home.
3. Buyer Home shows:
   - current active order, or "No active order" when none exists;
   - Create New Order button;
   - recent buyer orders;
   - loading, error, retry, and empty states while dashboard data is fetched.
4. Buyer creates a new order with:
   - From Location, encoded into `item_desc`;
   - To Location -> `to_location`;
   - Description, encoded into `item_desc`;
   - fixed `Rp 5.000` delivery fee shown before submit.
   The backend currently has no `from_location` field, so the frontend combines From Location and Description into the submitted `item_desc`.
5. Backend creates the order as `PENDING`.
6. Buyer waits for a Kurir. Buyer may cancel while the order is unpaid.
7. When a Kurir accepts, order becomes `ACCEPTED` and chat becomes available.
8. Buyer and Kurir chat about details.
9. Kurir submits final item price and optional receipt URL/data URL.
10. Order becomes `PRICED`.
11. Buyer sees:
   - item price;
   - delivery fee;
   - total;
   - Confirm & Pay button.
12. Buyer pays from wallet balance.
13. Order becomes `PAID`.
14. Backend returns `security_code` once. The frontend must save it and show it prominently as the handoff code.
15. Buyer gives the handoff code to the Kurir only after receiving the delivered item.
16. When Kurir completes the order, Buyer sees `COMPLETED`.

Buyer restriction:

- A user must not be allowed to accept their own order. Hide self-owned orders in Kurir available order lists and handle backend `403` if it still happens.

## Kurir Flow

1. Kurir registers or logs in.
2. Kurir opens Kurir Home.
3. Kurir Home shows:
   - dashboard totals for accepted/completed orders and earnings;
   - current active delivery, or "No active order" when none exists;
   - Accept New Order button/feed;
   - recent kurir orders.
4. Kurir opens the available order pool.
5. Available pool shows backend `PENDING` orders, excluding orders where `buyer_id === currentUser.id`.
6. Kurir accepts an order.
7. Backend changes status to `ACCEPTED` and assigns `kurir_id`.
8. Chat becomes available between Buyer and assigned Kurir.
9. Kurir buys the requested item.
10. Kurir submits the item price with optional receipt.
11. Backend changes status to `PRICED`.
12. Kurir waits for Buyer payment.
13. After Buyer pays, backend changes status to `PAID`.
14. Kurir delivers the item and asks Buyer for the security code.
15. Kurir enters the security code.
16. Backend verifies the code, changes status to `COMPLETED`, and credits the Kurir balance.

Kurir release rule:

- Before payment, assigned Kurir can call the cancel route to release the order back to `PENDING`. This applies in `ACCEPTED` and `PRICED`.

## Order Status Flow

```text
PENDING -> ACCEPTED -> PRICED -> PAID -> COMPLETED
PENDING -> CANCELLED by Buyer
ACCEPTED -> CANCELLED by Buyer
PRICED -> CANCELLED by Buyer
ACCEPTED -> PENDING when assigned Kurir releases
PRICED -> PENDING when assigned Kurir releases
```

No backend route currently supports cancellation or refund after `PAID`.

## Status Meaning

| Status | Meaning | Primary UI |
| --- | --- | --- |
| `PENDING` | Buyer created order; no Kurir assigned. | Buyer waiting state, Kurir available pool. |
| `ACCEPTED` | Kurir assigned; chat available. | Chat, Kurir price input. |
| `PRICED` | Kurir submitted item price. | Buyer payment screen, Kurir waiting state. |
| `PAID` | Buyer paid and received the one-time code. | Buyer handoff code, Kurir security-code entry. |
| `COMPLETED` | Kurir entered valid code and got paid. | Completed outcome summary and transaction update. |
| `CANCELLED` | Buyer cancelled before payment. | Muted outcome summary. |

## Wallet Flow

Wallet requirements:

- Show current balance from `GET /auth/me`.
- Show transaction history from `GET /transactions/history`.
- Support mock top-up through `POST /transactions/deposit`.
- Use one global Rupiah formatter for all balance, fee, item price, total, earning, and transaction labels.
- Use the same formatter behavior for amount inputs where practical, while sending numeric `amount` values to the backend.

Balance refresh rules:

- Refresh user after deposit.
- Refresh user after Buyer payment.
- Refresh user after Kurir completion.

## Chat Flow

Backend support:

- There is no standalone global chat-history endpoint.
- Chat history exists per order through `GET /orders/{id}/messages`.
- Realtime chat uses Socket.io namespace `/chat`.

Chat tab behavior:

- Use `GET /orders/my` to derive chat threads from orders where the user is Buyer or assigned Kurir.
- Include orders with an assigned Kurir or existing messages.
- For each opened thread, fetch `GET /orders/{id}/messages`.
- If there is no active chat and no previous chat thread, show "No chat history".
- Active order chats use normal styling.
- Completed, cancelled, or inactive order chats use inactive/muted styling.

Chat thread behavior:

1. Fetch order detail.
2. Fetch message history.
3. Connect to `/chat` with `withCredentials: true`.
4. Emit `join_room` with `order_id`.
5. Emit `send_message` for outgoing messages.
6. Listen for `receive_message`.
7. Listen for `order_status_changed`.
8. Clean up listeners on unmount.

## Backend Support Check

| Requirement | Backend support | Frontend note |
| --- | --- | --- |
| Register/login | Supported by `/auth/register`, `/auth/login`. | Backend stores auth in an HttpOnly cookie; frontend sends credentials and stores only user/session state. |
| Profile info | Supported by `/auth/me`. | No profile edit route. |
| Logout | Supported by `/auth/logout`. | Send credentials, then clear local auth state even if backend logout fails. |
| Buyer create order | Supported by `POST /orders`. | UI collects From Location, To Location, and Description; payload sends `to_location` plus combined `item_desc`. |
| Buyer own orders | Supported by `GET /orders/my`. | Filter by `buyer_id`. |
| Kurir available orders | Supported by `GET /orders/available`. | Hide self-owned orders in frontend. |
| Kurir active/recent orders | Supported by `GET /orders/my`. | Filter by `kurir_id`. |
| Accept order | Supported by `POST /orders/{id}/accept`. | Backend blocks self-accept with `403`. |
| Price order | Supported by `POST /orders/{id}/price`. | Receipt is URL/data URL text only; no file upload endpoint. |
| Pay order | Supported by `POST /orders/{id}/pay`. | Security code returned once. |
| Complete order | Supported by `POST /orders/{id}/complete`. | Assigned Kurir submits security code. |
| Cancel/release before payment | Supported by `POST /orders/{id}/cancel`. | No cancellation after `PAID`. |
| Wallet top-up/history | Supported by transaction routes. | Mock payment only. |
| Per-order chat history | Supported by `GET /orders/{id}/messages`. | No global chat inbox endpoint. |
| Realtime chat/status | Supported by Socket.io `/chat`. | Connect with `withCredentials: true`, then join per-order room. |
| Role persistence | Not used by frontend navigation. | Buyer/Kurir context is route-defined. |

## Design Principle

Respect [`DESIGN.md`](./DESIGN.md):

- Mobile-first portrait layout.
- Campus Velocity design tokens.
- Honey/orange CTA energy with campus blue for navigation and secondary actions.
- Clean, modern, friendly campus delivery tone.
- Use reusable components and avoid one-off page structures.
