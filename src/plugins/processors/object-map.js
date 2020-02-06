const Processor = require('../../defaults/processor')
const get = require('lodash/get')

// @ts-ignore
class ObjectMap extends Processor {
  constructor () {
    super()

    this.description = {
      name: 'Maps Object',
      description: 'Maps values in an object to an array given criteria',
      inputHint: Object,
      outputHint: Array,
      configuration: {
        criteria: {
          required: true,
          type: String
        }
      }
    }
  }

  async process (input, configuration) {
    if (input === null) {
      return null
    }
    return input
      .map(value => get(value, configuration.criteria))
      .filter(element => { return element !== undefined })
  }
}

module.exports = ObjectMap
