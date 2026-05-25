import { AppError } from "./app-error.js";

export class UnauthorizedError extends AppError {
  public readonly statusCode = 401;

  constructor(message = "Unauthorized") {
    super(message);
  }
}
