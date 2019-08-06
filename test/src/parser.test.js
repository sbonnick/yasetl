const Parser = require('../../src/parser')
const chai = require('chai')
const chaiPromise = require('chai-as-promised')

chai.use(chaiPromise)
const expect = chai.expect

describe('Parser', function () {
  let basicFields, item

  beforeAll(function () {
    basicFields = {
      id: {
        input: 'RECORD.id',
        datatype: 'integer',
        primary: true
      },
      budget: {
        input: 'RECORD.fields.labels',
        datatype: 'text',
        processors: [{
          processor: 'ArrayFilter',
          criteria: ['AAA', 'BBB']
        }]
      }
    }

    item = {
      id: 123456,
      fields: {
        components: [
          { name: 'Gateway' },
          { name: 'BackEnd' },
          { name: 'frontend' }
        ],
        labels: ['AAA', 'CCC', 'BBB'],
        created: '2018-12-11T08:14:28.000-0800',
        resolutiondate: '2019-01-03T13:08:18.000-0800'
      },
      changelog: {
        startAt: 0,
        maxResults: 11,
        total: 11,
        histories: [
          {
            created: '2019-01-01T11:09:08.000-0800',
            items: [
              {
                field: 'status',
                fieldtype: 'jira',
                from: '10000',
                fromString: 'To Do',
                to: '3',
                toString: 'In Progress'
              }
            ]
          }
        ]
      }
    }
  })

  describe('init()', function () {
    it('should load processors and fields', async function () {
      const parser = await Parser.init(basicFields)
      expect(parser.fields).to.contain.keys('id', 'budget')
      expect(parser.processors).to.contain.keys('ArrayFilter', 'StringFormat')
    })
  })

  describe('parseItem()', function () {
    it('should parse config against RECORDS', async function () {
      const parser = await Parser.init(basicFields)
      const result = await parser.parseItem(item)
      expect(result).to.have.keys('id', 'budget')
      expect(result.id).to.equal(123456)
      expect(result.budget).to.eql(['AAA', 'BBB'])
    })

    it('should parse config against FIELDS', async function () {
      const input = { ...basicFields, 
        refid: {
          input: 'FIELD.id',
          datatype: 'integer'
        }
      }
      const parser = await Parser.init(input)
      const result = await parser.parseItem(item)
      expect(result).to.have.keys('id', 'refid', 'budget')
      expect(result.id).to.equal(123456)
      expect(result.refid).to.equal(123456)
      expect(result.budget).to.eql(['AAA', 'BBB'])
    })

    it('should reject with error on unrecognized input', async function () {
      const input = { 
        refid: {
          input: 'SOMETHING.id',
          datatype: 'integer'
        }
      }
      const parser = await Parser.init(input)
      const result = parser.parseItem(item)
      expect(result).to.be.rejectedWith(Error)
    })
  })

  describe('parse()', function () {
    it('should pass basic config', async function () {
      const parser = await Parser.init(basicFields)
      const result = await parser.parse([item])
      expect(result).to.have.lengthOf(1)
      expect(result[0]).to.have.keys('id', 'budget')
      expect(result[0].id).to.equal(123456)
      expect(result[0].budget).to.eql(['AAA', 'BBB'])
    })
  })
})
