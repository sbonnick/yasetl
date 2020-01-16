const Processor = require('../../../../src/plugins/processors/string-replace')

describe('String Replace Processor', () => {
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
      expect(description.name).toEqual('Replace String')
    })
  })

  describe('process()', () => {
    const commonInput = 'tHIS ShouldFunction correctlyAs EXPECTED'
    const cmd = [
      { test: 'should by default pass through input when configuration is null', value: commonInput, config: null, result: commonInput },
      { test: 'should by default pass through input when configuration does not contain with', value: commonInput, config: {}, result: commonInput },
      { test: 'should by default pass through input when value in blank', value: '', config: {}, result: '' },
      { test: 'should return correct replacement given simple string', value: 'Cab3465', config: { with: '3213', regex: 'ab' }, result: 'C32133465' },
      { test: 'should return correct replacement with case insensitivty regex', value: 'Cab3465', config: { with: '3213', regex: 'Ab' }, result: 'C32133465' },
      { test: 'should return value and not replace with case insensitivty turned on and match required off', value: 'Cab3465', config: { with: '3213', regex: 'Ab', flags: 'g', mustMatch: false }, result: 'Cab3465' },
      { test: 'should return correct replacement given integers returned as string', value: 3465, config: { with: '3213', regex: '34' }, result: '321365' },
      { test: 'should return correct replacement given all null values', value: null, config: { with: null, regex: null }, result: null },
      { test: 'should return correct replacement given object returned as string', value: { with: null }, config: { with: 'something', regex: 'null' }, result: '{"with":something}' },
      { test: 'should return null replacement when no match occurres and mustMatch is set', value: '3465', config: { with: '3213', regex: '84', mustMatch: true }, result: null }

    ]

    cmd.forEach(function (input) {
      it(input.test, async () => {
        const proc = new Processor()
        const processed = await proc.process(input.value, input.config)
        expect(processed).toEqual(input.result)
      })
    })
  })
})
