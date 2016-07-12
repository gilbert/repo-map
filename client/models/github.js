var m = require('mithril')


var GitHub = module.exports

GitHub.repoCommits = function (repo) {
  // TODO: Fetch all branches of repo
  return request('/repos/lhorie/mithril.js/branches', true)
    .run(function (results) {
      console.log('branches', results);
      var pendingStreams = results.map(function (branch) {
        let branchName = branch.name;
        let reqEndpoint = '/repos/lhorie/mithril.js/commits?ref=' + branchName;
        return request(reqEndpoint, true)
          .map(function (commitList) {
            console.log('commitList', commitList);
            return commitList;
          });
      });
      console.log('ps', pendingStreams)
    // return m.prop.combine(function(...pendingStreams) {
    //   //TODO: Use combine streams asynchronously
    //   //TODO: Retain branch names
    // }, [...pendingStreams]);
    return pendingStreams;
    })
    .run(function(pendingStreams) {
      console.log('ps2', pendingStreams)
      return m.prop.combine(function(...pendingStreams) {
        var argStreams = arguments;
        var resultObj = {};
        console.log('argStreams', argStreams);
        for (let i=0; i < argStreams.length; i++) {
          resultObj[i] = argStreams[i]();
          console.log('loop', argStreams[i], argStreams[i]())
          console.log('resultObj[i]', resultObj[i], i)
        }
        return resultObj;
      }, [...pendingStreams])
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
