var browserify = require('browserify-middleware')
var express = require('express')
var Path = require('path')

var routes = express.Router()

//
// Provide a browserified file at a specified path
//
var shared = ['mithril', 'd3']

routes.get('/vendor-bundle.js',
  browserify(shared, { cache: true }))

routes.get('/app-bundle.js',
  browserify('./client/app.js', { external: shared }))

//
// GitHub OAuth
//
var authom = require('authom')
routes.get('/auth/:service', authom.app)

var github = authom.createServer({
  service: "github",
  id: process.env.GITHUB_ID,
  secret: process.env.GITHUB_SECRET,
  scope: ["repo"],
})

github.on('auth', function (req, res, githubData) {
  console.log("It worked!", githubData)
  res.set('Content-Type', 'text/html').send(`
    <!doctype html>
    <title>OAuth Success</title>
    <script>
      localStorage.setItem('token', '${githubData.token}');
      window.location = '/';
    </script>
  `)
})

authom.on('error', function (req, res, githubData) {
  res.redirect('/')
})

//
// Static assets (html, etc.)
//
var assetFolder = Path.resolve(__dirname, '../client/public')
routes.use(express.static(assetFolder))


if (process.env.NODE_ENV !== 'test') {
  //
  // The Catch-all Route
  // This is for supporting browser history pushstate.
  // NOTE: Make sure this route is always LAST.
  //
  routes.get('/*', function(req, res){
    res.sendFile( assetFolder + '/index.html' )
  })

  //
  // We're in development or production mode;
  // create and run a real server.
  //
  var app = express()

  // Parse incoming request bodies as JSON
  app.use( require('body-parser').json() )

  // Mount our main router
  app.use('/', routes)

  // Start the server!
  var port = process.env.PORT || 4000
  app.listen(port)
  console.log("Listening on port", port)
}
else {
  // We're in test mode; make this file importable instead.
  module.exports = routes
}
