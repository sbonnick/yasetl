const Reader = require('./../../defaults/reader')
const ExternalJira = require('@atlassian/jira')

/*
configuration: {
  baseurl:   'https://api.atlassian.com/ex/jira/<cloudId>/rest',
  query:     'project=PROD ORDER BY status ASC',
  username:  'user',
  password:  'password',
  timout:    36000,
  batchSize: 50
}
*/
class Jira extends Reader {
  async open () {
    const jira = new ExternalJira({
      baseUrl: this.config.baseurl,
      headers: {},
      options: {
        timeout: this.config.timeout || 36000
      }
    })

    jira.authenticate({
      type: 'basic',
      username: this.config.username,
      password: this.config.password
    })

    this.jira = jira
  }

  async items (configuration) {
    const config = { ...this.config, ...configuration }
    return this._query(config.query, config.batchSize)
  }

  async close () {
    delete (this.jira)
    this.jira = null
  }

  async _query (jql, batchSize = 50, pageIndex = 0, data) {
    return this._queryPage(jql, batchSize, pageIndex)
      .then(response => {
        if (!data) data = []

        data = data.concat(response.data.issues)
        const next = response.data.startAt + response.data.maxResults
        if (next < response.data.total) { 
          return this._query(jql, batchSize, next, data) 
        }
        return data
      })
  }

  async _queryPage (jql, batchSize, pageIndex) {
    return this.jira.search.searchForIssuesUsingJqlGet({
      jql: jql,
      maxResults: batchSize,
      startAt: pageIndex,
      expand: 'editmeta,changelog'
    })
  }
}

module.exports = Jira