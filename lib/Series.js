const path = require('path')
const fs = require('fs-extra')
const matter = require('gray-matter')
const slugify = require('slugify')

module.exports = class Series {
  constructor(dataEntry) {
    this.dataEntry = dataEntry
    this.merchandise = []
    this.type = 'series'
    this.name = this.dataEntry.name
    this.slug = slugify(this.name + '-series', {
      replacement: '-',
      lower: true,
    })
    this.fileName = this.slug + '.md'
    this.headline = undefined // defined during composition
    this.description = this.dataEntry.description
    this.products = []
    this.breadcrumbs = []
    this.image = {
      url: '/companyLogo.png', // redefined during composition
      thumbnailUrl: '/companyLogo.png', // redefined during composition
      description: undefined, // defined during composition
    }
    this.seo = {
      title: undefined, // defined during composition
      description: this.description,
      keywords: [],
    }
    this.markdownBody = ''
  }

  compose(merchandise, imageManifest, imageDir) {
    this.merchandise = merchandise
    this.products = this.merchandise
      .filter(item => item.getType() === 'products')
      .filter(item => item.isProductWithinSeries(this.name))
      .map(item => item.getFileName())
    const ancestry = this.getAncestry()
    this.breadcrumbs = ancestry.map((ancestor, index, original) => ({
      type: ancestor.getType(),
      slug: ancestor.getSlug(),
      fileName: ancestor.getFileName(),
      text: ancestor.getName(),
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
    const parent = ancestry
      .reverse()
      .find(ancestor => ancestor.getType() === 'categories')
    this.headline = `${this.name} Series ${parent.getName()}`
    this.seo.title = `${this.headline} | Gentry Way & Gentry Hardware`
    this.seo.keywords = parent.getKeywords()
    const imageFilePath = path.join(imageDir, this.dataEntry.image)
    const findFn = entry => entry.filePath === imageFilePath
    const imageDataEntry = imageManifest.find(findFn)
    this.image.url = imageDataEntry.imageUrl
    this.image.thumbnailUrl = imageDataEntry.thumbnailUrl
    this.image.description = this.headline
  }

  generate(contentDir) {
    const content = matter
      .stringify(this.markdownBody, {
        type: this.type,
        name: this.name,
        slug: this.slug,
        fileName: this.fileName,
        headline: this.headline,
        description: this.description,
        products: this.products,
        breadcrumbs: this.breadcrumbs,
        image: this.image,
        seo: this.seo,
      })
      .trim()
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

  getName() {
    return this.name
  }

  getParent() {
    return this.merchandise
      .filter(item => item.getType() === 'categories')
      .find(item => item.getName() === this.dataEntry.parentCategory)
  }

  getSlug() {
    return this.slug
  }

  getType() {
    return this.type
  }

  isChildrenSeriesOf(parentName) {
    return this.dataEntry.parentCategory === parentName
  }
}
