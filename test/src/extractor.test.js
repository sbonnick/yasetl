const Extractor = require('../../src/jira-parser')
const expect = require('chai').expect

describe('Extractor', () => {
  describe('run()', () => {
    it.skip('One off extraction', function () {
      const extract = new Extractor()
      expect(extract).to.equal(true)
    })

    it.skip('Cron scheduled extraction', function () {
      const extract = new Extractor()
      expect(extract).to.equal(true)
    })
  })
})
