const Reader = require('../../../src/defaults/reader')
const chai = require('chai')
const chaiPromise = require('chai-as-promised')

chai.use(chaiPromise)
const expect = chai.expect

describe('Default Reader', () => {
  describe('open()', () => {
    it('open function exists', async function () {
      let writer = new Reader({})
      expect(writer.open).to.not.equal(null)
    })
  })
  describe('items()', () => {
    it('items function throws a not-implemented error', async function () {
      let writer = new Reader({})
      expect(writer.items({})).to.be.rejectedWith(Error)
    })
  })
  describe('close()', () => {
    it('close function exists', async function () {
      let writer = new Reader({})
      expect(writer.close).to.not.equal(null)
    })
  })
})