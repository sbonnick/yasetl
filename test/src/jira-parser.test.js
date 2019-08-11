const JiraParser = require('../../src/jira-parser')

describe('Jira-Parser', () => {
  let item

  beforeAll(() => {
    item = {
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

  describe('Parse()', () => {
    it('should parse multiple issues', async () => {
      const parser = new JiraParser(null)
      const stub = jest.spyOn(parser, 'parseItem')
      stub.mockImplementation(async () => { return [] })
      await parser.parse(['one', 'two', 'three'])
      expect(stub).toHaveBeenCalledTimes(3)
    })
  })

  describe('ParseItem()', () => {
    it('should parse simple string mappings by default', async () => {
      const parser = new JiraParser({
        createdDate: 'fields.created'
      })

      const output = {
        createdDate: '2018-12-11T08:14:28.000-0800'
      }

      const results = await parser.parseItem(item)
      expect(results).toEqual(output)
    })

    it('should parse simple string mappings with no function specified', async () => {
      const parser = new JiraParser({
        createdDate: {
          source: 'fields.created'
        }
      })

      const output = {
        createdDate: '2018-12-11T08:14:28.000-0800'
      }

      const results = await parser.parseItem(item)
      expect(results).toEqual(output)
    })

    it('should parse complex and mixed field functions', async () => {
      const parser = new JiraParser({
        createdDate: 'fields.created',
        resolutionDate: {
          source: 'fields.resolutiondate',
          datatype: 'datetime'
        },
        inProgressDate: {
          source: 'fields.stateChangeDates.inprogress',
          datatype: 'datetime'
        },
        cycleTime: {
          function: 'daysdiff',
          source: 'fields.stateChangeDates.inprogress',
          criteria: 'fields.resolutiondate',
          datatype: 'integer'
        },
        catalog: {
          function: 'filter',
          return: 'first',
          source: 'fields.labels',
          criteria: ['AAA'],
          datatype: 'text'
        }
      })

      const output = {
        catalog: 'AAA',
        createdDate: '2018-12-11T08:14:28.000-0800',
        cycleTime: 3,
        inProgressDate: '2019-01-01T11:09:08.000-0800',
        resolutionDate: '2019-01-03T13:08:18.000-0800'
      }

      const results = await parser.parseItem(item)
      expect(results).toEqual(output)
    })
  })

  describe('_getStateChangeDates()', () => {
    let parser

    beforeEach(() => {
      parser = new JiraParser(null)
    })

    it('should return last date of all state changes', () => {
      const results = parser._getStateChangeDates(item)
      expect(results).toHaveProperty('inprogress', '2019-01-01T11:09:08.000-0800')
    })
  })

  describe('_fnMap()', () => {
    let field, parser

    beforeEach(() => {
      parser = new JiraParser(null)
      field = {
        function: 'map',
        source: 'fields.components',
        criteria: 'name',
        datatype: 'text'
      }
    })

    it('should output a comma separated list as a string', () => {
      const results = parser._fnMap(item, field)
      expect(results).toEqual('Gateway, BackEnd, frontend')
    })

    it('should output a empty string with invalid criteria', () => {
      field['criteria'] = 'non-existent'
      const results = parser._fnMap(item, field)
      expect(results).toEqual('')
    })

    it('should output a empty string with invalid source', () => {
      field['source'] = 'non-existent'
      const results = parser._fnMap(item, field)
      expect(results).toEqual('')
    })
  })

  describe('_fnMapFilter()', () => {
    let field, parser

    beforeEach(() => {
      parser = new JiraParser(null)
      field = {
        function: 'mapfilter',
        source: 'fields.components',
        map: 'name',
        criteria: ['Gateway', 'frontend'],
        datatype: 'text'
      }
    })

    it('should output a comma separated list as a string with all criteria matching', () => {
      const results = parser._fnMapFilter(item, field)
      expect(results).toEqual('Gateway, frontend')
    })

    it('should output a comma separated list as a string with single criteria matching', () => {
      field['criteria'] = ['Gateway', 'Something']
      const results = parser._fnMapFilter(item, field)
      expect(results).toEqual('Gateway')
    })

    it('should output a empty string with no criteria matching', () => {
      field['criteria'] = ['Blah', 'Foo']
      const results = parser._fnMapFilter(item, field)
      expect(results).toEqual('')
    })

    it('should output the first match as a string when return is set to "first"', () => {
      field['return'] = 'first'
      const results = parser._fnMapFilter(item, field)
      expect(results).toEqual('Gateway')
    })
  })

  describe('_fnFilter()', () => {
    let field, parser

    beforeEach(() => {
      parser = new JiraParser(null)
      field = {
        function: 'filter',
        source: 'fields.labels',
        criteria: ['AAA', 'BBB'],
        datatype: 'text'
      }
    })

    it('should output a comma separated list as a string with all criteria matching', () => {
      const results = parser._fnFilter(item, field)
      expect(results).toEqual('AAA, BBB')
    })

    it('should output a comma separated list as a string with single criteria matching', () => {
      field['criteria'] = ['AAA', 'DDD']
      const results = parser._fnFilter(item, field)
      expect(results).toEqual('AAA')
    })

    it('should output a empty string with no criteria matching', () => {
      field['criteria'] = ['EEE', 'DDD']
      const results = parser._fnFilter(item, field)
      expect(results).toEqual('')
    })

    it('should output the first match as a string when return is set to "first"', () => {
      field['return'] = 'first'
      const results = parser._fnFilter(item, field)
      expect(results).toEqual('AAA')
    })
  })

  describe('_fnDaysDiff()', () => {
    let field, parser

    beforeEach(() => {
      parser = new JiraParser(null)
      field = {
        function: 'datediff',
        source: 'fields.created',
        criteria: 'fields.resolutiondate',
        datatype: 'integer'
      }
    })

    it('should output the difference in full days between two dates', () => {
      const results = parser._fnDaysDiff(item, field)
      expect(results).toEqual(24)
    })

    it('should output the difference in work days between two dates', () => {
      field['return'] = 'workday'
      const results = parser._fnDaysDiff(item, field)
      expect(results).toEqual(18)
    })
  })

  describe('_fnSimple()', () => {
    let parser

    beforeEach(() => {
      parser = new JiraParser(null)
    })

    it('should output when using a string value', () => {
      const field = 'fields.created'
      const results = parser._fnSimple(item, field)
      expect(results).toEqual('2018-12-11T08:14:28.000-0800')
    })

    it('should output when using a source object', () => {
      const field = { source: 'fields.created' }
      const results = parser._fnSimple(item, field)
      expect(results).toEqual('2018-12-11T08:14:28.000-0800')
    })
  })

  describe('_fnNull()', () => {
    let parser

    beforeEach(() => {
      parser = new JiraParser(null)
    })

    it('should return null', () => {
      expect(parser._fnNull()).toEqual(null)
    })
  })

  describe('_fn()', () => {
    let parser
    const fnSupported = ['simple', 'filter', 'map', 'mapfilter', 'daysdiff']

    beforeEach(() => {
      parser = new JiraParser(null)
    })

    fnSupported.forEach(function (fn) {
      it('should return function reference with ' + fn + ' function', () => {
        const fct = parser._fn(fn)
        expect(typeof fct).toBe('function')
      })
    })

    it('should return _fnNull reference on unrecognized functions', () => {
      const fct = parser._fn('fake')
      expect(typeof fct).toBe('function')
      expect(fct.name).toEqual('_fnNull')
    })
  })

  describe('_castCase()', () => {
    const parser = new JiraParser(null)
    const cmd = [
      { value: 'tHIS ShouldFunction correctlyAs EXPECTED', cast: 'lowercase', result: 'this shouldfunction correctlyas expected' },
      { value: 'tHIS ShouldFunction correctlyAs EXPECTED', cast: 'uppercase', result: 'THIS SHOULDFUNCTION CORRECTLYAS EXPECTED' },
      { value: 'tHIS ShouldFunction correctlyAs EXPECTED', cast: 'propercase', result: 'This shouldfunction correctlyas expected' },
      { value: 'tHIS ShouldFunction correctlyAs EXPECTED', cast: 'camelcase', result: 'tHisShouldFunctionCorrectlyAsExpected' },
      { value: '', cast: '', result: '' },
      { value: 3465, cast: 'lowercase', result: 3465 },
      { value: null, cast: null, result: null }
    ]

    cmd.forEach(function (input) {
      it('should return correct case given the input cast ' + input.cast + '', () => {
        const rtn = parser._castCase(input.value, input.cast)
        expect(rtn).toEqual(input.result)
      })
    })
  })

  describe('_replace()', () => {
    const parser = new JiraParser(null)
    const cmd = [
      { value: 'A4A', regex: '[^0-9.]', with: '', result: '4' },
      { value: '', regex: '', with: '', result: '' },
      { value: '', regex: null, with: '', result: '' },
      { value: null, regex: null, with: null, result: null },
      { value: ['state=ACTIVE,name=34.2 Sprint 1,startDate=2019-02-19'], regex: '^.*name=.*([0-9]{2})\\.([0-9]{1}) .*?([0-9]).*', with: '$1$2$3', result: '3421' },
      { value: ['state=ACTIVE,name=Sprint 1 blah,startDate=2019-02-19'], regex: '^.*name=.*([0-9]{2})\\.([0-9]{1}) .*?([0-9]).*', with: '$1$2$3', result: null }
    ]

    cmd.forEach(function (input) {
      it('should return correct replaced value with input "' + input.value + '", regex "' + input.regex + '"', () => {
        const rtn = parser._replace(input.value, {
          replace: {
            regex: input.regex,
            with: input.with
          } })
        expect(rtn).toEqual(input.result)
      })
    })
  })
})
