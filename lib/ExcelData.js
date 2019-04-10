const path = require('path')
const excelAsJson = require('excel-as-json').processFile

module.exports = class excelData {
  constructor(filePath, refKeys) {
    const missingMsg = 'excel file path not specified'
    if (!filePath) throw new Error(missingMsg)
    this.filePath = path.resolve(filePath)
    if (!refKeys) throw new Error('refKeys not specified')
    this.refKeys = refKeys
    this.sheetNames = Object.keys(this.refKeys)
    this.datasets = this.sheetNames.reduce((_datasets, key) => {
      _datasets[key] = undefined
      return _datasets
    }, {})
  }

  async getData(key) {
    try {
      if (!key) {
        await this._hydrate()
        return JSON.parse(JSON.stringify(this.datasets))
      } else if (this._isValidKey(key)) {
        await this._hydrate(key)
        return JSON.parse(JSON.stringify(this.datasets[key]))
      } else {
        throw new Error('invalid sheet lookup')
      }
    } catch (error) {
      throw error
    }
  }

  _isValidKey(key) {
    const someFn = sheetName => sheetName === key
    return this.sheetNames.some(someFn)
  }

  _parseWorkSheet({filePath, sheetIndex}) {
    return new Promise((resolve, reject) => {
      const opt = {sheet: sheetIndex}
      excelAsJson(filePath, undefined, opt, (error, data) => {
        if (error) reject(error)
        else resolve(data)
      })
    })
  }

  async _hydrate(key) {
    try {
      if (!key) {
        const mapFn = key => {
          const filePath = this.filePath
          const sheetIndex = this.refKeys[key].toString()
          return this._parseWorkSheet({filePath, sheetIndex})
        }
        const datasets = await Promise.all(this.sheetNames.map(mapFn))
        this.sheetNames.forEach(sheetName => {
          const index = this.refKeys[sheetName] - 1
          this.datasets[sheetName] = datasets[index]
        })
      } else if (this._isValidKey(key)) {
        this.datasets[key] = await this._parseWorkSheet({
          filePath: this.filePath,
          sheetIndex: this.refKeys[key].toString(),
        })
      } else {
        throw new Error('invalid sheet lookup')
      }
    } catch (error) {
      throw error
    }
  }
}
