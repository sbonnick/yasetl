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
          values: ['lowercase', 'uppercase', 'propercase', 'camelcase']
        }
      }
    }
  }

  async process(input, configuration) {

    if (input == null) return input
    if (configuration == null || get(configuration, 'format', null) == null) return input  

    let inputString = (lang.isString(input)) ? input : JSON.stringify(input)
      
    switch(configuration.format.toLowerCase()) {
      case "lowercase":  return inputString.toLowerCase();
      case "uppercase":  return inputString.toUpperCase();
      case "propercase": return string.capitalize(inputString);
      case "camelcase":  return string.camelCase(inputString);
      default:           return inputString;
    }
  }

}

module.exports = StringFormat