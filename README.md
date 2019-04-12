# Product Catalog Website Content Generator

> command-line utilities to scaffold markdown contents and assets for [product catalog website](https://github.com/juniorCitizen/gentry-way) projects

## USAGE

> the following commands are available after the repo is cloned locally

```bash
# install as global npm package
npm install -g ./

# clear out generated contents to start over
node ./bin/index reset
contentGenerator reset # when installed as a global package

# copy image assets from specified location to working directory
node ./bin/index import images "directory"
contentGenerator import images "directory" # when installed as a global package

# copy user data file from specified location to working directory
node ./bin/index import data "filePath"
contentGenerator import data "filePath" # when installed as a global package

# deploy or upload image assets according to the specified CMS system
node ./bin/index deploy [netlifyCms|storyblok]
contentGenerator deploy [netlifyCms|storyblok] # when installed as a global package

# markdown content generation
node ./bin/index generate
contentGenerator generate # when installed as a global package

# scaffold the generated content to a local website project repo according to the specified CMS system
node ./bin/index scaffold [netlifyCms|storyblok] "directory"
contentGenerator scaffold [netlifyCms|storyblok] "directory" # when installed as a global package
```

## DETAILS

### **Reset project folders**

```bash
# clear out generated contents to start over
node ./bin/index reset
contentGenerator reset # when installed as a global package
```

- execution requires a yes/no confirmation
- './assets/' and './static/' folders are deleted

### **Import image assets**

```bash
# copy image assets from specified location to working directory
node ./bin/index import images "directory"
contentGenerator import images "directory" # when installed as a global package
```

- create a _working folder_ at "./assets/", or empty it if already existed
- copy everything from under the specified directory to "./assets/images/"
  > **note**: _each folder under the source image asset directory should be named after a product slug, and holding only image assets of this product_

### **Import user data file**

```bash
# copy user data file from specified location to working director
node ./bin/index import data "filePath"
contentGenerator import data "filePath" # when installed as a global package
```

- copy the file specified by the _filePath_ to "./assets/", and rename it to "userData.xlsx"
  > _"userData.xlsx" is an excel file that holds the initial product catalog data to be scaffold, e.g. "cateogry", "series", "product", etc..._

### **Image asset deployment**

> deploys image assets to one the specified CMS system

#### _(a) NetlifyCMS running from a Github repo_

```bash
# deploy or upload image assets according to NetlifyCMS specification
node ./bin/index cms netlifyCms
contentGenerator cms netlifyCms # when installed as a global package
```

- image assets and user data must be imported before execution
- files are copied to "./static/images/" (see **note**), and a manifest is generated listing file mapping information of each image asset
  > **note**: _media_folder is assumed to be "static/images" and public_folder is set to "/images". This info is included in the generated "./assets/manifests/images.json" and will be used in the final content generation phase. This is currently hardcoded into the generator, to change this behavior, either modify "./lib/imageUploaders/netlifyCms.js", or do a mass search and replace on the generated images.json manifest file_

#### _(b) using Storyblok space as asset storage_

```bash
# deploy or upload image assets to a Storyblok space
node ./bin/index cms storyblok
contentGenerator cms storyblok # when installed as a global package
```

- image assets and user data must be imported before execution
- a Storyblok account is required, update the .env file with the account credentials accordingly (.env.example is an empty template)
- the upload concurrency rate is hard-coded. While Storyblok client library has failure retry mechanism, if 429 status is preventing the script from completion. Reduce the concurrency rate to 3 maximum
- _image assets are hard-coded to:_

  1. _converted to png format_
  2. _resized into a medium sized image and a smaller thumbnail image_
  3. _transparency are preserved as much as possible_

> _"images.json" is generated under "./assets/manifests/" after deployment, which contains a list of images related mapping information to be used during content generation phase_

### **Product catalog website content generation**

```bash
# markdown content generation
node ./bin/index generate
contentGenerator generate # when installed as a global package
```

1. before script execution, be sure to have completed the following:

   (a) import image assets

   (b) import user data

   (c) deployed image assets according to the CMS system being used

2. following markdown files are generated under "./assets/content/":

   (a) catalog (./assets/content/catalog.md)

   (b) all categories (./assets/content/categories/[*category slug*].md)

   (c) all series (./assets/content/series/[*series slug*].md)

   (d) all products (./assets/content/products/[*product slug*].md)

   (e) home page data (./assets/content/home.md)

   (f) privacy page data (./assets/content/privacy.md)

3. following manifests are generated under "./assets/manifests/"

   (a) a listing of category .md file names in the 'categories.json' file

   (b) a listing of series .md file names in the 'series.json' file

   (c) a listing of product .md file names in the 'product.json' file

   (d) a listing of all merchandise (categories, series and products) .md file names and types are listed as an array of objects in the 'content.json' file

### **Scaffolding a website project by copying product catalog contents**

```bash
# scaffold the generated content to a local website project repo according to the specified CMS system
node ./bin/index scaffold [netlifyCms|storyblok] "directory"
contentGenerator scaffold [netlifyCms|storyblok] "directory" # when installed as a global package
```

- contents of "**./assets/content/**" are copied to "**./assets/content/**" of the designated project directory
- if "netlifyCms" is the specified CMS system, contents of "**./static/images**" are copied to "**./static/images/**" of the designated project directory
- or, the generated content can be edited manually and copied to appropriate locations required to be used in other markdown content consuming projects
  > test the contents in development locally before committing to a remote deployed repo
