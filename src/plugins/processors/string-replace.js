const Processor = require('../../defaults/processor')
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
          default: true
        }
      }
    }
  }

  async process (input, configuration) {
    if (input == null || (lang.isString(input) && input === '')) return input 

    if (configuration == null || get(configuration, 'with', null) == null) return input

    const inputString = lang.isString(input) ? input : JSON.stringify(input)
    
    const mustMatch = get(configuration, 'mustMatch', this.description.configuration.mustMatch.default)
    const regex = get(configuration, 'regex', this.description.configuration.regex.default)
    const flags = get(configuration, 'flags', this.description.configuration.flags.default)
    const replaceWith = get(configuration, 'with', this.description.configuration.with.default)

    const regStatement = new RegExp(regex, flags)

    if (mustMatch && inputString.match(regStatement) == null) { return null }

    return inputString.replace(regStatement, replaceWith)
  }
}

module.exports = StringReplace
