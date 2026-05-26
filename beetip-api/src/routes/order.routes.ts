import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import {
  CreateOrderBodySchema,
  CreateOrderResponseSchema,
  ListOrdersResponseSchema,
  AcceptOrderResponseSchema,
} from "../dtos/order.dto.js";
import { ErrorResponseSchema } from "../dtos/auth.dto.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { UnauthorizedError } from "../errors/unauthorized.error.js";
import { createOrder, listAvailableOrders, acceptOrder } from "../services/order.service.js";

export const orderApp = new OpenAPIHono();

orderApp.use("/orders/*", authMiddleware);

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

const acceptOrderRoute = createRoute({
  method: "post",
  path: "/orders/{id}/accept",
  tags: ["Orders"],
  summary: "Accept a pending order as a kurir",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
    }),
  },
  responses: {
    200: {
      description: "Order accepted successfully",
      content: {
        "application/json": {
          schema: AcceptOrderResponseSchema,
        },
      },
    },
    400: {
      description: "Order is not in PENDING state",
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
    403: {
      description: "Cannot accept your own order",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    404: {
      description: "Order not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

orderApp.openapi(acceptOrderRoute, async (c) => {
  const user = c.get("user" as never);
  if (!user) throw new UnauthorizedError();

  const { id } = c.req.valid("param");
  const result = await acceptOrder(id, (user as any).id);
  return c.json(result, 200);
});
