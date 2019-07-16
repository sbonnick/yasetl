const Postgres = require('../../../../src/plugins/writers/postgres')
const chai = require('chai')
const chaiPromise = require('chai-as-promised')

chai.use(chaiPromise)
const expect = chai.expect

describe('Postgres', () => {
  describe('open()', () => {
    it('Initialize as a writer implementation', async function () {
      const postgres = new Postgres({})
      // TODO: mock the _connect() function to return a mock db
      expect(postgres.db).to.equal(undefined)
    })
  })
})