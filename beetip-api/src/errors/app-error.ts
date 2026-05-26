// Factory Method Design Pattern
/* The global error handling system relies on a family of error objects that all
share the same interface (AppError) but differ in their HTTP status codes and
default messages. Each subclass (BadRequestError, UnauthorizedError, NotFoundError,
ForbiddenError, ConflictError) acts as its own factory, producing polymorphic
error instances handled uniformly by app.onError(). */
export abstract class AppError extends Error {
  public abstract readonly statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}
