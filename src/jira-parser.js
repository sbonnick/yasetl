const isString = require('lodash/isString')
const isObject = require('lodash/isObject')
const get = require('lodash/get')
const str_ = require('lodash/string')
const moment = require('moment')
require('moment-weekday-calc')

class jiraParser {
  constructor (fields) {
    this.fields = fields
  }

  async parse (data) {
    let items = data.map(async item => this.parseItem(item))
    return Promise.all(items)
  }

  async parseItem (item) {
    item.fields['stateChangeDates'] = this._getStateChangeDates(item)
    let sanitizedItem = {}
    Object.keys(this.fields).forEach(fieldName => {
      let field = this.fields[fieldName]
      let fn = (isObject(field) && 'function' in field) ? field.function : 'simple'
      let ca = (isObject(field) && 'case' in field) ? field.case : null

      let fnResp = this._fn(fn)(item, field)
      let caResp = this._castCase(fnResp, ca)
      let reResp = this._replace(caResp, field)

      sanitizedItem[fieldName] = reResp
    })
    return sanitizedItem
  }

  _getStateChangeDates (item) {
    let history = get(item, 'changelog.histories', null)
    if (history == null) return null

    let changeDates = {}
    history.forEach(change => {
      change.items.forEach(changeItem => {
        if (changeItem.field === 'status') {
          changeDates[changeItem.toString.replace(/\s+/g, '').toLowerCase()] = change.created
        }
      })
    })
    return changeDates
  }

  _fnFilter (item, field) {
    let result = get(item, field.source, [])
      .filter(value => field.criteria.findIndex(item => item.toLowerCase() === value.toLowerCase()) !== -1)

    if ('return' in field && field.return === 'first') { result = result.shift() || null } else { result = result.join(', ') }
    return result
  }

  _fnMap (item, field) {
    return get(item, field.source, [])
      .map(value => get(value, field.criteria))
      .filter(element => { return element !== undefined })
      .join(', ')
  }

  _fnMapFilter (item, field) {
    let result = get(item, field.source, [])
      .map(value => get(value, field.map))
      .filter(value => field.criteria.findIndex(item => item.toLowerCase() === value.toLowerCase()) !== -1)

    if ('return' in field && field.return === 'first') { result = result.shift() || null } else { result = result.join(', ') }
    return result
  }

  _fnDaysDiff (item, field) {
    let source = get(item, field.source, null)
    let criteria = get(item, field.criteria, null)
    let range = ('return' in field && field.return === 'workday') ? [1, 2, 3, 4, 5] : [1, 2, 3, 4, 5, 6, 7]
    return (source != null && criteria != null) ? moment().isoWeekdayCalc(source, criteria, range) : null
  }

  _fnSimple (item, field) {
    return (isString(field)) ? get(item, field, null) : get(item, field.source, null)
  }

  // eslint-disable-next-line no-unused-vars
  _fnNull (item, field) {
    return null
  }

  _fn (fn) {
    let functions = {
      'simple': this._fnSimple,
      'filter': this._fnFilter,
      'map': this._fnMap,
      'mapfilter': this._fnMapFilter,
      'daysdiff': this._fnDaysDiff
    }
    return get(functions, fn.toLowerCase(), this._fnNull)
  }

  _castCase (value, cast) {
    if (value == null || cast == null || !isString(value)) return value

    switch (cast.toLowerCase()) {
    case 'lowercase': return value.toLowerCase()
    case 'uppercase': return value.toUpperCase()
    case 'propercase': return str_.capitalize(value)
    case 'camelcase': return str_.camelCase(value)
    default: return value
    }
  }

  _replace (value, field) {
    if (value == null || (isString(value) && value === '') || field.replace == null) { return value }

    let repValue = (isString(value)) ? value : JSON.stringify(value)

    if (get(field, 'replace.mustMatch', true) && repValue.match(get(field, 'replace.regex', '')) == null) { return null }

    return repValue.replace(
      new RegExp(
        get(field, 'replace.regex', ''),
        get(field, 'replace.flags', 'gi')),
      get(field, 'replace.with', ''))
  }
}

module.exports = jiraParser

// TODO: handle config fields in a case-insensitive way
// TODO: change _getStateChangeDates() to use MAPs and an object append to iterate
// TODO: introduce a logger
// TODO: inherit from base class with common parsing removed

// TODO: FIXME: Hacked in "mapfilter" to solve a short term chaining problem. refactoring to natively support chaining is better
