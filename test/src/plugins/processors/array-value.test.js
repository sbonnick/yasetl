const Processor = require('../../../../src/plugins/processors/array-value')

describe('Array Join Processor', () => {
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
      expect(description.name).toEqual('Array Value')
    })
  })

  describe('process()', () => {
    it('should output a first value as string', async () => {
      const proc = new Processor()
      const results = await proc.process(['AAA', 'CCC', 'BBB'], { criteria: 'first' })
      expect(results).toEqual('AAA')
    })

    it('should output last value as string', async () => {
      const proc = new Processor()
      const results = await proc.process(['AAA', 'CCC', 'BBB'], { criteria: 'last' })
      expect(results).toEqual('BBB')
    })

    it('should output null with empty array with first', async () => {
      const proc = new Processor()
      const results = await proc.process([], { criteria: 'first' })
      expect(results).toEqual(null)
    })

    it('should output null with empty array with last', async () => {
      const proc = new Processor()
      const results = await proc.process([], { criteria: 'last' })
      expect(results).toEqual(null)
    })
    it('should output null value with invalid or no critiera', async () => {
      const proc = new Processor()
      const results = await proc.process(['AAA', 'CCC', 'BBB'], { criteria: null })
      expect(results).toEqual(null)
    })

    it('should output a null with input of null', async () => {
      const proc = new Processor()
      const results = await proc.process(null, { criteria: 'first' })
      expect(results).toEqual(null)
    })
  })
})
