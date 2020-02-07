const Processor = require('../../defaults/processor')

// @ts-ignore
class ArrayFilter extends Processor {
  constructor () {
    super()

    this.description = {
      name: 'Filter Array',
      description: 'Filters out items in an array given criteria',
      inputHint: Array,
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
    if (input === null) {
      return null
    }
    return input.filter(value => configuration.criteria.findIndex(item => item.toLowerCase() === value.toLowerCase()) !== -1)
  }
}

module.exports = ArrayFilter
