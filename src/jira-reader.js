const JIRA = require('@atlassian/jira');

class jiraReader {

  constructor(baseurl, username, password, timeout = 36000) {

    var jira = new JIRA({ 
      baseUrl: baseurl,
      headers: {},
      options: {
        timeout: timeout
      }
    })

    jira.authenticate({
      type: 'basic',
      username: username,
      password: password
    })
  
    this.jira = jira

    return this;
  }

  query(jql, batchSize = 50, pageIndex = 0, data) {

    return this._queryPage(jql, batchSize, pageIndex)
      .then(response => {
        if (!data) data = [];
        
        data = data.concat(response.data.issues)
        let next = response.data.startAt + response.data.maxResults
        if (next < response.data.total)
          return this.query(jql, batchSize, next, data)
        return data;        
      })
  }

  _queryPage(jql, batchSize, pageIndex) {
    return this.jira.search.searchForIssuesUsingJqlGet({
      jql: jql, 
      maxResults: batchSize,    
      startAt: pageIndex,
      expand: "changelog"                   
    })
  }

  close() {
    return true;
  }
}

module.exports = jiraReader