const path = require('path')
const fs = require('fs-extra')

module.exports = srcDir => {
  const dirs = {
    dest: path.resolve('./assets/images'),
    src: srcDir,
  }
  return fs
    .pathExists(dirs.src)
    .then(exists => {
      if (!exists) {
        throw new Error('invalid image asset source directory')
      } else {
        return Promise.resolve()
      }
    })
    .then(() => fs.ensureDir(dirs.dest))
    .then(() => fs.emptyDir(dirs.dest))
    .then(() => fs.copy(dirs.src, dirs.dest))
    .catch(error => Promise.reject(error))
}
