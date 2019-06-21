const path = require('path')
const PluginLoader = require('./plugin-loader')
const Reader = require('./defaults/reader')
const logger = require('./pino')
const get = require('lodash/get')

class ReaderService {
  constructor (config, readers) {
    this.config = config
    this.readers = readers
  }
 
  static async init (config) {
    let dir = path.join(__dirname, '/plugins/readers/')
    logger.info('loading reader plugins from: ' + dir)
    let loader = new PluginLoader({ extends: Reader })
    let readers = await loader.loadPlugins(dir)
    return new ReaderService(config, readers)
  }

  async loadEngine (engine) {
    engine = engine || get(this.config, 'engine', null)
    if (engine === null) {
      throw Error('Write engine not provided')
    }

    let LoadedEngine = get(this.readers, engine, null)
    if (LoadedEngine === null) {
      throw Error('Write engine could not be found')
    }

    return new LoadedEngine(this.config)
  }
}

module.exports = ReaderService