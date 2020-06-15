const SchemaExtractor = require('../../src/schema-extractor')
const moment = require('moment')
const Sequelize = require('sequelize')
const tmp = require('tmp')
const fs = require('fs')

jest.setTimeout(60000)
tmp.setGracefulCleanup()

describe('SchemaExtractor', () => {
  describe('constructor()', () => {
    it('throw error without a schema version in the configuration', async () => { 
      expect(() => new SchemaExtractor({})).toThrow(/no schemaVersion is specified/)
    })
  })

  describe('extract()', () => {
    let config

    beforeEach(() => {
      config = {
        schemaVersion: '0.1',
        source: {
          engine: 'Passthrough',
          items: [{
            id: 34523,
            name: 'bob',
            labels: ['aaa', 'bbb', 'ccc']
          }, {
            id: 2353,
            name: 'jane',
            labels: ['ddd', 'ccc']
          }]
        },
        destination: {
          engine: 'Passthrough'
        },
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
            }, {
              processor: 'StringFormat',
              format: 'lowercase'
            }]
          }
        }
      }
    })
    it('should extract simple passthrough data given a schema config', async () => {
      const extractor = new SchemaExtractor(config)    
      const result = await extractor.extract()
      expect(result.count).toEqual(2)
    })

    it('should extract simple passthrough data given a schema config and a fire date', async () => {
      const extractor = new SchemaExtractor(config)    
      const result = await extractor.extract(moment.now())
      expect(result.count).toEqual(2)
    })

    it('should create a dubug file when sampling is set', async () => {
      jest.spyOn(fs, 'writeFileSync').mockImplementation()
      const extractor = new SchemaExtractor({
        ...config,
        settings: {
          debug: {
            samples: 1
          }
        }
      }) 
      await extractor.extract(moment.now())   
      expect(fs.writeFileSync).toHaveBeenCalled()
    })

    it('should extract simple passthrough data given SQLite output', async () => {
      config.destination.engine = 'SQL'
      config.destination.table = 'mydbs'

      const tmpobj = await tmp.fileSync({ postfix: '.db' })
  
      config.destination.connection = 'sqlite:' + tmpobj.name
      console.log(config.destination.connection)
      
      const extractor = new SchemaExtractor(config)
      const result = await extractor.extract(moment.now())

      // @ts-ignore
      const directSQL = new Sequelize({
        dialect: 'sqlite',
        storage: tmpobj.name,
        type: Sequelize.QueryTypes.SELECT
      })
      const confirmDB = await directSQL.query('SELECT * FROM mydbs')

      await directSQL.close()

      tmpobj.removeCallback()

      expect(result.count).toEqual(2)
      expect(confirmDB[0].length).toEqual(2)
      expect(confirmDB[0]).toMatchObject([{
        id: 2353,
        budget: 'ccc'
      }, {
        id: 34523,
        budget: 'aaa ccc'
      }])
    })
  })
})
