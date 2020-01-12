const path = require('path')
const PluginLoader = require('./plugin-loader')
const Processor = require('./defaults/processor')
const logger = require('./pino')
const get = require('lodash/get')

class Parser {
  constructor (fields, processors) {
    this.RECORD = /RECORD\.(.+)$/i
    this.FIELD = /FIELD\.(.+)$/i

    this.processors = processors
    this.fields = fields
  }

  static async init (fields) {
    const dir = path.join(__dirname, '/plugins/processors/')
    logger.info('loading processor plugins from: ' + dir)

    const loader = new PluginLoader({ extends: Processor })
    const processors = await loader.loadPlugins(dir)
    return new Parser(fields, processors)
  }

  async parse (data) {
    return Promise.all(data.map(item => this.parseItem(item)))
  }

  async parseItem (item) {
    const sanitizedItem = {}

    const fields = Object.keys(this.fields)
    for (var i = 0; i < fields.length; i++) {
      const fieldName = fields[i]
      const field = this.fields[fieldName]
      logger.debug('Processing field "' + fieldName + '"')
      const inputValue = await this._getInputValue(field, item, sanitizedItem)
      const processed = await this._processField(field, inputValue)
      logger.debug('finished processing, value: ' + processed)
      sanitizedItem[fieldName] = processed
    }
    return sanitizedItem
  }

  async _processField (field, inputValue) {
    if (field.processors !== undefined) {
      for (var i = 0; i < field.processors.length; i++) {
        const proc = field.processors[i]
        const procObj = this._getProcessor(proc.processor)
        inputValue = await procObj.process(inputValue, proc)
      }
    }
    return inputValue
  }

  async _getInputValue (field, item, processedFields) {
    if (field.input.match(this.RECORD)) {
      const key = field.input.replace(this.RECORD, '$1')
      return get(item, key)
    } else if (field.input.match(this.FIELD)) {
      const key = field.input.replace(this.FIELD, '$1')
      return get(processedFields, key)
    }
    throw Error('Input value cannot be recognized')
  }

  _getProcessor (name) {
    return new this.processors[name]()
  }
}

module.exports = Parser

// TODO: determine dependancy graph and work on fields in parallel