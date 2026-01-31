export function isTokenActive(
  expirationTimestamp: number,
  gracePeriodMs: number = 60_000,
  now: number = Date.now(),
): boolean {
  return now < expirationTimestamp - gracePeriodMs;
}
