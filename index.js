const fs = require('fs')
const minimist = require('minimist')
const Extractor = require('./src/schema-extractor')

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
const app = new Extractor(configuration)

app.extract()
