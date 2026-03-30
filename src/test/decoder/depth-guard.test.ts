import { describe, expect, it } from 'vitest'
import { ScValType, normalizeScVal } from '../../workers/decoder/normalizeScVal'
import type { NormalizedTruncated } from '../../types/normalized'

function isTruncatedNode(value: unknown): value is NormalizedTruncated {
  return (
    typeof value === 'object' &&
    value !== null &&
    'kind' in value &&
    (value as any).kind === 'truncated'
  )
}

describe('Depth Guard - maxDepth', () => {
  describe('below limit', () => {
    it('normalizes fully when depth is below maxDepth', () => {
      const scVal = {
        switch: ScValType.SCV_VEC,
        value: [
          { switch: ScValType.SCV_I32, value: 1 },
          {
            switch: ScValType.SCV_VEC,
            value: [
              { switch: ScValType.SCV_I32, value: 2 },
              { switch: ScValType.SCV_I32, value: 3 },
            ],
          },
        ],
      }
      const result: any = normalizeScVal(scVal, undefined, { maxDepth: 3 })
      expect(result.kind).toBe('vec')
      expect(result.items[0].value).toBe(1)
      expect(result.items[1].kind).toBe('vec')
      expect(result.items[1].items.map((i: any) => i.value)).toEqual([2, 3])
    })

    it('truncates vec children when maxDepth is 1', () => {
      const scVal = {
        switch: ScValType.SCV_VEC,
        value: [
          { switch: ScValType.SCV_I32, value: 1 },
          {
            switch: ScValType.SCV_VEC,
            value: [{ switch: ScValType.SCV_I32, value: 2 }],
          },
        ],
      }
      const result: any = normalizeScVal(scVal, undefined, { maxDepth: 1 })
      expect(result.kind).toBe('vec')
      expect(result.items.length).toBe(2)
      expect(isTruncatedNode(result.items[0])).toBe(true)
      expect(isTruncatedNode(result.items[1])).toBe(true)
      expect((result.items[0] as NormalizedTruncated).depth).toBe(1)
      expect((result.items[1] as NormalizedTruncated).depth).toBe(1)
    })
  })

  describe('at limit', () => {
    it('returns truncated marker at maxDepth for vec children', () => {
      const scVal = {
        switch: ScValType.SCV_VEC,
        value: [
          { switch: ScValType.SCV_I32, value: 1 },
          {
            switch: ScValType.SCV_VEC,
            value: [{ switch: ScValType.SCV_I32, value: 2 }],
          },
        ],
      }
      const result: any = normalizeScVal(scVal, undefined, { maxDepth: 2 })
      expect(result.kind).toBe('vec')
      expect(result.items[0].value).toBe(1)
      expect(result.items[1].kind).toBe('vec')
      const inner = result.items[1].items as Array<unknown>
      expect(inner.length).toBe(1)
      expect(isTruncatedNode(inner[0])).toBe(true)
      expect((inner[0] as NormalizedTruncated).depth).toBe(2)
    })

    it('root is replaced with truncated when maxDepth is 0', () => {
      const scVal = {
        switch: ScValType.SCV_VEC,
        value: [{ switch: ScValType.SCV_I32, value: 1 }],
      }
      const result = normalizeScVal(scVal, undefined, { maxDepth: 0 })
      expect(isTruncatedNode(result)).toBe(true)
      expect((result as NormalizedTruncated).depth).toBe(0)
    })
  })

  describe('above limit', () => {
    it('returns truncated marker when depth exceeds maxDepth', () => {
      const scVal = {
        switch: ScValType.SCV_VEC,
        value: [
          {
            switch: ScValType.SCV_VEC,
            value: [
              {
                switch: ScValType.SCV_VEC,
                value: [{ switch: ScValType.SCV_I32, value: 99 }],
              },
            ],
          },
        ],
      }
      const result: any = normalizeScVal(scVal, undefined, { maxDepth: 1 })
      expect(result.kind).toBe('vec')
      expect(result.items.length).toBe(1)
      expect(isTruncatedNode(result.items[0])).toBe(true)
      expect((result.items[0] as NormalizedTruncated).depth).toBe(1)
    })

    it('deep nesting produces truncated at each level past maxDepth', () => {
      const scVal = {
        switch: ScValType.SCV_VEC,
        value: [
          {
            switch: ScValType.SCV_VEC,
            value: [
              {
                switch: ScValType.SCV_VEC,
                value: [
                  {
                    switch: ScValType.SCV_VEC,
                    value: [{ switch: ScValType.SCV_I32, value: 1 }],
                  },
                ],
              },
            ],
          },
        ],
      }
      const result: any = normalizeScVal(scVal, undefined, { maxDepth: 2 })
      const level1 = result.items[0].items as Array<unknown>
      expect(level1.length).toBe(1)
      expect(isTruncatedNode(level1[0])).toBe(true)
      expect((level1[0] as NormalizedTruncated).depth).toBe(2)
    })

    it('truncates map values when maxDepth exceeded', () => {
      const scVal = {
        switch: ScValType.SCV_MAP,
        value: [
          {
            key: { switch: ScValType.SCV_SYMBOL, value: 'keys' },
            val: {
              switch: ScValType.SCV_VEC,
              value: [{ switch: ScValType.SCV_I32, value: 123 }],
            },
          },
        ],
      }
      const result: any = normalizeScVal(scVal, undefined, { maxDepth: 1 })
      expect(result.kind).toBe('map')
      expect(result.entries[0].key).toBe('keys')
      expect(isTruncatedNode(result.entries[0].value)).toBe(true)
      expect((result.entries[0].value as NormalizedTruncated).depth).toBe(1)
    })
  })

  describe('without maxDepth', () => {
    it('behaves as before when options omitted', () => {
      const scVal = {
        switch: ScValType.SCV_VEC,
        value: [
          {
            switch: ScValType.SCV_VEC,
            value: [{ switch: ScValType.SCV_I32, value: 42 }],
          },
        ],
      }
      const result: any = normalizeScVal(scVal)
      expect(result.kind).toBe('vec')
      expect(result.items[0].kind).toBe('vec')
      expect(result.items[0].items[0].value).toBe(42)
    })

    it('behaves as before when options.maxDepth omitted', () => {
      const scVal = {
        switch: ScValType.SCV_VEC,
        value: [
          {
            switch: ScValType.SCV_VEC,
            value: [{ switch: ScValType.SCV_I32, value: 42 }],
          },
        ],
      }
      const result: any = normalizeScVal(scVal, undefined, {})
      expect(result.kind).toBe('vec')
      expect(result.items[0].kind).toBe('vec')
      expect(result.items[0].items[0].value).toBe(42)
    })
  })

  describe('truncated marker shape', () => {
    it('truncated marker is JSON-serializable', () => {
      const scVal = {
        switch: ScValType.SCV_VEC,
        value: [
          {
            switch: ScValType.SCV_VEC,
            value: [{ switch: ScValType.SCV_I32, value: 1 }],
          },
        ],
      }
      const result: any = normalizeScVal(scVal, undefined, { maxDepth: 1 })
      const marker = result.items[0] as NormalizedTruncated
      const json = JSON.stringify(marker)
      const parsed = JSON.parse(json)
      expect(parsed.kind).toBe('truncated')
      expect(parsed.depth).toBe(1)
    })
  })
})
