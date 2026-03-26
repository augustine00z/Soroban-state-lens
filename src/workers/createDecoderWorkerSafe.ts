import { createDecoderWorker } from './createDecoderWorker'
import type * as Comlink from 'comlink'
import type { DecoderWorkerApi } from '../types/decoder-worker'

/**
 * Safely creates a decoder worker by wrapping the original factory.
 * This wrapper catches synchronous constructor failures and normalizes them 
 * into a rejected promise with a stable error message.
 *
 * @returns A promise that resolves to the Comlink-wrapped decoder worker.
 * @throws {Error} if the worker factory fails during initialization.
 */
export async function createDecoderWorkerSafe(): Promise<Comlink.Remote<DecoderWorkerApi>> {
  try {
    // Wrap createDecoderWorker and normalize thrown boot errors.
    return createDecoderWorker()
  } catch (error) {
    // Return rejected promise with stable message for constructor failures.
    const message =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
          ? error
          : 'Unknown error'
    throw new Error(`Failed to initialize decoder worker: ${message}`)
  }
}
