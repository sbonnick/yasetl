const path = require('path')
const PluginLoader = require('../../src/plugin-loader')
const chai = require('chai')
const chaiPromise = require('chai-as-promised')

chai.use(chaiPromise)
const expect = chai.expect

describe('Plugin Loader', function () {
  const pluginPath = path.join(__dirname, '/../resources/plugins/generic/')
  const simplePluginPath = path.join(pluginPath + 'simple-plugin.js')
  const extendedPluginPath = path.join(pluginPath + 'extended-plugin.js')
  const otherPluginPath = path.join(pluginPath + 'other-plugin.js')

  const simplePlugin = require(simplePluginPath)
  const extendedPlugin = require(extendedPluginPath)
  const otherPlugin = require(otherPluginPath)

  describe('loadPlugins()', function () {
    it('should load all valid plugins with a valid directory', async function () {
      const pluginLoader = new PluginLoader()
      const pluginList = await pluginLoader.loadPlugins(pluginPath)
      expect(pluginList).to.include({
        simplePlugin: simplePlugin,
        extendedPlugin: extendedPlugin,
        otherPlugin: otherPlugin
      })
    })

    it('should return error with a invalid directory', async function () {
      const pluginLoader = new PluginLoader()
      const pluginList = pluginLoader.loadPlugins(pluginPath + 'NE')
      expect(pluginList).to.be.rejectedWith(Error)
    })

    it('should only load plugins that explicitly extend a base class', async function () {
      const pluginLoader = new PluginLoader({ extends: simplePlugin })
      const pluginList = await pluginLoader.loadPlugins(pluginPath)
      expect(pluginList).to.include({
        extendedPlugin: extendedPlugin
      })
      expect(pluginList).to.not.include({
        simplePlugin: simplePlugin,
        otherPlugin: otherPlugin
      })
    })
  })

  describe('loadPlugin()', function () {
    it('should load a plugin with correct path', async function () {
      const pluginLoader = new PluginLoader()
      const Plugin = await pluginLoader.loadPlugin(simplePluginPath)
      expect(Plugin).to.be.a('function')
      expect((new Plugin()).hello()).equal('world')
    })

    it('should be rejected on an incorrect path', async function () {
      const pluginLoader = new PluginLoader()
      const Plugin = pluginLoader.loadPlugin(simplePluginPath + 'NE')
      expect(Plugin).to.be.rejectedWith(Error)
    })

    it('should be rejected on an incorrect file regex', async function () {
      const pluginLoader = new PluginLoader({ regex: /.+\.jsNE$/i })
      const Plugin = pluginLoader.loadPlugin(simplePluginPath)
      expect(Plugin).to.be.rejectedWith(Error)
    })

    it('should be rejected if it does not extend the correct base class', async function () {
      const pluginLoader = new PluginLoader({ extends: simplePlugin })
      const Plugin = pluginLoader.loadPlugin(otherPluginPath)
      expect(Plugin).to.be.rejectedWith(Error)
    })

    it('should load plugin with correct base class', async function () {
      const pluginLoader = new PluginLoader({ extends: simplePlugin })
      const Plugin = await pluginLoader.loadPlugin(extendedPluginPath)
      expect(Plugin).to.be.a('function')
      expect((new Plugin()).hello()).equal('world')
      expect((new Plugin()).foo()).equal('bar')
    })
  })
})
