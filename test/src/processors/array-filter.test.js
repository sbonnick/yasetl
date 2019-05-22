const Processor = require('../../../src/processors/array-filter')
const chai = require('chai')
const chaiPromise = require('chai-as-promised')
const sinon = require('sinon')
const test = require('sinon-test')(sinon)

chai.use(chaiPromise)
const expect = chai.expect

describe('Array Filter Processor', () => {
  describe('describe()', () => {
    it('should contain mandatory description fields', test(async function () {
      let proc = new Processor()
      let description = await proc.describe()
      expect(description).to.have.all.keys('name', 'description', 'inputHint', 'outputHint', 'configuration')
    }))

    it('should contain override name', test(async function () {
      let proc = new Processor()
      let description = await proc.describe()
      expect(description.name).equals('Filter Array')
    }))
  })

  describe('process()', () => {
    it('should output a sublist with all criteria matching', test(async function () {
      let proc = new Processor()
      let results = await proc.process([ 'AAA', 'CCC', 'BBB' ], { criteria: ['AAA', 'BBB'] })
      expect(results).to.eql(['AAA', 'BBB'])
    }))

    it('should output a sublist with single criteria matching', test(async function () {
      let proc = new Processor()
      let results = await proc.process([ 'AAA', 'CCC', 'BBB' ], { criteria: ['AAA', 'DDD'] })
      expect(results).to.eql(['AAA'])
    }))

    it('should output a empty list with no criteria matching', test(async function () {
      let proc = new Processor()
      let results = await proc.process([ 'AAA', 'CCC', 'BBB' ], { criteria: ['EEE', 'DDD'] })
      expect(results).to.eql([])
    }))
  })
})
