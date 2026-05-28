import type { Message } from "../types/chat";
import type { Order } from "../types/order";
import type { Transaction } from "../types/payment";
import type { User } from "../types/user";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

interface ApiRequestOptions {
  method?: string;
  token?: string | null;
  body?: unknown;
}

interface AuthResponse {
  message: string;
  accessToken: string;
  user: User;
}

interface UserResponse {
  user: User;
}

interface OrderResponse {
  message?: string;
  order: Order;
}

interface OrdersResponse {
  orders: Order[];
  total: number;
}

interface PayOrderResponse extends OrderResponse {
  security_code: string;
}

interface MessagesResponse {
  messages: Message[];
}

interface DepositResponse {
  message: string;
  new_balance: number;
}

interface TransactionsResponse {
  transactions: Transaction[];
  total: number;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const headers = new Headers();

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (!response.ok) {
    let message = "Something went wrong";

    try {
      const error = (await response.json()) as { message?: string; error?: string };
      message = error.message ?? error.error ?? message;
    } catch {
      message = response.statusText || message;
    }

    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const transactionApi = {
  deposit: (token: string, amount: number) =>
    apiRequest<DepositResponse>("/transactions/deposit", {
      method: "POST",
      token,
      body: {
        amount,
      },
    }),
  history: (token: string) =>
    apiRequest<TransactionsResponse>("/transactions/history", {
      token,
    }),
};

export const transactionApi = {
  deposit: (token: string, amount: number) =>
    apiRequest<DepositResponse>("/transactions/deposit", {
      method: "POST",
      token,
      body: {
        amount,
      },
    }),
  history: (token: string) =>
    apiRequest<TransactionsResponse>("/transactions/history", {
      token,
    }),
};
