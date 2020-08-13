const Processor = require('../../defaults/processor')
const get = require('lodash/get')

// @ts-ignore
class ArraySearch extends Processor {
  constructor () {
    super()

    this.description = {
      name: 'Search Array',
      description: 'Searches for items in the array given a regex',
      inputHint: Array,
      outputHint: Array,
      configuration: {
        regex: {
          required: true,
          type: String,
          values: ''
        },
        flags: {
          required: false,
          type: String,
          default: 'gi'
        }
      }
    }
  }

  async process (input, configuration) {
    if (input == null) return input 

    const regex = get(configuration, 'regex', this.description.configuration.regex.default)
    const flags = get(configuration, 'flags', this.description.configuration.flags.default)
    
    const regStatement = new RegExp(regex, flags)

    const rtn = input.filter(value => value.match(regStatement))
    return rtn
  }
}

module.exports = ArraySearch