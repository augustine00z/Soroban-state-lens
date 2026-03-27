// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { contractIdValidator } from '../../lib/validation/contractIdValidator'

describe('contractIdValidator', () => {
  it('should pass for a valid contract ID', () => {
    const result = contractIdValidator(
      'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
    )
    expect(result.valid).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('should pass for a valid all-A contract ID', () => {
    const result = contractIdValidator(
      'CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    )
    expect(result.valid).toBe(true)
  })

  it('should fail for blank input', () => {
    expect(contractIdValidator('').valid).toBe(false)
    expect(contractIdValidator('').error).toBe('Contract ID cannot be blank')
  })

  it('should fail for whitespace-only input', () => {
    expect(contractIdValidator('   ').valid).toBe(false)
    expect(contractIdValidator('\t').valid).toBe(false)
    expect(contractIdValidator('\n').valid).toBe(false)
  })

  it('should trim and uppercase input before validation', () => {
    // lowercase with spaces should still pass after normalization
    const result = contractIdValidator(
      '  cdlzfc3syjydzt7k67vz75hpjvieuvnixf47zg2fb2rmqqvu2hhgcysc  ',
    )
    expect(result.valid).toBe(true)
  })

  it('should fail for random strings', () => {
    const cases = [
      'hello world',
      'not-a-contract-id',
      '12345',
      'GABCDEF',
      'foobar',
    ]
    cases.forEach((input) => {
      const result = contractIdValidator(input)
      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  it('should fail for malformed values with wrong prefix', () => {
    const result = contractIdValidator(
      'GDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
    )
    expect(result.valid).toBe(false)
  })

  it('should fail for wrong length', () => {
    expect(contractIdValidator('CDLZFC3S').valid).toBe(false)
  })

  it('should fail for invalid base32 characters', () => {
    const result = contractIdValidator(
      'C000000000000000000000000000000000000000000000000000000Q',
    )
    expect(result.valid).toBe(false)
  })

  it('should fail for non-string types at runtime', () => {
    // @ts-ignore - testing runtime behavior
    expect(contractIdValidator(null).valid).toBe(false)
    // @ts-ignore - testing runtime behavior
    expect(contractIdValidator(undefined).valid).toBe(false)
    // @ts-ignore - testing runtime behavior
    expect(contractIdValidator(123).valid).toBe(false)
  })
})
