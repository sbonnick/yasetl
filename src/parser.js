const PluginLoader = require('./plugin-loader');
const Processor    = require('./processor');

class Parser {

  constructor (fields) {
    let loader     = new PluginLoader({ extends: Processor })
    let processors = await loader.loadPlugins(__dirname + '/processors/')

    this.processors = processors
    this.fields     = fields
  }

  async parse(data) {
    let items = data.map(async item => await this.parseItem(item))
    return Promise.all(items)
  }

  async parseItem(item) {
    let sanitizedItem = {}

    Object.keys(this.fields).forEach(fieldName => {
      let field = this.fields[fieldName]
      
      //TODO: Iterate over defined processors in fields and execute the chain, returning value to output field for each input item

      sanitizedItem[fieldName] = null
    });
    return sanitizedItem;
  }
}
