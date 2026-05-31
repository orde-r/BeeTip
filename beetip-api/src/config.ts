export function getCorsOrigin(): string | string[] {
  const origin = process.env.CORS_ORIGIN;
  if (!origin) {
    throw new Error("CORS_ORIGIN is not set in .env");
  }
  return origin.includes(",") ? origin.split(",").map((o) => o.trim()) : origin;
}
