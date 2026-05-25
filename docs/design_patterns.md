These design patterns should be implemented:

## Behavioral Patterns

### 1. State Pattern
**Reference:** https://refactoring.guru/design-patterns/state

**Where:** Order Lifecycle (`PENDING` → `ACCEPTED` → `PRICED` → `PAID` → `COMPLETED` / `CANCELLED`)

The Order entity behaves differently depending on its current status. Each state determines:
- Which actions are allowed (e.g., only `PENDING` orders can be accepted, only `PRICED` orders can be paid).
- Who is authorized to perform those actions (Buyer vs Kurir).
- What side effects occur on transition (e.g., balance deduction on `PAID`, security code generation).

Instead of scattering `if (order.status === 'PENDING')` checks across handlers, each state encapsulates its own transition logic and guards.

```typescript
// Example: State-driven transition map
const orderTransitions = {
  PENDING: {
    accept: { nextState: 'ACCEPTED', allowedRole: 'KURIR' },
    cancel: { nextState: 'CANCELLED', allowedRole: 'BUYER' },
  },
  ACCEPTED: {
    price:  { nextState: 'PRICED', allowedRole: 'KURIR' },
    cancel: { nextState: 'CANCELLED', allowedRole: 'BOTH' },
  },
  PRICED: {
    pay:    { nextState: 'PAID', allowedRole: 'BUYER' },
    cancel: { nextState: 'CANCELLED', allowedRole: 'BOTH' },
  },
  PAID: {
    complete: { nextState: 'COMPLETED', allowedRole: 'KURIR' },
  },
} as const;
```

---

### 2. Observer Pattern
**Reference:** https://refactoring.guru/design-patterns/observer

**Where:** Chat System (Socket.io) and Order Status Notifications

Socket.io is inherently an Observer (Pub/Sub) implementation. When a participant sends a message, all subscribers in the room receive the event without the sender needing to know who is listening.

- **Subject:** The Socket.io room (`room_order_<id>`).
- **Observers:** The Buyer's and Kurir's connected sockets.
- **Event:** `receive_message` broadcast when a new message is persisted.

This also applies to order status changes — when a Kurir accepts an order or uploads a price, the Buyer's client can be notified in real-time via a Socket.io event.

```typescript
// Example: Broadcasting a message to all observers in the room
io.to(`room_order_${orderId}`).emit('receive_message', {
  id: message.id,
  order_id: orderId,
  sender_id: senderId,
  content: content,
  timestamp: new Date().toISOString(),
});

// Example: Notifying observers of an order status change
io.to(`room_order_${orderId}`).emit('order_status_changed', {
  order_id: orderId,
  new_status: 'PRICED',
  item_price: 25000,
});
```

---

### 3. Chain of Responsibility Pattern
**Reference:** https://refactoring.guru/design-patterns/chain-of-responsibility

**Where:** Hono Middleware Pipeline (Auth, Error Handling, Validation)

Each incoming HTTP request passes through a chain of middleware handlers. Each handler in the chain either:
- Processes the request and passes it to the **next** handler, or
- Short-circuits the chain by returning a response (e.g., 401 Unauthorized).

The request flows through: **Auth Middleware → Route Handler → `app.onError()` (if thrown)**.

```typescript
// Example: Auth middleware as a link in the chain
const authMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    throw new UnauthorizedError('Missing token');  // short-circuits the chain
  }

  const payload = verifyJwt(token);
  c.set('user', payload);  // attach data for downstream handlers
  await next();             // pass to the next handler in the chain
});

// Applying the chain to protected routes
app.use('/orders/*', authMiddleware);
app.use('/transactions/*', authMiddleware);
```

---

### 4. Strategy Pattern
**Reference:** https://refactoring.guru/design-patterns/strategy

**Where:** Transaction Processing (Deposit, Payment, Earning)

The system processes multiple types of financial transactions (`DEPOSIT`, `PAYMENT`, `EARNING`), each with different business logic (who gets debited/credited, validation rules). Instead of a monolithic function with branching logic, each transaction type can be handled by a dedicated strategy.

```typescript
// Example: Transaction strategies
type TransactionStrategy = (
  db: DrizzleDB,
  userId: string,
  amount: number,
  orderId?: string
) => Promise<TransactionResult>;

const transactionStrategies: Record<string, TransactionStrategy> = {
  DEPOSIT: async (db, userId, amount) => {
    // Increase user balance, no order involved
    return await db.transaction(async (tx) => {
      await increaseBalance(tx, userId, amount);
      return await createTransactionRecord(tx, userId, 'DEPOSIT', amount);
    });
  },
  PAYMENT: async (db, userId, amount, orderId) => {
    // Decrease buyer balance, validate sufficient funds
    return await db.transaction(async (tx) => {
      const user = await getUserForUpdate(tx, userId);
      if (user.balance < amount) throw new BadRequestError('Insufficient balance');
      await decreaseBalance(tx, userId, amount);
      return await createTransactionRecord(tx, userId, 'PAYMENT', amount, orderId);
    });
  },
  EARNING: async (db, userId, amount, orderId) => {
    // Increase kurir balance upon order completion
    return await db.transaction(async (tx) => {
      await increaseBalance(tx, userId, amount);
      return await createTransactionRecord(tx, userId, 'EARNING', amount, orderId);
    });
  },
};
```

---

## Creational Patterns

### 5. Factory Method Pattern
**Reference:** https://refactoring.guru/design-patterns/factory-method

**Where:** Custom Error Creation (`AppError` hierarchy)

The global error handling system relies on a family of error objects that all share the same interface (`AppError`) but differ in their HTTP status codes and default messages. A factory function can centralize error creation, or each subclass acts as its own factory.

```typescript
// Example: AppError base and concrete error factories
abstract class AppError extends Error {
  abstract readonly statusCode: number;
}

class BadRequestError extends AppError {
  readonly statusCode = 400;
  constructor(message = 'Bad Request') { super(message); }
}

class UnauthorizedError extends AppError {
  readonly statusCode = 401;
  constructor(message = 'Unauthorized') { super(message); }
}

class NotFoundError extends AppError {
  readonly statusCode = 404;
  constructor(message = 'Not Found') { super(message); }
}

class ForbiddenError extends AppError {
  readonly statusCode = 403;
  constructor(message = 'Forbidden') { super(message); }
}

// Usage in app.onError — polymorphic handling
app.onError((err, c) => {
  if (err instanceof AppError) {
    return c.json({ error: err.message }, err.statusCode);
  }
  console.error(err);
  return c.json({ error: 'Internal Server Error' }, 500);
});
```

---

## Structural Patterns

### 6. Facade Pattern
**Reference:** https://refactoring.guru/design-patterns/facade

**Where:** Service Layer (Order Payment Flow)

The `payOrder` service function acts as a Facade over a complex subsystem involving multiple operations: balance validation, balance deduction, transaction record creation, security code generation, and order status update. The route handler only calls a single service function, hiding the complexity behind a clean interface.

```typescript
// Example: payOrder service as a Facade
export async function payOrder(db: DrizzleDB, orderId: string, buyerId: string) {
  // The handler just calls this one function.
  // Internally it orchestrates multiple subsystems:
  return await db.transaction(async (tx) => {
    // 1. Fetch and validate order state
    const order = await getOrderForUpdate(tx, orderId);
    if (order.status !== 'PRICED') throw new BadRequestError('Order is not priced');
    if (order.buyer_id !== buyerId) throw new ForbiddenError('Not your order');

    // 2. Validate and deduct buyer balance
    const totalAmount = order.item_price + 5000;
    const buyer = await getUserForUpdate(tx, buyerId);
    if (buyer.balance < totalAmount) throw new BadRequestError('Insufficient balance');
    await decreaseBalance(tx, buyerId, totalAmount);

    // 3. Create transaction record
    await createTransactionRecord(tx, buyerId, 'PAYMENT', totalAmount, orderId);

    // 4. Generate security code
    const securityCode = generateSecurityCode();

    // 5. Update order status
    await updateOrder(tx, orderId, {
      status: 'PAID',
      security_code: securityCode,
    });

    return { securityCode, totalAmount };
  });
}
```
