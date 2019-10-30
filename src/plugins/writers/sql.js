const Writer = require('./../../defaults/writer')
const logger = require('./../../pino')
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
    const db = new Sequelize(this.config.connection)
    this.model = db.define(
      this.config.table, 
      this._createModel(this.config.fields),
      {})
    db.sync({ force: true })
    this.db = db
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
    const inserts = this.model.bulkCreate(items)
      .catch(err => {
        logger.error({ error: err.error, hint: err.hint })
      })
    return inserts
  }

  async close () {
    await this.db.close()
    delete this.db
  }
}

module.exports = SQL