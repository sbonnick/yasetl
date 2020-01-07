const Processor = require('../../processor')
const lang = require('lodash/lang')
const get = require('lodash/get')

class StringReplace extends Processor {
  constructor () {
    super()

    this.description = {
      name: 'Replace String',
      description: 'Replaces strings with a given value',
      inputHint: String,
      outputHint: String,
      configuration: {
        regex: {
          required: true,
          type: String,
          values: ''
        },
        with: {
          required: true,
          type: String,
          values: ''
        },
        flags: {
          required: false,
          type: String,
          default: 'gi'
        },
        mustMatch: {
          required: false,
          type: Boolean,
          default: false
        }
      }
    }
  }

  async process (input, configuration) {
    if (input == null || (lang.isString(input) && input === '')) return input 

    if (configuration == null || get(configuration, 'with', null) == null) return input

    const inputString = lang.isString(input) ? input : JSON.stringify(input)

    if (get(configuration, 'mustMatch', this.description.configuration.mustMatch.default) && inputString.match(get(configuration, 'regex', '')) == null) { return null }

    return inputString.replace(
      new RegExp(
        get(configuration, 'regex', ''), 
        get(configuration, 'flags', this.description.configuration.flags.default)),
      get(configuration, 'with', ''))
  }
}

module.exports = StringReplace
