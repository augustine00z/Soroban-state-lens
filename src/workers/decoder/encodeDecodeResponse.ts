import { normalizeRpcError } from '../../lib/rpc/normalizeRpcError'

/**
 * Encodes a worker response into a standardized JSON string.
 * This helper ensures that the response envelope follows strict rules:
 * - When ok is true, error must be omitted.
 * - When ok is false, the error is normalized and data is omitted.
 *
 * @param input - The response envelope containing ok status, data, and optional error.
 * @returns A JSON string representing the encoded response.
 */
export function encodeDecodeResponse(input: {
  ok: boolean
  data?: unknown
  error?: unknown
}): string {
  if (input.ok) {
    return JSON.stringify({
      ok: true,
      data: input.data,
    })
  }

  // When ok is false, include normalized error payload and omit data
  return JSON.stringify({
    ok: false,
    error: normalizeRpcError(input.error),
  })
}
