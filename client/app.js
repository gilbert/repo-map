require('papp-polyfill')
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
m.route(document.getElementById('app'), '/lhorie/mithril.js', {

  '/:username/:reponame': {

    view: function (vnode) {
      return m('.app', [
        m('h1', 'RepoMap'),
        App.token
          ? m('button', { onclick: App.clearToken }, 'Clear GitHub Token')
          : m('a[href=/auth/github]', "Connect with GitHub")
        ,
        m(RepoMap, { repo: vnode.attrs.username + '/' + vnode.attrs.reponame }),
      ])
    }
  }

})
