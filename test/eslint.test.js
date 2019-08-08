const glob = require('glob')
const CLIEngine = require('eslint').CLIEngine

const paths = glob.sync('./+(src|test)/**/*.js')
const engine = new CLIEngine({
  useEslintrc: true
})

expect.extend({
  fail (received, messages) {
    const errors = messages.map((message) => {
      return `${message.line}:${message.column} ${message.message} - ${message.ruleId}\n`
    })
  
    return {
      message: () => `\n${errors.join('')}`,
      pass: false
    }
  }
})

const results = engine.executeOnFiles(paths).results

describe('ESLint', () => {
  results.forEach((result) => generateTest(result))
})

function generateTest (result) {
  const { filePath, messages } = result

  it(`validates ${filePath}`, () => {
    if (messages.length > 0) {
      expect(filePath).fail(messages)
    }
  })
}
