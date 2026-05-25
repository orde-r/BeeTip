# Chat System Use Case

The chat system is primarily managed via WebSockets (Socket.io) for real-time bidirectional communication. However, a REST endpoint is provided to fetch historical messages.

## REST Endpoint

### GET `/orders/:id/messages`

Fetches historical chat messages for a specific order.

**REQUIRES AUTHENTICATED USER (MUST BE BUYER OR KURIR FOR THE ORDER)**

#### Request

No body required. Query parameters can be used for pagination.

#### Response

```json
{
    "messages": [
        {
            "id": "msg-uuid-1",
            "order_id": "order-uuid-1",
            "sender_id": "user-uuid",
            "content": "Hi, I'm on my way!",
            "timestamp": "2026-05-25T10:11:00Z"
        }
    ]
}
```

#### Failure Responses

| Status | Condition |
|--------|-----------|
| `401` | Missing or invalid authentication. |
| `403` | User is neither the Buyer nor the Kurir for this order. |
| `404` | Order not found. |

## Socket.io Events

### `join_room`

* **Direction:** Client -> Server
* **Payload:** `{ "order_id": "order-uuid-1" }`
* **Action:** Server authenticates socket. If authorized (user is Buyer or Kurir), adds socket to `room_order_<order_id>`.

### `send_message`

* **Direction:** Client -> Server
* **Payload:** `{ "order_id": "order-uuid-1", "content": "I am waiting at the lobby." }`
* **Action:** Server persists message to the `MESSAGES` table, then broadcasts `receive_message` to `room_order_<order_id>`.

### `receive_message`

* **Direction:** Server -> Client
* **Payload:** 
  ```json
  {
      "id": "msg-uuid-2",
      "order_id": "order-uuid-1",
      "sender_id": "buyer-uuid",
      "content": "I am waiting at the lobby.",
      "timestamp": "2026-05-25T10:25:00Z"
  }
  ```
