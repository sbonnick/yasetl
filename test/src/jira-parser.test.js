const jiraParser = require('../../src/jira-parser');
const expect     = require('chai').expect;
const sinon      = require('sinon');
const test       = require('sinon-test')(sinon);

describe('Jira-Parser', () => {
  let item

  before(function() {
    item = {
      "fields": {
        "components": [
          { "name": "Gateway" },
          { "name": "BackEnd" },
          { "name": "frontend" }
        ],
        "labels": [ 'AAA', 'CCC', 'BBB' ],
        "created": "2018-12-11T08:14:28.000-0800",
        "resolutiondate": "2019-01-04T13:08:18.000-0800"
      },
      "changelog": {
        "startAt": 0,
        "maxResults": 11,
        "total": 11,
        "histories": [
          {
            "created": "2019-01-01T11:09:08.000-0800",
            "items": [
              {
                "field": "status",
                "fieldtype": "jira",
                "from": "10000",
                "fromString": "To Do",
                "to": "3",
                "toString": "In Progress"
              }
            ]
          }
        ]
      }
    }
  })

  describe('Parse()', () => {

    it('should parse multiple issues', test(function() {
      let parser = new jiraParser(null)
      var stub = this.stub(parser, 'parseItem')
      let result = parser.parse(['one', 'two', 'three'])
      expect(stub.callCount).equals(3)
    }))
  })

  describe('ParseItem()', () => {
    
    it('should parse simple string mappings by default', test(async function() {
      let parser = new jiraParser( {
        createdDate: "fields.created"
      })

      let output = { 
        createdDate: '2018-12-11T08:14:28.000-0800' 
      }

      let results = await parser.parseItem(item)
      expect(results).to.eql(output)
    }))

    it('should parse simple string mappings with no function specified', test(async function() {
      let parser = new jiraParser( {
        createdDate: {
          source: "fields.created"
        }
      })

      let output = { 
        createdDate: '2018-12-11T08:14:28.000-0800' 
      }

      let results = await parser.parseItem(item)
      expect(results).to.eql(output)
    }))

    it('should parse complex and mixed field functions', test(async function() {
      let parser = new jiraParser( {
        createdDate: "fields.created",
        resolutionDate: {
          source:   "fields.resolutiondate",
          datatype: "datetime"
        },
        inProgressDate: {
          source:   "fields.stateChangeDates.inprogress",
          datatype: "datetime"
        },
        cycleTime: {
          function: "daysdiff",
          source:   "fields.stateChangeDates.inprogress",
          criteria: "fields.resolutiondate",
          datatype: "integer"
        },
        catalog: {
          function: "filter",
          return:   "first",
          source:   "fields.labels",
          criteria: ["AAA"],
          datatype: "text"
        },
      })

      let output = {                                                 
        catalog:        "AAA",                     
        createdDate:    "2018-12-11T08:14:28.000-0800",   
        cycleTime:      4,     
        inProgressDate: "2019-01-01T11:09:08.000-0800",
        resolutionDate: "2019-01-04T13:08:18.000-0800"                        
      }                                                 

      let results = await parser.parseItem(item)
      expect(results).to.eql(output)
    }))
  })

  describe('_getStateChangeDates()', () => {
    let parser

    beforeEach(function() {
      parser = new jiraParser(null)
    })

    it('should return last date of all state changes', test(function() {
      let results = parser._getStateChangeDates(item)
      expect(results).to.have.property('inprogress', '2019-01-01T11:09:08.000-0800' )
    }))
  })

  describe('_fnMap()', () => {
    let field, parser

    beforeEach(function() {
      parser = new jiraParser(null)
      field = {
        function: "map",
        source:   "fields.components",
        criteria: "name",
        datatype: "text"
      }
    });

    it('should output a comma separated list as a string', test(function() {
      let results = parser._fnMap(item, field)
      expect(results).to.equal('Gateway, BackEnd, frontend')
    }))

    it('should output a empty string with invalid criteria', test(function() {
      field['criteria'] = "non-existent"
      let results = parser._fnMap(item, field)
      expect(results).to.equal('')
    }))

    it('should output a empty string with invalid source', test(function() {
      field['source'] = "non-existent"
      let results = parser._fnMap(item, field)
      expect(results).to.equal('')
    }))
  })

  describe('_fnMapFilter()', () => {
    let field, parser

    beforeEach(function() {
      parser = new jiraParser(null)
      field = {
        function: "mapfilter",
        source:   "fields.components",
        map:      "name",
        criteria: ["Gateway", "frontend"],
        datatype: "text"
      }
    });

    it('should output a comma separated list as a string with all criteria matching', test(function() {
      let results = parser._fnMapFilter(item, field)
      expect(results).to.equal('Gateway, frontend')
    }))

    it('should output a comma separated list as a string with single criteria matching', test(function() {
      field['criteria'] = ["Gateway", "Something"]
      let results = parser._fnMapFilter(item, field)
      expect(results).to.equal('Gateway')
    }))

    it('should output a empty string with no criteria matching', test(function() {
      field['criteria'] = ["Blah", "Foo"]
      let results = parser._fnMapFilter(item, field)
      expect(results).to.equal('')
    }))

    it('should output the first match as a string when return is set to "first"', test(function() {
      field['return'] = "first"
      let results = parser._fnMapFilter(item, field)
      expect(results).to.equal('Gateway')
    }))
  })

  describe('_fnFilter()', () => {
    let field, parser

    beforeEach(function() {
      parser = new jiraParser(null)
      field = {
        function: "filter",
        source:   "fields.labels",
        criteria: ["AAA", "BBB"],
        datatype: "text"
      }
    })

    it('should output a comma separated list as a string with all criteria matching', test(function() {
      let results = parser._fnFilter(item, field)
      expect(results).to.equal('AAA, BBB')
    }))

    it('should output a comma separated list as a string with single criteria matching', test(function() {
      field['criteria'] = ["AAA", "DDD"]
      let results = parser._fnFilter(item, field)
      expect(results).to.equal('AAA')
    }))

    it('should output a empty string with no criteria matching', test(function() {
      field['criteria'] = ["EEE", "DDD"]
      let results = parser._fnFilter(item, field)
      expect(results).to.equal('')
    }))

    it('should output the first match as a string when return is set to "first"', test(function() {
      field['return'] = "first"
      let results = parser._fnFilter(item, field)
      expect(results).to.equal('AAA')
    }))
  })

  describe('_fnDaysDiff()', () => {
    let field, parser

    beforeEach(function() {
      parser = new jiraParser(null)
      field = {
        function: "datediff",
        source:   "fields.created",
        criteria: "fields.resolutiondate",
        datatype: "integer"
      }
    })

    it('should output the difference in full days between two dates', test(function() {
      let results = parser._fnDaysDiff(item, field)
      expect(results).to.equal(25)
    }))

    it('should output the difference in work days between two dates', test(function() {
      field['return'] = 'workday'
      let results = parser._fnDaysDiff(item, field)
      expect(results).to.equal(19)
    }))
  })

  describe('_fnSimple()', () => {
    let parser

    beforeEach(function() {
      parser = new jiraParser(null)
    })

    it('should output when using a string value', test(function() {
      let field = 'fields.created'
      let results = parser._fnSimple(item, field)
      expect(results).to.equal('2018-12-11T08:14:28.000-0800')
    }))

    it('should output when using a source object', test(function() {
      let field = { source: 'fields.created' }
      let results = parser._fnSimple(item, field)
      expect(results).to.equal('2018-12-11T08:14:28.000-0800')
    }))
  })

  describe('_fnNull()', () => {
    let parser

    beforeEach(function() {
      parser = new jiraParser(null)
    })

    it('should return null', test(function() {
      expect(parser._fnNull()).to.be.null
    }))
  })

  describe('_fn()', () => {
    let parser
    let fnSupported = ["simple", "filter", "map", "mapfilter", "daysdiff"]

    beforeEach(function() {
      parser = new jiraParser(null)
    })
    
    fnSupported.forEach(function(fn) {
      it('should return function reference with ' + fn + ' function', test(function() {
        let fct = parser._fn(fn)
        expect(fct).to.be.a('function')
        expect(fct).to.have.lengthOf(2)
      }))
    })
    
    it('should return _fnNull reference on unrecognized functions', test(function() {
      let fct = parser._fn('fake')
      expect(fct).to.be.a('function')
      expect(fct).to.have.lengthOf(2)
      expect(fct.name).to.equal('_fnNull')
    }))
  })

  describe('_castCase()', () => {
    let parser = new jiraParser(null)
    let cmd = [
      {value: "tHIS ShouldFunction correctlyAs EXPECTED", cast: "lowercase", result: "this shouldfunction correctlyas expected"},
      {value: "tHIS ShouldFunction correctlyAs EXPECTED", cast: "uppercase", result: "THIS SHOULDFUNCTION CORRECTLYAS EXPECTED"},
      {value: "tHIS ShouldFunction correctlyAs EXPECTED", cast: "propercase", result: "This shouldfunction correctlyas expected"},
      {value: "tHIS ShouldFunction correctlyAs EXPECTED", cast: "camelcase", result: "tHisShouldFunctionCorrectlyAsExpected"},
      {value: "", cast: "", result: ""},
      {value: 3465, cast: "lowercase", result: 3465},
      {value: null, cast: null, result: null},
    ]

    cmd.forEach(function(input) {
      it('should return correct case given the input cast ' + input.cast + '', test(function() {
        let rtn = parser._castCase(input.value, input.cast)
        expect(rtn).to.equal(input.result)
      }))
    })
  })
})
