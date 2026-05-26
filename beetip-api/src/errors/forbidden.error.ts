import { AppError } from "./app-error.js";

export class ForbiddenError extends AppError {
  public readonly statusCode = 403;

  constructor(message = "Forbidden") {
    super(message);
  }
}
