const path = require('path')
const slugify = require('slugify')
const uuid = require('uuid/v4')

module.exports = imageSrcBaseDir => {
  return imageDataEntry => {
    const model = imageDataEntry.model
    const slug = slugify(model, {
      replacement: '-',
      remove: /[*+~.()'"!:@]/g,
      lower: true,
    })
    const modifiedVersion = imageDataEntry.modifiedVersion
    const originalVersion = imageDataEntry.originalVersion
    const srcFileName = modifiedVersion || originalVersion
    const srcBaseDir = path.resolve(imageSrcBaseDir)
    const srcFilePath = path.join(srcBaseDir, slug, srcFileName)
    return {
      model,
      slug,
      fileName: srcFileName,
      filePath: srcFilePath,
      uuid: uuid(),
      imageUrl: undefined,
      thumnailUrl: undefined,
    }
  }
}
