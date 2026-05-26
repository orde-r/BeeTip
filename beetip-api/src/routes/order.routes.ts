import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import {
  CreateOrderBodySchema,
  CreateOrderResponseSchema,
  ListOrdersResponseSchema,
} from "../dtos/order.dto.js";
import { ErrorResponseSchema } from "../dtos/auth.dto.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { UnauthorizedError } from "../errors/unauthorized.error.js";
import { createOrder, listAvailableOrders } from "../services/order.service.js";

export const orderApp = new OpenAPIHono();

orderApp.use("*", authMiddleware);

const createOrderRoute = createRoute({
  method: "post",
  path: "/orders",
  tags: ["Orders"],
  summary: "Create a new proxy buying order",
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateOrderBodySchema,
        },
      },
      required: true,
    },
  },
  responses: {
    201: {
      description: "Order created successfully",
      content: {
        "application/json": {
          schema: CreateOrderResponseSchema,
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

orderApp.openapi(createOrderRoute, async (c) => {
  const user = c.get("user" as never);
  if (!user) throw new UnauthorizedError();

  const { to_location, item_desc } = c.req.valid("json");
  const result = await createOrder((user as any).id, to_location, item_desc);
  return c.json(result, 201);
});

const listAvailableOrdersRoute = createRoute({
  method: "get",
  path: "/orders/available",
  tags: ["Orders"],
  summary: "List all available (PENDING) orders",
  security: [{ Bearer: [] }],
  responses: {
    200: {
      description: "List of available orders",
      content: {
        "application/json": {
          schema: ListOrdersResponseSchema,
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

orderApp.openapi(listAvailableOrdersRoute, async (c) => {
  const user = c.get("user" as never);
  if (!user) throw new UnauthorizedError();

  const result = await listAvailableOrders();
  return c.json(result, 200);
});
