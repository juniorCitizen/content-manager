const path = require('path')

const ContentManager = require('../ContentManager')
const ExcelReader = require('simple-excel-reader')

const dirs = {
  content: path.resolve('./assets/content'),
  image: path.resolve('./assets/images'),
  manifest: path.resolve('./assets/manifests'),
}

const paths = {
  userData: path.resolve('./assets/userData.xlsx'),
  datasetMapper: path.resolve('./lib/datasetMappers/product'),
}

const sheetNames = ['categories', 'series', 'products', 'features', 'images']

const excelReader = new ExcelReader(paths.userData, sheetNames)

module.exports = () => {
  return excelReader
    .getWorkBook()
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
