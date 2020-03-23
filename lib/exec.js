const child_process = require('child_process')

module.exports = function exec(cmd, opts = {}) {
  return new Promise((resolve, reject) => {
    child_process.exec(cmd, opts, (error, stdout, stderr) => {
      if (error) return reject(error)

      resolve(stdout)
    })
  })
}