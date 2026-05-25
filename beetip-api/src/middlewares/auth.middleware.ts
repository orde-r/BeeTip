import type { MiddlewareHandler } from "hono";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../errors/unauthorized.error.js";

export interface UserPayload {
  id: string;
  email: string;
  role: string;
}

const JWT_SECRET = process.env.JWT_SECRET!;

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("Missing or invalid Authorization header");
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, JWT_SECRET) as UserPayload;
    c.set("user", payload);
  } catch {
    throw new UnauthorizedError("Invalid or expired token");
  }

  await next();
};
