const PluginLoader = require('./plugin-loader');
const Processor    = require('./processor');

class Parser {

  constructor (processors, fields) {
    this.processors = processors
    this.fields     = fields
  }

  static async load(fields) {
    let loader     = new PluginLoader({ extends: Processor })
    let processors = await loader.loadPlugins(__dirname + '/processors/')
    return new Parser(processors, fields)
  }

  async parse(data) {
    let items = data.map(async item => await this.parseItem(item))
    return Promise.all(items)
  }

  async parseItem(item) {
    let sanitizedItem = {}

    Object.keys(this.fields).forEach(fieldName => {
      let field = this.fields[fieldName]
      
      console.log(item, field)

      //TODO: Iterate over defined processors in fields and execute the chain, returning value to output field for each input item

      sanitizedItem[fieldName] = null
    });
    return sanitizedItem;
  }
}

module.exports = Parser
