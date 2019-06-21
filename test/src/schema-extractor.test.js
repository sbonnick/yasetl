const SchemaExtractor = require('../../src/schema-extractor')
const expect = require('chai').expect

describe('SchemaExtractor', () => {
  describe('extract()', () => {
    it('should extract simple passthrough data given a schema config', async function () {
      let config = {
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

      let extractor = new SchemaExtractor(config)    
      let result = await extractor.extract()

      expect(result.destination.items).to.have.lengthOf(2)
    })
  })
})
