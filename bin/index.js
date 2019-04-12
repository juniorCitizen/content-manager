#!/usr/bin/env node
const path = require('path')
const fs = require('fs-extra')
const program = require('commander')

const generateContent = require('../lib/actions/generateContent')
const importImages = require('../lib/actions/importImages')
const importUserData = require('../lib/actions/importUserData')
const processImageAssets = require('../lib/actions/processImageAssets')
const reset = require('../lib/actions/reset')

program
  .command('reset')
  .description('remove generated contents')
  .action(() => {
    return reset()
      .then(() => Promise.resolve())
      .catch(error => {
        console.log(error)
      })
  })

program
  .command('import <type> <location>')
  .description('import project data or assets from specified path')
  .action(async (type, location) => {
    try {
      if (type === 'images') {
        await importImages(path.resolve(location))
        console.log('image assets are imported')
      } else if (type === 'data') {
        await importUserData(path.resolve(location))
        console.log('user data is imported')
      } else {
        throw new Error(`"${type}" is not a valid import type`)
      }
    } catch (error) {
      console.log(error)
    }
  })

program
  .command('deploy <cmsSystem>')
  .description('deploy image assets according to the specified CMS system')
  .action(async cmsSystem => {
    try {
      await processImageAssets(cmsSystem)
      console.log(`assets processed for ${cmsSystem}`)
    } catch (error) {
      console.log(error)
    }
  })

program
  .command('generate')
  .description('generate markdown content')
  .action(() =>
    generateContent()
      .then(() => Promise.resolve())
      .catch(error => {
        console.log(error)
      })
  )

program
  .command('scaffold <cmsSystem> <location>')
  .description('scaffolding a website project content')
  .action(async (cmsSystem, location) => {
    try {
      const destBaseDir = path.resolve(location)
      const srcDirs = {
        content: path.resolve('./assets/content'),
        manifest: path.resolve('./assets/manifests'),
        imageAsset: path.resolve('./static/images'),
      }
      const destDirs = {
        content: path.join(destBaseDir, 'assets', 'content'),
        manifest: path.join(destBaseDir, 'assets', 'manifests'),
        imageAsset: path.join(destBaseDir, 'static', 'images'),
      }
      await fs.copy(srcDirs.content, destDirs.content)
      await fs.copy(srcDirs.manifest, destDirs.manifest)
      await fs.remove(path.join(destDirs.manifest, 'images.json'))
      console.log('markdown content and manifest are scaffold')
      if (cmsSystem === 'netlifyCms') {
        await fs.copy(srcDirs.imageAsset, destDirs.imageAsset)
        console.log('NetlifyCMS image assets are scaffold')
      }
    } catch (error) {
      console.log(error)
    }
  })

program.parse(process.argv)
