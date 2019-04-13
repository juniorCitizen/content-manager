require('dotenv-safe').config()

const path = require('path')
const fs = require('fs-extra')
const Promise = require('bluebird')
const yaml = require('js-yaml')

const Image = require('../Image')

const configDir = path.resolve('./static/admin')
const configPath = path.join(configDir, 'config.yml')
const rawConfig = fs.readFileSync(configPath)
const parsedConfig = yaml.safeLoad(rawConfig)

const assetDir = path.resolve('./assets')
const manifestDir = path.join(assetDir, 'manifests')
const manifestPath = path.join(manifestDir, 'images.json')
const mediaDir = path.resolve('./' + parsedConfig.media_folder)
const baseUrl = parsedConfig.public_folder

module.exports = imageDataset => {
  const mapFn = imageDataEntry => uploadImage(imageDataEntry)
  return fs
    .emptyDir(mediaDir)
    .then(() => Promise.mapSeries(imageDataset, mapFn))
    .then(dataset => fs.outputJson(manifestPath, dataset))
    .catch(error => Promise.reject(error))
}

async function uploadImage(imageDataEntry) {
  try {
    const image = new Image(imageDataEntry.filePath)
    await image.init()
    // high res image
    const hiResFileName = imageDataEntry.uuid + '.hires.png'
    const hiResFilePath = path.join(mediaDir, hiResFileName)
    image.resize(
      parseInt(process.env.HI_RES_WIDTH),
      parseInt(process.env.HI_RES_HEIGHT)
    )
    image.toPng()
    await image.output(hiResFilePath)
    imageDataEntry.imageUrls.hiRes = baseUrl + '/' + hiResFileName
    // standard res image
    const stdResFileName = imageDataEntry.uuid + '.stdres.png'
    const stdResFilePath = path.join(mediaDir, stdResFileName)
    image.resize(
      parseInt(process.env.STD_RES_WIDTH),
      parseInt(process.env.STD_RES_HEIGHT)
    )
    image.toPng()
    await image.output(stdResFilePath)
    imageDataEntry.imageUrls.stdRes = baseUrl + '/' + stdResFileName
    // low res image
    const lowResFileName = imageDataEntry.uuid + '.lowres.png'
    const lowResFilePath = path.join(mediaDir, lowResFileName)
    image.resize(
      parseInt(process.env.LOW_RES_WIDTH),
      parseInt(process.env.LOW_RES_HEIGHT)
    )
    image.toPng()
    await image.output(lowResFilePath)
    imageDataEntry.imageUrls.lowRes = baseUrl + '/' + lowResFileName
    // thumbnail image
    const thumbnailFileName = imageDataEntry.uuid + '.thumbnail.png'
    const thumbnailFilePath = path.join(mediaDir, thumbnailFileName)
    image.resize(
      parseInt(process.env.THUMBNAIL_RES_WIDHT),
      parseInt(process.env.THUMBNAIL_RES_HEIGHT)
    )
    image.toPng()
    await image.output(thumbnailFilePath)
    imageDataEntry.imageUrls.thumbnail = baseUrl + '/' + thumbnailFileName

    image.destroy()
    return imageDataEntry
  } catch (error) {
    throw error
  }
}
