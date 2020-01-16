const path = require('path')
const PluginLoader = require('./plugin-loader')
const Processor = require('./defaults/processor')
const logger = require('./pino')
const get = require('lodash/get')
const isString = require('lodash/isString')

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
    const realItems = {}
    const virtualItems = {}

    const fields = Object.keys(this.fields)

    // TODO: add support for automaticly build a dependancy tree

    for (var i = 0; i < fields.length; i++) {
      const fieldName = fields[i]
      const field = this.fields[fieldName]
      const isVirtual = get(field, 'virtual', false)

      logger.debug('Processing field "' + fieldName + '"')
      const inputValue = this._getReferanceValue(field.input, item, realItems, virtualItems)
      const processed = await this._processField(field, inputValue, item, realItems, virtualItems)

      logger.debug('finished processing, value: ' + processed)

      if (isVirtual) {
        virtualItems[fieldName] = processed
      } else {
        realItems[fieldName] = processed
      }
    }

    return realItems
  }

  async _processField (field, inputValue, recordItems, realItems, virtualItems) {
    if (field.processors !== undefined) {
      // TODO: Need to check processor if there is any values requiring replacement with RECORD or FIELD. Perhaps use a specific field??

      for (var i = 0; i < field.processors.length; i++) {
        const proc = field.processors[i]
        const readyProc = {}
        const optionKeys = Object.keys(proc)
        
        for (let index = 0; index < optionKeys.length; index++) {
          const optionKey = optionKeys[index]
          const optionValue = proc[optionKey]

          if (this._isReferance(optionValue)) {
            readyProc[optionKey] = this._getReferanceValue(optionValue, recordItems, realItems, virtualItems)
          } else {
            readyProc[optionKey] = optionValue
          }
        }

        const procObj = this._getProcessor(readyProc.processor)
        inputValue = await procObj.process(inputValue, readyProc)
      }
    }
    return inputValue
  }

  _isReferance (suspectedReferance) {
    if (!isString(suspectedReferance)) return false
    return (suspectedReferance.match(this.RECORD) || suspectedReferance.match(this.FIELD))
  }

  _getReferanceValue (referance, recordItems, realItems, virtualItems) {
    let value

    if (referance.match(this.RECORD)) {
      const key = referance.replace(this.RECORD, '$1')
      value = get(recordItems, key)
    } else if (referance.match(this.FIELD)) {
      const key = referance.replace(this.FIELD, '$1')
      value = get(realItems, key)
      if (value === undefined) { value = get(virtualItems, key) }
    } else {
      throw Error(`Value ${referance} cannot be recognized as a field referance, or field not yet processed`)
    }

    return value
  }

  _getProcessor (name) {
    return new this.processors[name]()

    // TODO: this needs to be improved to be name safe (case, hyphen-notation, etc...). needs to log if cannot be found and why
  }
}

module.exports = Parser

// TODO: determine dependancy graph and work on fields in parallel