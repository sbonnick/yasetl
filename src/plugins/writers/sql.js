const Writer = require('./../../defaults/writer')
// const logger = require('./../../pino')
const Sequelize = require('sequelize')
const get = require('lodash/get')

class SQL extends Writer {
  constructor (config) {
    super(config)

    this.types = {
      text: Sequelize.STRING,
      real: Sequelize.REAL,
      timestamp: Sequelize.DATE,
      boolean: Sequelize.BOOLEAN,
      integer: Sequelize.INTEGER
    }
  }

  async open () {
    // @ts-ignore
    this.db = new Sequelize(this.config.connection)
    this.model = this.db.define(
      this.config.table, 
      this._createModel(this.config.fields),
      {})
    this.model.sync({ force: true })
  }

  _createModel (fields) {
    const model = {}
    Object.keys(fields).forEach(name => {
      const field = fields[name]
      const type = get(field, 'datatype', 'text').toLowerCase()
      model[name] = {
        type: this.types[type],
        primaryKey: get(field, 'primary', false)
      }
    })
    return model
  }

  async items (items, configuration) {
    return this.model.bulkCreate(items)
  }

  async close () {
    delete this.db
    delete this.model
  }
}

module.exports = SQL