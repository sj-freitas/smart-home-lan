/**
 * Avoids multiple requests for the same Symbol. This shouldn't be used in every
 * case, but in Integrations there are cases where we are fetching all the devices
 * only to read ONE, this causes severe network loads that we shouldn't need.
 * 
 * This guarantees that in the same integration context we keep recycling as many
 * requests as possible.
 */
export class Memoizer {
  private readonly resolved = new Map<symbol, unknown>();
  private readonly inFlight = new Map<symbol, Promise<unknown>>();

  public async run<T>(key: symbol, fn: () => Promise<T>): Promise<T> {
    if (this.resolved.has(key)) {
      return this.resolved.get(key) as T;
    }

    // Someone else is already computing it
    const running = this.inFlight.get(key);
    if (running) {
      return running as Promise<T>;
    }

    const promise = (async () => {
      try {
        const value = await fn();
        this.resolved.set(key, value);
        return value;
      } finally {
        // Ensure lock is released even on error
        this.inFlight.delete(key);
      }
    })();

    this.inFlight.set(key, promise);
    return promise as Promise<T>;
  }
}
