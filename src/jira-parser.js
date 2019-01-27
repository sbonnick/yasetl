const isString = require('lodash/isString');
const get      = require('lodash/get');

class jiraParser {

  constructor(fields) {
    this.fields = fields
  }

  parse(data) {
    return data.map(item => this.parseItem(item))
  }

  parseItem(item) {
    let sanitizedItem = {}
    Object.keys(this.fields).forEach(fieldName => {
      let field = this.fields[fieldName]

        if (isString(field))
          sanitizedItem[fieldName] = get(item, field, "")
  
        else if ('function' in field) {
          switch (field.function) {
            case 'filter':
              sanitizedItem[fieldName] = this._fnFilter(item, field)
              break;
            case 'map':
              sanitizedItem[fieldName] = this._fnMap(item, field)
              break;
          }
        }

        if (sanitizedItem[fieldName] == undefined)
          sanitizedItem[fieldName] = get(item, field.source, "") 
    });
    return sanitizedItem;
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
/*
  _fn = {
    'filter': this._fnFilter,
    'map':    this._fnMap
  }*/
}

module.exports = jiraParser