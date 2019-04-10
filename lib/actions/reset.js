const path = require('path')
const fs = require('fs-extra')
const inquirer = require('inquirer')

const dirs = {
  assets: path.resolve('./assets'),
  static: path.resolve('./static'),
}

module.exports = () => {
  return inquirer
    .prompt({
      type: 'confirm',
      name: 'input',
      message: 'are you sure you want to remove all generated contents?',
      default: false,
    })
    .then(({input}) => {
      if (!input) {
        console.log('action is cancelled')
        return Promise.resolve()
      } else {
        console.log('removing generated contents')
        return fs
          .remove(dirs.assets)
          .then(() => fs.remove(dirs.static))
          .then(() => {
            console.log('content removal completed')
            return Promise.resolve()
          })
          .catch(error => Promise.reject(error))
      }
    })
    .catch(error => Promise.reject(error))
}
