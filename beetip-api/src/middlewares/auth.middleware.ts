import { createMiddleware } from "hono/factory";
import { getCookie } from "hono/cookie";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../errors/unauthorized.error.js";


export interface UserPayload {
  id: string;
  email: string;
  role: string;
}

declare module "hono" {
  interface ContextVariableMap {
    user: UserPayload;
  }
}

const JWT_SECRET = process.env.JWT_SECRET!;

// Chain of Responsibility Design Pattern
/* Each incoming request passes through a chain of middleware handlers.
This auth middleware either processes the request and passes it to the
next handler via await next(), or terminates the chain by throwing
an UnauthorizedError. Flow: Auth Middleware → Route Handler → app.onError(). */


// Proxy Design Pattern (Protection Proxy)
/* The middleware acts as a protection proxy that controls access to protected route handlers.
It verifies the JWT token and attaches the authenticated user before forwarding
the request to the real handler. Unauthorized requests are rejected before
reaching the protected resource*/
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
