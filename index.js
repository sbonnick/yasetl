const fs = require('fs')
const minimist = require('minimist')
const Extractor = require('./src/schema-extractor')
const schedule = require('node-schedule')

const argv = minimist((process.argv.slice(2)))

function getArgument (value, def = null) {
  if (value in argv) return argv[value]
  else if (value in process.env) return process.env[value]
  else return def
}

const configuration = JSON.parse(
  fs.readFileSync(getArgument('config', 'config.json'), 'utf8')
)

configuration.source.username = getArgument('username')
configuration.source.password = getArgument('password')

configuration.settings = {
  debug: {
    samples: getArgument('samples'),
    processes: getArgument('trace')
  }
}

const app = new Extractor(configuration)
app.extract()

const cron = getArgument('cron')
if (cron !== null) {
  schedule.scheduleJob(cron, function (app) {
    app.extract()
  }.bind(null, app))
}