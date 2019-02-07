const sqlite3  = require('sqlite3');
const isObject = require('lodash/isObject');
const isString = require('lodash/isString');
const moment   = require('moment-timezone');

class SqliteWriter {

  constructor(path, table, fields) {
    
    sqlite3.verbose()
    let db = new sqlite3.Database(path, error => {
      if (error != null)
        console.error(error)
    });

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

    db.serialize( function() { 
      db.run(`DROP TABLE IF EXISTS ${table}`)
      db.run(`CREATE TABLE IF NOT EXISTS ${table} (${schema.join(', ')})`)
    });

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
          value = (data[name].toLowerCase() == "true") ? 1 : 0
      }
      // TODO: fix other formattings

      formattedKeys.push(name) 
      formattedData.push(value) 
    });
    this.db.run(`INSERT INTO ${this.table} (${formattedKeys.join(', ')}) VALUES (${formattedData.join(', ')})`)

    return this;
  }

  close() {
    this.db.close()
  }
}

module.exports = SqliteWriter