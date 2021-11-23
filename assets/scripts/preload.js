
const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');
const recipesDir = path.join(__dirname, '../recipes/');

const IOSystem = require('./IOSystem');

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
  // init();
});

/**
 * initializes all event handlers & preprocesses all data
 */
function init() {
  // load all of the json files in the "./assets/recipes" folder
  // into our data structures
  // and index them into the HTML header
  cacheRecipesFromDisk();
}

/**
 * Loads all of the json files in the "./assets/recipes" folder
 * into our data structures
 */
function cacheRecipesFromDisk() {

  // READ: retrieve all entries from disk complete
  const readDict = IOSystem.scanFiles(recipesDir);
  for (const fileObj of readDict) {
    const filePath = fileObj.path;
    const fileData = fileObj.data;
    console.log(fileData);

    const fileAsJSON = JSON.parse(fileData);

    IOSystem.indexRecipe(fileAsJSON.name, fileAsJSON);
    IOSystem.indexFile(fileAsJSON.name, filePath);
  }
  console.log(IOSystem.recipesDict);
  console.log(IOSystem.filesDict);
}


