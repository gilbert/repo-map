var m = require('mithril')
var GitHub = require('../models/github')

// d3-timeline needs d3 to be globally-accessible
var d3 = require('d3')
var Timeline = require('d3-timeline')
var timeAgo = require('date-fns/distance_in_words_to_now')


exports.oninit = function (vnode) {
  vnode.state.branchCommits = GitHub.repoCommits(vnode.attrs.repo)
  vnode.state.branchCommits.catch(err => console.log("branchCommits err:", err))
}

exports.view = function (vnode) {
  var activeCommit = vnode.state.activeCommit

  return m('.repo-map', [
    m('h2', vnode.attrs.repo),

    vnode.state.branchCommits()
      ? m('.graph', { oncreate: renderGraph.papp(vnode.state) })
      : m('p', "Loading...")
    ,

    m('.commit-info', activeCommit && [
      m('h3', activeCommit.commit.message),
      m('p', `by ${activeCommit.commit.author.name}, ${timeAgo(activeCommit.starting_time)} ago.`),
    ])
  ])
}

function renderGraph (state, vnode) {
  var nineDaysAgo = Date.now() - 1000 * 60 * 60 * 24 * 9

  state.chart = Timeline()
    .stack(true)
    .beginning(nineDaysAgo)
    .ending(Date.now())
    .tickFormat({ tickTime: d3.timeDay, tickSize: 6 })
    .display('circle')
    .mouseover(function (d, i, datum) {
      state.activeCommit = d
      m.redraw()
    })
    .mouseout(function () {
      state.activeCommit = undefined
    })

  var branchCommits = state.branchCommits()

  var branchData = Object.keys(branchCommits).map(function (branchName, i) {

    // TODO: d3 magic
    // https://github.com/jiahuang/d3-timeline
    var commitTimes = branchCommits[branchName]
      .map(function (commit) {
        var time = new Date(commit.commit.author.date).getTime()

        // Extend data point for timeline lib
        commit.starting_time = time
        commit.ending_time = time + 1000*60*15

        return commit
      })
      .filter( time => time.starting_time > nineDaysAgo )

    return { label: branchName, times: commitTimes }
  })

  console.log("Using commit data", branchData)

  d3.select( vnode.dom ).append('svg')
    .attr('width', document.body.clientWidth)
    .datum( branchData )
    .call( state.chart )
}

// var commits = [
//   {class: "pA", label: "person a", times: [
//     {"starting_time": 1355752800000, "ending_time": 1355759900000},
//     {"starting_time": 1355767900000, "ending_time": 1355774400000}]},
//   {class: "pB", label: "person b", times: [
//     {"starting_time": 1355759910000, "ending_time": 1355761900000}]},
//   {class: "pC", label: "person c", times: [
//     {"starting_time": 1355761910000, "ending_time": 1355763910000}]}
// ];
//
// var chart = d3.timeline();
//
// var svg = d3.select("#app").append("svg").attr("width", 500)
//   .datum(commits).call(chart);
