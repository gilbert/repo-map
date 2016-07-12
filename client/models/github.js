var m = require('mithril')


var GitHub = module.exports

GitHub.repoCommits = function (repo) {
  // TODO: Fetch all branches of repo
  return request('/repos/lhorie/mithril.js/branches', true)
    .run(function (branches) {
      console.log('branches', branches);
      var branchRequestStreams = branches.map(function (branch) {
        let branchName = branch.name;
        let reqEndpoint = '/repos/lhorie/mithril.js/commits?sha=' + branchName;
        return request(reqEndpoint, true)
          .map(function (commitList) {
            console.log('commitList', commitList);
            return commitList;
          });
      });

      return m.prop.combine(function(...branchRequestStreams) {
        branchRequestStreams.pop();
        var resultObj = {};
        // console.log('argStreams', branchRequestStreams.map(f=>f()), branchRequestStreams.length);
        for (let i=0; i < branchRequestStreams.length; i++) {
          resultObj[i] = branchRequestStreams[i]();
          console.log('resultObj[i]', resultObj[i], i);
          console.log('resultObj', resultObj);
        }
        console.log('done', resultObj);
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
  })
    .map(function (result) {
      if ( cache ) localStorage.setItem( endpoint, JSON.stringify(result) )
      return result
    })
}
