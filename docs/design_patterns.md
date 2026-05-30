These design patterns are used in the backend, following:

## Behavioral Patterns

### 1. State Pattern
**Reference:** https://refactoring.guru/design-patterns/state

**Where:** Order Lifecycle (`PENDING` -> `ACCEPTED` -> `PRICED` -> `PAID` -> `COMPLETED` / `CANCELLED`)

**Code:** `beetip-api/src/services/order-states.ts`

The Order entity behaves differently depending on its current status. Each state determines:
- Which actions are allowed (e.g., only `PENDING` orders can be accepted, only `PRICED` orders can be paid).
- Who is authorized to perform those actions (Buyer vs Kurir).
- What next status should be returned for the transition.

Instead of scattering `if (order.status === "PENDING")` checks across handlers, the transition map and `validateTransition()` function centralize the order state rules.

```typescript
// State-driven transition map
const orderTransitions = {
  PENDING: {
    accept: { nextState: "ACCEPTED", allowedRole: "KURIR" },
    cancel: { nextState: "CANCELLED", allowedRole: "BUYER" },
  },
  ACCEPTED: {
    price: { nextState: "PRICED", allowedRole: "KURIR" },
    cancel: { nextState: "CANCELLED", allowedRole: "BOTH" },
  },
  PRICED: {
    pay: { nextState: "PAID", allowedRole: "BUYER" },
    cancel: { nextState: "CANCELLED", allowedRole: "BOTH" },
  },
  PAID: {
    complete: { nextState: "COMPLETED", allowedRole: "KURIR" },
  },
} as const;
```

---

### 2. Observer Pattern
**Reference:** https://refactoring.guru/design-patterns/observer

**Where:** Chat System (Socket.io) and Order Status Notifications

**Code:** `beetip-api/src/socket.ts`

Socket.io rooms work as an Observer/Pub-Sub implementation. When a participant sends a message or an order status changes, all connected clients subscribed to the order room receive the event without the service needing to know each socket directly.

- **Subject:** The Socket.io room (`room_order_<id>`).
- **Observers:** The Buyer's and Kurir's connected sockets.
- **Events:** `receive_message` and `order_status_changed`.

```typescript
// Broadcasting a message to all observers in the room
chatNamespace.to(roomName).emit("receive_message", message);

// Notifying observers of an order status change
chatNamespaceRef?.to(`room_order_${order.id}`).emit("order_status_changed", {
  order,
});
```

---

### 3. Chain of Responsibility Pattern
**Reference:** https://refactoring.guru/design-patterns/chain-of-responsibility

**Where:** Hono Middleware Pipeline (Auth, Error Handling, Validation)

**Code:** `beetip-api/src/middlewares/auth.middleware.ts`, `beetip-api/src/index.ts`

Each incoming HTTP request passes through middleware handlers. A handler can process the request and pass it to the next handler, or stop the chain by throwing an error such as `UnauthorizedError`.

The request flow is: **Auth Middleware -> Route Handler -> `app.onError()` if an error is thrown**.

```typescript
// Auth middleware as a link in the chain
export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header("Authorization");
  let token: string | undefined;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  }

  if (!token) {
    // Short-circuits the chain and forwards control to app.onError()
    throw new UnauthorizedError("Missing or invalid Authorization header");
  }

  const payload = jwt.verify(token, JWT_SECRET) as UserPayload;
  // Attach data for downstream handlers
  c.set("user", payload);
  // Pass to the next handler in the chain
  await next();
};
```

---

### 4. Strategy Pattern
**Reference:** https://refactoring.guru/design-patterns/strategy

**Where:** Transaction Processing (Deposit, Payment, Earning)

**Code:** `beetip-api/src/services/transaction-strategies.ts`

The system processes multiple transaction types (`DEPOSIT`, `PAYMENT`, `EARNING`), and each type has different business logic. Instead of one large branching function, each transaction type is handled by a dedicated strategy function.

```typescript
// Transaction strategies selected by transaction type
export const transactionStrategies: Record<string, TransactionStrategy> = {
  DEPOSIT: async (tx, userId, amount) => {
    // Increase user balance, no order involved
    await increaseBalance(tx, userId, amount);
    return await createTransactionRecord(tx, userId, "DEPOSIT", amount);
  },

  PAYMENT: async (tx, userId, amount, orderId) => {
    // Decrease buyer balance after validating sufficient funds
    const [user] = await tx
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .for("update")
      .limit(1);

    if (!user || Number(user.balance) < amount) {
      throw new BadRequestError("Insufficient balance");
    }

    await decreaseBalance(tx, userId, amount);
    return await createTransactionRecord(tx, userId, "PAYMENT", amount, orderId);
  },

  EARNING: async (tx, userId, amount, orderId) => {
    // Increase kurir balance after order completion
    await increaseBalance(tx, userId, amount);
    return await createTransactionRecord(tx, userId, "EARNING", amount, orderId);
  },
};
```

---

## Creational Patterns

### 5. Factory Method Pattern
**Reference:** https://refactoring.guru/design-patterns/factory-method

**Where:** Custom Error Creation (`AppError` hierarchy)

**Code:** `beetip-api/src/errors/app-error.ts`, `beetip-api/src/errors/*.error.ts`

The global error handling system relies on a family of error objects that all share the same interface (`AppError`) but differ in their HTTP status codes and default messages.

This is a Factory Method pattern in the current codebase: each concrete error class creates a specific error type, and `app.onError()` handles all of them uniformly through the `AppError` abstraction.

```typescript
// AppError base and concrete HTTP error class
export abstract class AppError extends Error {
  public abstract readonly statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class BadRequestError extends AppError {
  public readonly statusCode = 400;

  constructor(message = "Bad Request") {
    super(message);
  }
}
```

```typescript
// Polymorphic error handling in app.onError()
app.onError((err, c) => {
  if (err instanceof AppError) {
    return c.json({ message: err.message }, err.statusCode as any);
  }

  console.error("Unhandled error:", err);
  return c.json({ message: "Internal Server Error" }, 500);
});
```

---

## Structural Patterns

### 6. Facade Pattern
**Reference:** https://refactoring.guru/design-patterns/facade

**Where:** Service Layer (Order Payment and Completion Flow)

**Code:** `beetip-api/src/services/order.service.ts`

The `payOrder()` and `completeOrder()` service functions act as facades over a complex subsystem involving order locking, state validation, balance updates, transaction records, security code validation/generation, and order status updates.

The route handler only calls a single service function, while the service hides the internal sequence behind a clean interface.

```typescript
// payOrder service as a Facade
export async function payOrder(orderId: string, buyerId: string) {
  return await db.transaction(async (tx) => {
    // 1. Fetch and lock the order
    const [row] = await tx
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, orderId))
      .for("update")
      .limit(1);

    // 2. Validate order state and actor permission
    const order = getOrderOrThrow(row);
    validateTransition(order.status, "pay", buyerId, order.buyerId, order.kurirId);
    const emails = await getParticipantEmails(order.buyerId, order.kurirId);

    // 3. Deduct buyer balance and create a PAYMENT transaction
    const totalAmount = Number(order.itemPrice!) + Number(order.deliveryFee);
    await executeTransaction(tx, "PAYMENT", buyerId, totalAmount, orderId);

    // 4. Generate the security code used for completion
    const securityCode = generateSecurityCode();

    // 5. Update order status
    const [updated] = await tx
      .update(ordersTable)
      .set({
        status: "PAID",
        securityCode,
        updatedAt: new Date(),
      })
      .where(eq(ordersTable.id, orderId))
      .returning();

    return {
      message: "Payment successful",
      security_code: securityCode,
      order: toOrderDTO(updated, emails.buyerEmail, emails.kurirEmail),
    };
  });
}
```
