var m = require('mithril')

var GitHub = module.exports


// takes a repo and returns array stream of branch objects
GitHub.repoBranches = function (repo) {
  return request(`/repos/${repo}/branches`, true)
}

// takes a repo and branch name, and returns array stream of commits for each branch?
GitHub.repoBranchCommits = function (repo, branch) {
  return request(`/repos/${repo}/commits?sha=${branch}`, true)
}

// takes repo name and branch name inputs and returns an array of fork array streams
  // each fork array stream made up of branch array streams containing all the commits
  // for each branch.
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

//function allBranchCommits takes a repo input and returns
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

//
// Caching (gotta go fast)
// Since we're only doing GET requests,
// we can keep it simple.
//
var streamCache = {}

// request takes an endpoint, and boolean, and returns array of endpoint specific
  // objects. e.g. (fork objects)
  // If the boolean is true and the endpoint is found in local storage,
  // the stored endpoint is parsed and returned in a prop
// Else, a get request is made to the github api at the input endpoint.
  // the results are mapped to an array (and cached if cache boolean is true)
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
      console.log('request function endpoint', endpoint)
      console.log('request function, map result', result)
      if ( cache ) localStorage.setItem( endpoint, JSON.stringify(result) )
      return result
    })
    .catch(function (err) {
      console.log("url error:", err)
    })
}
