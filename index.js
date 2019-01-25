const fs        = require('fs');
const minimist  = require('minimist');
const extractor = require('./src/extractor');


const argv = minimist((process.argv.slice(2)))

function getArgument(value, def = null) {
  if (value in argv)              return argv[value]
  else if (value in process.env)  return process.env[value]
  else                            return def
}

let configuration = JSON.parse(
  fs.readFileSync(getArgument('config', 'config.json'), 'utf8')
);

let app = new extractor(
  configuration, 
  getArgument('baseurl'), 
  getArgument('username'), 
  getArgument('password'))

app.run(getArgument('cron'))
