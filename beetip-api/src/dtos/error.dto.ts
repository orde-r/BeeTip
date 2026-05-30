import { z } from "@hono/zod-openapi";

export const ValidationErrorItemSchema = z
  .object({
    path: z.array(z.string()).openapi({ example: ["email"] }),
    message: z.string().openapi({ example: "Invalid email address" }),
    code: z.string().openapi({ example: "invalid_format" }),
  })
  .openapi("ValidationErrorItem");

export const ErrorResponseSchema = z
  .object({
    message: z.string().openapi({ example: "Something went wrong" }),
    errors: z.array(ValidationErrorItemSchema).optional().openapi({
      description: "Present for validation errors (HTTP 400)",
      example: [{ path: ["email"], message: "Invalid email address", code: "invalid_format" }],
    }),
  })
  .openapi("ErrorResponse");
