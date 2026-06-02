

# BeeTip
Are you a BINUSIAN looking for a delivery service around campus? Well, here is your solution

Submission for Software Architecture Final Project:
- Bryan Widjaja
- Danielson
- Jeremy Auriel Zhang
- Jonathan Hanska Susanto
- Kristopher Nathanael


## Table of Contents
- [Design Patterns](#design-patterns)
  - [1. Singleton Pattern](#1-singleton-pattern)
  - [2. Observer Pattern](#2-observer-pattern)
  - [3. Chain of Responsibility Pattern](#3-chain-of-responsibility-pattern)
  - [4. Facade Pattern](#4-facade-pattern)
  - [5. Proxy Pattern (Protection Proxy)](#5-proxy-pattern-protection-proxy)

## Design Patterns
These design patterns are used in the backend:

### 1. Singleton Pattern
**Reference:** https://refactoring.guru/design-patterns/singleton

**Feature:** Database Connection (db instance)

**Code:** [/beetip-api/src/db.ts](/beetip-api/src/db.ts)

The database connection is created once as a constant and then exported. Every other module that imports `db` receives the same single instance, so that the entire application shares one database connection pool.

```typescript
const db = drizzle(process.env.DATABASE_URL!);

export default db;
```

---

### 2. Observer Pattern
**Reference:** https://refactoring.guru/design-patterns/observer

**Feature:** Chat System (Socket.io) and Order Status Notifications

**Code:** [/beetip-api/src/socket.ts](/beetip-api/src/socket.ts)

Socket.io rooms work as an Observer/Pub-Sub implementation. When a participant sends a message or an order status changes, all connected clients subscribed to the order room receive the event without the service needing to know each socket directly.

- **Subject:** The Socket.io room (`room_order_<id>`).
- **Observers:** The Buyer's and Kurir's connected sockets.
- **Events:** `receive_message` and `order_status_changed`.

```typescript
chatNamespace.to(roomName).emit("receive_message", message);

chatNamespaceRef?.to(`room_order_${order.id}`).emit("order_status_changed", {
  order,
});
```

---

### 3. Chain of Responsibility Pattern
**Reference:** https://refactoring.guru/design-patterns/chain-of-responsibility

**Feature:** Middleware Pipeline(Auth > Error Handling > Validation)

**Code:** [/beetip-api/src/middlewares/auth.middleware.ts](/beetip-api/src/middlewares/auth.middleware.ts), [/beetip-api/src/index.ts](/beetip-api/src/index.ts)

Each incoming HTTP request passes through middleware handlers. A handler can process the request and pass it to the next handler, or stop the chain by throwing an error.

The request flow is: **Auth Middleware -> Route Handler -> `app.onError()` if an error is thrown**.

```typescript
export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header("Authorization");
  let token: string | undefined;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  }

  if (!token) {
    throw new UnauthorizedError("Missing or invalid Authorization header");
  }

  const payload = jwt.verify(token, JWT_SECRET) as UserPayload;
  c.set("user", payload);
  await next();
};
```

---

### 4. Facade Pattern
**Reference:** https://refactoring.guru/design-patterns/facade

**Feature:** Service Layer (Order Payment and Completion Flow)

**Code:** [/beetip-api/src/services/order.service.ts](/beetip-api/src/services/order.service.ts)

The `payOrder()` and `completeOrder()` service functions act as facades over a complex subsystem involving order locking, state validation, balance updates, transaction records, security code validation/generation, and order status updates.

The route handler only calls a single service function, the service hides the complex implementation details.

```typescript
export async function payOrder(orderId: string, buyerId: string) {
  return await db.transaction(async (tx) => {
    const [row] = await tx
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, orderId))
      .for("update")
      .limit(1);

    const order = getOrderOrThrow(row);
    validateOrderAction(order.status, "pay", buyerId, order.buyerId, order.kurirId);
    const emails = await getParticipantEmails(order.buyerId, order.kurirId);
    const totalAmount = Number(order.itemPrice!) + Number(order.deliveryFee);
    await processTransaction(tx, "PAYMENT", buyerId, totalAmount, orderId);

    const securityCode = generateSecurityCode();
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

---

### 5. Proxy Pattern (Protection Proxy)
**Reference:** https://refactoring.guru/design-patterns/proxy

**Feature:** Authentication Middleware

**Code:** [/beetip-api/src/middlewares/auth.middleware.ts](/beetip-api/src/middlewares/auth.middleware.ts)

While the middleware pipeline as a whole is an implementation of the Chain of Responsibility design pattern, the `authMiddleware` specifically acts as a Protection Proxy. It is a proxy that stands between the client and the protected routes. Only authenticated requests are forwarded to the route handlers, while unauthorized requests are rejected.

- **Proxy:** `authMiddleware` that intercepts all requests to protected routes.
- **Real Subject:** The route handler that performs the actual business logic.
- **Access Control:** Validates the JWT token and attaches the authenticated user payload to the request context.

```typescript
orderApp.use("/orders", authMiddleware);
orderApp.use("/orders/*", authMiddleware);

export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  let token: string | undefined;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  } else {
    token = getCookie(c, "accessToken");
  }

  if (!token) {
    throw new UnauthorizedError("Missing or invalid Authorization header");
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as UserPayload;
    c.set("user", payload);
  } catch {
    throw new UnauthorizedError("Invalid or expired token");
  }

  await next();
});
```
