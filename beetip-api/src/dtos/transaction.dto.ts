import { z } from "@hono/zod-openapi";

export const TopUpBodySchema = z
  .object({
    amount: z.number().positive("Amount must be positive").max(9999999999.99).openapi({ example: 100000.0 }),
  })
  .openapi("TopUpBody");

export const TransactionDTOSchema = z
  .object({
    id: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
    type: z.string().openapi({ example: "DEPOSIT" }),
    amount: z.number().max(9999999999.99).openapi({ example: 100000.0 }),
    createdAt: z.string().datetime().openapi({ example: "2026-05-25T09:00:00.000Z" }),
  })
  .openapi("TransactionDTO");

export type TransactionDTO = z.infer<typeof TransactionDTOSchema>;

export const TopUpResponseSchema = z
  .object({
    message: z.string().openapi({ example: "Deposit successful" }),
    transaction: TransactionDTOSchema,
    new_balance: z.number().max(9999999999.99).openapi({ example: 100000.0 }),
  })
  .openapi("TopUpResponse");
