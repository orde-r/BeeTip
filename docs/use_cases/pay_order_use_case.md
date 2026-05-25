# Pay Order Use Case

The Buyer confirms the uploaded price and pays for the order.

This triggers a database transaction that reduces the Buyer's balance by the total amount (`item_price` + fixed `5000` delivery fee). It generates a `security_code` visible only to the Buyer and transitions the status to `PAID`.

## Flow

1. Buyer sees that the order is `PRICED`.
2. Buyer clicks "Confirm & Pay".
3. Server checks if the Buyer has sufficient balance.
4. Server starts an ACID transaction:
   - Decreases Buyer's balance.
   - Creates a `PAYMENT` record in the Transactions table.
   - Generates a random 4-6 digit `security_code`.
   - Updates the order status to `PAID`.
5. Server returns success and provides the `security_code` to the Buyer.

## Endpoints

### POST `/orders/:id/pay`

**REQUIRES AUTHENTICATED USER (MUST BE THE BUYER)**

#### Request

* `id` (path parameter): The UUID of the order to pay for.
* No body required.

#### Response

```json
{
    "message": "Payment successful",
    "security_code": "123456",
    "order": {
        "id": "order-uuid-1",
        "status": "PAID",
        "updatedAt": "2026-05-25T10:20:00Z"
    }
}
```

#### Failure Responses

| Status | Condition |
|--------|-----------|
| `400` | Order is not in `PRICED` state, or insufficient balance. |
| `401` | Missing or invalid authentication. |
| `403` | User is not the Buyer for this order. |
| `404` | Order not found. |
