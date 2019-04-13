const path = require('path')
const fs = require('fs-extra')
const matter = require('gray-matter')

module.exports = class Home {
  constructor() {
    this.name = 'Home Page'
    this.slug = ''
    this.route = ''
    this.fileName = 'home.md'
    this.merchandise = []
    this.rootCategories = []
    this.seo = {
      title: 'Best Homecare Products | Gentry Way & Gentry Hardware',
      description:
        'Gentry is a homecare equipment and assistive medical device supplier with 40 years of manufacturing experience.  Providing high quality products from China and Taiwan to our customers world-wide at competitive prices',
      keywords: [
        'Asian',
        'Chinese',
        'Taiwanese',
        'manufacturer',
        'supplier',
        'aluminum',
        'steel',
        'home care equipment',
        'home care products',
        'rehabilitation equipment',
        'rehabilitation products',
        'patient-aid products',
        'medical devices',
        'bathroom safety',
      ],
    }
    this.markdownBody = ''
  }

  compose(merchandise) {
    this.merchandise = merchandise
    this.rootCategories = this.merchandise
      .filter(item => item.getType() === 'categories')
      .filter(item => item.isRootCategory())
      .map(item => item.getFileName())
  }

  generate(contentDir) {
    const content =
      matter
        .stringify(this.markdownBody, {
          name: this.name,
          slug: this.slug,
          route: this.route,
          fileName: this.fileName,
          rootCategories: this.rootCategories,
          seo: this.seo,
        })
        .trim() + '\n'
    const filePath = path.join(contentDir, this.fileName)
    return fs.outputFile(filePath, content)
  }
}
