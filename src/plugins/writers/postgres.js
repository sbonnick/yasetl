const Writer = require('./../../defaults/writer')
const logger = require('./../../pino')
const { Client } = require('pg')
const { retry } = require('@lifeomic/attempt')
const get = require('lodash/get')
const moment = require('moment-timezone')

/*
configuration: {
  connection: "conn",
  table:      "",
  timout:     36000,
  attempts:   5,
  fields:     {}
}
*/

class Postgres extends Writer {
  async open () {
    let db
    try {
      db = await retry(async () => {
        return this._connect(this.config.connection)
      }, { 
        maxAttempts: this.config.attempts || 5, 
        timeout: this.config.timout || 36000 
      })
    } catch (error) {
      logger.error(error)
      return Promise.reject(error)
    }

    this.db = db

    const schema = await this._createTableSchema(this.config.fields)

    await this._dropTable(db, this.config.table)
    await this._createTable(db, this.config.table, schema)
  }

  async _connect (connection) {
    const db = new Client({ connectionString: connection })
    try {
      await db.connect()
    } catch (error) {
      logger.warn(error)
      return Promise.reject(error)
    }
    return db
  }

  async _createTableSchema (fields) {
    const schema = []
    Object.keys(fields).forEach(name => {
      const field = fields[name]
      const datatype = get(field, 'datatype', 'TEXT').toUpperCase()
      const isPrimary = (get(field, 'primary', false) === true) ? 'PRIMARY KEY' : '' 

      schema.push([name, datatype, isPrimary].join(' ').trimRight())
    })
    return schema
  }

  async _dropTable (db, table) {
    logger.info(`Dropping table ${table}`)
    return db.query(`DROP TABLE IF EXISTS ${table}`)
      .catch(logger.error)
  }

  async _createTable (db, table, schema) {
    logger.info(`Creating table ${table}`)
    return db.query(`CREATE TABLE IF NOT EXISTS ${table} (${schema.join(', ')})`)
      .catch(logger.error)
  }

  async items (items, configuration) {
    const config = { ...this.config, ...configuration }
    const inserts = items.map(async item => this._item(item, config.fields, config.table, this.db))
    return Promise.all(inserts)
  }

  async _item (item, fields, table, db) {
    const query = this._insertQuery(item, fields, table)
    await db.query(query)
      .catch(err => {
        logger.error({ error: err.error, query: query, hint: err.hint })
      })
  }

  _insertQuery (item, fields, table) {
    const formattedKeys = []
    const formattedData = []
    Object.keys(item).forEach(name => {
      let value
      const datatype = get(fields[name], 'datatype', 'text').toLowerCase()

      if (['integer', 'real'].includes(datatype)) {
        value = item[name] 
      } else if (['timestamptz'].includes(datatype)) { 
        value = "'" + moment(item[name]).tz('America/Los_Angeles').format() + "'" 
      } else if (['boolean'].includes(datatype)) { 
        value = (String(item[name]).toLowerCase() === 'true') 
      } else { 
        this._escapeString(item[name]) 
      }
      
      formattedKeys.push(item[name])
      formattedData.push(value)
    })

    const query = `INSERT INTO ${table} (${formattedKeys.join(', ')}) VALUES (${formattedData.join(', ')})`
    return query
  }

  _escapeString (input) {
    let value = String(input)
    var backslash = ~value.indexOf('\\')
    var prefix = backslash ? 'E' : ''
    value = value.replace(/'/g, "''").replace(/\\/g, '\\\\')
    value = prefix + "'" + value + "'"
    return value
  }

  async close () {
    await this.db.end()
    delete this.db
  }
}

module.exports = Postgres