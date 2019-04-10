const path = require('path')

const ExcelData = require('../ExcelData')

const dirs = {
  image: path.resolve('./assets/images'),
}
const paths = {
  userData: path.resolve('./assets/userData.xlsx'),
  datasetMapper: path.resolve('./lib/datasetMappers/image'),
  processor: undefined,
}

const refKeys = {
  categories: '1',
  series: '2',
  products: '3',
  features: '4',
  images: '5',
}

const userData = new ExcelData(paths.userData, refKeys)

module.exports = cmsSystem => {
  return userData
    .getData()
    .then(userData => {
      const imageDatasetMapper = require(paths.datasetMapper)
      const mapFn = imageDatasetMapper(dirs.image)
      return userData.images.map(mapFn)
    })
    .then(imageDataset => {
      const pathString = `./lib/cmsSystems/${cmsSystem}`
      paths.processor = path.resolve(pathString)
      const processor = require(paths.processor)
      return processor(imageDataset)
    })
    .catch(error => Promise.reject(error))
}
