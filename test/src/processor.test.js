const Processor    = require('../../src/processor');
const chai         = require('chai');
const chaiPromise  = require('chai-as-promised');
const sinon        = require('sinon');
const test         = require('sinon-test')(sinon);

chai.use(chaiPromise);
const expect = chai.expect;

describe('Processor', () => {

  describe('describe()', () => {
    it('should contain mandatory description fields', test(async function() {
      let proc = new Processor()
      let description = await proc.describe()
      expect(description).to.have.all.keys('name', 'description', 'inputHint', 'outputHint', 'configuration')
    }))
  })

  describe('process()', () => {
    it('should by default pass through input', test(async function() {
      let proc = new Processor()
      let processed = await proc.process('value', null)
      expect(processed).equal('value')
    }))
  })
})