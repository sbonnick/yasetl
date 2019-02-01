const isString = require('lodash/isString');
const isObject = require('lodash/isObject');
const get      = require('lodash/get');
const moment   = require('moment');
                 require('moment-weekday-calc');

class jiraParser {

  constructor(fields) {
    this.fields = fields
  }

  parse(data) {
    return data.map(item => this.parseItem(item))
  }

  parseItem(item) {
    item.fields['stateChangeDates'] = this._getStateChangeDates(item)
    let sanitizedItem = {}
    Object.keys(this.fields).forEach(fieldName => {
      let field = this.fields[fieldName]
      let fn = (isObject(field) && 'function' in field) ? field.function : 'simple' 
      sanitizedItem[fieldName] = this._fn(fn)(item, field)
    });
    return sanitizedItem;
  }

  _getStateChangeDates(item) {
    let history = get(item, 'changelog.histories', null)
    if (history == null) return null

    let changeDates = {}
    history.forEach(change => {
      change.items.forEach(changeItem => {
        if(changeItem.field == "status") 
          changeDates[changeItem.toString.replace(/\s+/g, '').toLowerCase()] = change.created
      })
    })
    return changeDates
  }

  _fnFilter(item, field) {
    let result = get(item, field.source, [])
                  .filter(value => field.criteria.indexOf(value) !== -1)
    
    if ('return' in field && field.return == 'first')
      result = result.shift() || null
    else 
      result = result.join(", ")
    return result;
  }

  _fnMap(item, field) {
    return get(item, field.source, [])
            .map( value => get(value, field.criteria))
            .filter( element => { return element !== undefined; })
            .join(", ")
  }

  _fnDaysDiff(item, field) {
    let source = get(item, field.source, null)
    let criteria = get(item, field.criteria, null)
    let range = ('return' in field && field.return == 'workday') ? [1,2,3,4,5] : [0,1,2,3,4,5,6];
    return (source != null && criteria != null) ? moment().weekdayCalc(source, criteria, range) : null
  }

  _fnSimple(item, field) {
    return (isString(field)) ? get(item, field, null) : get(item, field.source, null)
  }

  _fnNull(item, field) { 
    return null 
  }

  _fn(fn) { 
    let functions = {
      'simple':   this._fnSimple,
      'filter':   this._fnFilter,
      'map':      this._fnMap,
      'daysdiff': this._fnDaysDiff
    }
    return get(functions, fn, this._fnNull)
  }
}

module.exports = jiraParser

// TODO: handle config fields in a case-insensitive way
// TODO: change _getStateChangeDates() to use MAPs and an object append to iterate