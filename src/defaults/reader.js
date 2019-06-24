
class Reader {
  constructor (config) {
    this.config = config
  }

  async open () {}

  // @ts-ignore
  async items (configuration) {
    throw Error('Reader Not implemented')
  }

  async close () {}
}

module.exports = Reader