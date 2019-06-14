const SchemaExtractor = require('../../src/schema-extractor')
const withFile = require('tmp-promise').withFile
const expect = require('chai').expect

describe('SchemaExtractor', () => {
  describe('extract()', () => {
    it('should extract and transform a simple data set from CSV to CSV', async function () {
      withFile(async ({ path, fd }) => {
        // when this function returns or throws - release the file 
        let extractor = new SchemaExtractor({
          schemaVersion: '0.1',
          source: {
            engine: 'csv',
            location: '../../resources/sources/simple.csv'
          },
          destination: {
            engine: 'csv',
            location: '../../resources/sources/simple.csv'
          },
          fields: {
            
          }
        })    

        expect(extractor).to.equal(null)
      })
    })
  })
})
