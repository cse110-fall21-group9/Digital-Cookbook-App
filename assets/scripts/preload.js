// This file will be used to preprocess the JSON files
// inside the recipes directory.

/**
 * This file preprocesses all of the available web components
 * and injects them into the document.
 */
import {IOSystem} from './IOSystem';

const fs = require('fs');
const path = require('path');

const recipesDir = path.join(__dirname, '../recipes/');
// const FILE_EXTENSION_LENGTH = 3;


// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
  init();
});

/**
 * initializes all event handlers & preprocesses all data
 */
function init() {
  // load all of the json files in the "./assets/recipes" folder
  // into our data structures
  // and index them into the HTML header
  loadRecipesFromDisk();
}

/**
 * Loads all of the json files in the "./assets/recipes" folder
 * into our data structures
 */
function loadRecipesFromDisk() {
  const fileNames = fs.readdirSync(recipesDir);

  for (const fileName of fileNames) {
    // strip the file extension
    const filePath = `${recipesDir}${fileName}`;
    const fileHandle = fs.readFileSync(filePath);

    // index files into the IOSystem
    const fileContents = IOSystem.unpackJSON(fileHandle);
    IOSystem.indexFile(fileContents, fileHandle);
    IOSystem.indexRecipe(fileContents.name, fileContents);
  }
}


