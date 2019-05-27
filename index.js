const fs = require('fs')
const minimist = require('minimist')
const Extractor = require('./src/extractor')
const logger = require('./src/pino')

const argv = minimist((process.argv.slice(2)))

function getArgument (value, def = null) {
  if (value in argv) return argv[value]
  else if (value in process.env) return process.env[value]
  else return def
}

let debug = (getArgument('loglevel') === 'debug')

if (debug) {
  logger.debug('Input Paramaters')
  logger.debug('----------------')
  let con = ['config', 'baseurl', 'username', 'cron']
  con.forEach(element => {
    logger.debug(`${element} = ${getArgument(element, 'NULL')}`)
  })
}

let configuration = JSON.parse(
  fs.readFileSync(getArgument('config', 'config.json'), 'utf8')
)

let app = new Extractor(
  configuration,
  getArgument('baseurl'),
  getArgument('username'),
  getArgument('password'),
  debug)

app.run(getArgument('cron'))
