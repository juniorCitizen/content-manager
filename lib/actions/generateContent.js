const path = require('path')

const ContentManager = require('../ContentManager')
const ExcelData = require('../ExcelData')

const dirs = {
  content: path.resolve('./assets/content'),
  image: path.resolve('./assets/images'),
  manifest: path.resolve('./assets/manifests'),
}

const paths = {
  userData: path.resolve('./assets/userData.xlsx'),
  datasetMapper: path.resolve('./lib/datasetMappers/product'),
}

const refKeys = {
  categories: '1',
  series: '2',
  products: '3',
  features: '4',
  images: '5',
}

const userData = new ExcelData(paths.userData, refKeys)

module.exports = () => {
  return userData
    .getData()
    .then(async userDataset => {
      const productDatasetMapper = require(paths.datasetMapper)
      const mapFn = productDatasetMapper(userDataset.features)
      const dataset = {
        categories: userDataset.categories,
        series: userDataset.series,
        products: userDataset.products.map(mapFn),
      }
      try {
        const contentManager = new ContentManager(dirs, dataset)
        await contentManager.reset()
        contentManager.initialize()
        contentManager.compose()
        await contentManager.generate()
      } catch (error) {
        throw error
      }
    })
    .catch(error => Promise.reject(error))
}
