import type { MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../errors/unauthorized.error.js";

// Chain of Responsibility Design Pattern
/* Each incoming request passes through a chain of middleware handlers.
This auth middleware either processes the request and passes it to the
next handler via await next(), or short-circuits the chain by throwing
an UnauthorizedError. Flow: Auth Middleware → Route Handler → app.onError(). */

export interface UserPayload {
  id: string;
  email: string;
  role: string;
}

const JWT_SECRET = process.env.JWT_SECRET!;

export const authMiddleware: MiddlewareHandler = async (c, next) => {
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
};
