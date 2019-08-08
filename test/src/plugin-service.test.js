const path = require('path')
const PluginService = require('../../src/plugin-service')

describe('Plugin Service', () => {
  const pluginPath = path.join(__dirname, '/../resources/plugins/generic/')
  const simplePluginPath = path.join(pluginPath + 'simple-plugin.js')
  const extendedPluginPath = path.join(pluginPath + 'extended-plugin.js')

  const simplePlugin = require(simplePluginPath)
  const ExtendedPlugin = require(extendedPluginPath)
  describe('init()', () => {
    it('should load specific plugins given a path and type', async () => {
      const pluginService = await PluginService.init(simplePlugin, pluginPath)
      expect(pluginService.plugins).toHaveProperty('extendedPlugin', ExtendedPlugin)
    })
  })

  describe('loadEngine()', () => {
    it('loads the engine specified successfully', async () => {
      const pluginService = await PluginService.init(simplePlugin, pluginPath)
      const loadedEngine = await pluginService.loadEngine('extendedPlugin')
      expect(loadedEngine.foo()).toEqual((new ExtendedPlugin()).foo())
    })

    it('throws error when plugin cannot be found', async () => {
      const pluginService = await PluginService.init(simplePlugin, pluginPath)
      const loadedEngine = pluginService.loadEngine('noPlugin', {})
      await expect(loadedEngine).rejects.toThrow(/Plugin "noPlugin" could not be found/)
    })
  })
})