```bash
docker compose up -d
pnpm install
pnpm run db:migrate
pnpm run dev
```

```bash
open http://localhost:3000/doc
```

## Design Patterns Reference

*   **State Pattern**: `src/services/order-states.ts` (Order status transitions and role guards)
*   **Observer Pattern**: `src/socket.ts` (Socket.io rooms broadcast chat and order updates)
*   **Chain of Responsibility**: `src/middlewares/auth.middleware.ts` (Hono request pipeline)
*   **Strategy Pattern**: `src/services/transaction-strategies.ts` (Deposit, payment, and earning handling)
*   **Factory Method**: `src/errors/app-error.ts` (Shared AppError contract with concrete HTTP error classes)
*   **Facade Pattern**: `src/services/order.service.ts` (Order payment/completion flow)

Full explanation: `../docs/design_patterns.md`
