const Writer = require('../../../src/defaults/writer')

describe('Default Writer', () => {
  describe('open()', () => {
    it('open function exists', async () => {
      const writer = new Writer({})
      return writer.open()
    })
  })
  describe('items()', () => {
    it('items function throws a not-implemented error', async () => {
      const writer = new Writer({})
      await expect(writer.items([], {})).rejects.toThrow(/Not implemented/)
    })
  })
  describe('close()', () => {
    it('close function exists', async () => {
      const writer = new Writer({})
      return writer.close()
    })
  })
})