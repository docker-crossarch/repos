import { white, cyan, yellow, red, bold } from 'colorette'

function _log(styles, prefix, text) {
  let stylized = `${prefix} ${text}`
  for (const style of styles) {
    stylized = style(stylized)
  }

  console.log(stylized)
}

export function log(text) {
  _log([white], '', text)
}

export function info(text) {
  _log([cyan, bold], 'ℹ️ ', text)
}

export function warning(text) {
  _log([yellow, bold], '⚠️ ', text)
}

export function error(text) {
  _log([red, bold], '❌ ', text)
}
