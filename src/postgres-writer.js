const { Client } = require('pg')
const isObject   = require('lodash/isObject');
const isString   = require('lodash/isString');
const moment     = require('moment-timezone');
const Retry      = require('promise-retry');

class PostgressWriter {

  constructor(connectionString, table, fields) {
    this.connectionString = connectionString;
    this.fields = fields;
    this.table = table;
    return this;
  }

  async create() {
    var db
    var con = this.connectionString
    await Retry(async function (retry) {
      db = new Client({ connectionString: con })
      return await db.connect()
        .catch(err => {
          console.log(err)
          retry(err)
        })
    })    
    this.db = db

    let schema = []
    Object.keys(this.fields).forEach(name => {
      let field = this.fields[name]
    
      let data = `${name} TEXT`
      if (isObject(field)) {
        if ('datatype' in field)
          data = `${name} ${field.datatype.toUpperCase()}`

          if ('primary' in field && field.primary == true)
          data += ' PRIMARY KEY'
      }
      schema.push(data)
    });

    await this.db.query(`DROP TABLE IF EXISTS ${this.table}`)
      .then(`Dropping table ${this.table}`)
      .catch(console.log)

    await this.db.query(`CREATE TABLE IF NOT EXISTS ${this.table} (${schema.join(', ')})`)
      .then(`Creating table ${this.table}`)
      .catch(console.log)
  }

  async insert(data) {
    let inserts = data.map(async item => await this.insertItem(item))
    return await Promise.all(inserts)
  }

  async insertItem(data) {
    let query = this._buildInsertQuery(data)
    await this.db.query(query)
      .catch(err => {
        console.log({error: err.error, query: query, hint: err.hint})
      })
  }

  async close() {
    await this.db.end()
  }

  _buildInsertQuery(data) {
    let formattedData = []
    let formattedKeys = []
    Object.keys(data).forEach(name => { 

      if (data[name] == null)
        return

      let value = String(data[name])
      var backslash = ~value.indexOf('\\');
      var prefix = backslash ? 'E' : '';
      value = value.replace(/'/g, "''");
      value = val.replace(/\\/g, '\\\\');
      value = prefix + "'" + val + "'";

      if (isObject(this.fields[name]) && 'datatype' in this.fields[name]) {
        if (this.fields[name].datatype == 'integer')
          value = data[name]
        if (this.fields[name].datatype == 'timestamptz')
          value = "'" + moment(data[name]).tz("America/Los_Angeles").format() + "'"
        if (this.fields[name].datatype == 'boolean')
          value = (String(data[name]).toLowerCase() == "true") ? true : false
      }

      formattedKeys.push(name) 
      formattedData.push(value) 
    });

    let query = `INSERT INTO ${this.table} (${formattedKeys.join(', ')}) VALUES (${formattedData.join(', ')})`
    return query
  }
}

module.exports = PostgressWriter


// TODO: the schema function should be able to be inherited by writers and supplying a mapping table
// TODO: the query builder should be able to also be inherited with a supplied mapping table
// TODO: a larger breadth of formats need to be supported. currently only text, date, boolean, integer
