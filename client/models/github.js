var m = require('mithril')

var GitHub = module.exports

GitHub.repoCommits = function (repo) {
  return request('/repos/'+ repo +'/branches', true)
    .run(function (branches) {
      const branchNames = [];
      const branchRequestStreams = branches.map(function (branch) {
        let branchName = branch.name;
        branchNames.push(branchName);
        let reqEndpoint = '/repos/'+ repo +'/commits?sha=' + branchName;
        return request(reqEndpoint, true)
          .map(function (commitList) {
            return commitList;
          });
      });
      return m.prop.combine(function(...branchRequestStreams) {
        branchRequestStreams.pop();
        const resultObj = {};
        for (let i=0; i < branchRequestStreams.length; i++) {
          resultObj[branchNames[i]] = branchRequestStreams[i]();
        }
        return resultObj;
      }, branchRequestStreams)
    })
}

//
// Caching (gotta go fast)
// Since we're only doing GET requests,
// we can keep it simple.
//
var streamCache = {}

function request (endpoint, cache) {
  if ( cache && localStorage.getItem(endpoint) ) {
    return m.prop( JSON.parse( localStorage.getItem(endpoint) ) )
  }

  return m.request({
    method: 'GET',
    url: 'https://api.github.com' + endpoint,
    config: function (xhr) {
      if ( App.token ) xhr.setRequestHeader('Authorization', `token ${App.token}`)
    }
  })
    .map(function (result) {
      if ( cache ) localStorage.setItem( endpoint, JSON.stringify(result) )
      return result
    })
}
