require('papp-polyfill')
var m = require('mithril')
var RepoMap = require('./components/RepoMap')

//
// Client-side routing
//
m.route.prefix('')
m.route(document.getElementById('app'), '/lhorie/mithril', {

  '/:username/:reponame': {

    view: function (vnode) {
      return m('.app', [
        m('h1', 'RepoMap'),
        m(RepoMap, { repo: vnode.attrs.username + '/' + vnode.attrs.reponame })
      ])
    }
  }

})
