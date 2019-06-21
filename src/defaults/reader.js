
class Reader {
  constructor (config) {
    this.config = config
  }

  async open () {
    return true
  }

  async items () {
    throw Error('Reader Not implemented')
  }

  async close () {
    return true
  }
}

module.exports = Reader