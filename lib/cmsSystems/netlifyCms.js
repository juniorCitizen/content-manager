const path = require('path')
const fs = require('fs-extra')
const Promise = require('bluebird')

const Image = require('../Image')

const assetDir = path.resolve('./assets')
const manifestDir = path.join(assetDir, 'manifests')
const manifestPath = path.join(manifestDir, 'images.json')
const mediaDir = path.resolve('./static/images')
const baseUrl = '/images'

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
    const fileName = imageDataEntry.uuid + '.png'
    const filePath = path.join(mediaDir, fileName)
    image.resize(640, 360)
    image.toPng()
    await image.output(filePath)
    imageDataEntry.imageUrl = baseUrl + '/' + fileName
    const thumbName = imageDataEntry.uuid + '.thumbnail.png'
    const thumbPath = path.join(mediaDir, thumbName)
    image.resize(192, 108)
    image.toPng()
    await image.output(thumbPath)
    imageDataEntry.thumbnailUrl = baseUrl + '/' + thumbName
    image.destroy()
    return imageDataEntry
  } catch (error) {
    throw error
  }
}
