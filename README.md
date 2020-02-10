

[![Build Status](https://travis-ci.org/sbonnick/jiraextract.svg?branch=master)](https://travis-ci.org/sbonnick/jiraextract)
[![Maintainability](https://api.codeclimate.com/v1/badges/6641534502a1cde6c565/maintainability)](https://codeclimate.com/github/sbonnick/jiraextract/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/6641534502a1cde6c565/test_coverage)](https://codeclimate.com/github/sbonnick/jiraextract/test_coverage)

[![dependencies Status](https://david-dm.org/sbonnick/jiraextract/status.svg)](https://david-dm.org/sbonnick/jiraextract)
[![devDependencies Status](https://david-dm.org/sbonnick/jiraextract/dev-status.svg)](https://david-dm.org/sbonnick/jiraextract?type=dev)

[![Docker](https://images.microbadger.com/badges/image/sbonnick/jiraextract.svg)](https://microbadger.com/images/sbonnick/jiraextract)
[![Docker](https://images.microbadger.com/badges/version/sbonnick/jiraextract.svg)](https://microbadger.com/images/sbonnick/jiraextract)


## Proposed syntax:
node index.js --source.username user --source.password password --source.baseurl https://api.atlassian.com/ex/jira/${cloudId}/rest

## Proposed Configuration:

### General
```
{
  "schemaVersion": "0.1",
  "source": {
    "engine":   "jira",
    "baseurl":  "https://api.atlassian.com/ex/jira/cloudId/rest",
    "query":    "project=PROD ORDER BY status ASC",
    "username": "user",
    "password": "password",
  },
  "destination": {
    "engine":      "postgres",
    "connection":  "postgresql://postgres:1234@localhost:5432/postgres",
    "table":       "jira"
  },
  "fields": {
    ...
  }
}
```

### Fields

field processors are chained linearly. the output of one is streamed into the next.

```
"<field>": {
  "input":    "RECORD.fields.labels",
  "datatype": "text",
  "internal": false,  
  "processors": [{
    "processor": "array-filter",
    "criteria":  ["blah"]
  },{
    "processor": "string-format",
    "criteria":  "camelcase"
  }]
}
```

### Filed Input Options

- RECORD [default]: referencing the source item object or a sub record of it
- FIELD: referencing a already processed field record
