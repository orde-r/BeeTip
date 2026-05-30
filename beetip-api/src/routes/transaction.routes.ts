import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import {
  ListTransactionsResponseSchema,
  TopUpBodySchema,
  TopUpResponseSchema,
} from "../dtos/transaction.dto.js";
import { ErrorResponseSchema } from "../dtos/error.dto.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { UnauthorizedError } from "../errors/unauthorized.error.js";
import { deposit, listUserTransactions } from "../services/transaction.service.js";

import { validationHook } from "../validation.js";

export const transactionApp = new OpenAPIHono({ defaultHook: validationHook });

transactionApp.use("/transactions/*", authMiddleware);

const listTransactionsRoute = createRoute({
  method: "get",
  path: "/transactions/history",
  tags: ["Transactions"],
  summary: "List transaction history for the authenticated user",
  security: [{ Bearer: [] }],
  responses: {
    200: {
      description: "Transaction history",
      content: {
        "application/json": {
          schema: ListTransactionsResponseSchema,
        },
      },
    },
    401: {
      description: "Missing or invalid authentication",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

transactionApp.openapi(listTransactionsRoute, async (c) => {
  const user = c.get("user" as never);
  if (!user) throw new UnauthorizedError();

  const result = await listUserTransactions((user as any).id);
  return c.json(result, 200);
});

const depositRoute = createRoute({
  method: "post",
  path: "/transactions/deposit",
  tags: ["Transactions"],
  summary: "Top up balance (mock deposit)",
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: TopUpBodySchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      description: "Deposit successful",
      content: {
        "application/json": {
          schema: TopUpResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid amount",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    401: {
      description: "Missing or invalid authentication",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

transactionApp.openapi(depositRoute, async (c) => {
  const user = c.get("user" as never);
  if (!user) throw new UnauthorizedError();

  const { amount } = c.req.valid("json");
  const result = await deposit((user as any).id, amount);
  return c.json(result, 200);
});
