const SchemaExtractor = require('../../src/schema-extractor')
const expect = require('chai').expect
const moment = require('moment')

describe('SchemaExtractor', () => {
  describe('constructor()', () => {
    it('throw error without a schema version in the configuration', async function () {
      function expectFunc () { 
        let extract = new SchemaExtractor({}) 
        console.log(extract)
      }
      expect(expectFunc).to.throw('no schemaVersion is specified in the configuration')
    })
  })
  describe('extract()', () => {
    let config

    beforeEach(function () {
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
    it('should extract simple passthrough data given a schema config', async function () {
      let extractor = new SchemaExtractor(config)    
      let result = await extractor.extract()
      expect(result.destination.items).to.have.lengthOf(2)
    })

    it('should extract simple passthrough data given a schema config and a fire date', async function () {
      let extractor = new SchemaExtractor(config)    
      let result = await extractor.extract(moment.now())
      expect(result.destination.items).to.have.lengthOf(2)
    })
  })
})
