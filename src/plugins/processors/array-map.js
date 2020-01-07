const Processor = require('../../processor')
const get = require('lodash/get')

// @ts-ignore
class ArrayMap extends Processor {
  constructor () {
    super()

    this.description = {
      name: 'Maps Array',
      description: 'Maps items in an array given criteria',
      inputHint: [Array],
      outputHint: Array,
      configuration: {
        criteria: {
          required: true,
          type: Array
        }
      }
    }
  }

  async process (input, configuration) {
    return input
      .map(value => get(value, configuration.criteria))
      .filter(element => { return element !== undefined })
  }
}

module.exports = ArrayMap
