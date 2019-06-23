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

    try {
      this.version = get(configuration, 'schemaVersion')
      // TODO: Load specific schema implementation or throw
    } catch (error) {
      logger.error(error)
    }

    return this
  }

  async initAndLoadEngine (loaderConfig, engineConfig) {
    let engine = await PluginService.init(...loaderConfig)
    let plugin = await engine.loadEngine(engineConfig.engine, engineConfig)
    return plugin
  }

  async extract (fireDate) {
    if (fireDate === null) {
      fireDate = moment.now()
    }

    // Make a shallow copy of configurations
    let config = { ...this.configuration }

    // let readerEngine = await PluginService.init(...readerServiceConfig)
    // let writerEngine = await PluginService.init(...writerServiceConfig)
    let parser = await ParserService.init(config.fields)

    // let reader = await readerEngine.loadEngine(config.source.engine, config.source)
    // let writer = await writerEngine.loadEngine(config.destination.engine, config.destination)

    let reader = await this.initAndLoadEngine(readerServiceConfig, config.source)
    let writer = await this.initAndLoadEngine(writerServiceConfig, config.destination)

    await writer.open()
    await reader.open()
    
    let results = await reader.items()
    let values = await parser.parse(results)
    await writer.items(values)
    
    await reader.close()
    await writer.close()

    var duration = humanize(moment(Date.now()).diff(moment(fireDate)))

    logger.info(`Extracted ${values.length} records from jira to ${this.configuration.source.engine}  (${duration})`)

    return config
  }

  // TODO: Impl. should be moved to a schema version specific file, loaded by a factory
  // TODO: Implement operation logic (Record replacement, looping, etc...) 
}

module.exports = SchemaExtractor