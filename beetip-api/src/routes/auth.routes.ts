import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { setCookie, deleteCookie } from "hono/cookie";
import {
  AuthRegisterBodySchema,
  AuthRegisterResponseSchema,
  AuthLoginBodySchema,
  AuthLoginResponseSchema,
  AuthMeResponseSchema,
  MessageResponseSchema,
} from "../dtos/auth.dto.js";
import { ErrorResponseSchema } from "../dtos/error.dto.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { UnauthorizedError } from "../errors/unauthorized.error.js";
import { registerUser, loginUser, getUserById } from "../services/auth.service.js";

import { validationHook } from "../validation.js";

export const authApp = new OpenAPIHono({ defaultHook: validationHook });

const registerRoute = createRoute({
  method: "post",
  path: "/auth/register",
  tags: ["Auth"],
  summary: "Register a new user",
  request: {
    body: {
      content: {
        "application/json": {
          schema: AuthRegisterBodySchema,
        },
      },
      required: true,
    },
  },
  responses: {
    201: {
      description: "Registration successful",
      content: {
        "application/json": {
          schema: AuthRegisterResponseSchema,
        },
      },
    },
    400: {
      description: "Missing or invalid fields",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    409: {
      description: "Email already exists",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

authApp.openapi(registerRoute, async (c) => {
  const { email, password } = c.req.valid("json");
  const result = await registerUser(email, password);
  return c.json(result, 201);
});


const loginRoute = createRoute({
  method: "post",
  path: "/auth/login",
  tags: ["Auth"],
  summary: "Login and receive an access token",
  request: {
    body: {
      content: {
        "application/json": {
          schema: AuthLoginBodySchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      description: "Login successful",
      content: {
        "application/json": {
          schema: AuthLoginResponseSchema,
        },
      },
    },
    400: {
      description: "Missing required fields",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    401: {
      description: "Invalid credentials",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

authApp.openapi(loginRoute, async (c) => {
  const { email, password } = c.req.valid("json");
  const result = await loginUser(email, password);

  setCookie(c, "accessToken", result.accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return c.json(result, 200);
});

authApp.use("/auth/me", authMiddleware);

const meRoute = createRoute({
  method: "get",
  path: "/auth/me",
  tags: ["Auth"],
  summary: "Get the authenticated user",
  security: [{ Bearer: [] }],
  responses: {
    200: {
      description: "Authenticated user",
      content: {
        "application/json": {
          schema: AuthMeResponseSchema,
        },
      },
    },
    401: {
      description: "Missing or invalid authentication",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

authApp.openapi(meRoute, async (c) => {
  const user = c.get("user" as never);
  if (!user) throw new UnauthorizedError();

  const result = await getUserById((user as any).id);
  return c.json(result, 200);
});

const logoutRoute = createRoute({
  method: "post",
  path: "/auth/logout",
  tags: ["Auth"],
  summary: "Logout and clear session cookie",
  responses: {
    200: {
      description: "Logout successful",
      content: {
        "application/json": {
          schema: MessageResponseSchema,
        },
      },
    },
  },
});

authApp.openapi(logoutRoute, (c) => {
  deleteCookie(c, "accessToken", {
    path: "/",
  });

  return c.json({ message: "Logout successful" }, 200);
});
