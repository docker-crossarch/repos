export function getTextFromEnv (variable) {
  const value = process.env[variable]
  if (typeof value === 'undefined') {
    throw new Error(`Cannot get "${variable}" from environment`)
  }

  return value
}

export function getBooleanFromEnv (variable) {
  const value = getTextFromEnv(variable)

  if (value !== 'false' && value !== 'true') {
    throw new Error(`Cannot get "${variable}" as a boolean from environment`)
  }

  return value === 'true'
}
