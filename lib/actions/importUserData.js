const path = require('path')
const fs = require('fs-extra')

module.exports = srcPath => {
  const paths = {
    dest: path.resolve('./assets/userData.xlsx'),
    src: srcPath,
  }
  return fs
    .pathExists(paths.src)
    .then(exists => {
      if (!exists) {
        throw new Error('invalid user data file path')
      } else {
        return Promise.resolve()
      }
    })
    .then(() => fs.copy(paths.src, paths.dest))
    .catch(error => Promise.reject(error))
}
