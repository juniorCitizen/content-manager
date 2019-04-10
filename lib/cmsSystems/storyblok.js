const path = require('path')
const FormData = require('form-data')
const fs = require('fs-extra')
const Storyblok = require('storyblok-js-client')
const Promise = require('bluebird')

const Image = require('../Image')

require('dotenv-safe').config()

const spaceId = process.env.STORYBLOK_SPACE_ID
const oauthToken = process.env.STORYBLOK_MANAGEMENT_API_TOKEN
const apiEndPoint = `spaces/${spaceId}/assets`
const storyblok = new Storyblok({oauthToken})

const assetDir = path.resolve('./assets')
const manifestDir = path.join(assetDir, 'manifests')
const manifestPath = path.join(manifestDir, 'images.json')
const concurrency = {concurrency: 6}

module.exports = imageDataset => {
  const mapFn = imageDataEntry => uploadImage(imageDataEntry)
  return resetStoryblokAssets()
    .then(() => Promise.map(imageDataset, mapFn, concurrency))
    .then(dataset => fs.outputJson(manifestPath, dataset))
    .catch(error => Promise.reject(error))
}

async function uploadImage(imageDataEntry) {
  try {
    const imageFileName = imageDataEntry.uuid + '.png'
    const thumbFileName = imageDataEntry.uuid + '.thumbnail.png'
    const signedRequests = {
      image: await storyblok
        .post(apiEndPoint, {filename: imageFileName})
        .then(({data}) => data)
        .catch(error => Promise.reject(error)),
      thumb: await storyblok
        .post(apiEndPoint, {filename: thumbFileName})
        .then(({data}) => data)
        .catch(error => Promise.reject(error)),
    }
    const image = new Image(imageDataEntry.filePath)
    await image.init()
    image.resize(640, 360)
    image.toPng()
    const thumb = new Image(imageDataEntry.filePath)
    await thumb.init()
    thumb.resize(192, 108)
    thumb.toPng()
    const forms = {
      image: composeForm(signedRequests.image, await image.output()),
      thumb: composeForm(signedRequests.thumb, await thumb.output()),
    }
    await submitForm(forms.image, signedRequests.image.post_url)
    imageDataEntry.imageUrl = 'https:' + signedRequests.image.pretty_url
    image.destroy()
    await submitForm(forms.thumb, signedRequests.thumb.post_url)
    imageDataEntry.thumbnailUrl = 'https:' + signedRequests.thumb.pretty_url
    thumb.destroy()
    console.log(`${imageDataEntry.imageUrl} uploaded`)
    return imageDataEntry
  } catch (error) {
    console.log(error)
    throw error
  }
}

function composeForm(signedRequest, bufferedImageData) {
  const form = new FormData()
  for (const key in signedRequest.fields) {
    form.append(key, signedRequest.fields[key])
  }
  form.append('file', bufferedImageData)
  return form
}

async function submitForm(form, endpoint) {
  try {
    await new Promise((resolve, reject) => {
      form.submit(endpoint, error => {
        if (error) reject(error)
        resolve()
      })
    })
  } catch (error) {
    console.log(error)
    throw error
  }
}

async function resetStoryblokAssets() {
  try {
    const assets = []
    let pageIndex = 1
    const perPage = 500
    const paging = {page: pageIndex, per_page: perPage}
    const initialResponse = await storyblok.get(apiEndPoint, paging)
    const {data, headers} = initialResponse
    const assetCount = headers.total
    assets.push(...data.assets)
    while (assets.length < assetCount) {
      pageIndex++
      paging.page = pageIndex
      const {data} = await storyblok.get(apiEndPoint, paging)
      assets.push(...data.assets)
    }
    await Promise.map(
      assets,
      asset => {
        const filename = asset.filename
        return storyblok
          .delete(`${apiEndPoint}/${asset.id}`)
          .then(() => {
            console.log(`${filename} deleted`)
            return Promise.resolve()
          })
          .catch(() => {
            console.log(`${filename} deleted, but with error`)
            return Promise.resolve()
          })
      },
      concurrency
    )
  } catch (error) {
    console.log(error)
    throw error
  }
}
