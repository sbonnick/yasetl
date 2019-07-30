const Processor = require('../../../../src/plugins/processors/array-filter')
const chai = require('chai')
const chaiPromise = require('chai-as-promised')

chai.use(chaiPromise)
const expect = chai.expect

describe('Array Filter Processor', function () {
  describe('describe()', function () {
    it('should contain mandatory description fields', async function () {
      const proc = new Processor()
      const description = await proc.describe()
      expect(description).to.have.all.keys('name', 'description', 'inputHint', 'outputHint', 'configuration')
    })

    it('should contain override name', async function () {
      const proc = new Processor()
      const description = await proc.describe()
      expect(description.name).equals('Filter Array')
    })
  })

  describe('process()', function () {
    it('should output a sublist with all criteria matching', async function () {
      const proc = new Processor()
      const results = await proc.process(['AAA', 'CCC', 'BBB'], { criteria: ['AAA', 'BBB'] })
      expect(results).to.eql(['AAA', 'BBB'])
    })

    it('should output a sublist with single criteria matching', async function () {
      const proc = new Processor()
      const results = await proc.process(['AAA', 'CCC', 'BBB'], { criteria: ['AAA', 'DDD'] })
      expect(results).to.eql(['AAA'])
    })

    it('should output a empty list with no criteria matching', async function () {
      const proc = new Processor()
      const results = await proc.process(['AAA', 'CCC', 'BBB'], { criteria: ['EEE', 'DDD'] })
      expect(results).to.eql([])
    })
  })
})
