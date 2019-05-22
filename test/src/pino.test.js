const pino = require('../../src/pino')
const chai = require('chai')
const sinon = require('sinon')
const test = require('sinon-test')(sinon)

const expect = chai.expect

describe('Pino', () => {
  describe('configurations', () => {
    it('should configure a basic logger for the application', test(async function () {
      let logger = pino
      expect(logger).to.not.equal(null)
    }))
  })
})
