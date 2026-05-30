import { z } from "@hono/zod-openapi";
import type { Context } from "hono";

export const validationHook = (
  result: { success: false; error: z.ZodError } | { success: true; data: unknown },
  c: Context<any, any, any>
): Response | void => {
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      path: issue.path.map(String),
      message: issue.message,
      code: issue.code,
    }));
    return c.json({ message: "Validation error", errors }, 400);
  }
};
