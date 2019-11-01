const Reader = require('../../../src/defaults/reader')

describe('Default Reader', () => {
  describe('open()', () => {
    it('open function exists', async () => {
      const reader = new Reader({})
      await expect(reader.open()).resolves.toBe(undefined)
    })
  })
  describe('items()', () => {
    it('items function throws a not-implemented error', async () => {
      const reader = new Reader({})
      await expect(reader.items({})).rejects.toThrow(/Not implemented/)
    })
  })
  describe('close()', () => {
    it('close function exists', async () => {
      const reader = new Reader({})
      await expect(reader.close()).resolves.toBe(undefined)
    })
  })
})