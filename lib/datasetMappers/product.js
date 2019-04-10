module.exports = featureDataset => {
  return productDataEntry => {
    const {model} = productDataEntry
    productDataEntry.features = featureDataset
      .filter(featureDataEntry => featureDataEntry.model === model)
      .map(featureDataEntry => featureDataEntry.feature)
    return productDataEntry
  }
}
