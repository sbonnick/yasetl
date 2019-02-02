const schedule = require('node-schedule');

const sqliteWriter = require('./sqlite-writer');
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

  run(cron = null) {  
    var reader = new jiraReader(this.baseurl, this.username, this.password);
    var parser = new jiraParser(this.config.output.fields);

    // TODO: maintain state in the writer class
    // TODO: use promise chaining instead of single function
    // TODO: print time of query as well as when a schedule is 
    // TODO: extract from this function
    var active = false
    function extract(fireDate, cl) {
      if (!active) {
        active = true
        let writer = new sqliteWriter(cl.config.output.location, cl.config.output.table, cl.config.output.fields)
        reader.query(cl.config.jql)
          .then(data => {
            if (cl.debug) console.log(JSON.stringify(data[0], null, 2))
            let val = parser.parse(data)
            writer.insert(val)
            writer.close()
            active = false
            console.log(`Extracted ${val.length} records from jira to sqlite`)
          })
      }
    }

    // Run extract Immediately on execution
    extract(Date.now(), this)

    // Continue to run extract at a given frequency
    if (cron != null) {
      schedule.scheduleJob(cron, function(fireDate){
        extract(fireDate, this)
      })
    }
  }
}

module.exports = extractor