const path = require('path')
const PluginLoader = require('../../src/plugin-loader')

describe('Plugin Loader', () => {
  const pluginPath = path.join(__dirname, '/../resources/plugins/generic/')
  const simplePluginPath = path.join(pluginPath + 'simple-plugin.js')
  const extendedPluginPath = path.join(pluginPath + 'extended-plugin.js')
  const otherPluginPath = path.join(pluginPath + 'other-plugin.js')

  const simplePlugin = require(simplePluginPath)
  const extendedPlugin = require(extendedPluginPath)
  const otherPlugin = require(otherPluginPath)

  describe('loadPlugins()', () => {
    it('should load all valid plugins with a valid directory', async () => {
      const pluginLoader = new PluginLoader()
      const pluginList = await pluginLoader.loadPlugins(pluginPath)
      expect(pluginList).toEqual({
        simplePlugin: simplePlugin,
        extendedPlugin: extendedPlugin,
        otherPlugin: otherPlugin
      })
    })

    it('should return error with a invalid directory', async () => {
      const pluginLoader = new PluginLoader()
      const pluginList = pluginLoader.loadPlugins(pluginPath + 'NE')
      await expect(pluginList).rejects.toThrow(/Not a valid plugin directory/)
    })

    it('should only load plugins that explicitly extend a base class', async () => {
      const pluginLoader = new PluginLoader({ extends: simplePlugin })
      const pluginList = await pluginLoader.loadPlugins(pluginPath)
      expect(pluginList).toHaveProperty('extendedPlugin', extendedPlugin)
      expect(pluginList).not.toHaveProperty('simplePlugin', simplePlugin)
      expect(pluginList).not.toHaveProperty('otherPlugin', otherPlugin)
    })
  })

  describe('loadPlugin()', () => {
    it('should load a plugin with correct path', async () => {
      const pluginLoader = new PluginLoader()
      const Plugin = await pluginLoader.loadPlugin(simplePluginPath)
      expect(typeof Plugin).toBe('function')
      expect((new Plugin()).hello()).toEqual('world')
    })

    it('should be rejected on an incorrect path', async () => {
      const pluginLoader = new PluginLoader()
      const Plugin = pluginLoader.loadPlugin(simplePluginPath + 'NE')
      await expect(Plugin).rejects.toThrow(/Not a valid plugin file/)
    })

    it('should be rejected on an incorrect file regex', async () => {
      const pluginLoader = new PluginLoader({ regex: /.+\.jsNE$/i })
      const Plugin = pluginLoader.loadPlugin(simplePluginPath)
      await expect(Plugin).rejects.toThrow(/Not a valid plugin file/)
    })

    it('should be rejected if it does not extend the correct base class', async () => {
      const pluginLoader = new PluginLoader({ extends: simplePlugin })
      const Plugin = pluginLoader.loadPlugin(otherPluginPath)
      await expect(Plugin).rejects.toThrow(/Plugin not an instance of \[simplePlugin\]/)
    })

    it('should load plugin with correct base class', async () => {
      const pluginLoader = new PluginLoader({ extends: simplePlugin })
      const Plugin = await pluginLoader.loadPlugin(extendedPluginPath)
      expect(typeof Plugin).toBe('function')
      expect((new Plugin()).hello()).toEqual('world')
      expect((new Plugin()).foo()).toEqual('bar')
    })
  })
})
