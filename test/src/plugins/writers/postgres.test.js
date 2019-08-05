const Postgres = require('../../../../src/plugins/writers/postgres')
const chai = require('chai')
const chaiPromise = require('chai-as-promised')
const td = require('testdouble')

chai.use(chaiPromise)
const expect = chai.expect

describe('Postgres', function () {
  const any = td.matchers.anything()

  describe('open()', function () {
    let postgres, _connect, _createTableSchema, _dropTable, _createTable
    
    beforeEach(function () {
      postgres = new Postgres({ connection: '' })
      _connect = td.replace(postgres, '_connect')
      _createTableSchema = td.replace(postgres, '_createTableSchema')
      _dropTable = td.replace(postgres, '_dropTable')
      _createTable = td.replace(postgres, '_createTable')
    })

    it('attempts to connect, create schema, drop table and create table', async function () {
      await postgres.open()
      
      td.verify(_connect(any))
      td.verify(_createTableSchema(any))
      td.verify(_dropTable(any, any))
      td.verify(_createTable(any, any, any))
    })

    it('retries upon failed connection then rejects', async function () {
      let result
      try {
        td.when(_connect(any)).thenReject(new Error('Fake Rejection'))
        result = postgres.open()
        await Promise.all([result])
      } catch (error) {
        console.log(error)
      }

      expect(result).to.be.rejectedWith('Fake Rejection')
      td.verify(_connect(), { times: 5, ignoreExtraArgs: true })
    })

    afterEach(function () {
      td.reset()
    })
  })

  describe('close()', function () {
    it('closes and deletes db object', function () {
      const postgres = new Postgres({ connection: '' })
      postgres.close()
      expect(postgres.db).to.equal(undefined)
    })
  })
})
