const sqlite3  = require('sqlite3');
const isObject = require('lodash/isObject');
const isString = require('lodash/isString');
const moment   = require('moment-timezone');

class SqliteWriter {

  constructor(path, table, fields) {
    sqlite3.verbose()
    this.db = new sqlite3.Database(path, error => {
      if (error != null)
        console.error(error)
    });
    this.fields = fields;
    this.table = table;
    return this;
  }

  async create() {
    let schema = []
    Object.keys(this.fields).forEach(name => {
      let field = this.fields[name]

      let data = `${name} BLOB`
      if (isObject(field)) {
        if ('datatype' in field)
          data = `${name} ${field.datatype.toUpperCase()}`
        
        if ('primary' in field && field.primary == true)
          data += ' PRIMARY KEY'
      }
      schema.push(data)
    });

    await this.db.run(`DROP TABLE IF EXISTS ${this.table}`)
    await this.db.run(`CREATE TABLE IF NOT EXISTS ${this.table} (${schema.join(', ')})`)
  }

  async insert(data) {
    let inserts = data.map(async item => await this.insertItem(item))
    return await Promise.all(inserts)
  }

  async insertItem(data) {
    let query = this._buildInsertQuery(data)
    await this.db.run(query)
  }

  async close() {
    this.db.close()
  }

  _buildInsertQuery(data) {
    let formattedData = []
    let formattedKeys = []
    Object.keys(data).forEach(name => { 

      let value = "\"" + String(data[name]) + "\""
      if (data[name] == null)
        return

      if (isObject(this.fields[name]) && 'datatype' in this.fields[name]) {
        if (this.fields[name].datatype == 'integer')
          value = data[name]
        if (this.fields[name].datatype == 'datetime')
          value = "\"" + moment(data[name]).tz("America/Los_Angeles").format() + "\""
        if (this.fields[name].datatype == 'boolean')
          value = (String(data[name]).toLowerCase() == "true") ? 1 : 0
      }

      formattedKeys.push(name) 
      formattedData.push(value) 
    });

    let query = `INSERT INTO ${this.table} (${formattedKeys.join(', ')}) VALUES (${formattedData.join(', ')})`
    return query
  }
}

module.exports = SqliteWriter


// TODO: the schema function should be able to be inherited by writers and supplying a mapping table
// TODO: the query builder should be able to also be inherited with a supplied mapping table
// TODO: a larger breadth of formats need to be supported. currently only text, date, boolean, integer
