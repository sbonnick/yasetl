const Processor = require('../../../../src/plugins/processors/array-map')

describe('Array Map Processor', () => {
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

    it('should contain override name', async () => {
      const proc = new Processor()
      const description = await proc.describe()
      expect(description.name).toEqual('Maps Array')
    })
  })

  describe('process()', () => {
    const commonInput = [
      { name: 'Gateway' },
      { name: 'Backend' },
      { name: 'frontend' }
    ]

    it('should output an array of name fields from input', async () => {
      const proc = new Processor()
      const results = await proc.process(commonInput, { criteria: 'name' })
      expect(results).toEqual(['Gateway', 'Backend', 'frontend'])
    })

    it('should output a empty array with invalid criteria', async () => {
      const proc = new Processor()
      const results = await proc.process(commonInput, { criteria: 'non-existent' })
      expect(results).toEqual([])
    })
  })
})
