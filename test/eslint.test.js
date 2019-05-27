const lint = require('mocha-eslint')

var options = {
  formatter: 'compact',
  alwaysWarn: false, 
  timeout: 10000, 
  slow: 1000,
  strict: true, 
  contextName: 'eslint'
}

var paths = [
  'src/**/*.js',
  'test/**/*.js'
]

// Run the tests
lint(paths, options)
