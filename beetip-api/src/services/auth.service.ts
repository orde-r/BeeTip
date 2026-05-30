import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import db from "../db.js";
import { usersTable } from "../db/schema.js";
import { ConflictError } from "../errors/conflict.error.js";
import { UnauthorizedError } from "../errors/unauthorized.error.js";
import type { UserDTO } from "../dtos/auth.dto.js";

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = "7d";


function toUserDTO(row: typeof usersTable.$inferSelect): UserDTO {
  return {
    id: row.id,
    email: row.email,
    balance: Number(row.balance),
    current_role: row.currentRole,
    createdAt: row.createdAt.toISOString(),
  };
}


export async function registerUser(email: string, password: string) {
  
  const existing = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (existing.length > 0) {
    throw new ConflictError("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const [newUser] = await db
    .insert(usersTable)
    .values({
      email,
      password: hashedPassword,
    })
    .returning();

  return {
    message: "Registration successful",
    user: toUserDTO(newUser),
  };
}


export async function loginUser(email: string, password: string) {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (!user) {
    throw new UnauthorizedError("Invalid credentials");
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new UnauthorizedError("Invalid credentials");
  }
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.currentRole },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    message: "Login successful",
    accessToken,
    user: toUserDTO(user),
  };
}

export async function getUserById(userId: string) {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  if (!user) {
    throw new UnauthorizedError("Invalid user session");
  }

  return {
    user: toUserDTO(user),
  };
}
