const Processor = require('../../../src/processors/string-format')
const chai = require('chai')
const chaiPromise = require('chai-as-promised')
const sinon = require('sinon')
const test = require('sinon-test')(sinon)

chai.use(chaiPromise)
const expect = chai.expect

describe('String Format Processor', () => {
  describe('describe()', () => {
    it('should contain mandatory description fields', test(async function () {
      let proc = new Processor()
      let description = await proc.describe()
      expect(description).to.have.all.keys('name', 'description', 'inputHint', 'outputHint', 'configuration')
    }))

    it('should contain override name', test(async function () {
      let proc = new Processor()
      let description = await proc.describe()
      expect(description.name).equals('Format String')
    }))
  })

  describe('process()', () => {
    let commonInput = 'tHIS ShouldFunction correctlyAs EXPECTED'
    let cmd = [
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
      it(input.test, test(async function () {
        let proc = new Processor()
        let processed = await proc.process(input.value, input.config)
        expect(processed).to.equal(input.result)
      }))
    })
  })
})
