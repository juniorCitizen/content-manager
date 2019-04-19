require('dotenv-safe').config()

const path = require('path')
const fs = require('fs-extra')
const Promise = require('bluebird')
const yaml = require('js-yaml')

const Image = require('@juniorcitizen/convert-to-png')

const configDir = path.resolve('./static/admin')
const configPath = path.join(configDir, 'config.yml')
const rawConfig = fs.readFileSync(configPath)
const parsedConfig = yaml.safeLoad(rawConfig)

const assetDir = path.resolve('./assets')
const manifestDir = path.join(assetDir, 'manifests')
const manifestPath = path.join(manifestDir, 'images.json')
const mediaDir = path.resolve('./' + parsedConfig.backend.media_folder)
const baseUrl = parsedConfig.backend.public_folder

module.exports = imageDataset => {
  const mapFn = imageDataEntry => uploadImage(imageDataEntry)
  return fs
    .emptyDir(mediaDir)
    .then(() => {
      console.log(mediaDir)
      console.log('has been cleared out before deployment')
      return Promise.mapSeries(imageDataset, mapFn)
    })
    .then(dataset => fs.outputJson(manifestPath, dataset))
    .catch(error => Promise.reject(error))
}

async function uploadImage(imageDataEntry) {
  try {
    // high res image
    const hiResFileName = imageDataEntry.uuid + '.hires.png'
    const hiResFilePath = path.join(mediaDir, hiResFileName)
    imageDataEntry.imageUrls.hiRes = baseUrl + '/' + hiResFileName
    const hiResImage = new Image()
    await hiResImage.init(imageDataEntry.filePath, {
      xLimit: parseInt(process.env.HI_RES_WIDTH),
      yLimit: parseInt(process.env.HI_RES_HEIGHT),
    })
    await hiResImage.output(hiResFilePath)
    // standard res image
    const stdResFileName = imageDataEntry.uuid + '.stdres.png'
    const stdResFilePath = path.join(mediaDir, stdResFileName)
    imageDataEntry.imageUrls.stdRes = baseUrl + '/' + stdResFileName
    const stdResImage = new Image()
    await stdResImage.init(imageDataEntry.filePath, {
      xLimit: parseInt(process.env.STD_RES_WIDTH),
      yLimit: parseInt(process.env.STD_RES_HEIGHT),
    })
    await stdResImage.output(stdResFilePath)
    // low res image
    const lowResFileName = imageDataEntry.uuid + '.lowres.png'
    const lowResFilePath = path.join(mediaDir, lowResFileName)
    imageDataEntry.imageUrls.lowRes = baseUrl + '/' + lowResFileName
    const lowResImage = new Image()
    await lowResImage.init(imageDataEntry.filePath, {
      xLimit: parseInt(process.env.LOW_RES_WIDTH),
      yLimit: parseInt(process.env.LOW_RES_HEIGHT),
    })
    await lowResImage.output(lowResFilePath)
    // thumbnail image
    const thumbnailFileName = imageDataEntry.uuid + '.thumbnail.png'
    const thumbnailFilePath = path.join(mediaDir, thumbnailFileName)
    imageDataEntry.imageUrls.thumbnail = baseUrl + '/' + thumbnailFileName
    const thumbnailImage = new Image()
    await thumbnailImage.init(imageDataEntry.filePath, {
      xLimit: parseInt(process.env.THUMBNAIL_RES_WIDHT),
      yLimit: parseInt(process.env.THUMBNAIL_RES_HEIGHT),
    })
    await thumbnailImage.output(thumbnailFilePath)
    console.log(`${path.resolve(imageDataEntry.imageUrls.hiRes)} uploaded`)
    return imageDataEntry
  } catch (error) {
    throw error
  }
}
