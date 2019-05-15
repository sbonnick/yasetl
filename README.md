

[![Build Status](https://travis-ci.org/sbonnick/jiraextract.svg?branch=master)](https://travis-ci.org/sbonnick/jiraextract)
[![codecov](https://codecov.io/gh/sbonnick/jiraextract/branch/master/graph/badge.svg)](https://codecov.io/gh/sbonnick/jiraextract)


## Proposed syntax:
node index.js --username user --password password --baseurl https://api.atlassian.com/ex/jira/${cloudId}/rest

## Proposed Configuration:

### Option 1
```
output: {
  processor: string-format,
  format:  camelcase,
  input: {
    processor: array-filter,
    criteria:  [blah],
    input:     source.lables
  }
}
```

### Option 2

```
output: {
  source: labels,
  processors: [{
    processor: array-filter,
    criteria:  [blah]
  },{
    processor: string-format,
    criteria:  camelcase
  }]
}
```