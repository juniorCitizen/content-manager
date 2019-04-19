const subprocess = require('child_process')
const path = require('path')
const fs = require('fs-extra')
const Promise = require('bluebird')
const yaml = require('js-yaml')

const configDir = path.resolve('./static/admin')
const configPath = path.join(configDir, 'config.yml')
const rawConfig = fs.readFileSync(configPath)
const parsedConfig = yaml.safeLoad(rawConfig)

const mediaDir = path.resolve('./' + parsedConfig.backend.media_folder)

module.exports = async imageDataset => {
  try {
    await fs.emptyDir(mediaDir)
    console.log('media folder has been cleared out')
    const workerCountLimit = require('os').cpus().length - 1
    const workerCount = imageDataset.length
    await Promise.map(
      Array.from(Array(workerCount).keys()),
      index => {
        return new Promise((resolve, reject) => {
          const subprocessHandle = subprocess.fork(`${__dirname}/task.js`)
          subprocessHandle.send(imageDataset[index])
          subprocessHandle.on('message', updatedImageDataEntry => {
            imageDataset[index] = updatedImageDataEntry
            resolve()
          })
          subprocessHandle.on('error', error => {
            reject(error)
          })
        })
      },
      { concurrency: workerCountLimit }
    )
  } catch (error) {
    throw error
  }
}
