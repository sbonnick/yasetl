const fs = require('fs').promises

class PluginLoader {
  constructor (options = {}) {
    this.regex = options.regex || /.+\.js$/i
    this.extended = options.extends || null
    return this
  }

  async loadPlugins (path) {
    const files = await fs.readdir(path)
    let promises = files.map(file => this.loadPlugin(path + file))

    const loadedPlugins = await Promise.all(promises.map(p => p.catch(e => e)))

    const validPlugins = loadedPlugins.filter(plugin => !(plugin instanceof Error))

    const indexedPlugins = validPlugins.reduce((obj, plugin) => {
      obj[plugin.name] = plugin
      return obj
    }, {})

    return Promise.resolve(indexedPlugins)
  }

  async loadPlugin (filePath) {
    const stat = await fs.stat(filePath)
    if (!stat.isFile() || !filePath.match(this.regex)) { return Promise.reject(new Error('Not a valid plugin file path: ' + filePath)) }

    let plugin = require(filePath)

    if (this.extended != null && !(plugin.prototype instanceof this.extended)) { return Promise.reject(new Error('Plugin not an instance of [' + this.extended.name + ']: ' + filePath)) }

    return Promise.resolve(plugin)
  }
}

module.exports = PluginLoader
