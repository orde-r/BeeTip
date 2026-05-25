# Accept Order Use Case

A User (acting as a Kurir) accepts a `PENDING` order from the public pool.

This locks the order to that Kurir and changes the status to `ACCEPTED`. It also establishes the prerequisites for the chat room.

## Flow

1. Kurir selects an order from the feed and clicks "Accept".
2. The server verifies the order is still `PENDING`.
3. The server updates the order, setting `kurir_id` to the current user's ID and `status` to `ACCEPTED`.
4. The system prepares the Socket.io chat room (`room_order_<id>`).

## Endpoints

### POST `/orders/:id/accept`

**REQUIRES AUTHENTICATED USER**

#### Request

* `id` (path parameter): The UUID of the order to accept.
* No body required.

#### Response

```json
{
    "message": "Order accepted successfully",
    "order": {
        "id": "order-uuid-1",
        "buyer_id": "buyer-uuid",
        "kurir_id": "kurir-uuid",
        "to_location": "13th floor room 2",
        "item_desc": "Chicken rice from canteen",
        "status": "ACCEPTED",
        "updatedAt": "2026-05-25T10:10:00Z"
    }
}
```

#### Failure Responses

| Status | Condition |
|--------|-----------|
| `400` | Order is not in `PENDING` state (already accepted by someone else). |
| `401` | Missing or invalid authentication. |
| `403` | User is attempting to accept their own order. |
| `404` | Order not found. |
