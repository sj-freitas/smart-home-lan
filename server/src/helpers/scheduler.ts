export async function startScheduler<T>(
  fn: () => Promise<T>,
  intervalInMilliseconds: number,
): Promise<T> {
  // Run immediately
  const firstRun = await fn();
  // Schedule future runs
  setInterval(() => {
    void fn();
  }, intervalInMilliseconds);

  return firstRun;
}
