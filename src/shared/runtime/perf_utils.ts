/**
 * Performance utilities for the Believe runtime.
 *
 * Provides simple, pure timing helpers for benchmarking and performance analysis.
 * Designed to be engine-agnostic and side-effect free.
 */

/**
 * Result of a timed operation.
 */
export interface TimedResult<T> {
  /** Label describing the operation */
  readonly label: string;
  /** Duration in milliseconds */
  readonly durationMs: number;
  /** Result returned by the operation */
  readonly result: T;
}

/**
 * Measure the execution time of a synchronous or asynchronous function.
 *
 * Uses `performance.now()` if available (Node.js/Browser), falling back to `Date.now()`.
 *
 * @param label - Descriptive label for the operation
 * @param fn - Function to execute and measure
 * @returns Promise resolving to a TimedResult containing the return value and duration
 */
export async function timeBlock<T>(
  label: string,
  fn: () => Promise<T> | T
): Promise<TimedResult<T>> {
  const start =
    typeof performance !== "undefined" && performance.now
      ? performance.now()
      : Date.now();

  const result = await fn();

  const end =
    typeof performance !== "undefined" && performance.now
      ? performance.now()
      : Date.now();

  return {
    label,
    durationMs: end - start,
    result,
  };
}
