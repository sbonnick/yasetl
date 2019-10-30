
const SQL = require('../../../../src/plugins/writers/sql')
const Sequelize = require('sequelize')
const SequelizeMock = require('sequelize-mock')

describe('Jira-Parser', () => {
  let config, schema

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
    
    schema = {
      id: {
        type: Sequelize.INTEGER(),
        primaryKey: true,
        fieldName: 'id',
        field: 'id'
      },
      budget: {
        type: Sequelize.STRING(),
        primaryKey: false,
        fieldName: 'budget',
        field: 'budget'
      }
    }
  })

  describe('items()', () => {
    it('query items from the model', async () => {
      const sql = new SQL(config)
      await sql.open()
      sql.db = new SequelizeMock(config.connection)
      sql.model = sql.db.define(
        config.table,
        sql._createModel(config.fields),
        {}
      )

      await sql.items([
        { 
          id: 1234,
          budget: 'defect'
        }, {
          id: 636,
          budget: 'feature'
        }
      ])

      expect(sql.db.getDialect()).toEqual('mock')
    })
  })

  describe('close()', () => {
    it('opens and then closes a db', async () => {
      const sql = new SQL(config)
      await sql.open()
      await sql.close()
      expect(sql.db).toEqual(undefined)
    })
  })

  describe('open()', () => {
    it('opens a connection to an expected postgres db with expected fields', async () => {
      const sql = new SQL(config)
      await sql.open()
      expect(sql.db.getDialect()).toEqual('postgres')
      expect(sql.db.isDefined(config.table)).toEqual(true)
      expect(sql.db.model(config.table).rawAttributes).toMatchObject(schema)
    })
  })
})