const get = require('lodash/get')
const logger = require('./pino')
const moment = require('moment')
const humanize = require('humanize-duration')
const path = require('path')
const PluginService = require('./plugin-service')
const ParserService = require('./parser')

const readerServiceConfig = [
  require('./defaults/reader'),
  path.join(__dirname, '/plugins/readers/')
]

const writerServiceConfig = [
  require('./defaults/writer'),
  path.join(__dirname, '/plugins/writers/')
]

class SchemaExtractor {
  constructor (configuration) {
    this.configuration = configuration

    this.version = get(configuration, 'schemaVersion', null)
    if (this.version == null) {
      throw Error('no schemaVersion is specified in the configuration')
    }
    // TODO: Do something with specific schema implementation   
  }

  async initAndLoadEngine (loaderConfig, engineConfig) {
    let engine = await PluginService.init(...loaderConfig)
    let plugin = await engine.loadEngine(engineConfig.engine, engineConfig)
    return plugin
  }

  async extract (fireDate) {
    if (fireDate == null) {
      fireDate = moment.now()
    }

    // Make a shallow copy of configurations
    let config = { ...this.configuration }

    let parser = await ParserService.init(config.fields)
    let reader = await this.initAndLoadEngine(readerServiceConfig, config.source)
    let writer = await this.initAndLoadEngine(writerServiceConfig, config.destination)

    await Promise.all([writer.open(), reader.open()])
    
    let results = await reader.items()
    let values = await parser.parse(results)
    await writer.items(values)

    await Promise.all([reader.close(), writer.close()])

    var duration = humanize(moment(Date.now()).diff(moment(fireDate)))

    logger.info(`Extracted ${values.length} records from jira to ${this.configuration.source.engine}  (${duration})`)

    return config
  }

  // TODO: Impl. should be moved to a schema version specific file, loaded by a factory
}

module.exports = SchemaExtractor