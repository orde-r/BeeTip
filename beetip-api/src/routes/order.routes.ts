import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import {
  CreateOrderBodySchema,
  CreateOrderResponseSchema,
  ListOrdersResponseSchema,
  AcceptOrderResponseSchema,
  UploadPriceBodySchema,
  UploadPriceResponseSchema,
  PayOrderResponseSchema,
  CompleteOrderBodySchema,
  CompleteOrderResponseSchema,
  CancelOrderResponseSchema,
  OrderDTOSchema,
} from "../dtos/order.dto.js";
import { ListMessagesResponseSchema } from "../dtos/message.dto.js";
import { ErrorResponseSchema } from "../dtos/error.dto.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { UnauthorizedError } from "../errors/unauthorized.error.js";
import { getOrderMessages } from "../services/chat.service.js";
import {
  createOrder,
  listAvailableOrders,
  listUserOrders,
  getOrderById,
  acceptOrder,
  uploadPrice,
  payOrder,
  completeOrder,
  cancelOrder,
} from "../services/order.service.js";
import { emitOrderStatusChanged } from "../socket.js";


import { validationHook } from "../validation.js";

export const orderApp = new OpenAPIHono({ defaultHook: validationHook });

orderApp.use("/orders", authMiddleware);
orderApp.use("/orders/*", authMiddleware);

const listMyOrdersRoute = createRoute({
  method: "get",
  path: "/orders/my",
  tags: ["Orders"],
  summary: "List orders for the authenticated user",
  security: [{ Bearer: [] }],
  responses: {
    200: {
      description: "List of the user's orders",
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

orderApp.openapi(listMyOrdersRoute, async (c) => {
  const user = c.get("user" as never);
  if (!user) throw new UnauthorizedError();

  const result = await listUserOrders((user as any).id);
  return c.json(result, 200);
});

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

  const { toLocation, itemDesc } = c.req.valid("json");
  const result = await createOrder((user as any).id, toLocation, itemDesc);
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

const getOrderRoute = createRoute({
  method: "get",
  path: "/orders/{id}",
  tags: ["Orders"],
  summary: "Get an order by id",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
    }),
  },
  responses: {
    200: {
      description: "Order detail",
      content: {
        "application/json": {
          schema: z.object({ order: OrderDTOSchema }).openapi("OrderDetailResponse"),
        },
      },
    },
    401: {
      description: "Missing or invalid authentication",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    403: {
      description: "Not a participant in this order",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    404: {
      description: "Order not found",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

orderApp.openapi(getOrderRoute, async (c) => {
  const user = c.get("user" as never);
  if (!user) throw new UnauthorizedError();

  const { id } = c.req.valid("param");
  const result = await getOrderById(id, (user as any).id);
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
  emitOrderStatusChanged(result.order);
  return c.json(result, 200);
});

const uploadPriceRoute = createRoute({
  method: "post",
  path: "/orders/{id}/price",
  tags: ["Orders"],
  summary: "Upload item price for an accepted order",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
    }),
    body: {
      content: {
        "application/json": {
          schema: UploadPriceBodySchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      description: "Price updated successfully",
      content: {
        "application/json": {
          schema: UploadPriceResponseSchema,
        },
      },
    },
    400: {
      description: "Order is not in ACCEPTED state or invalid price",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    401: {
      description: "Missing or invalid authentication",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    403: {
      description: "Not the assigned kurir",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    404: {
      description: "Order not found",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

orderApp.openapi(uploadPriceRoute, async (c) => {
  const user = c.get("user" as never);
  if (!user) throw new UnauthorizedError();

  const { id } = c.req.valid("param");
  const { itemPrice, receiptImageUrl } = c.req.valid("json");
  const result = await uploadPrice(id, (user as any).id, itemPrice, receiptImageUrl);
  emitOrderStatusChanged(result.order);
  return c.json(result, 200);
});

const payOrderRoute = createRoute({
  method: "post",
  path: "/orders/{id}/pay",
  tags: ["Orders"],
  summary: "Pay for a priced order",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
    }),
  },
  responses: {
    200: {
      description: "Payment successful",
      content: {
        "application/json": {
          schema: PayOrderResponseSchema,
        },
      },
    },
    400: {
      description: "Order is not in PRICED state or insufficient balance",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    401: {
      description: "Missing or invalid authentication",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    403: {
      description: "Not the buyer for this order",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    404: {
      description: "Order not found",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

orderApp.openapi(payOrderRoute, async (c) => {
  const user = c.get("user" as never);
  if (!user) throw new UnauthorizedError();

  const { id } = c.req.valid("param");
  const result = await payOrder(id, (user as any).id);
  emitOrderStatusChanged(result.order);
  return c.json(result, 200);
});

const completeOrderRoute = createRoute({
  method: "post",
  path: "/orders/{id}/complete",
  tags: ["Orders"],
  summary: "Complete an order with security code",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
    }),
    body: {
      content: {
        "application/json": {
          schema: CompleteOrderBodySchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      description: "Order completed successfully",
      content: {
        "application/json": {
          schema: CompleteOrderResponseSchema,
        },
      },
    },
    400: {
      description: "Order is not in PAID state or invalid security code",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    401: {
      description: "Missing or invalid authentication",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    403: {
      description: "Not the assigned kurir",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    404: {
      description: "Order not found",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

orderApp.openapi(completeOrderRoute, async (c) => {
  const user = c.get("user" as never);
  if (!user) throw new UnauthorizedError();

  const { id } = c.req.valid("param");
  const { securityCode } = c.req.valid("json");
  const result = await completeOrder(id, (user as any).id, securityCode);
  emitOrderStatusChanged(result.order);
  return c.json(result, 200);
});

const cancelOrderRoute = createRoute({
  method: "post",
  path: "/orders/{id}/cancel",
  tags: ["Orders"],
  summary: "Cancel an order before payment",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
    }),
  },
  responses: {
    200: {
      description: "Order cancelled successfully",
      content: {
        "application/json": {
          schema: CancelOrderResponseSchema,
        },
      },
    },
    400: {
      description: "Order cannot be cancelled in its current state",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    401: {
      description: "Missing or invalid authentication",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    403: {
      description: "User cannot cancel this order",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    404: {
      description: "Order not found",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

orderApp.openapi(cancelOrderRoute, async (c) => {
  const user = c.get("user" as never);
  if (!user) throw new UnauthorizedError();

  const { id } = c.req.valid("param");
  const result = await cancelOrder(id, (user as any).id);
  emitOrderStatusChanged(result.order);
  return c.json(result, 200);
});

const orderMessagesRoute = createRoute({
  method: "get",
  path: "/orders/{id}/messages",
  tags: ["Orders", "Chat"],
  summary: "Get chat messages for an order",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
    }),
  },
  responses: {
    200: {
      description: "List of messages",
      content: {
        "application/json": {
          schema: ListMessagesResponseSchema,
        },
      },
    },
    401: {
      description: "Missing or invalid authentication",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    403: {
      description: "Not a participant in this order",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    404: {
      description: "Order not found",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

orderApp.openapi(orderMessagesRoute, async (c) => {
  const user = c.get("user" as never);
  if (!user) throw new UnauthorizedError();

  const { id } = c.req.valid("param");
  const result = await getOrderMessages(id, (user as any).id);
  return c.json(result, 200);
});
