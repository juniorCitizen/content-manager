const path = require('path')
const sharp = require('sharp')

module.exports = class Image {
  constructor(filePath) {
    this.filePath = path.resolve(filePath)
    this.image = undefined
    this.metadata = undefined
  }

  async init() {
    try {
      this.image = sharp(this.filePath).rotate()
      this.metadata = await this.image.metadata()
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  resize(xLimit, yLimit) {
    const options = {
      width: xLimit,
      height: yLimit,
      fit: sharp.fit.contain,
      background: {r: 0, g: 0, b: 0, alpha: 0},
    }
    this.image.resize(options)
  }

  toPng(options) {
    !options ? this.image.png() : this.image.png(options)
  }

  async output(filePath) {
    try {
      if (filePath) {
        await this.image.toFile(path.resolve(filePath))
      } else {
        return await this.image.toBuffer()
      }
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  destroy() {
    this.metadata = undefined
    this.image = undefined
  }
}