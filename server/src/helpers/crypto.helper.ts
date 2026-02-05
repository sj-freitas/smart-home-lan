import { createHmac, randomBytes, timingSafeEqual } from "crypto";

const AUTH_API_KEY_SECRET = process.env.AUTH_API_KEY_SECRET!;

export function hashApiKey(apiKey: string): string {
  return createHmac("sha256", AUTH_API_KEY_SECRET).update(apiKey).digest("hex");
}

export function generateApiKey(): string {
  return randomBytes(32).toString("base64");
}

export function verifyApiKey(providedKey: string, storedHash: string): boolean {
  const providedHash = hashApiKey(providedKey);

  return timingSafeEqual(
    Buffer.from(providedHash, "hex"),
    Buffer.from(storedHash, "hex"),
  );
}
