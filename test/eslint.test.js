const lint = require('mocha-eslint')

var options = {
  formatter: 'compact',
  alwaysWarn: false, 
  timeout: 5000, 
  slow: 1000,
  strict: true, 
  contextName: 'eslint'
}

// Run the tests
lint('.', options)
