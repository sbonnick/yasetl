const Reader = require('./../../defaults/reader')
const get = require('lodash/get')

class Passthrough extends Reader {
  async items (configuration) {
    const config = { ...this.config, ...configuration }
    return get(config, 'items', [])
  }
}

module.exports = Passthrough