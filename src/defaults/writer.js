
class Writer {
  constructor (config) {
    this.config = config
  }

  /**
   * Opens and prepares the writer to be writen to
   * @function open
   */
  async open () {}

  /**
   * Writes given items to the writer
   * @function items
   * @param  {Array} items The list of Items to be writen
   * @param  {Object} [configuration] The optional configuration to override the default class config
   * @return {Promise<any[]>} Promises of items being writen
   */
  async items (items, configuration) {
    throw Error('Writer Not implemented. ' + items + configuration)
  }

  /**
   * Cleans up and closes writer
   * @function open
   */
  async close () {}
}

module.exports = Writer