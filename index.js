const fs        = require('fs');
const minimist  = require('minimist');
const extractor = require('./src/extractor');


const argv = minimist((process.argv.slice(2)))

function getArgument(value, def = null) {
  if (value in argv)              return argv[value]
  else if (value in process.env)  return process.env[value]
  else                            return def
}

let debug = (getArgument('loglevel') == 'debug') ? true : false

if(debug) {
  console.log('Input Paramaters')
  console.log('----------------')
  let con = ['config', 'baseurl','username', 'cron']
  con.forEach(element => {
    console.log(`${element} = ${getArgument(element, "NULL")}`)
  });
  console.log('')
}

let configuration = JSON.parse(
  fs.readFileSync(getArgument('config', 'config.json'), 'utf8')
);

let app = new extractor(
  configuration, 
  getArgument('baseurl'), 
  getArgument('username'), 
  getArgument('password'),
  debug)

app.run(getArgument('cron'))
