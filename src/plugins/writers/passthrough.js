const Writer = require('./../../defaults/writer')
const get = require('lodash/get')

class Passthrough extends Writer {
  async items (items, configuration) {
    const config = { ...this.config, ...configuration }
    const existingItems = get(config, 'items', [])
    this.config.items = [...existingItems, ...items]
  }
}

module.exports = Passthrough