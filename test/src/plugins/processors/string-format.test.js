const Processor = require('../../../../src/plugins/processors/string-format')
const chai = require('chai')
const chaiPromise = require('chai-as-promised')

chai.use(chaiPromise)
const expect = chai.expect

describe('String Format Processor', function () {
  describe('describe()', function () {
    it('should contain mandatory description fields', async function () {
      const proc = new Processor()
      const description = await proc.describe()
      expect(description).to.have.all.keys('name', 'description', 'inputHint', 'outputHint', 'configuration')
    })

    it('should contain override name', async function () {
      const proc = new Processor()
      const description = await proc.describe()
      expect(description.name).equals('Format String')
    })
  })

  describe('process()', function () {
    const commonInput = 'tHIS ShouldFunction correctlyAs EXPECTED'
    const cmd = [
      { test: 'should by default pass through input when configuration is null', value: commonInput, config: null, result: commonInput },
      { test: 'should by default pass through input when configuration does not containa format', value: commonInput, config: {}, result: commonInput },
      { test: 'should return correct case given format lowercase', value: commonInput, config: { format: 'lowercase' }, result: 'this shouldfunction correctlyas expected' },
      { test: 'should return correct case given format uppercase', value: commonInput, config: { format: 'uppercase' }, result: 'THIS SHOULDFUNCTION CORRECTLYAS EXPECTED' },
      { test: 'should return correct case given format propercase', value: commonInput, config: { format: 'propercase' }, result: 'This shouldfunction correctlyas expected' },
      { test: 'should return correct case given format camelcase', value: commonInput, config: { format: 'camelcase' }, result: 'tHisShouldFunctionCorrectlyAsExpected' },
      { test: 'should return correct case given blank string values', value: '', config: { format: '' }, result: '' },
      { test: 'should return correct case given integers returned as string', value: 3465, config: { format: 'lowercase' }, result: '3465' },
      { test: 'should return correct case given all null values', value: null, config: { format: null }, result: null },
      { test: 'should return correct case given format camelcase and array input', value: ['blah', 'foo', 'bar'], config: { format: 'camelcase', joinOn: ',' }, result: 'blahFooBar' },
      { test: 'should return correct case given format camelcase and object input', value: { foo: 'bar' }, config: { format: 'camelcase' }, result: 'fooBar' }
    ]

    cmd.forEach(function (input) {
      it(input.test, async function () {
        const proc = new Processor()
        const processed = await proc.process(input.value, input.config)
        expect(processed).to.equal(input.result)
      })
    })
  })
})
