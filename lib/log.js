import clor from 'clor'

function _log (style, prefix, text) {
  console.log(style(`${prefix}${text}`))
}

export function log (text) {
  _log(clor.white, '', text)
}

export function info (text) {
  _log(clor.cyan.bold, 'ℹ️ ', text)
}

export function warning (text) {
  _log(clor.yellow.bold, '⚠️ ', text)
}

export function error (text) {
  _log(clor.red.bold, '❌ ', text)
}
