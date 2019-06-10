const schedule = require('node-schedule')
const moment = require('moment')
const humanize = require('humanize-duration')
const logger = require('./pino')

const JiraReader = require('./jira-reader')
const JiraParser = require('./jira-parser')

class extractor {
  constructor (config, baseurl, username, password, debug = false) {
    this.config = config
    this.baseurl = baseurl
    this.username = username
    this.password = password
    this.debug = debug
    return this
  }

  _writer (name) {
    switch (name) {
    case 'postgres': return require('./postgres-writer')
    default: return null
    }
  }

  static async extract (config, reader, parser, writer, fireDate) {
    await writer.create()

    let results = await reader.query(config.jql)
    let values = await parser.parse(results)

    await writer.insert(values)
    await writer.close()

    var duration = humanize(moment(Date.now()).diff(moment(fireDate)))

    logger.info(`Extracted ${values.length} records from jira to ${config.output.format}  (${duration})`)
  }

  run (cron = null) {
    var reader = new JiraReader(this.baseurl, this.username, this.password)
    var parser = new JiraParser(this.config.output.fields)

    let WriterEngine = this._writer(this.config.output.format)
    let writer = new WriterEngine(this.config.output.location, this.config.output.table, this.config.output.fields)

    // Run extract Immediately on execution
    extractor.extract(this.config, reader, parser, writer, Date.now())

    // Continue to run extract at a given frequency
    if (cron != null) {
      schedule.scheduleJob(cron, function (config, reader, parser, writer) {
        extractor.extract(config, reader, parser, writer, Date.now())
      }.bind(null, this.config, reader, parser, writer))
    }
  }
}

module.exports = extractor

// TODO: Add safety around if null is returned from writer selection
// TODO: Add safety around cron jobs overlapping
