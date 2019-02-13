const schedule = require('node-schedule');
const moment   = require('moment');
const humanize = require('humanize-duration')

const jiraReader   = require('./jira-reader');
const jiraParser   = require('./jira-parser');


class extractor {
  constructor(config, baseurl, username, password, debug = false) {
    this.config = config
    this.baseurl = baseurl
    this.username = username
    this.password = password
    this.debug = debug
    return this
  }

  _writer(name) {
    switch (name) {
      case 'sqlite':   return require('./sqlite-writer');
      case 'postgres': return require('./postgres-writer');
      default:         return null;
    }
  }

  async _extract(config, reader, parser, writer, fireDate) {
    await writer.create()

    let results = await reader.query(config.jql)
    let values = await parser.parse(results)

    await writer.insert(values)
    await writer.close()

    var duration = humanize(moment(Date.now()).diff(moment(fireDate)))

    console.log(`Extracted ${values.length} records from jira to ${config.output.format}  (${duration})`)
  }

  run(cron = null) {  
    var reader = new jiraReader(this.baseurl, this.username, this.password);
    var parser = new jiraParser(this.config.output.fields);

    let writerEngine = this._writer(this.config.output.format)
    let writer = new writerEngine(this.config.output.location, this.config.output.table, this.config.output.fields)
    
    // Run extract Immediately on execution
    this._extract(this.config, reader, parser, writer, Date.now())

    // Continue to run extract at a given frequency
    if (cron != null) {
      schedule.scheduleJob(cron, function(fireDate){
        this._extract(this.config, reader, parser, writer, fireDate)
      })
    }
  }
}

module.exports = extractor


// TODO: Add safety around if null is returned from writer selection
// TODO: Add safety around cron jobs overlapping