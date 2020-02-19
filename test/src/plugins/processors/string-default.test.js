const Processor = require('../../../../src/plugins/processors/string-default')

describe('String Default Processor', () => {
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
      expect(description.name).toEqual('Default Value')
    })
  })

  describe('process()', () => {
    const cmd = [
      { test: 'should return input value when not null', value: 'foo', config: { default: 'bar' }, result: 'foo' },
      { test: 'should return default value when input is null', value: null, config: { default: 'bar' }, result: 'bar' },
      { test: 'should return null if no default provided', value: null, config: { default: null }, result: null }
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
