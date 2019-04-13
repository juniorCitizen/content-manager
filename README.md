# Product Catalog Project Website Content Generator (content-generator)

Command-line utilities to scaffold markdown contents and image assets for [product catalog website](https://github.com/juniorCitizen/gentry-way) projects.

## Installation

```bash
# CLONE THE PROJECT FILES
clone https://github.com/juniorCitizen/content-generator.git

# INSTALL AS A GLOBAL PACKAGE
npm install -g ./

# GENERATE A .env FILE FROM EXAMPLE
cp ./.env.example ./.env
```

**!!! BEFORE PROCEEDING FURTHER !!!**

This project uses [dotenv-safe](https://www.npmjs.com/package/dotenv-safe) to hydrate environment variables, which requires the .env file has the same elements as the .env.example file. Remove the Storyblok credential related items if not used before proceeding.

## Usage

```bash
# PROJECT RESET (REMOVE ALL GENERATED CONTENTS)
node ./bin/index reset
contentGenerator reset # globally installed package

# IMPORT WORKING COPIES OF IMAGE ASSETS
node ./bin/index import images "source directory"
contentGenerator import images "source directory" # globally installed package

# IMPORT START-UP CATALOG DATA FILE
node ./bin/index import data "source filePath"
contentGenerator import data "source filePath" # globally installed package

# IMPORT NETLIFY CMS CONFIGURATION FILE
node ./bin/index import netlifyCmsConfig "projectRootPath"
contentGenerator import netlifyCmsConfig "projectRootPath" # globally installed package

# DEPLOY IMAGE ASSETS TO A SPECIFIED CMS SYSTEM
node ./bin/index deploy [netlifyCms|storyblok]
contentGenerator deploy [netlifyCms|storyblok] # globally installed package

# MARKDOWN CONTENT FILES GENERATION
node ./bin/index generate
contentGenerator generate # globally installed package

# SCAFFOLD THE GENERATED CONTENTS TO A LOCAL PROJECT REPO
node ./bin/index scaffold [netlifyCms|storyblok] "projectRootPath"
contentGenerator scaffold [netlifyCms|storyblok] "projectRootPath" # globally installed package
```

## License

GNU V3
