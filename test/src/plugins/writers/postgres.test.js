const Postgres = require('../../../../src/plugins/writers/postgres')
const td = require('testdouble')

describe('Postgres', () => {
  const any = td.matchers.anything()

  describe('open()', () => {
    let postgres, _connect, _createTableSchema, _dropTable, _createTable
    
    beforeEach(() => {
      postgres = new Postgres({ connection: '' })
      _connect = td.replace(postgres, '_connect')
      _createTableSchema = td.replace(postgres, '_createTableSchema')
      _dropTable = td.replace(postgres, '_dropTable')
      _createTable = td.replace(postgres, '_createTable')
    })

    it('attempts to connect, create schema, drop table and create table', async () => {
      await postgres.open()
      
      td.verify(_connect(any))
      td.verify(_createTableSchema(any))
      td.verify(_dropTable(any, any))
      td.verify(_createTable(any, any, any))
    })

    it('retries upon failed connection then rejects', async () => {
      let result
      try {
        td.when(_connect(any)).thenReject(new Error('Fake Rejection'))
        result = postgres.open()
        await Promise.all([result])
      // eslint-disable-next-line
      } catch { }

      await expect(result).rejects.toThrow(/Fake Rejection/)
      td.verify(_connect(), { times: 5, ignoreExtraArgs: true })
    })

    afterEach(() => {
      td.reset()
    })
  })

  describe('close()', () => {
    it('closes and deletes db object', () => {
      const postgres = new Postgres({ connection: '' })
      postgres.close()
      expect(postgres.db).toEqual(undefined)
    })
  })
})
