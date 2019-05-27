const simplePlugin = require('./simple-plugin')

class extendedPlugin extends simplePlugin {
  foo () {
    return 'bar'
  }
}

module.exports = extendedPlugin
