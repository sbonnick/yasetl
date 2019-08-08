const Processor = require('../../../../src/plugins/processors/array-filter')

describe('Array Filter Processor', () => {
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
      expect(description.name).toEqual('Filter Array')
    })
  })

  describe('process()', () => {
    it('should output a sublist with all criteria matching', async () => {
      const proc = new Processor()
      const results = await proc.process(['AAA', 'CCC', 'BBB'], { criteria: ['AAA', 'BBB'] })
      expect(results).toEqual(['AAA', 'BBB'])
    })

    it('should output a sublist with single criteria matching', async () => {
      const proc = new Processor()
      const results = await proc.process(['AAA', 'CCC', 'BBB'], { criteria: ['AAA', 'DDD'] })
      expect(results).toEqual(['AAA'])
    })

    it('should output a empty list with no criteria matching', async () => {
      const proc = new Processor()
      const results = await proc.process(['AAA', 'CCC', 'BBB'], { criteria: ['EEE', 'DDD'] })
      expect(results).toEqual([])
    })
  })
})
