# Kaelby's Repo for Chouten
## Overview
This is a repository for the Chouten project. [Chouten](https://www.chouten.app) is a mobile and desktop application that allows users to watch content from various sources in one place.
This repo is not affiliated with the Chouten project in any way.
My modules will mainly focus on website used by those who speaks French, but will try to add more modules for other languages in the future.
### File Structure
```bash
├── icons # Icons folder
├── src 
│   ├── modules # Modules folder
│   │   ├── *module-name*
│   │   │   ├── *module-name*.ts
│   ├── shared
│   │   ├── models
│   │   ├── utils
├── tests
│   ├── utils # contains utility functions for testing
│   ├──*module-name*.test.ts # Test file
├── build.ts # Build script
├── tsconfig.json # TypeScript configuration file
├── README.md
├── .gitignore
```
## Usage
### Desktop
You can use the modules on Chouten by following these steps:
1. Open Chouten
2. Go to the repo section of the app (it's a box icon)
3. Click on the "+" button on the top right corner
4. Enter the URL of the repo [https://kaelby30.github.io/chouten-kaelby](https://kaelby30.github.io/chouten-kaelby)
5. Select the modules you want to install
6. Click on the "Install" button
Now you can use the modules you installed in the "Modules" section of the app.

### Mobile
*soon*
## Pre-requisites
- Bun
- Basic knolwedge of JavaScript and TypeScript
- A lot of patience

## Installation and Development
If you want to help me develop more modules and host them on this repo, you can clone this repo and run the following commands:
```bash
git clone https://github.com/kaelby30/chouten-kaelby.git
cd chouten-kaelby
bun install
bun run build # Build the repo to generate the modules
```
## Contributing
If you want to contribute to this project, you can fork this repo and submit a pull request. I will review your changes and merge them if they are good.






