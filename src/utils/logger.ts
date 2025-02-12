// Simple development logger
export const logger = {
  info: (...args: any[]) => import.meta.env.DEV && console.info(...args),
  error: (...args: any[]) => import.meta.env.DEV && console.error(...args),
  warn: (...args: any[]) => import.meta.env.DEV && console.warn(...args),
  debug: (...args: any[]) => import.meta.env.DEV && console.debug(...args)
};