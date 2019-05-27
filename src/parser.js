const path = require('path')
const PluginLoader = require('./plugin-loader')
const Processor = require('./processor')
const logger = require('pino')

class Parser {
  constructor (fields, processors) {
    this.processors = processors
    this.fields = fields
  }

  static async init (fields) {
    let loader = new PluginLoader({ extends: Processor })
    let processors = await loader.loadPlugins(path.join(__dirname, '/processors/'))
    return new Parser(fields, processors)
  }

  async parse (data) {
    let items = data.map(async item => this.parseItem(item))
    return Promise.all(items)
  }

  async parseItem (item) {
    let sanitizedItem = {}

    Object.keys(this.fields).forEach(fieldName => {
      let field = this.fields[fieldName]

      logger.info(item, field)

      // TODO: Iterate over defined processors in fields and execute the chain, returning value to output field for each input item

      sanitizedItem[fieldName] = null
    })
    return sanitizedItem
  }
}

module.exports = Parser
