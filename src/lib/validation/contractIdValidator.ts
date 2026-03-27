import { normalizeContractIdInput } from './normalizeContractIdInput'
import { isContractId } from './isContractId'

export interface ContractIdValidatorResult {
  valid: boolean
  error?: string
}

/**
 * Synchronous contract ID validator that trims input, rejects blank and
 * malformed values, and accepts valid Soroban contract IDs.
 *
 * This combines normalizeContractIdInput and isContractId into a single
 * pass/fail helper suitable for pre-submit guards and inline validation.
 */
export function contractIdValidator(input: string): ContractIdValidatorResult {
  if (typeof input !== 'string') {
    return { valid: false, error: 'Input must be a string' }
  }

  const trimmed = normalizeContractIdInput(input)

  if (!trimmed) {
    return { valid: false, error: 'Contract ID cannot be blank' }
  }

  if (!isContractId(trimmed)) {
    return {
      valid: false,
      error:
        'Invalid contract ID. Must start with "C", be 56 characters, and use base32 characters (A-Z, 2-7)',
    }
  }

  return { valid: true }
}
