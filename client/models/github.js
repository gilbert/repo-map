var m = require('mithril')
var alertify = require('alertify.js')

var GitHub = module.exports

GitHub.allBranchesCommits = function (repo) {
  return GitHub.repoBranches(repo)
    .run(function (branches) {

      const branchRequestStreams = branches.map(function (branchData) {
        return GitHub.repoBranchCommits(repo, branchData.name)
          .map(function (commitList) {
            return { name: branchData.name, commits: commitList };
          })
      });

      return m.prop.merge(branchRequestStreams)
    })
}

GitHub.repoBranches = function (repo) {
  return request('/repos/'+ repo +'/branches', true)
}

GitHub.repoBranchCommits = function (repo, branch) {
  return request(`/repos/${repo}/commits?sha=${branch}`, true)
}

GitHub.singleBranchForkCommits = function (repo, branch) {
  return request(`/repos/${repo}/forks?sort=newest`, true)
    .run(function (forks) {
      const forkStreams = forks.map( fork =>
        GitHub.repoBranchCommits(fork.full_name, branch)
          .map(function (commitList) {
            return { name: fork.owner.login, commits: commitList }
          })
          .catch(function (err) {
            console.log("Fetch fork error:", err)
            return { name: fork.owner.login, commits: [] }
          })
      )

      return m.prop.merge( forkStreams )
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
    .catch(function (err) {
      console.log("url error:", err)
      alertify.error("Error log message");
    })
}
