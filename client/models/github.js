var m = require('mithril')


var GitHub = module.exports

GitHub.repoCommits = function (repo) {
  // TODO: Fetch all branches of repo
  return request('/repos/lhorie/mithril.js/commits?ref=rewrite', true)
    .map(function (results) {
      // Simulate what we will return when we fetch all branches
      return { 'rewrite': results, 'master': results }
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
