const pino = require('../../src/pino')

describe('Pino', () => {
  describe('configurations', () => {
    it('should configure a basic logger for the application', async () => {
      const logger = pino
      expect(logger).not.toEqual(null)
    })
  })
})
