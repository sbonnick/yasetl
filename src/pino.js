const pino = require('pino')
const pinoPretty = require('pino-pretty')

// Basic logger. good for Docker compose as it will have its own timestamps
const logger = pino({
  enabled: !(process.env.LOG_ENABLED === 'false'),
  level: 'info',
  timestamp: false,
  prettyPrint: {
    levelFirst: true,
    colorize: true,
    ignore: 'time,pid,hostname'
  },
  // @ts-ignore
  prettifier: pinoPretty
})

module.exports = logger

// TODO: Only use prettyPrint for Dev environments or as a input
