const Writer = require('./../../defaults/writer')
const get = require('lodash/get')

class Passthrough extends Writer {
  async items (items, configuration) {
    let config = { ...this.config, ...configuration }
    let existingItems = get(config, 'items', [])
    this.config.items = [...existingItems, ...items]
  }
}

module.exports = Passthrough