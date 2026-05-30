import { z } from "@hono/zod-openapi";

export const CreateOrderBodySchema = z
  .object({
    toLocation: z.string().min(1, "Location is required").openapi({ example: "13th floor room 2" }),
    itemDesc: z.string().min(1, "Item description is required").openapi({ example: "Chicken rice from canteen" }),
  })
  .openapi("CreateOrderBody");

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

export const CreateOrderResponseSchema = z
  .object({
    message: z.string().openapi({ example: "Order created successfully" }),
    order: OrderDTOSchema,
  })
  .openapi("CreateOrderResponse");

export const ListOrdersResponseSchema = z
  .object({
    orders: z.array(OrderDTOSchema),
    total: z.number().openapi({ example: 1 }),
  })
  .openapi("ListOrdersResponse");

export const AcceptOrderResponseSchema = z
  .object({
    message: z.string().openapi({ example: "Order accepted successfully" }),
    order: OrderDTOSchema,
  })
  .openapi("AcceptOrderResponse");

export const UploadPriceBodySchema = z
  .object({
    itemPrice: z.number().positive("Price must be positive").max(9999999999.99).openapi({ example: 25000.0 }),
    receiptImageUrl: z.string().optional().openapi({ example: "data:image/jpeg;base64,..." }),
  })
  .openapi("UploadPriceBody");

export const UploadPriceResponseSchema = z
  .object({
    message: z.string().openapi({ example: "Price updated successfully" }),
    order: OrderDTOSchema,
  })
  .openapi("UploadPriceResponse");

export const PayOrderResponseSchema = z
  .object({
    message: z.string().openapi({ example: "Payment successful" }),
    securityCode: z.string().openapi({ example: "123456" }),
    order: OrderDTOSchema,
  })
  .openapi("PayOrderResponse");

export const CompleteOrderBodySchema = z
  .object({
    securityCode: z.string().min(1, "Security code is required").openapi({ example: "123456" }),
  })
  .openapi("CompleteOrderBody");

export const CompleteOrderResponseSchema = z
  .object({
    message: z.string().openapi({ example: "Order completed successfully" }),
    order: OrderDTOSchema,
  })
  .openapi("CompleteOrderResponse");

export const CancelOrderResponseSchema = z
  .object({
    message: z.string().openapi({ example: "Order cancelled successfully" }),
    order: OrderDTOSchema,
  })
  .openapi("CancelOrderResponse");
