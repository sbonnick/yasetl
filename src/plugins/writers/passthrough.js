const Writer = require('./../../defaults/writer')
const get = require('lodash/get')

class Passthrough extends Writer {
  async items (items) {
    let existingItems = get(this.config, 'items', [])
    this.config.items = [...existingItems, ...items]
  }
}

module.exports = Passthrough