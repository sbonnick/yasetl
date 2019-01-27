const jiraParser = require('../jira-parser');
const expect     = require('chai').expect;
const sinon      = require('sinon');
const test       = require('sinon-test')(sinon);

describe('Jira-Parser MAP function', () => {

  let parser = new jiraParser(null)

  let item = {
    "fields": {
      "components": [
        { "name": "Gateway" },
        { "name": "Backend" }
  ]}}

  it('should output a comma seperated list as a string', test(function() {

    let field = {
      function: "map",
      source:   "fields.components",
      criteria: "name",
      datatype: "text"
    }

    let results = parser._fnMap(item, field)
    expect(results).to.equal('Gateway, Backend')
  }))

  it('should output a empty string with invalid criteria', test(function() {

    let field = {
      function: "map",
      source:   "fields.components",
      criteria: "non-existant",
      datatype: "text"
    }

    let results = parser._fnMap(item, field)
    expect(results).to.equal('')
  }))

  it('should output a empty string with invalid source', test(function() {

    let field = {
      function: "map",
      source:   "non-existant",
      criteria: "name",
      datatype: "text"
    }

    let results = parser._fnMap(item, field)
    expect(results).to.equal('')
  }))
})

describe('Jira-Parser Filter function', () => {
  
  let parser = new jiraParser(null)

  let item = {
    "fields": {
      "labels": [ 'AAA', 'CCC', 'BBB' ]
  }}

  it('should output a comma seperated list as a string with all criteria matching', test(function() {

    let field = {
      function: "filter",
      source:   "fields.labels",
      criteria: ["AAA", "BBB"],
      datatype: "text"
    }

    let results = parser._fnFilter(item, field)
    expect(results).to.equal('AAA, BBB')
  }))

  it('should output a comma seperated list as a string with single criteria matching', test(function() {

    let field = {
      function: "filter",
      source:   "fields.labels",
      criteria: ["AAA", "DDD"],
      datatype: "text"
    }

    let results = parser._fnFilter(item, field)
    expect(results).to.equal('AAA')
  }))

  it('should output a empty string with no criteria matching', test(function() {

    let field = {
      function: "filter",
      source:   "fields.labels",
      criteria: ["EEE", "DDD"],
      datatype: "text"
    }

    let results = parser._fnFilter(item, field)
    expect(results).to.equal('')
  }))

  it('should output the first match as a string when return is set to "first"', test(function() {

    let field = {
      function: "filter",
      source:   "fields.labels",
      criteria: ["AAA", "BBB"],
      return:   "first",
      datatype: "text"
    }

    let results = parser._fnFilter(item, field)
    expect(results).to.equal('AAA')
  }))
})