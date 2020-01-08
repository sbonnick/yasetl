const Processor = require('../../processor')

// @ts-ignore
class ArrayValue extends Processor {
  constructor () {
    super()

    this.description = {
      name: 'Array Value',
      description: 'get value in array given criteria critiera function',
      inputHint: [Array],
      outputHint: Array,
      configuration: {
        criteria: {
          required: true,
          type: String,
          value: ['first', 'last']
        }
      }
    }
  }

  async process (input, configuration) {
    if (configuration.criteria === 'first') {
      return input.shift() || null
    } if (configuration.criteria === 'last') {
      return input.pop() || null
    } 
    return null
  }
}

module.exports = ArrayValue
