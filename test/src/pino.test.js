const pino = require('../../src/pino')
const expect = require('chai').expect

describe('Pino', function () {
  describe('configurations', function () {
    it('should configure a basic logger for the application', async function () {
      const logger = pino
      expect(logger).to.not.equal(null)
    })
  })
})
