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
    const commonOptions = {
      logging: logger.debug,
      retry: {
        max: 5,
        timeout: 36000
      }
    }

    let dialectConn = [
      this.config.connection, 
      commonOptions
    ]

    if (this.config.connection.toLowerCase().startsWith('sqlite:')) {
      logger.info('Writing DB to: ' + this.config.connection.substr(7))
      dialectConn = [{
        dialect: 'sqlite',
        storage: this.config.connection.substr(7),
        ...commonOptions
      }]
    }

    // @ts-ignore
    this.db = new Sequelize(...dialectConn)

    this.model = this.db.define(
      this.config.table, 
      this._createModel(this.config.fields), { timestamps: false })
    await this.model.sync({ force: true })
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