import { AppError } from "./app-error.js";

export class NotFoundError extends AppError {
  public readonly statusCode = 404;

  constructor(message = "Not Found") {
    super(message);
  }
}
