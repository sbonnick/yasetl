const Processor = require('../../../../src/plugins/processors/array-search')

describe('Array Search Processor', () => {
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
      expect(description.name).toEqual('Search Array')
    })
  })

  describe('process()', () => {
    it('should output a sublist with all items matching', async () => {
      const proc = new Processor()
      const results = await proc.process(['AAA', 'CCC', 'BBB'], { regex: '[A,B,C]{3}' })
      expect(results).toEqual(['AAA', 'CCC', 'BBB'])
    })

    it('should output a sublist with single item matching', async () => {
      const proc = new Processor()
      const results = await proc.process(['AAA', 'CCC', 'BBB'], { regex: '[A]{3}' })
      expect(results).toEqual(['AAA'])
    })

    it('should output a empty list with no items matching', async () => {
      const proc = new Processor()
      const results = await proc.process(['AAA', 'CCC', 'BBB'], { regex: '[D]{3}' })
      expect(results).toEqual([])
    })

    it('should output a null with input of null', async () => {
      const proc = new Processor()
      const results = await proc.process(null, { regex: null })
      expect(results).toEqual(null)
    })
  })
})
