const path = require('path')

const ExcelReader = require('simple-excel-reader')

const dirs = {
  image: path.resolve('./assets/images'),
}
const paths = {
  userData: path.resolve('./assets/userData.xlsx'),
  datasetMapper: path.resolve('./lib/datasetMappers/image'),
  processor: undefined,
}

const sheetNames = ['categories', 'series', 'products', 'features', 'images']

const excelReader = new ExcelReader(paths.userData, sheetNames)

module.exports = cmsSystem => {
  return excelReader
    .getWorkSheet('images')
    .then(userData => {
      const imageDatasetMapper = require(paths.datasetMapper)
      const mapFn = imageDatasetMapper(dirs.image)
      return userData.map(mapFn)
    })
    .then(imageDataset => {
      const pathString = `./lib/cmsSystems/${cmsSystem}`
      paths.processor = path.resolve(pathString)
      const processor = require(paths.processor)
      return processor(imageDataset)
    })
    .catch(error => Promise.reject(error))
}
