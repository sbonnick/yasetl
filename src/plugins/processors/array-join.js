const Processor = require('../../defaults/processor')
const get = require('lodash/get')

// @ts-ignore
class ArrayJoin extends Processor {
  constructor () {
    super()

    this.description = {
      name: 'Join Array',
      description: 'join the values in an array',
      inputHint: Array,
      outputHint: String,
      configuration: {
        joinOn: {
          required: false,
          type: String,
          default: ', '
        }
      }
    }
  }

  async process (input, configuration) {
    const joinChar = get(configuration, 'joinOn', this.description.configuration.joinOn.default)
    if (input === null || joinChar === null) return null
    return input.join(joinChar)
  }
}

module.exports = ArrayJoin
