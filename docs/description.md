# BeeTip
A proxy buying service available in campus grounds(BINUS university). User can make an order and a courier will take the order, deliver it to the buyer, and then the courier will get paid

## Flow
User Register - Login - Make new order - Fill up the form(To, Desc, etc) - Place Order - Kurir Accept Order - Connect Kurir and User through Chat - Kurir upload price and the receipt(optional) - Reduce balance from user - Give Security Code to User(which will needed by Kurir to get the pay) - Kurir arrive and give the order - Kurir Ask for the code and fill - Kurir get pay

## Features
- User Authentication(Email, JWT)
- Proxy Buying Service
- Order Management
- Chat System
- Payment Integration(Mock, can just add money manually)
- Current Role(User, Kurir)

## Tech Stack
- Backend: Node.js, PostgreSQL, Socket.io, Hono, Drizzle, Typescript

## Backend Practices
### Directory Structure

src/
├── db/             # Drizzle instance, schema definitions, and migrations
├── dtos/           # Zod schemas (Hono uses Zod heavily for validation and OpenAPI docs)
├── errors/         # Custom AppErrors subclasses for standard HTTP errors
├── middlewares/    # Hono middlewares (e.g., Auth, rate-limiting)
├── routes/         # Zod OpenAPI route definitions & functional handlers
├── services/       # Functional business logic (exported functions)
└── index.ts        # App entrypoint and app.onError setup

### Architectural Layers (Functional Route-Based)
The application follows a functional architecture to ensure separation of concerns: Routes → Handlers → Services → Database (Drizzle)

Routes & Handlers: Define Zod-OpenAPI routes (method, path, schemas) and bind a functional handler to it. The handler extracts validated request data from Hono Context (`c`), calls the appropriate Service, and returns the response using `c.json()`.
Services: Contain the business logic. Implemented as exported functions rather than classes.
Database (Drizzle): Drizzle is used for database interactions. Services can directly use the Drizzle database instance or dedicated query functions.

### Standard Practices
#### Global Error Handling
We use Hono's built-in global error catching mechanism in `src/index.ts` via `app.onError()`.

Custom Errors: Create errors by extending the abstract `AppError` base class. Predefined errors exist in `src/errors/` (e.g., `BadRequestError`, `UnauthorizedError`, `NotFoundError`).
Throwing Errors: You can safely throw new `BadRequestError("message")` inside async handlers or services.
Error Catching: The `app.onError((err, c) => { ... })` hook intercepts these thrown errors. If it is an instance of `AppError`, it returns the associated `statusCode` and JSON message. Unhandled exceptions are logged and return a 500 Internal Server Error.

```typescript
// Example: Throwing an error in a handler or service
if (!user) {
  throw new UnauthorizedError("Unauthorized");
}
```

#### Authentication Middleware
Authentication is handled via a Hono middleware.

It checks for a valid JWT in the `Authorization: Bearer <token>` header.
Upon successful verification, it attaches the decoded user payload to Hono's Context using `c.set('user', payload)`.
To ensure type safety, the Hono app instance is strongly typed with Variables: `new OpenAPIHono<{ Variables: { user: UserPayload } }>()`.

```typescript
// Example: Accessing the authenticated user in a handler
app.openapi(createReportRoute, async (c) => {
  const user = c.get('user');
  if (!user) throw new UnauthorizedError("Unauthorized");
  
  const body = c.req.valid('json');
  const result = await createReportService(body, user.id);
  return c.json(result, 201);
});
```

#### Data Validation and DTOs (Zod)
Instead of plain TypeScript types, DTOs and validation schemas are defined using Zod (`@hono/zod-openapi`).

They are stored in `src/dtos/` and define the exact shape of payloads sent in requests and returned in responses.
Hono automatically validates incoming requests against these schemas and generates Swagger documentation.
Services consume the inferred TypeScript types using `z.infer<typeof schema>`.

```typescript
// Example: report-detail.dto.ts
import { z } from '@hono/zod-openapi';

export const VoteSummarySchema = z.object({
  confirms: z.number(),
  resolves: z.number(),
  userVoted: z.string().nullable(),
});

export type VoteSummaryDTO = z.infer<typeof VoteSummarySchema>;
```

## Architecture Details

### Socket.io (Chat System) Architecture
* **Namespaces and Rooms:** The chat system will utilize a specific namespace (e.g., `/chat`) and dynamically join the Buyer and Kurir into a dedicated room specific to their order (e.g., `room_order_<order_id>`).
* **Authorization:** Socket connections must be authenticated (using the same JWT strategy). Only the Buyer and the assigned Kurir are permitted to join a given order's room.
* **Persistence:** Chat messages should be persisted to the PostgreSQL database (via Drizzle) before being broadcasted to ensure message history is available upon reconnection.

### Concurrency and Financials (Payment Mock)
* **ACID Transactions:** When transitioning an order to `PAID` (which involves reducing the Buyer's balance) and `COMPLETED` (increasing the Kurir's balance), all database operations must be wrapped in a single Drizzle transaction.
* **Concurrency:** If two simultaneous requests attempt to modify balances, Drizzle/Postgres row-level locking (e.g., `FOR UPDATE`) should be utilized to prevent race conditions and negative balances.