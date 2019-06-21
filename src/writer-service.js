const path = require('path')
const PluginLoader = require('./plugin-loader')
const Writer = require('./defaults/writer')
const logger = require('./pino')
const get = require('lodash/get')

class WriterService {
  constructor (config, writers) {
    this.config = config
    this.writers = writers
  }
 
  static async init (config) {
    let dir = path.join(__dirname, '/plugins/writers/')
    logger.info('loading writer plugins from: ' + dir)
    let loader = new PluginLoader({ extends: Writer })
    let writers = await loader.loadPlugins(dir)
    return new WriterService(config, writers)
  }

  async loadEngine (engine) {
    engine = engine || get(this.config, 'engine', null)
    if (engine === null) {
      throw Error('Write engine not provided')
    }

    let LoadedEngine = get(this.writers, engine, null)
    if (LoadedEngine === null) {
      throw Error('Write engine could not be found')
    }

    return new LoadedEngine(this.config)
  }
}

module.exports = WriterService