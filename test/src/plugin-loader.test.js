const PluginLoader = require('../../src/plugin-loader');
const chai         = require('chai');
const chaiPromise  = require('chai-as-promised');
const sinon        = require('sinon');
const test         = require('sinon-test')(sinon);

chai.use(chaiPromise);
const expect = chai.expect;

describe('Plugins', () => {

  const pluginPath         = __dirname  + '/plugins/generic/'
  const simplePluginPath   = pluginPath  + 'simple-plugin.js'
  const extendedPluginPath = pluginPath  + 'extended-plugin.js'
  const otherPluginPath    = pluginPath  + 'other-plugin.js'

  const simplePlugin   = require(simplePluginPath)
  const extendedPlugin = require(extendedPluginPath)
  const otherPlugin    = require(otherPluginPath)

  describe('loadPlugins()', () => {
    it('should load all valid plugins with a valid directory', test(async function() {
      let pluginLoader = new PluginLoader()
      let pluginList = await pluginLoader.loadPlugins(pluginPath)
      expect(pluginList).to.include({
        simplePlugin: simplePlugin, 
        extendedPlugin: extendedPlugin, 
        otherPlugin: otherPlugin
      })
    }))

    it('should return error with a invalid directory', test(async function() {
      let pluginLoader = new PluginLoader()
      let pluginList = pluginLoader.loadPlugins(pluginPath + 'NE')
      expect(pluginList).to.be.rejected
    }))

    it('should only load plugins that explicitly extend a base class', test(async function() {
      let pluginLoader = new PluginLoader({extends: simplePlugin})
      let pluginList = await pluginLoader.loadPlugins(pluginPath)
      expect(pluginList).to.include({
        extendedPlugin: extendedPlugin
      })
      expect(pluginList).to.not.include({
        simplePlugin: simplePlugin,
        otherPlugin: otherPlugin
      })
    }))
  })

  describe('loadPlugin()', () => {

    it('should load a plugin with correct path', test(async function() {
      let pluginLoader = new PluginLoader()
      let plugin = await pluginLoader.loadPlugin(simplePluginPath)
      expect(plugin).to.be.a('function')
      expect((new plugin).hello()).equal('world')
    }))

    it('should be rejected on an incorrect path', test(async function() {
      let pluginLoader = new PluginLoader()
      let plugin = pluginLoader.loadPlugin(simplePluginPath + 'NE')
      expect(plugin).to.be.rejected
    }))

    it('should be rejected on an incorrect file regex', test(async function() {
      let pluginLoader = new PluginLoader({regex: /.+\.jsNE$/i})
      let plugin = pluginLoader.loadPlugin(simplePluginPath)
      expect(plugin).to.be.rejected
    }))

    it('should be rejected if it does not extend the correct base class', test(async function() {
      let pluginLoader = new PluginLoader({extends: simplePlugin})
      let plugin = pluginLoader.loadPlugin(otherPluginPath)
      expect(plugin).to.be.rejected
    }))

    it('should load plugin with correct base class', test(async function() {
      let pluginLoader = new PluginLoader({extends: simplePlugin})
      let plugin = await pluginLoader.loadPlugin(extendedPluginPath)
      expect(plugin).to.be.a('function')
      expect((new plugin).hello()).equal('world')
      expect((new plugin).foo()).equal('bar')
    }))
  })
}) 