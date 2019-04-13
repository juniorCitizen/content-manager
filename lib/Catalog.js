const path = require('path')
const fs = require('fs-extra')
const matter = require('gray-matter')

module.exports = class Catalog {
  constructor() {
    this.merchandise = []
    this.type = 'catalog'
    this.name = 'Product Catalog'
    this.slug = 'catalog'
    this.route = '/catalog'
    this.fileName = this.slug + '.md'
    this.headline = 'Product Catalog'
    this.description =
      'Gentry offers a complete selection of high-quality homecare equipment and assistive medical devices at competitive prices'
    this.subcategories = []
    this.seo = {
      title: `${this.headline} | Gentry Way & Gentry Hardware`,
      description: this.description,
      keywords: [
        'crutches',
        'aluminum crutches',
        'canes',
        'walking sticks',
        'bath seats',
        'shower stools',
        'shower chairs',
        'transfer benches',
        'walkers',
        'aluminum walkers',
        'commodes',
        'commode chairs',
        'transfer commodes',
        'elevated toilet seats',
        'raised toliet seats',
        'bathroom safety',
        'patient aids',
        'handrails and frames',
      ],
    }
    this.markdownBody = ''
  }

  compose(merchandise) {
    this.merchandise = merchandise
    this.subcategories = this.merchandise
      .filter(item => item.getType() === 'categories')
      .filter(item => item.isRootCategory())
      .map(item => item.getFileName())
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
          seo: this.seo,
        })
        .trim() + '\n'
    const filePath = path.join(contentDir, this.fileName)
    return fs.outputFile(filePath, content)
  }

  getType() {
    return this.type
  }
}
