const path = require('path')
const fs = require('fs-extra')
const matter = require('gray-matter')
const slugify = require('slugify')

module.exports = class Product {
  constructor(dataEntry) {
    this.dataEntry = dataEntry
    this.merchandise = []
    this.type = 'products'
    this.name = this.dataEntry.name
    this.model = this.dataEntry.model
    this.slug = slugify(this.model, {
      replacement: '-',
      remove: /[*+~.()'"!:@]/g,
      lower: true,
    })
    this.route = undefined
    this.fileName = this.slug + '.md'
    this.headline = `${this.model} ${this.name}`
    this.description = this.dataEntry.description
    this.breadcrumbs = []
    this.images = []
    this.features = this.dataEntry.features
    this.tags = this.dataEntry.tags
    this.seo = {
      title: `${this.headline} | Gentry Way & Gentry Hardware`,
      description: this.description,
      keywords: [],
    }
    this.markdownBody = ''
  }

  compose(merchandise, imageManifest) {
    this.merchandise = merchandise
    const ancestry = this.getAncestry()
    this.breadcrumbs = ancestry.map((ancestor, index, original) => ({
      type: ancestor.getType(),
      slug: ancestor.getSlug(),
      fileName: ancestor.getFileName(),
      text:
        ancestor.getType() === 'products'
          ? ancestor.getModel()
          : ancestor.getName(),
      route:
        '/catalog/' +
        original
          .slice(0, index + 1)
          .map(s => s.getSlug())
          .join('/'),
    }))
    this.breadcrumbs.unshift({
      type: 'catalog',
      slug: 'catalog',
      fileName: 'catalog.md',
      text: 'Catalog',
      route: '/catalog',
    })
    this.route = this.breadcrumbs[this.breadcrumbs.length - 1].route
    this.seo.keywords = ancestry
      .reverse()
      .find(ancestor => ancestor.getType() === 'categories')
      .getKeywords()
    const filterFn = ({model: m}) => m === this.model
    const mapFn = entry => ({
      urls: {
        hiRes: entry.imageUrls.hiRes,
        stdRes: entry.imageUrls.stdRes,
        lowRes: entry.imageUrls.lowRes,
        thumbnail: entry.imageUrls.thumbnail,
      },
      description: this.headline,
    })
    this.images = imageManifest.filter(filterFn).map(mapFn)
  }

  generate(contentDir) {
    const content =
      matter
        .stringify(this.markdownBody, {
          type: this.type,
          name: this.name,
          model: this.model,
          slug: this.slug,
          route: this.route,
          fileName: this.fileName,
          headline: this.headline,
          description: this.description,
          breadcrumbs: this.breadcrumbs,
          images: this.images,
          features: this.features,
          tags: this.tags,
          seo: this.seo,
        })
        .trim() + '\n'
    const filePath = path.join(contentDir, this.type, this.fileName)
    return fs.outputFile(filePath, content)
  }

  getAncestry(ancestry = []) {
    ancestry.unshift(this)
    const parent = this.getParent()
    return !parent ? ancestry : parent.getAncestry(ancestry)
  }

  getFileName() {
    return this.fileName
  }

  getModel() {
    return this.model
  }

  getParent() {
    const parentType = !this.dataEntry.parentCategory ? 'series' : 'categories'
    const parentName =
      this.dataEntry.parentCategory || this.dataEntry.parentSeries
    return this.merchandise
      .filter(item => item.getType() === parentType)
      .find(item => item.getName() === parentName)
  }

  getSlug() {
    return this.slug
  }

  getType() {
    return this.type
  }

  isProductWithinCategory(parentName) {
    return this.dataEntry.parentCategory === parentName
  }

  isProductWithinSeries(parentName) {
    return this.dataEntry.parentSeries === parentName
  }
}
