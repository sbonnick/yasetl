const Processor    = require('../../../src/processors/string-format');
const chai         = require('chai');
const chaiPromise  = require('chai-as-promised');
const sinon        = require('sinon');
const test         = require('sinon-test')(sinon);

chai.use(chaiPromise);
const expect = chai.expect;

describe('String Format Processor', () => {

  describe('describe()', () => {
    it('should contain mandatory description fields', test(async function() {
      let proc = new Processor()
      let description = await proc.describe()
      expect(description).to.have.all.keys('name', 'description', 'inputHint', 'outputHint', 'configuration')
    }))

    it('should contain override name', test(async function() {
      let proc = new Processor()
      let description = await proc.describe()
      expect(description.name).equals('Format String')
    }))
  })

  describe('process()', () => {
    it('should by default pass through input when configuration is null', test(async function() {
      let proc = new Processor()
      let processed = await proc.process('value', null)
      expect(processed).equal('value')
    }))

    it('should by default pass through input when configuration does not containa format', test(async function() {
      let proc = new Processor()
      let processed = await proc.process('value', {})
      expect(processed).equal('value')
    }))

    let cmd = [
      {value: "tHIS ShouldFunction correctlyAs EXPECTED", config: {format: "lowercase"}, result: "this shouldfunction correctlyas expected"},
      {value: "tHIS ShouldFunction correctlyAs EXPECTED", config: {format: "uppercase"}, result: "THIS SHOULDFUNCTION CORRECTLYAS EXPECTED"},
      {value: "tHIS ShouldFunction correctlyAs EXPECTED", config: {format: "propercase"}, result: "This shouldfunction correctlyas expected"},
      {value: "tHIS ShouldFunction correctlyAs EXPECTED", config: {format: "camelcase"}, result: "tHisShouldFunctionCorrectlyAsExpected"},
      {value: "", config: {format: ""}, result: ""},
      {value: 3465, config: {format: "lowercase"}, result: '3465'},
      {value: null, config: {format: null}, result: null},
    ]

    cmd.forEach(function(input) {
      it('should return correct case given the input cast ' + input.config.format + '', test(async function() {
        let proc = new Processor()
        let processed = await proc.process(input.value, input.config)
        expect(processed).to.equal(input.result)
      }))
    })
  })
})