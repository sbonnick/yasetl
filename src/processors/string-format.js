const Processor = require('../processor');
const string    = require('lodash/string');
const lang      = require('lodash/lang');
const get       = require('lodash/get');

class StringFormat extends Processor {

  constructor () {
    super()

    this.description = {
      name:           "Format String",
      description:    "Formats a string using several different formats",
      inputHint:      String,
      outputHint:     String,
      configuration:  {
        format: {
          required: true,
          type:     String,
          values:   ['lowercase', 'uppercase', 'propercase', 'camelcase']
        }
      }
    }
  }

  async process(input, configuration) {

    if (input == null) return input
    if (configuration == null || get(configuration, 'format', null) == null) return input  

    let joinChar = get(configuration, 'joinOn', " ")
    let inputString = await this._convertToString(input, joinChar)

    switch(configuration.format.toLowerCase()) {
      case "lowercase":  return inputString.toLowerCase();
      case "uppercase":  return inputString.toUpperCase();
      case "propercase": return string.capitalize(inputString);
      case "camelcase":  return string.camelCase(inputString);
      default:           return inputString;
    }
  }

  async _convertToString(value, joinChar = " ") {
    if (lang.isString(value)) 
      return value;

    if (lang.isArrayLikeObject(value)) {
      let ret = await Promise.all(value.map(iter => this._convertToString(iter, joinChar)))
      return ret.join(joinChar);
    }
     
    return JSON.stringify(value)
  } 

}

module.exports = StringFormat