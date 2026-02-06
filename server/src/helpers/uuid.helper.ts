/**
 * Insert dashes into a 32-character hex sequence to form a UUID (8-4-4-4-12).
 * Accepts input with or without dashes; normalizes to lowercase dashed form.
 *
 * @param sequence - 32 hex characters (may include dashes which will be ignored)
 * @returns canonical dashed uuid string (lowercase)
 * @throws TypeError when input is not a valid 32-hex-character sequence
 */
export function toUuid(sequence: string): string {
  if (typeof sequence !== "string") {
    throw new TypeError("toUuid: input must be a string");
  }

  // remove existing dashes and surrounding braces/spaces
  const cleaned = sequence
    .trim()
    .replace(/^[{(]+|[)}]+$/g, "")
    .replace(/-/g, "")
    .toLowerCase();

  if (!/^[0-9a-f]{32}$/.test(cleaned)) {
    throw new TypeError(
      "toUuid: input must contain exactly 32 hexadecimal characters (0-9, a-f)",
    );
  }

  return (
    cleaned.slice(0, 8) +
    "-" +
    cleaned.slice(8, 12) +
    "-" +
    cleaned.slice(12, 16) +
    "-" +
    cleaned.slice(16, 20) +
    "-" +
    cleaned.slice(20, 32)
  );
}

/**
 * Remove dashes from a UUID string and return a 32-character hex sequence.
 * Accepts dashed or undashed UUIDs, with optional surrounding braces.
 *
 * @param uuid - dashed or undashed uuid string
 * @returns 32-character hex sequence (lowercase)
 * @throws TypeError when input is not a valid UUID/32-hex-character sequence
 */
export function toSequence(uuid: string): string {
  if (typeof uuid !== "string") {
    throw new TypeError("toSequence: input must be a string");
  }

  // remove braces and dashes, trim spaces, lowercase
  const cleaned = uuid
    .trim()
    .replace(/^[{(]+|[)}]+$/g, "")
    .replace(/-/g, "")
    .toLowerCase();

  if (!/^[0-9a-f]{32}$/.test(cleaned)) {
    throw new TypeError(
      "toSequence: input must be a UUID or 32 hexadecimal characters (0-9, a-f)",
    );
  }

  return cleaned;
}
