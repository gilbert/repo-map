var m = require('mithril')

exports.view = function (vnode) {
  return m('.repo-map', [
    m('h2', `${vnode.attrs.username}/${vnode.attrs.reponame}`)
  ])
}
