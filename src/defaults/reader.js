
class Reader {
  constructor (config) {
    this.config = config
  }

  /**
   * Opens and prepares the reader to be read from
   * @function open
   */
  async open () {}

  /**
   * Reads given items from the reader
   * @function items
   * @param  {Object} [configuration] The optional configuration to override the default class config
   * @return {Promise<any[]>} Promises of items that are being read
   */
  async items (configuration) {
    throw Error('Reader Not implemented. ' + configuration)
  }

  /**
   * Cleans up and closes reader
   * @function open
   */
  async close () {}
}

module.exports = Reader