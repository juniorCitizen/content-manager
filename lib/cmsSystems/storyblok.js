require('dotenv-safe').config()

const path = require('path')
const FormData = require('form-data')
const fs = require('fs-extra')
const Storyblok = require('storyblok-js-client')
const Promise = require('bluebird')

const Image = require('../Image')

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

    const hiResImage = new Image(imageDataEntry.filePath)
    await hiResImage.init()
    hiResImage.resize(
      parseInt(process.env.HI_RES_WIDTH),
      parseInt(process.env.HI_RES_HEIGHT)
    )
    hiResImage.toPng()

    const stdResImage = new Image(imageDataEntry.filePath)
    await stdResImage.init()
    stdResImage.resize(
      parseInt(process.env.STD_RES_WIDTH),
      parseInt(process.env.STD_RES_HEIGHT)
    )
    stdResImage.toPng()

    const lowResImage = new Image(imageDataEntry.filePath)
    await lowResImage.init()
    lowResImage.resize(
      parseInt(process.env.LOW_RES_WIDTH),
      parseInt(process.env.LOW_RES_HEIGHT)
    )
    lowResImage.toPng()

    const thumbnail = new Image(imageDataEntry.filePath)
    await thumbnail.init()
    thumbnail.resize(
      parseInt(process.env.THUMBNAIL_RES_WIDHT),
      parseInt(process.env.THUMBNAIL_RES_HEIGHT)
    )
    thumbnail.toPng()

    const forms = {
      hiRes: composeForm(signedRequests.hiRes, await hiResImage.output()),
      stdRes: composeForm(signedRequests.stdRes, await stdResImage.output()),
      lowRes: composeForm(signedRequests.lowRes, await lowResImage.output()),
      thumbnail: composeForm(
        signedRequests.thumbnail,
        await thumbnail.output()
      ),
    }

    await submitForm(forms.hiRes, signedRequests.hiRes.post_url)
    imageDataEntry.imageUrls.hiRes = 'https:' + signedRequests.hiRes.pretty_url
    hiResImage.destroy()

    await submitForm(forms.stdRes, signedRequests.stdRes.post_url)
    imageDataEntry.imageUrls.stdRes =
      'https:' + signedRequests.stdRes.pretty_url
    stdResImage.destroy()

    await submitForm(forms.lowRes, signedRequests.lowRes.post_url)
    imageDataEntry.imageUrls.lowRes =
      'https:' + signedRequests.lowRes.pretty_url
    lowResImage.destroy()

    await submitForm(forms.thumbnail, signedRequests.thumbnail.post_url)
    imageDataEntry.imageUrls.thumbnail =
      'https:' + signedRequests.thumbnail.pretty_url
    thumbnail.destroy()

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
