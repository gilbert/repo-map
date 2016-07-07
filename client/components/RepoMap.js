var m = require('mithril')
var d3 = require('d3')
var GitHub = require('../models/github')

exports.oninit = function (vnode) {
  vnode.state.branchCommits = GitHub.repoCommits(vnode.attrs.repo)
}

exports.view = function (vnode) {
  return m('.repo-map', [
    m('h2', vnode.attrs.repo),

    vnode.state.branchCommits()
      ? m('.graph', { oncreate: renderGraph.papp(vnode.state.branchCommits()) })
      : m('p', "Loading...")
    ,
  ])
}

function renderGraph (branchCommits, vnode) {

  Object.keys(branchCommits).forEach(function (branchName, i) {

    var commits = branchCommits[branchName]
    // TODO: d3 magic
    // https://github.com/jiahuang/d3-timeline
  })
}
