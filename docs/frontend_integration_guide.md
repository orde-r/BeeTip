# Frontend Integration Guide for BeeTip

This guide outlines the recommended approach for integrating a frontend application (React, Flutter, etc.) with the BeeTip API. 

The API uses **Functional Route-Based Architecture** and relies heavily on a **State Machine** for order lifecycles and **WebSockets (Socket.io)** for real-time chat.

---

## 1. Authentication (JWT)

All protected routes require a JWT token passed in the `Authorization` header.

*   **Login Endpoint**: `POST /auth/login`
*   **Storage**: Store the `accessToken` returned from login securely (e.g., Secure Storage, HttpOnly cookies if SSR, or local storage).
*   **Header Format**: `Authorization: Bearer <your_token_here>`

> [!WARNING]
> WebSockets also require authentication! When initializing the Socket.io client, you must pass the token in the `auth` payload:
> ```javascript
> const socket = io("ws://localhost:3000/chat", {
>   auth: { token: "your_jwt_token" }
> });
> ```

---

## 2. Managing the Order State Machine

Orders follow a strict State Pattern. The frontend UI should be completely driven by the `status` field of an order. 

**State Flow:** `PENDING` -> `ACCEPTED` -> `PRICED` -> `PAID` -> `COMPLETED`

### Recommended UI Approach:
Instead of trying to calculate what the user should see, use a `switch` statement based on the order's current `status` and the user's `role` (Buyer vs Kurir) to render the correct component.

| Status | Buyer UI | Kurir UI |
| :--- | :--- | :--- |
| `PENDING` | Waiting screen, Cancel button. | "Accept Order" button. |
| `ACCEPTED` | Chat screen. Waiting for Kurir to upload price. | Chat screen. Form to input `item_price` and submit. |
| `PRICED` | Chat screen. "Pay Order" button (displays amount). | Chat screen. Waiting for Buyer to pay. |
| `PAID` | Chat screen. **Displays Security Code**. | Chat screen. Input field to enter Buyer's security code to complete order. |
| `COMPLETED`| Order history view. | Order history view. |

> [!IMPORTANT]
> **The Security Code**: When the Buyer calls `POST /orders/{id}/pay`, the response includes a `security_code` at the root of the JSON response. **You must save this code to your frontend state (e.g., Redux, Context, local storage)** so the Buyer can see it and show it to the Kurir! The backend does not provide an endpoint to fetch this code again for security reasons.

---

## 3. Real-Time Chat (Socket.io)

The chat is strictly room-based per order. 

### Integration Flow:
1.  **Initialize**: Connect to `ws://localhost:3000/chat` using the JWT token (see Auth section).
2.  **Join Room**: Immediately emit a `join_room` event when the chat screen mounts.
    ```javascript
    socket.emit("join_room", { order_id: currentOrderId });
    ```
3.  **Fetch History**: While joining the room, fetch the historical messages via the REST endpoint `GET /orders/{id}/messages` and populate your UI.
4.  **Listen**: Set up a listener for `receive_message`. Append any incoming messages to your chat UI state.
    ```javascript
    socket.on("receive_message", (message) => {
      setMessages(prev => [...prev, message]);
    });
    ```
5.  **Send**: When the user types a message, emit it to the server.
    ```javascript
    socket.emit("send_message", { 
      order_id: currentOrderId, 
      content: textInput 
    });
    ```
6.  **Cleanup**: Always remove listeners and emit a `disconnect` or leave event when the chat component unmounts.

---

## 4. Financials & Balances

The API includes a mock payment system. 

*   Before testing the order flow, ensure the Buyer uses `POST /transactions/deposit` to add funds to their wallet.
*   If `POST /orders/{id}/pay` fails with a `400 Bad Request`, check if the error is "Insufficient balance" and prompt the user to top up.
*   The Kurir's balance will automatically increase when they successfully hit `POST /orders/{id}/complete` using the correct security code. Use `GET /auth/me` to refresh the user's current balance in the header/profile UI.

---

## 5. API Documentation

Always refer to the OpenAPI/Swagger documentation for the exact shapes of request bodies and responses.
*   **Swagger UI URL**: `http://localhost:3000/doc`.
