// Thrown for expected, user-facing business errors ("not a member", "invalid token", etc).
// Its message is safe to send to the client as-is.
// Anything else thrown (Prisma errors, network errors, bugs) is NOT an AppError,
// so toActionResult() below will hide its message from the client and log it instead.
export class AppError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "AppError";
    this.status = status;
  }
}
