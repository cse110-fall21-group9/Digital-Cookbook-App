/**
 * @module main
 * @author import pandas: cse110-fall21-group9
 * @description This file is the entry point of our app and defines a fake server that contains a Node.js environment. Node.js modules, the electron API (windowing methods, etc.) and message handlers live here.
 */

// Modules to control application life and create native browser window
const {app, BrowserWindow, dialog, ipcMain} = require('electron');
const path = require('path');
const IOSystem = require('./IOSystem');
const {v4: uuidv4} = require('uuid');

// directory with recipes
const RECIPES_DIR = path.join(__dirname, '../recipes/');
// directory with *recipe images*, NOT app images
const IMAGES_DIR = path.join(__dirname, '../recipes/images/');
// const indexDir = path.join(__dirname, '../../'); // directory with index.html

/**
 * Strip the spaces from a given string
 * @param {string} name a string to strip the spaces from
 * @returns the stripped string
 */
function strStrip(name) {
  return name.replace(/\s/g, '');
}

/**
 * Initializes the Window.
 */
function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    icon: '../images/panda.ico',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile('index.html');

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  cacheRecipesFromDisk();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

/**
 * Loads all of the json files in the "./assets/recipes" folder
 * into our data structures
 */
function cacheRecipesFromDisk() {
  // READ: retrieve all entries from disk complete
  const readDict = IOSystem.scanFiles(RECIPES_DIR);

  for (const fileObj of readDict) {
    const filePath = fileObj.path;
    const fileData = fileObj.data;
    const fileAsJSON = JSON.parse(fileData);

    IOSystem.indexRecipe(fileAsJSON.recipe_id, fileAsJSON);
    IOSystem.indexFile(fileAsJSON.recipe_id, filePath);
  }
  console.log(`Backend Dictionary Databases:`);
  console.log(IOSystem.recipesDict);
  console.log(IOSystem.filesDict);
}
ipcMain.on('LOAD', (event) => {
  event.returnValue(IOSystem.recipesDict);
});

/**
 * Add recipe
 * If error occur 'FAILED' will be returned.
 * If success "SUCCESS" will be returned.
 */
ipcMain.on('ADD', (event, recipeData, recipeId) => {
  try {
    IOSystem.dumpJSON(recipeData, RECIPES_DIR, `${recipeId}.json`);
    // index or update the recipe in our backend dictionary.
    IOSystem.indexRecipe(recipeId, recipeData);

    event.returnValue = 'SUCCESS';
  } catch (err) {
    console.error(err);
    event.returnValue = `FAILED: ${err}`;
  }
});

/**
 * Write an image to a specified file in our app directory
 * If error occur 'FAILED' will be returned.
 * If success "SUCCESS" will be returned.
 */
ipcMain.on('COPY_IMAGE', (event, imgPath, imgName) => {
  try {
    IOSystem.copyFile(imgPath, IMAGES_DIR, imgName);
    event.returnValue = 'SUCCESS';
  } catch (err) {
    console.error(err);
    event.returnValue = `FAILED: ${err}`;
  }
});

/**
 * Delete recipe
 * If error occur 'FAILED' will be returned.
 *  If success "SUCCESS" will be returned.
 */
ipcMain.on('DELETE', (event, recipeId) => {
  try {
    // NOTE: Depending on whether we make the file names the recipe name
    // or the uuid, this statement might need to be changed.
    IOSystem.eraseFileAt(RECIPES_DIR, `${recipeId}.json`);

    // also delete the corresponding image.
    /*
    let imgName = path.basename(IOSystem.recipesDict[recipeId].image);
    let imgPath = path.join(__dirname, IMAGES_DIR);
    IOSystem.eraseFileAt(`${imgPath}${imgName}`);
    */

    // de-index the recipe from our dictionary in the backend.
    IOSystem.deIndexFile(recipeId);
    IOSystem.deIndexRecipe(recipeId);

    event.returnValue = 'SUCCESS';
  } catch (err) {
    event.returnValue = `FAILED: ${err}`;
  }
});

/**
 * Used for acquiring a recipe directly from disk.
 * Generally, this one probably should be avoided if possible.
 */
ipcMain.on('ACQUIRE', (event, recipeId) => {
  let fileDir = RECIPES_DIR + `${recipeId}.json`;
  event.returnValue = require(fileDir);
});

/**
 * Acquire the dictionary of recipes from the backend.
 */
ipcMain.on('CACHE_DICT', (event) => {
  event.returnValue = IOSystem.recipesDict;
});

/**
 * Zip an array of recipe data JSON objects into an rc package and dump to disk at specified location.
 */
ipcMain.on('RC_PACK', (event, recipeArray, filePath) => {
  try {
    IOSystem.zipRCPackage(recipeArray, filePath);
    event.returnValue = 'SUCCESS';
  } catch (err) {
    event.returnValue = `FAILED: ${err}`;
  }
});

/**
 * Unzip the RC Package at the specified dir into an array of JSON objects.
 */
ipcMain.on('RC_UNPACK', (event, filePath) => {
  try {
    let recipeArray = IOSystem.unzipRCPackage(filePath);
    event.returnValue = recipeArray;
  } catch (err) {
    event.returnValue = `FAILED: ${err}`;
  }
});

/**
 * Unzip the RC Package at the specified dir into an array of JSON objects.
 */
ipcMain.on('SAVE_DIALOG', (event) => {
  try {
    let path = dialog.showSaveDialogSync(null);
    event.returnValue = path;
  } catch (err) {
    event.returnValue = `FAILED: ${err}`;
  }
});

/**
 * Generate a new uuidv4 on-demand.
 * This one should ONLY be called when a *new* recipe card is created.
 */
ipcMain.on('MAKE_ID', (event) => {
  event.returnValue = uuidv4();
});
