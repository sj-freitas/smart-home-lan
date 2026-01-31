export async function startScheduler<T>(
  fn: () => Promise<T>,
  interval: number,
): Promise<T> {
  // Run immediately
  const firstRun = await fn();
  // Schedule future runs
  setInterval(() => {
    void fn();
  }, interval);

  return firstRun;
}
