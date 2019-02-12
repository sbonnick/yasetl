const { Client } = require('pg')
const isObject = require('lodash/isObject');
const isString = require('lodash/isString');
const moment   = require('moment-timezone');

class PostgressWriter {

  constructor(connectionString, table, fields) {
    
    var db = new Client({
      connectionString: connectionString,
    })

    await db.connect()

    let schema = []
    Object.keys(fields).forEach(name => {
      let field = fields[name]
    
      let data = `${name} BLOB`
      if (isObject(field)) {
        if ('datatype' in field)
          data = `${name} ${field.datatype.toUpperCase()}`
        
        if ('primary' in field && field.primary == true)
          data += ' PRIMARY KEY'
      }
      schema.push(data)
    });

    let drop   = await db.query(`DROP TABLE IF EXISTS ${table}`)
    let create = await db.query(`CREATE TABLE IF NOT EXISTS ${table} (${schema.join(', ')})`)

    this.db = db
    this.fields = fields;
    this.table = table;
    return this;
  }

  insert(data) {
    data.map(item => this.insertItem(item))
  }

  insertItem(data) {
    
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
      // TODO: fix other formattings

      formattedKeys.push(name) 
      formattedData.push(value) 
    });
    this.db.query(`INSERT INTO ${this.table} (${formattedKeys.join(', ')}) VALUES (${formattedData.join(', ')})`)

    return this;
  }

  close() {
    await this.db.end()
  }
}

module.exports = PostgressWriter