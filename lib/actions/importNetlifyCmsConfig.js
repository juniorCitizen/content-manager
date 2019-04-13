const path = require('path')
const fs = require('fs-extra')

module.exports = srcPath => {
  const paths = {
    dest: path.resolve('./static/admin/config.yml'),
    src: path.join(srcPath, 'static', 'admin', 'config.yml'),
  }
  return fs
    .pathExists(paths.src)
    .then(exists => {
      if (!exists) {
        throw new Error('invalid file path to NetlifyCMS config')
      } else {
        return Promise.resolve()
      }
    })
    .then(() => fs.copy(paths.src, paths.dest))
    .catch(error => Promise.reject(error))
}
