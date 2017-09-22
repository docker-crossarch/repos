import fs from 'fs'
import os from 'os'
import path from 'path'
import util from 'util'
import rimraf from 'rimraf'

export function generateTempName (prefix) {
  return path.join(os.tmpdir(), `${prefix}_${Date.now()}`)
}

export async function createDirectory (path) {
  const promisified = util.promisify(fs.mkdir)
  return promisified(path)
}

export async function deleteDirectory (path) {
  const promisified = util.promisify(rimraf)
  return promisified(path)
}

export async function copyFile (src, dest) {
  const promisified = util.promisify(fs.copyFile)
  return promisified(src, dest)
}

export async function readFile (path) {
  const promisified = util.promisify(fs.readFile)
  return promisified(path, 'utf8')
}

export async function writeFile (path, content) {
  const promisified = util.promisify(fs.writeFile)
  return promisified(path, content)
}
