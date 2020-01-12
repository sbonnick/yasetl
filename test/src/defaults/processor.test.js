const Processor = require('../../../src/defaults/processor')

describe('Processor', () => {
  describe('describe()', () => {
    it('should contain mandatory description fields', async () => {
      const proc = new Processor()
      const description = await proc.describe()
      expect(description).toHaveProperty('name')
      expect(description).toHaveProperty('description')
      expect(description).toHaveProperty('inputHint')
      expect(description).toHaveProperty('outputHint')
      expect(description).toHaveProperty('configuration')
    })
  })

  describe('process()', () => {
    it('should by default pass through input', async () => {
      const proc = new Processor()
      const processed = await proc.process('value', null)
      expect(processed).toEqual('value')
    })
  })
})
