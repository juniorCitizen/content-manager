require('dotenv-safe').config()

const path = require('path')
const FormData = require('form-data')
const fs = require('fs-extra')
const Storyblok = require('storyblok-js-client')
const Promise = require('bluebird')

const Image = require('@juniorcitizen/convert-to-png')

const spaceId = process.env.STORYBLOK_SPACE_ID
const oauthToken = process.env.STORYBLOK_MANAGEMENT_API_TOKEN
const apiEndPoint = `spaces/${spaceId}/assets`
const storyblok = new Storyblok({oauthToken})

const assetDir = path.resolve('./assets')
const manifestDir = path.join(assetDir, 'manifests')
const manifestPath = path.join(manifestDir, 'images.json')
const concurrency = {concurrency: 3}

module.exports = imageDataset => {
  const mapFn = imageDataEntry => uploadImage(imageDataEntry)
  return resetStoryblokAssets()
    .then(() => Promise.map(imageDataset, mapFn, concurrency))
    .then(dataset => fs.outputJson(manifestPath, dataset))
    .catch(error => Promise.reject(error))
}

async function uploadImage(imageDataEntry) {
  try {
    const hiResFileName = imageDataEntry.uuid + '.hires.png'
    const stdResFileName = imageDataEntry.uuid + '.stdres.png'
    const lowResFileName = imageDataEntry.uuid + '.lowres.png'
    const thumbnailFileName = imageDataEntry.uuid + '.thumbnail.png'
    const signedRequests = {
      hiRes: await storyblok
        .post(apiEndPoint, {filename: hiResFileName})
        .then(({data}) => data)
        .catch(error => Promise.reject(error)),
      stdRes: await storyblok
        .post(apiEndPoint, {filename: stdResFileName})
        .then(({data}) => data)
        .catch(error => Promise.reject(error)),
      lowRes: await storyblok
        .post(apiEndPoint, {filename: lowResFileName})
        .then(({data}) => data)
        .catch(error => Promise.reject(error)),
      thumbnail: await storyblok
        .post(apiEndPoint, {filename: thumbnailFileName})
        .then(({data}) => data)
        .catch(error => Promise.reject(error)),
    }

    const hiResImage = new Image()
    const stdResImage = new Image()
    const lowResImage = new Image()
    const thumbnailImage = new Image()
    await Promise.all([
      hiResImage.init(imageDataEntry.filePath, {
        xLimit: parseInt(process.env.HI_RES_WIDTH),
        yLimit: parseInt(process.env.HI_RES_HEIGHT),
      }),
      stdResImage.init(imageDataEntry.filePath, {
        xLimit: parseInt(process.env.STD_RES_WIDTH),
        yLimit: parseInt(process.env.STD_RES_HEIGHT),
      }),
      lowResImage.init(imageDataEntry.filePath, {
        xLimit: parseInt(process.env.LOW_RES_WIDTH),
        yLimit: parseInt(process.env.LOW_RES_HEIGHT),
      }),
      thumbnailImage.init(imageDataEntry.filePath, {
        xLimit: parseInt(process.env.THUMBNAIL_RES_WIDTH),
        yLimit: parseInt(process.env.THUMBNAIL_RES_HEIGHT),
      }),
    ])
    const [
      hiResBuffer,
      stdResBuffer,
      lowResBuffer,
      thumbnailBuffer,
    ] = await Promise.all([
      hiResImage.output(),
      stdResImage.output(),
      lowResImage.output(),
      thumbnailImage.output(),
    ])
    const forms = {
      hiRes: composeForm(signedRequests.hiRes, hiResBuffer),
      stdRes: composeForm(signedRequests.stdRes, stdResBuffer),
      lowRes: composeForm(signedRequests.lowRes, lowResBuffer),
      thumbnail: composeForm(signedRequests.thumbnail, thumbnailBuffer),
    }
    await Promise.all([
      submitForm(forms.hiRes, signedRequests.hiRes.post_url),
      submitForm(forms.stdRes, signedRequests.stdRes.post_url),
      submitForm(forms.lowRes, signedRequests.lowRes.post_url),
      submitForm(forms.thumbnail, signedRequests.thumbnail.post_url),
    ])
    imageDataEntry.imageUrls.hiRes = 'https:' + signedRequests.hiRes.pretty_url
    imageDataEntry.imageUrls.stdRes =
      'https:' + signedRequests.stdRes.pretty_url
    imageDataEntry.imageUrls.lowRes =
      'https:' + signedRequests.lowRes.pretty_url
    imageDataEntry.imageUrls.thumbnail =
      'https:' + signedRequests.thumbnail.pretty_url

    console.log(`${imageDataEntry.imageUrls.hiRes} uploaded`)
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
