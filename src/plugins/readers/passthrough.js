const Reader = require('./../../defaults/reader')
const get = require('lodash/get')

class Passthrough extends Reader {
  async items () {
    return get(this.config, 'items', [])
  }
}

module.exports = Passthrough