require('papp-polyfill')
require('./ext')
var m = require('mithril')
var RepoMap = require('./components/RepoMap')

window.App = {}
App.token = localStorage.getItem('token') || null
App.clearToken = function () {
  App.token = null
  localStorage.removeItem('token')
}

//
// Client-side routing
//
m.route.prefix('')
m.route(document.getElementById('app'), '/forks/makersquare/MKS-ATX-javascript-koans/master', {

  '/forks/:username/:reponame/:branch': {

    view: function (vnode) {
      return m('.app', [
        m('h1', 'RepoMap'),
        App.token
          ? m('button', { onclick: App.clearToken }, 'Clear GitHub Token')
          : m('a[href=/auth/github]', "Connect with GitHub")
        ,
        m('h2', [vnode.attrs.username + '/' + vnode.attrs.reponame + '/' + vnode.attrs.branch]),
        m(RepoMap, { repo: vnode.attrs.username + '/' + vnode.attrs.reponame, branch: vnode.attrs.branch }),
      ])
    }
  }

})
