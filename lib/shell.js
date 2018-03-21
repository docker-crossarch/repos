import childProcess from 'child_process'

export function runCommand (command, args, allAtOnce = false) {
  return new Promise((resolve, reject) => {
    const child = childProcess.spawn(command, args)
    if (allAtOnce) {
      let buffer = ''
      const receiver = data => { buffer += data.toString() }
      child.stdout.on('data', receiver)
      child.stderr.on('data', receiver)

      child.on('close', () => resolve(buffer))
    } else {
      child.stdout.pipe(process.stdout)
      child.stderr.pipe(process.stderr)

      child.on('close', (code) => {
        if (code === 0) return resolve()

        reject(new Error(`Process exited with code ${code}`))
      })
    }
  })
}
