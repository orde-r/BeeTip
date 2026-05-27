import { z } from "@hono/zod-openapi";

export const MessageDTOSchema = z
  .object({
    id: z.string().uuid().openapi({ example: "msg-uuid-1" }),
    order_id: z.string().uuid().openapi({ example: "order-uuid-1" }),
    sender_id: z.string().uuid().openapi({ example: "user-uuid" }),
    content: z.string().openapi({ example: "Hi, I'm on my way!" }),
    timestamp: z.string().datetime().openapi({ example: "2026-05-25T10:11:00.000Z" }),
  })
  .openapi("MessageDTO");

export type MessageDTO = z.infer<typeof MessageDTOSchema>;

export const ListMessagesResponseSchema = z
  .object({
    messages: z.array(MessageDTOSchema),
  })
  .openapi("ListMessagesResponse");
