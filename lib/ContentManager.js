const path = require('path')
const fs = require('fs-extra')
const Promise = require('bluebird')

const Catalog = require('./Catalog')
const Category = require('./Category')
const Series = require('./Series')
const Product = require('./Product')
const Home = require('./Home')
const Privacy = require('./Privacy')

module.exports = class ContentManager {
  constructor(dirs, userDataset) {
    this.dirs = {
      content: dirs.content,
      image: dirs.image,
      manifest: dirs.manifest,
    }
    this.dirs.categories = path.join(this.dirs.content, 'categories')
    this.dirs.products = path.join(this.dirs.content, 'products')
    this.dirs.series = path.join(this.dirs.content, 'series')
    this.userDataset = userDataset
    this.merchandise = []
    this.manifestPaths = {
      categories: path.join(this.dirs.manifest, 'categories.json'),
      content: path.join(this.dirs.manifest, 'content.json'),
      image: path.join(this.dirs.manifest, 'images.json'),
      products: path.join(this.dirs.manifest, 'products.json'),
      series: path.join(this.dirs.manifest, 'series.json'),
    }
    this.manifests = {
      content: undefined,
      image: require(this.manifestPaths.image),
    }
  }

  initialize() {
    this.home = new Home()
    this.privacy = new Privacy()
    this.catalog = new Catalog()
    const categoryDataset = this.userDataset.categories
    const mapCategoryFn = dataEntry => new Category(dataEntry)
    this.merchandise.push(...categoryDataset.map(mapCategoryFn))
    const seriesDataset = this.userDataset.series
    const mapSeriesFn = dataEntry => new Series(dataEntry)
    this.merchandise.push(...seriesDataset.map(mapSeriesFn))
    const productDataset = this.userDataset.products
    const mapProductFn = dataEntry => new Product(dataEntry)
    this.merchandise.push(...productDataset.map(mapProductFn))
  }

  compose() {
    this.merchandise.forEach(item => {
      item.compose(
        this.merchandise,
        this.manifests.image,
        this.dirs.image
      )
    })
    this.catalog.compose(this.merchandise)
    this.home.compose(this.merchandise)
  }

  generate() {
    const mapFn = item => item.generate(this.dirs.content)
    const types = ['categories', 'series', 'products']
    return Promise.mapSeries(this.merchandise, mapFn)
      .then(() => {
        // generate markdown content manifest
        // for each of merchandise types
        types.forEach(type => {
          this.manifests[type] = fs.readdirSync(this.dirs[type])
          fs.outputJsonSync(this.manifestPaths[type], this.manifests[type])
        })
      })
      .then(() => {
        // generate a overall content manifest
        this.manifests.content = types.reduce((_fullManifest, type) => {
          const mapFn = entry => ({type, fileName: entry})
          const typedManifest = this.manifests[type].map(mapFn)
          _fullManifest.push(...typedManifest)
          return _fullManifest
        }, [])
        fs.outputJsonSync(this.manifestPaths.content, this.manifests.content)
      })
      .then(() => this.catalog.generate(this.dirs.content))
      .then(() => this.home.generate(this.dirs.content))
      .then(() => this.privacy.generate(this.dirs.content))
      .catch(error => Promise.reject(error))
  }

  async reset() {
    try {
      await fs.emptyDir(this.dirs.content)
    } catch (error) {
      throw error
    }
  }
}
