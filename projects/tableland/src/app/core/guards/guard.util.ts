import { Signal } from '@angular/core';

export interface WaitForAuthOptions {
  maxRetries?: number; // Maximum number of retries before timeout
  retryDelay?: number; // Delay in ms between retries
}

const DEFAULT_OPTIONS: Required<WaitForAuthOptions> = {
  maxRetries: 50, // 5 seconds total by default (50 * 100ms)
  retryDelay: 100, // 100ms between checks
};

/**
 * Waits for the auth store to be initialized.
 * This is actually used in routes guards to ensure 
 * the auth store is initialized before triggering the guard logic.
 * 
 * @param initialized The initialized signal
 * @param options Optional configuration for retry behavior
 * @returns true if initialization completed, false if timed out
 */
export async function waitForAuthInit(
  initialized: Signal<boolean>,
  options: WaitForAuthOptions = {}
): Promise<boolean> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  let retries = 0;

  while (!initialized() && retries < config.maxRetries) {
    await new Promise((resolve) => setTimeout(resolve, config.retryDelay));
    retries++;
  }

  return retries < config.maxRetries;
}
