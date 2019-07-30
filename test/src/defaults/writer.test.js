const Writer = require('../../../src/defaults/writer')
const chai = require('chai')
const chaiPromise = require('chai-as-promised')

chai.use(chaiPromise)
const expect = chai.expect

describe('Default Writer', function () {
  describe('open()', function () {
    it('open function exists', async function () {
      const writer = new Writer({})
      expect(writer.open).to.not.equal(null)
    })
  })
  describe('items()', function () {
    it('items function throws a not-implemented error', async function () {
      const writer = new Writer({})
      expect(writer.items([], {})).to.be.rejectedWith(Error)
    })
  })
  describe('close()', function () {
    it('close function exists', async function () {
      const writer = new Writer({})
      expect(writer.close).to.not.equal(null)
    })
  })
})