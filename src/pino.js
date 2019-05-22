const pino = require('pino')
const pinoPretty = require('pino-pretty')

// Basic logger. good for Docker compose as it will have its own timestamps
const logger = pino({
  level: 'debug',
  timestamp: false,
  prettyPrint: {
    levelFirst: true,
    colorize: true,
    ignore: 'time,pid,hostname'
  },
  prettifier: pinoPretty
})

module.exports = logger

// TODO: Only use prettyPrint for Dev environments or as a input
