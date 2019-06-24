const Reader = require('./../../defaults/reader')
const get = require('lodash/get')

class Passthrough extends Reader {
  async items (configuration) {
    let config = { ...this.config, ...configuration }
    return get(config, 'items', [])
  }
}

module.exports = Passthrough