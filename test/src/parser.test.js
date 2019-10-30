const Parser = require('../../src/parser')

describe('Parser', () => {
  let basicFields, item

  beforeAll(() => {
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

  describe('init()', () => {
    it('should load processors and fields', async () => {
      const parser = await Parser.init(basicFields)
      expect(parser.fields).toHaveProperty('id')
      expect(parser.fields).toHaveProperty('budget')
      expect(parser.processors).toHaveProperty('ArrayFilter')
      expect(parser.processors).toHaveProperty('StringFormat')
    })
  })

  describe('parseItem()', () => {
    it('should parse config against RECORDS', async () => {
      const parser = await Parser.init(basicFields)
      const result = await parser.parseItem(item)
      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('budget')
      expect(result.id).toEqual(123456)
      expect(result.budget).toEqual(['AAA', 'BBB'])
    })

    it('should parse config against FIELDS', async () => {
      const input = { 
        ...basicFields, 
        refid: {
          input: 'FIELD.id',
          datatype: 'integer'
        }
      }
      const parser = await Parser.init(input)
      const result = await parser.parseItem(item)
      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('refid')
      expect(result).toHaveProperty('budget')
      expect(result.id).toEqual(123456)
      expect(result.refid).toEqual(123456)
      expect(result.budget).toEqual(['AAA', 'BBB'])
    })

    it('should reject with error on unrecognized input', async () => {
      const input = { 
        refid: {
          input: 'SOMETHING.id',
          datatype: 'integer'
        }
      }
      const parser = await Parser.init(input)
      const result = parser.parseItem(item)
      await expect(result).rejects.toThrow()
    })
  })

  describe('parse()', () => {
    it('should pass basic config', async () => {
      const parser = await Parser.init(basicFields)
      const result = await parser.parse([item])
      expect(result.length).toEqual(1)
      expect(result[0]).toHaveProperty('id')
      expect(result[0]).toHaveProperty('budget')
      expect(result[0].id).toEqual(123456)
      expect(result[0].budget).toEqual(['AAA', 'BBB'])
    })
  })
})
