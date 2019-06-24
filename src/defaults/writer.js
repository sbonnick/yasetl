
class Writer {
  constructor (config) {
    this.config = config
  }

  async open () {}

  // @ts-ignore
  async items (items, configuration) {
    throw Error('Writer Not implemented')
  }

  async close () {}
}

module.exports = Writer