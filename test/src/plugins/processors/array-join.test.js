const Processor = require('../../../../src/plugins/processors/array-join')

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
      expect(description.name).toEqual('Join Array')
    })
  })

  describe('process()', () => {
    it('should output a string of the array joined by default on space', async () => {
      const proc = new Processor()
      const results = await proc.process(['AAA', 'CCC', 'BBB'])
      expect(results).toEqual('AAA, CCC, BBB')
    })

    it('should output a string given a space joinOn character', async () => {
      const proc = new Processor()
      const results = await proc.process(['AAA', 'CCC', 'BBB'], { joinOn: ' ' })
      expect(results).toEqual('AAA CCC BBB')
    })

    it('should output a empty list with no criteria matching', async () => {
      const proc = new Processor()
      const results = await proc.process(['AAA', 'CCC', 'BBB'], { joinOn: null })
      expect(results).toEqual(null)
    })
  })
})
