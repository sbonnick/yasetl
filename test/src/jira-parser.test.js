const JiraParser = require('../../src/jira-parser')
const td = require('testdouble')
const expect = require('chai').expect

describe('Jira-Parser', function () {
  let item

  beforeAll(function () {
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

  describe('Parse()', function () {
    it('should parse multiple issues', function () {
      const parser = new JiraParser(null)
      var stub = td.replace(parser, 'parseItem')
      const result = parser.parse(['one', 'two', 'three'])
      expect(result).to.not.equal(null)
      td.verify(stub(), { times: 3, ignoreExtraArgs: true })
    })

    afterAll(function () {
      td.reset()
    })
  })

  describe('ParseItem()', function () {
    it('should parse simple string mappings by default', async function () {
      const parser = new JiraParser({
        createdDate: 'fields.created'
      })

      const output = {
        createdDate: '2018-12-11T08:14:28.000-0800'
      }

      const results = await parser.parseItem(item)
      expect(results).to.eql(output)
    })

    it('should parse simple string mappings with no function specified', async function () {
      const parser = new JiraParser({
        createdDate: {
          source: 'fields.created'
        }
      })

      const output = {
        createdDate: '2018-12-11T08:14:28.000-0800'
      }

      const results = await parser.parseItem(item)
      expect(results).to.eql(output)
    })

    it('should parse complex and mixed field functions', async function () {
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
      expect(results).to.eql(output)
    })
  })

  describe('_getStateChangeDates()', function () {
    let parser

    beforeEach(function () {
      parser = new JiraParser(null)
    })

    it('should return last date of all state changes', function () {
      const results = parser._getStateChangeDates(item)
      expect(results).to.have.property('inprogress', '2019-01-01T11:09:08.000-0800')
    })
  })

  describe('_fnMap()', function () {
    let field, parser

    beforeEach(function () {
      parser = new JiraParser(null)
      field = {
        function: 'map',
        source: 'fields.components',
        criteria: 'name',
        datatype: 'text'
      }
    })

    it('should output a comma separated list as a string', function () {
      const results = parser._fnMap(item, field)
      expect(results).to.equal('Gateway, BackEnd, frontend')
    })

    it('should output a empty string with invalid criteria', function () {
      field['criteria'] = 'non-existent'
      const results = parser._fnMap(item, field)
      expect(results).to.equal('')
    })

    it('should output a empty string with invalid source', function () {
      field['source'] = 'non-existent'
      const results = parser._fnMap(item, field)
      expect(results).to.equal('')
    })
  })

  describe('_fnMapFilter()', function () {
    let field, parser

    beforeEach(function () {
      parser = new JiraParser(null)
      field = {
        function: 'mapfilter',
        source: 'fields.components',
        map: 'name',
        criteria: ['Gateway', 'frontend'],
        datatype: 'text'
      }
    })

    it('should output a comma separated list as a string with all criteria matching', function () {
      const results = parser._fnMapFilter(item, field)
      expect(results).to.equal('Gateway, frontend')
    })

    it('should output a comma separated list as a string with single criteria matching', function () {
      field['criteria'] = ['Gateway', 'Something']
      const results = parser._fnMapFilter(item, field)
      expect(results).to.equal('Gateway')
    })

    it('should output a empty string with no criteria matching', function () {
      field['criteria'] = ['Blah', 'Foo']
      const results = parser._fnMapFilter(item, field)
      expect(results).to.equal('')
    })

    it('should output the first match as a string when return is set to "first"', function () {
      field['return'] = 'first'
      const results = parser._fnMapFilter(item, field)
      expect(results).to.equal('Gateway')
    })
  })

  describe('_fnFilter()', function () {
    let field, parser

    beforeEach(function () {
      parser = new JiraParser(null)
      field = {
        function: 'filter',
        source: 'fields.labels',
        criteria: ['AAA', 'BBB'],
        datatype: 'text'
      }
    })

    it('should output a comma separated list as a string with all criteria matching', function () {
      const results = parser._fnFilter(item, field)
      expect(results).to.equal('AAA, BBB')
    })

    it('should output a comma separated list as a string with single criteria matching', function () {
      field['criteria'] = ['AAA', 'DDD']
      const results = parser._fnFilter(item, field)
      expect(results).to.equal('AAA')
    })

    it('should output a empty string with no criteria matching', function () {
      field['criteria'] = ['EEE', 'DDD']
      const results = parser._fnFilter(item, field)
      expect(results).to.equal('')
    })

    it('should output the first match as a string when return is set to "first"', function () {
      field['return'] = 'first'
      const results = parser._fnFilter(item, field)
      expect(results).to.equal('AAA')
    })
  })

  describe('_fnDaysDiff()', function () {
    let field, parser

    beforeEach(function () {
      parser = new JiraParser(null)
      field = {
        function: 'datediff',
        source: 'fields.created',
        criteria: 'fields.resolutiondate',
        datatype: 'integer'
      }
    })

    it('should output the difference in full days between two dates', function () {
      const results = parser._fnDaysDiff(item, field)
      expect(results).to.equal(24)
    })

    it('should output the difference in work days between two dates', function () {
      field['return'] = 'workday'
      const results = parser._fnDaysDiff(item, field)
      expect(results).to.equal(18)
    })
  })

  describe('_fnSimple()', function () {
    let parser

    beforeEach(function () {
      parser = new JiraParser(null)
    })

    it('should output when using a string value', function () {
      const field = 'fields.created'
      const results = parser._fnSimple(item, field)
      expect(results).to.equal('2018-12-11T08:14:28.000-0800')
    })

    it('should output when using a source object', function () {
      const field = { source: 'fields.created' }
      const results = parser._fnSimple(item, field)
      expect(results).to.equal('2018-12-11T08:14:28.000-0800')
    })
  })

  describe('_fnNull()', function () {
    let parser

    beforeEach(function () {
      parser = new JiraParser(null)
    })

    it('should return null', function () {
      expect(parser._fnNull()).to.equal(null)
    })
  })

  describe('_fn()', function () {
    let parser
    const fnSupported = ['simple', 'filter', 'map', 'mapfilter', 'daysdiff']

    beforeEach(function () {
      parser = new JiraParser(null)
    })

    fnSupported.forEach(function (fn) {
      it('should return function reference with ' + fn + ' function', function () {
        const fct = parser._fn(fn)
        expect(fct).to.be.a('function')
        expect(fct).to.have.lengthOf(2)
      })
    })

    it('should return _fnNull reference on unrecognized functions', function () {
      const fct = parser._fn('fake')
      expect(fct).to.be.a('function')
      expect(fct).to.have.lengthOf(2)
      expect(fct.name).to.equal('_fnNull')
    })
  })

  describe('_castCase()', function () {
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
      it('should return correct case given the input cast ' + input.cast + '', function () {
        const rtn = parser._castCase(input.value, input.cast)
        expect(rtn).to.equal(input.result)
      })
    })
  })

  describe('_replace()', function () {
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
      it('should return correct replaced value with input "' + input.value + '", regex "' + input.regex + '"', function () {
        const rtn = parser._replace(input.value, {
          replace: {
            regex: input.regex,
            with: input.with
          } })
        expect(rtn).to.equal(input.result)
      })
    })
  })
})
