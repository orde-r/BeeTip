import { AppError } from "./app-error.js";

export class BadRequestError extends AppError {
  public readonly statusCode = 400;

  constructor(message = "Bad Request") {
    super(message);
  }
}
