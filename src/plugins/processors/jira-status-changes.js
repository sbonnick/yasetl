const Processor = require('../../defaults/processor')

// @ts-ignore
class JiraStatusChanges extends Processor {
  constructor () {
    super()

    this.description = {
      name: 'Jira Status Changes',
      description: 'extracts the list of dates upon each status change. Deals strickly with changelog.histories as input',
      inputHint: Array,
      outputHint: Object,
      configuration: {}
    }
  }

  async process (input, configuration) {
    if (input === null || Array.isArray(input) === false || input.length === 0) return null

    const changeDates = {}
    input.forEach(change => {
      change.items.forEach(changeItem => {
        if (changeItem.field === 'status') {
          changeDates[changeItem.toString.replace(/\s+/g, '').toLowerCase()] = change.created
        }
      })
    })
    return changeDates
  }
}

module.exports = JiraStatusChanges
