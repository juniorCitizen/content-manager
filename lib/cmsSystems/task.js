require('dotenv-safe').config()

const path = require('path')
const fs = require('fs-extra')
const Image = require('@juniorcitizen/convert-to-png')
const Promise = require('bluebird')
const yaml = require('js-yaml')

const configDir = path.resolve('./static/admin')
const configPath = path.join(configDir, 'config.yml')
const rawConfig = fs.readFileSync(configPath)
const parsedConfig = yaml.safeLoad(rawConfig)

const mediaDir = path.resolve('./' + parsedConfig.backend.media_folder)
const baseUrl = parsedConfig.backend.public_folder

process.on('message', async imageDataEntry => {
  try {
    // high res image
    const hiResFileName = imageDataEntry.uuid + '.hires.png'
    const hiResFilePath = path.join(mediaDir, hiResFileName)
    imageDataEntry.imageUrls.hiRes = baseUrl + '/' + hiResFileName
    const hiResImage = new Image()
    // standard res image
    const stdResFileName = imageDataEntry.uuid + '.stdres.png'
    const stdResFilePath = path.join(mediaDir, stdResFileName)
    imageDataEntry.imageUrls.stdRes = baseUrl + '/' + stdResFileName
    const stdResImage = new Image()
    // low res image
    const lowResFileName = imageDataEntry.uuid + '.lowres.png'
    const lowResFilePath = path.join(mediaDir, lowResFileName)
    imageDataEntry.imageUrls.lowRes = baseUrl + '/' + lowResFileName
    const lowResImage = new Image()
    // thumbnail image
    const thumbnailFileName = imageDataEntry.uuid + '.thumbnail.png'
    const thumbnailFilePath = path.join(mediaDir, thumbnailFileName)
    imageDataEntry.imageUrls.thumbnail = baseUrl + '/' + thumbnailFileName
    const thumbnailImage = new Image()
    // write out to disk
    await Promise.all([
      hiResImage
        .init(imageDataEntry.filePath, {
          xLimit: parseInt(process.env.HI_RES_WIDTH),
          yLimit: parseInt(process.env.HI_RES_HEIGHT),
        })
        .then(() => hiResImage.output(hiResFilePath))
        .catch(error => Promise.reject(error)),
      stdResImage
        .init(imageDataEntry.filePath, {
          xLimit: parseInt(process.env.STD_RES_WIDTH),
          yLimit: parseInt(process.env.STD_RES_HEIGHT),
        })
        .then(() => stdResImage.output(stdResFilePath))
        .catch(error => Promise.reject(error)),
      lowResImage
        .init(imageDataEntry.filePath, {
          xLimit: parseInt(process.env.LOW_RES_WIDTH),
          yLimit: parseInt(process.env.LOW_RES_HEIGHT),
        })
        .then(() => lowResImage.output(lowResFilePath))
        .catch(error => Promise.reject(error)),
      thumbnailImage
        .init(imageDataEntry.filePath, {
          xLimit: parseInt(process.env.THUMBNAIL_RES_WIDTH),
          yLimit: parseInt(process.env.THUMBNAIL_RES_HEIGHT),
        })
        .then(() => thumbnailImage.output(thumbnailFilePath))
        .catch(error => Promise.reject(error)),
    ])
    console.log(`${path.resolve(imageDataEntry.imageUrls.hiRes)} uploaded`)
    process.send(imageDataEntry)
    process.disconnect()
  } catch (error) {
    throw error
  }
})
