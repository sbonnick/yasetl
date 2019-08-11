const Postgres = require('../../../../src/plugins/writers/postgres')

describe('Postgres', () => {
  describe('open()', () => {
    let postgres, _connect, _createTableSchema, _dropTable, _createTable
    
    beforeEach(() => {
      postgres = new Postgres({ connection: '' })

      _connect = jest.spyOn(postgres, '_connect')
      _connect.mockImplementation(async () => { return undefined })
      
      _createTableSchema = jest.spyOn(postgres, '_createTableSchema')
      _createTableSchema.mockImplementation(async () => { return undefined })

      _dropTable = jest.spyOn(postgres, '_dropTable')
      _dropTable.mockImplementation(async () => { return undefined })

      _createTable = jest.spyOn(postgres, '_createTable')      
      _createTable.mockImplementation(async () => { return undefined })
    })

    it('attempts to connect, create schema, drop table and create table', async () => {
      await postgres.open()
      
      expect(_connect).toHaveBeenCalled()
      expect(_createTableSchema).toHaveBeenCalled()
      expect(_dropTable).toHaveBeenCalled()
      expect(_createTable).toHaveBeenCalled()
    })

    it('retries upon failed connection then rejects', async () => {
      let result
      try {
        _connect.mockImplementation(async () => Promise.reject(new Error('Fake Rejection')))
        result = postgres.open()
        await Promise.all([result])
        // eslint-disable-next-line
      } catch {}
      
      await expect(result).rejects.toThrow(/Fake Rejection/)
      expect(_connect).toHaveBeenCalledTimes(5)
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
