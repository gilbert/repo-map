var m = require('mithril')

m.prop.flatSync = function (streams) {
  return m.prop.combine(function (...args) {
    return args.slice(0,args.length-1).map( stream => stream() )
  }, streams)
}
