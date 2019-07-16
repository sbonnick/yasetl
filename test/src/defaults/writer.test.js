const Writer = require('../../../src/defaults/writer')
const chai = require('chai')
const chaiPromise = require('chai-as-promised')

chai.use(chaiPromise)
const expect = chai.expect

describe('Default Writer', () => {
  describe('open()', () => {
    it('open function exists', async function () {
      const writer = new Writer({})
      expect(writer.open).to.not.equal(null)
    })
  })
  describe('items()', () => {
    it('items function throws a not-implemented error', async function () {
      const writer = new Writer({})
      expect(writer.items([], {})).to.be.rejectedWith(Error)
    })
  })
  describe('close()', () => {
    it('close function exists', async function () {
      const writer = new Writer({})
      expect(writer.close).to.not.equal(null)
    })
  })
})