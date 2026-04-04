export function formatCurrentTime(): string {
  return new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })
}


export function safe<Args extends unknown[], T>(
  fn: (...args: Args) => Promise<T>,
): (...args: Args) => Promise<T | Error> {
  return async (...args: Args) => {
    try {
      return await fn(...args)
    } catch (error) {
      if (error instanceof Error) {
        return error
      }
      return new Error(String(error))
    }
  }
}
