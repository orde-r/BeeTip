import { z } from "@hono/zod-openapi";

export const OrderDTOSchema = z
  .object({
    id: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
    buyerId: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440001" }),
    buyerEmail: z.string().email().nullable().openapi({ example: "buyer@binus.ac.id" }),
    kurirId: z.string().uuid().nullable().openapi({ example: null }),
    kurirEmail: z.string().email().nullable().openapi({ example: null }),
    toLocation: z.string().openapi({ example: "13th floor room 2" }),
    itemDesc: z.string().openapi({ example: "Chicken rice from canteen" }),
    itemPrice: z.number().max(9999999999.99).nullable().openapi({ example: null }),
    deliveryFee: z.number().max(9999999999.99).openapi({ example: 5000.0 }),
    receiptImageUrl: z.string().nullable().openapi({ example: null }),
    status: z.string().openapi({ example: "PENDING" }),
    createdAt: z.string().datetime().openapi({ example: "2026-05-25T10:05:00.000Z" }),
    updatedAt: z.string().datetime().openapi({ example: "2026-05-25T10:06:00.000Z" }),
  })
  .openapi("OrderDTO");

export type OrderDTO = z.infer<typeof OrderDTOSchema>;

export const CreateOrderBodySchema = z
  .object({
    toLocation: z.string().min(1, "Location is required").openapi({ example: "13th floor room 2" }),
    itemDesc: z.string().min(1, "Item description is required").openapi({ example: "Chicken rice from canteen" }),
  })
  .openapi("CreateOrderBody");

export const UploadPriceBodySchema = z
  .object({
    itemPrice: z.number().positive("Price must be positive").max(9999999999.99).openapi({ example: 25000.0 }),
    receiptImageUrl: z.string().optional().openapi({ example: "data:image/jpeg;base64,..." }),
  })
  .openapi("UploadPriceBody");

export const CompleteOrderBodySchema = z
  .object({
    securityCode: z.string().min(1, "Security code is required").openapi({ example: "123456" }),
  })
  .openapi("CompleteOrderBody");

const createOrderResponseSchema = (messageExample: string, schemaName: string) =>
  z
    .object({
      message: z.string().openapi({ example: messageExample }),
      order: OrderDTOSchema,
    })
    .openapi(schemaName);

export const CreateOrderResponseSchema = createOrderResponseSchema("Order created successfully", "CreateOrderResponse");
export const AcceptOrderResponseSchema = createOrderResponseSchema("Order accepted successfully", "AcceptOrderResponse");
export const UploadPriceResponseSchema = createOrderResponseSchema("Price updated successfully", "UploadPriceResponse");
export const CompleteOrderResponseSchema = createOrderResponseSchema("Order completed successfully", "CompleteOrderResponse");
export const CancelOrderResponseSchema = createOrderResponseSchema("Order cancelled successfully", "CancelOrderResponse");

export const PayOrderResponseSchema = z
  .object({
    message: z.string().openapi({ example: "Payment successful" }),
    securityCode: z.string().openapi({ example: "123456" }),
    order: OrderDTOSchema,
  })
  .openapi("PayOrderResponse");

export const ListOrdersResponseSchema = z
  .object({
    orders: z.array(OrderDTOSchema),
    total: z.number().openapi({ example: 1 }),
  })
  .openapi("ListOrdersResponse");
