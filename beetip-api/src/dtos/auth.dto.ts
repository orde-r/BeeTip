import { z } from "@hono/zod-openapi";


export const AuthRegisterBodySchema = z
  .object({
    email: z.string().email().openapi({ example: "student@binus.ac.id" }),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .openapi({ example: "securePassword123" }),
  })
  .openapi("AuthRegisterBody");

export const AuthLoginBodySchema = z
  .object({
    email: z.string().email().openapi({ example: "student@binus.ac.id" }),
    password: z.string().openapi({ example: "securePassword123" }),
  })
  .openapi("AuthLoginBody");


export const UserDTOSchema = z
  .object({
    id: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
    email: z.string().email().openapi({ example: "student@binus.ac.id" }),
    balance: z.number().openapi({ example: 0.0 }),
    current_role: z.string().openapi({ example: "USER" }),
    createdAt: z.string().datetime().optional().openapi({ example: "2026-05-25T10:00:00.000Z" }),
  })
  .openapi("UserDTO");

export type UserDTO = z.infer<typeof UserDTOSchema>;


export const AuthRegisterResponseSchema = z
  .object({
    message: z.string().openapi({ example: "Registration successful" }),
    user: UserDTOSchema,
  })
  .openapi("AuthRegisterResponse");

export const AuthLoginResponseSchema = z
  .object({
    message: z.string().openapi({ example: "Login successful" }),
    accessToken: z.string().openapi({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }),
    user: UserDTOSchema,
  })
  .openapi("AuthLoginResponse");


export const ErrorResponseSchema = z
  .object({
    message: z.string().openapi({ example: "Something went wrong" }),
  })
  .openapi("ErrorResponse");
