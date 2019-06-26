const path = require('path')
const PluginService = require('../../src/plugin-service')
const chai = require('chai')
const chaiPromise = require('chai-as-promised')

chai.use(chaiPromise)
const expect = chai.expect

describe('Plugin Service', () => {
  const pluginPath = path.join(__dirname, '/../resources/plugins/generic/')
  const simplePluginPath = path.join(pluginPath + 'simple-plugin.js')
  const extendedPluginPath = path.join(pluginPath + 'extended-plugin.js')

  const simplePlugin = require(simplePluginPath)
  const ExtendedPlugin = require(extendedPluginPath)
  describe('init()', () => {
    it('should load specific plugins given a path and type', async function () {
      let pluginService = await PluginService.init(simplePlugin, pluginPath)
      expect(pluginService.plugins).to.include({
        extendedPlugin: ExtendedPlugin
      })
    })
  })

  describe('loadEngine()', () => {
    it('loads the engine specified successfully', async function () {
      let pluginService = await PluginService.init(simplePlugin, pluginPath)
      let loadedEngine = await pluginService.loadEngine('extendedPlugin')
      expect(loadedEngine.foo()).to.equal((new ExtendedPlugin()).foo())
    })

    it('throws error when plugin cannot be found', async function () {
      let pluginService = await PluginService.init(simplePlugin, pluginPath)
      let loadedEngine = pluginService.loadEngine('noPlugin', {})
      expect(loadedEngine).to.be.rejectedWith(Error)
    })
  })
})