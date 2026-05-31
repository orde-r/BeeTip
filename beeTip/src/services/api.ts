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
  message: string;
  order: Order;
}

interface OrdersResponse {
  orders: Order[];
  total: number;
}

interface PayOrderResponse extends OrderResponse {
  securityCode: string;
}

interface MessagesResponse {
  messages: Message[];
}

interface DepositResponse {
  message: string;
  newBalance: number;
}

interface TransactionsResponse {
  transactions: Transaction[];
  total: number;
}

export interface ValidationErrorDetail {
  path: string[];
  message: string;
  code: string;
}

export class ApiError extends Error {
  status: number;
  details?: ValidationErrorDetail[];

  constructor(message: string, status: number, details?: ValidationErrorDetail[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
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
    let details: ValidationErrorDetail[] | undefined;

    try {
      const error = (await response.json()) as {
        message?: string;
        error?: string;
        errors?: ValidationErrorDetail[];
      };
      message = error.message ?? error.error ?? message;
      details = error.errors;
    } catch {
      message = response.statusText || message;
    }

    throw new ApiError(message, response.status, details);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const authApi = {
  register: (email: string, password: string) =>
    apiRequest<UserResponse>("/auth/register", {
      method: "POST",
      body: { email, password },
    }),
  login: (email: string, password: string) =>
    apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
    }),
  me: (token: string) =>
    apiRequest<UserResponse>("/auth/me", {
      token,
    }),
  logout: (token: string | null) =>
    apiRequest<{ message: string }>("/auth/logout", {
      method: "POST",
      token,
    }),
};

export const orderApi = {
  myOrders: (token: string) =>
    apiRequest<OrdersResponse>("/orders/my", {
      token,
    }),
  available: (token: string) =>
    apiRequest<OrdersResponse>("/orders/available", {
      token,
    }),
  getById: (token: string, orderId: string) =>
    apiRequest<{ order: Order }>(`/orders/${orderId}`, {
      token,
    }),
  create: (token: string, toLocation: string, itemDesc: string) =>
    apiRequest<OrderResponse>("/orders", {
      method: "POST",
      token,
      body: {
        toLocation,
        itemDesc: itemDesc,
      },
    }),
  accept: (token: string, orderId: string) =>
    apiRequest<OrderResponse>(`/orders/${orderId}/accept`, {
      method: "POST",
      token,
    }),
  uploadPrice: (
    token: string,
    orderId: string,
    itemPrice: number,
    receiptImageUrl?: string,
  ) =>
    apiRequest<OrderResponse>(`/orders/${orderId}/price`, {
      method: "POST",
      token,
      body: {
        itemPrice,
        ...(receiptImageUrl ? { receiptImageUrl } : {}),
      },
    }),
  pay: (token: string, orderId: string) =>
    apiRequest<PayOrderResponse>(`/orders/${orderId}/pay`, {
      method: "POST",
      token,
    }),
  complete: (token: string, orderId: string, securityCode: string) =>
    apiRequest<OrderResponse>(`/orders/${orderId}/complete`, {
      method: "POST",
      token,
      body: {
        securityCode,
      },
    }),
  cancel: (token: string, orderId: string) =>
    apiRequest<OrderResponse>(`/orders/${orderId}/cancel`, {
      method: "POST",
      token,
    }),
  messages: (token: string, orderId: string) =>
    apiRequest<MessagesResponse>(`/orders/${orderId}/messages`, {
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
