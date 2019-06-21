const get = require('lodash/get')
const logger = require('./pino')
const moment = require('moment')
const humanize = require('humanize-duration')

const ReaderService = require('./reader-service')
const WriterService = require('./writer-service')
const ParserService = require('./parser')

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

  async extract (fireDate) {
    if (fireDate === null) {
      fireDate = moment.now()
    }

    let config = { ...this.configuration }

    let readerEngine = await ReaderService.init(config.source)
    let writerEngine = await WriterService.init(config.destination)
    let parser = await ParserService.init(config.fields)

    let reader = await readerEngine.loadEngine()
    let writer = await writerEngine.loadEngine()

    await writer.open()

    let results = await reader.items()

    let values = await parser.parse(results)

    await writer.items(values)
    await writer.close()

    var duration = humanize(moment(Date.now()).diff(moment(fireDate)))

    logger.info(`Extracted ${values.length} records from jira to ${this.configuration.source.engine}  (${duration})`)

    return config
  }

  // TODO: Impl. should be moved to a schema version specific file, loaded by a factory
  // TODO: Implement operation logic (Record replacement, looping, etc...) 
}

module.exports = SchemaExtractor