const path = require('path')
const fs = require('fs-extra')
const matter = require('gray-matter')
const slugify = require('slugify')

module.exports = class Category {
  constructor(dataEntry) {
    this.dataEntry = dataEntry
    this.merchandise = []
    this.type = 'categories'
    this.name = this.dataEntry.name
    this.slug = slugify(this.name, {
      replacement: '-',
      remove: /[*+~.()'"!:@]/g,
      lower: true,
    })
    this.route = undefined
    this.fileName = this.slug + '.md'
    this.headline = this.name + ' Category'
    this.description = this.dataEntry.description
    this.subcategories = []
    this.childrenSeries = []
    this.products = []
    this.breadcrumbs = []
    this.image = {
      urls: {
        hiRes: undefined,
        stdRes: undefined,
        lowRes: undefined,
        thumbnail: undefined,
      },
      description: this.headline,
    }
    this.seo = {
      title: `${this.headline} | Gentry Way & Gentry Hardware`,
      description: this.description,
      keywords: this.dataEntry.keywords,
    }
    this.markdownBody = ''
  }

  compose(merchandise, imageManifest, imageDir) {
    this.merchandise = merchandise
    this.subcategories = this.merchandise
      .filter(item => item.getType() === 'categories')
      .filter(item => item.isSubcategoryOf(this.name))
      .map(item => item.getFileName())
    this.childrenSeries = this.merchandise
      .filter(item => item.getType() === 'series')
      .filter(item => item.isChildrenSeriesOf(this.name))
      .map(item => item.getFileName())
    this.products = this.merchandise
      .filter(item => item.getType() === 'products')
      .filter(item => item.isProductWithinCategory(this.name))
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
    this.route = this.breadcrumbs[this.breadcrumbs.length - 1].route
    const imageFilePath = path.join(imageDir, this.dataEntry.image)
    const findFn = entry => entry.filePath === imageFilePath
    const imageDataEntry = imageManifest.find(findFn)
    this.image.urls.hiRes = imageDataEntry.imageUrls.hiRes
    this.image.urls.stdRes = imageDataEntry.imageUrls.stdRes
    this.image.urls.lowRes = imageDataEntry.imageUrls.lowRes
    this.image.urls.thumbnail = imageDataEntry.imageUrls.thumbnail
  }

  generate(contentDir) {
    const content =
      matter
        .stringify(this.markdownBody, {
          type: this.type,
          name: this.name,
          slug: this.slug,
          route: this.route,
          fileName: this.fileName,
          headline: this.headline,
          description: this.description,
          subcategories: this.subcategories,
          childrenSeries: this.childrenSeries,
          products: this.products,
          breadcrumbs: this.breadcrumbs,
          image: this.image,
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

  getKeywords() {
    return this.seo.keywords
  }

  getName() {
    return this.name
  }

  getSlug() {
    return this.slug
  }

  getParent() {
    return this.merchandise
      .filter(item => item.getType() === 'categories')
      .find(item => item.getName() === this.dataEntry.parentCategory)
  }

  getType() {
    return this.type
  }

  isRootCategory() {
    return !this.dataEntry.parentCategory
  }

  isSubcategoryOf(parentName) {
    return this.dataEntry.parentCategory === parentName
  }
}
