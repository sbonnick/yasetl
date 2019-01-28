const jiraParser = require('../jira-parser');
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
          { "name": "Backend" }
        ],
        "labels": [ 'AAA', 'CCC', 'BBB' ],
        "created": "2018-12-11T08:14:28.000-0800",
        "resolutionDate": "2019-01-04T13:08:18.000-0800"
      }}
  })

  describe('Parse list of issues', () => {

    it.skip('should parse multiple issues', test(function() {

    }))
  })

  describe('Parse single issue', () => {
    
    it.skip('should parse simple string mappings by default', test(function() {

    }))

    it.skip('should parse simple string mappings with no function specified', test(function() {

    }))

    it.skip('should parse complex and mixed field functions', test(function() {

    }))
  })

  describe('Map function', () => {
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

    it('should output a comma seperated list as a string', test(function() {
      let results = parser._fnMap(item, field)
      expect(results).to.equal('Gateway, Backend')
    }))

    it('should output a empty string with invalid criteria', test(function() {
      field['criteria'] = "non-existant"
      let results = parser._fnMap(item, field)
      expect(results).to.equal('')
    }))

    it('should output a empty string with invalid source', test(function() {
      field['source'] = "non-existant"
      let results = parser._fnMap(item, field)
      expect(results).to.equal('')
    }))
  })

  describe('Filter function', () => {
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

    it('should output a comma seperated list as a string with all criteria matching', test(function() {
      let results = parser._fnFilter(item, field)
      expect(results).to.equal('AAA, BBB')
    }))

    it('should output a comma seperated list as a string with single criteria matching', test(function() {
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

  describe('DaysDiff Function', () => {
    let field, parser

    beforeEach(function() {
      parser = new jiraParser(null)
      field = {
        function: "datediff",
        source:   "fields.created",
        criteria: "fields.resolutionDate",
        datatype: "datetime"
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
})
