
const SQL = require('../../../../src/plugins/writers/sql')

jest.mock('sequelize', () => {
  return require('sequelize-mock') 
})

describe('Jira-Parser', () => {
  let config

  beforeEach(() => {
    config = {
      connection: 'postgres://user:pass@example.com:5432/dbname',
      table: 'data',
      fields: {
        id: {
          input: 'RECORD.id',
          datatype: 'integer',
          primary: true
        },
        budget: {
          input: 'RECORD.labels',
          datatype: 'text',
          processors: [{
            processor: 'ArrayFilter',
            criteria: ['aaa', 'ccc']
          }]
        }
      }
    }
  })

  describe('items()', () => {
    it('query items from the model', async () => {
      const sql = new SQL(config)
      await sql.open()

      await sql.items([
        { 
          id: 1234,
          budget: 'defect'
        }, {
          id: 636,
          budget: 'feature'
        }
      ])

      const query = await sql.model.findById(1234)

      expect(sql.db.getDialect()).toEqual('mock')
      expect(query.get('budget')).not.toEqual(undefined)
    })
  })

  describe('close()', () => {
    it('opens and then closes a mock db', async () => {
      const sql = new SQL(config)
      await sql.open()
      await sql.close()
      expect(sql.db).toEqual(undefined)
    })
  })

  describe('open()', () => {
    it('opens a connection to an mock db with expected fields', async () => {
      const sql = new SQL(config)
      await sql.open()
      expect(sql.db.getDialect()).toEqual('mock')
      expect(sql.db.isDefined(config.table)).toEqual(true)

      const schema = {
        id: {
          primaryKey: true
        },
        budget: {
          primaryKey: false
        }
      }

      expect(sql.db.model(config.table)._defaults).toMatchObject(schema)
    })
  })
})