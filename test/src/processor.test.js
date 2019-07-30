const Processor = require('../../src/processor')
const chai = require('chai')
const chaiPromise = require('chai-as-promised')

chai.use(chaiPromise)
const expect = chai.expect

describe('Processor', function () {
  describe('describe()', function () {
    it('should contain mandatory description fields', async function () {
      const proc = new Processor()
      const description = await proc.describe()
      expect(description).to.have.all.keys('name', 'description', 'inputHint', 'outputHint', 'configuration')
    })
  })

  describe('process()', function () {
    it('should by default pass through input', async function () {
      const proc = new Processor()
      const processed = await proc.process('value', null)
      expect(processed).equal('value')
    })
  })
})
