const get = require('lodash/get')
const logger = require('./pino')
const moment = require('moment')
const humanize = require('humanize-duration')
const allSettled = require('promise.allsettled')

class SchemaExtractor {
  constructor (configuration, configurationOverloads) {
    this.configuration = configuration
    this.configurationOverloads = configurationOverloads

    try {
      this.version = get(configuration, 'schemaVersion')
      // TODO: Load specific schema implementation or throw
    } catch (error) {
      logger.error(error)
    }

    return this
  }

  async _getSourceReader () {
    let source = this.configuration.source
    // TODO: lookup engine in a list of plugin impl instead of hard coded. Throw as default
    if (source.engine === 'jira') {
      let ReaderEngine = require('./jira-reader')
      return new ReaderEngine(source.baseurl, source.username, source.password)
    }
  }

  async _getDestinationWriter () {
    let destination = this.configuration.destination
    // TODO: lookup engine in a list of plugin impl instead of hard coded. Throw as default
    if (destination.engine === 'postgres') {
      let WriterEngine = require('./postgres-writer')
      return new WriterEngine(destination.location, destination.table, destination.fields)
    }
  }

  async _getDataProcessor () {
    let Parser = require('./parser')
    return Parser.init()
  }

  async extract (fireDate) {
    if (fireDate === null) {
      fireDate = moment.now()
    }

    let reader = await this._getSourceReader()
    let writer = await this._getDestinationWriter()
    let parser = await this._getDataProcessor()

    allSettled([reader, writer, parser])

    await writer.create()

    let results = await reader.query(this.configuration.source.query)

    let values = await parser.parse(results)

    await writer.insert(values)
    await writer.close()

    var duration = humanize(moment(Date.now()).diff(moment(fireDate)))

    logger.info(`Extracted ${values.length} records from jira to ${this.configuration.source.engine}  (${duration})`)
  }

  // TODO: Impl. should be moved to a schema version specific file, loaded by a factory
  // TODO: Implement operation logic (Record replacement, looping, etc...) 
}

module.exports = SchemaExtractor