var m = require('mithril')
var GitHub = require('../models/github')

// d3-timeline needs d3 to be globally-accessible
var d3 = require('d3')
var Timeline = require('d3-timeline')
var timeAgo = require('date-fns/distance_in_words_to_now')

var nineDaysAgo = Date.now() - 1000 * 60 * 60 * 24 * 9
var modes = {
  nineDay: {
    start: nineDaysAgo,
    end: Date.now(),
    tickFormat: { tickTime: d3.timeDay, tickSize: 6 }
  },
  auto: {
    start: 0,
    end: 0,
    tickFormat: { tickTime: d3.timeDay, tickSize: 6 }
  }
}

exports.oninit = function (vnode) {
  vnode.state.branchCommits = GitHub.repoCommits(vnode.attrs.repo)
  vnode.state.branchCommits.catch(err => console.log("branchCommits err:", err))
  vnode.state.timeWindow = m.prop( modes.nineDay )
}

exports.view = function (vnode) {
  var activeCommit = vnode.state.activeCommit

  return m('.repo-map', [
    m('h2', vnode.attrs.repo),

    vnode.state.branchCommits()
      ? m('.graph', { oncreate: renderGraph.papp(vnode.state) })
      : m('p', "Loading...")
    ,

    m('select', { onchange: e => vnode.state.timeWindow( modes[e.currentTarget.value] ) }, [
      m('option[value=nineDay]', "Last 9 days"),
      m('option[value=auto]', "Automatic"),
    ]),

    m('.commit-info', activeCommit && [
      m('h3', activeCommit.commit.message),
      m('p', `by ${activeCommit.commit.author.name}, ${timeAgo(activeCommit.starting_time)} ago.`),
    ])
  ])
}

function renderGraph (state, vnode) {

  //
  // First gather and structure commit data
  //
  var branchCommits = state.branchCommits()
  window.chart = state.chart

  // Map data we get back from branchCommits to a format Timeline will accept
  var timelineDataStream = state.branchCommits.map(function (dataObj) {

    return Object.keys(branchCommits).map(function (branchName, i) {

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

  })

  console.log("Using commit data", timelineDataStream())


  //
  // Next create the chart
  //
  state.chart = Timeline()
    .stack(true)
    .display('circle')
    .identifyPointBy( commit => console.log('id',commit.sha)||commit.sha )

    .mouseover(function (d, i, datum) {
      state.activeCommit = d
      m.redraw()
    })
    .mouseout(function () {
      state.activeCommit = undefined
    })

  //
  // Feed values from streams into the chart
  //
  state.timeWindow.map( time =>
    console.log("Formatting")||
    state.chart
      .beginning(time.start)
      .ending(time.end)
      .tickFormat(time.tickFormat)
  )

  //
  // And finally, add chart to page,
  // auto-updating when any stream changes.
  //
  var svg = d3.select( vnode.dom ).append('svg')
    .attr('width', document.body.clientWidth)

  state.chart.init(svg)

  m.prop.combine(function (a, b) {
    console.log("Rendering")
    state.chart.render(svg, b())
  }, [state.timeWindow, timelineDataStream])
  .error( err => console.log("ERROR:", err) )
}
