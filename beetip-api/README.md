```bash
docker compose up -d
pnpm install
pnpm run dev
```

```bash
open http://localhost:3000/doc
```

## Design Patterns Reference

*   **State Pattern**: `src/services/order-states.ts` (Order status transitions)
*   **Observer Pattern**: `src/socket.ts` (Real time chat events)
*   **Chain of Responsibility**: `src/middlewares/auth.middleware.ts` (Request pipeline)
*   **Strategy Pattern**: `src/services/transaction-strategies.ts` (Balance handling)
*   **Factory Method**: `src/errors/app-error.ts` (Error classes)
*   **Facade Pattern**: `src/services/order.service.ts` (Order payment/completion)
