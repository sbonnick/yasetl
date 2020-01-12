const Processor = require('../../../../src/plugins/processors/jira-status-changes')

describe('Array Join Processor', () => {
  describe('describe()', () => {
    it('should contain mandatory description fields', async () => {
      const proc = new Processor()
      const description = await proc.describe()
      expect(description).toHaveProperty('name')
      expect(description).toHaveProperty('description')
      expect(description).toHaveProperty('inputHint')
      expect(description).toHaveProperty('outputHint')
      expect(description).toHaveProperty('configuration')
    })

    it('should contain override name', async () => {
      const proc = new Processor()
      const description = await proc.describe()
      expect(description.name).toEqual('Jira Status Changes')
    })
  })

  describe('process()', () => {
    it('should output the correct date for the In Progress state', async () => {
      const proc = new Processor()
      const results = await proc.process([
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
      ])
      expect(results).toEqual({ inprogress: '2019-01-01T11:09:08.000-0800' })
    })

    it('should output blank object if a incorrect Array of type histories is given', async () => {
      const proc = new Processor()
      const results = await proc.process([
        {
          nocreated: '2019-01-01T11:09:08.000-0800',
          items: [
            {
              nofield: 'status',
              fieldtype: 'jira',
              from: '10000',
              fromString: 'To Do',
              to: '3',
              notoString: 'In Progress'
            }
          ]
        }
      ])
      expect(results).toEqual({})
    })

    it('should output null if no Array is given', async () => {
      const proc = new Processor()
      const results = await proc.process({})
      expect(results).toEqual(null)
    })
  })
})
