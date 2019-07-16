const PluginLoader = require('./plugin-loader')
const logger = require('./pino')
const get = require('lodash/get')

class PluginService {
  constructor (plugins) {
    this.plugins = plugins
  }

  static async init (type, path) {
    logger.info('loading ' + type.name + ' plugins from: ' + path)
    const loader = new PluginLoader({ extends: type })
    const plugins = await loader.loadPlugins(path)
    return new PluginService(plugins)
  }

  async loadEngine (plugin, configuration) {
    const LoadedEngine = get(this.plugins, plugin, null)
    if (LoadedEngine === null) {
      throw Error('Plugin "' + plugin + '" could not be found. Validate plugin with matching Class name is in plugin path')
    }
    return new LoadedEngine(configuration)
  }
}

module.exports = PluginService