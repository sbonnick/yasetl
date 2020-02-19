const Processor = require('../../defaults/processor')
const get = require('lodash/get')

// @ts-ignore
class StringDefault extends Processor {
  constructor () {
    super()

    this.description = {
      name: 'Default Value',
      description: 'replace with default value if value is null',
      inputHint: Array,
      outputHint: Array,
      configuration: {
        default: {
          required: true,
          type: String
        }
      }
    }
  }

  async process (input, configuration) {
    if (input === null) {
      return get(configuration, 'default', null)
    } 
    return input
  }
}

module.exports = StringDefault
