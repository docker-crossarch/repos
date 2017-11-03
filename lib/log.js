import clorox from 'clorox'

function _log (style, prefix, text) {
  console.log(style(`${prefix}${text}`).toString())
}

export function log (text) {
  _log(clorox.white, '', text)
}

export function info (text) {
  _log(clorox.cyan.bold, 'ℹ️ ', text)
}

export function warning (text) {
  _log(clorox.yellow.bold, '⚠️ ', text)
}

export function error (text) {
  _log(clorox.red.bold, '❌ ', text)
}
