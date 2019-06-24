const schedule = require('node-schedule')
const moment = require('moment')
const humanize = require('humanize-duration')
const logger = require('./pino')

const JiraReader = require('./plugins/readers/jira')
const JiraParser = require('./jira-parser')
const WriterEngine = require('./plugins/writers/postgres')

class extractor {
  constructor (config, baseurl, username, password, debug = false) {
    this.config = config
    this.baseurl = baseurl
    this.username = username
    this.password = password
    this.debug = debug
    return this
  }

  static async extract (config, reader, parser, writer, fireDate) {
    await writer.open()

    let results = await reader.query({ query: config.jql })
    let values = await parser.parse(results)

    await writer.items(values)
    await writer.close()

    var duration = humanize(moment(Date.now()).diff(moment(fireDate)))

    logger.info(`Extracted ${values.length} records from jira to ${config.output.format}  (${duration})`)
  }

  run (cron = null) {
    var reader = new JiraReader({
      baseurl: this.baseurl, 
      username: this.username, 
      password: this.password
    })
    reader.open()
    
    var parser = new JiraParser(this.config.output.fields)

    let writer = new WriterEngine({
      connection: this.config.output.location, 
      table: this.config.output.table, 
      fields: this.config.output.fields
    })

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
