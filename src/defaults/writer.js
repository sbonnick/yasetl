
class Writer {
  constructor (config) {
    this.config = config
  }

  async open () {
    return true
  }

  async items (items) {
    throw Error('Writer Not implemented')
  }

  async close () {
    return true
  }
}

module.exports = Writer