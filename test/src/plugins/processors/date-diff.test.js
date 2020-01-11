const Processor = require('../../../../src/plugins/processors/date-diff')

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
      expect(description.name).toEqual('Date Differance')
    })
  })

  describe('process()', () => {
    it('should output the difference between two dates correct in days', async () => {
      const proc = new Processor()
      const results = await proc.process('2020-02-12', { against: '2020-02-18' })
      expect(results).toEqual(7)
    })

    it('should output the difference between two dates correct in workdays', async () => {
      const proc = new Processor()
      const results = await proc.process('2020-02-12', { against: '2020-02-18', in: 'workdays' })
      expect(results).toEqual(5)
    })

    it('should output the difference between two dates correct in days, even when dates are in reverse', async () => {
      const proc = new Processor()
      const results = await proc.process('2020-02-18', { against: '2020-02-12' })
      expect(results).toEqual(6)
    })

    it('should output null if against value is null', async () => {
      const proc = new Processor()
      const results = await proc.process('2020-02-18', { against: null })
      expect(results).toEqual(null)
    })
  })
})
