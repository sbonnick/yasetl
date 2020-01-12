const Processor = require('../../defaults/processor')
const get = require('lodash/get')
const moment = require('moment')
// @ts-ignore
require('moment-weekday-calc')

// @ts-ignore
class DateDiff extends Processor {
  constructor () {
    super()

    this.description = {
      name: 'Date Differance',
      description: 'Determine the difference between two dates',
      inputHint: String,
      outputHint: String,
      configuration: {
        against: {
          required: true,
          type: String
        },
        in: {
          required: false,
          type: String,
          values: ['days', 'workdays'],
          default: 'days'
        }
      }
    }
  }

  async process (input, configuration) {
    const against = get(configuration, 'against', null)
    if (against === null || input === null) return null

    const inType = get(configuration, 'in', this.description.configuration.in.default)
    const range = (inType === 'workdays') ? [1, 2, 3, 4, 5] : [1, 2, 3, 4, 5, 6, 7]

    // @ts-ignore
    return moment().isoWeekdayCalc(input, against, range)
  }
}

module.exports = DateDiff
