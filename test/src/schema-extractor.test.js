const SchemaExtractor = require('../../src/schema-extractor')
const moment = require('moment')

jest.setTimeout(60000)

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
            }]
          }
        }
      }
    })
    it('should extract simple passthrough data given a schema config', async () => {
      const extractor = new SchemaExtractor(config)    
      const result = await extractor.extract()
      expect(result.destination.items.length).toEqual(2)
    })

    it('should extract simple passthrough data given a schema config and a fire date', async () => {
      const extractor = new SchemaExtractor(config)    
      const result = await extractor.extract(moment.now())
      expect(result.destination.items.length).toEqual(2)
    })
  })
})
