// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron');
const path = require('path');
const IOSystem = require('./IOSystem');
const { ipcMain } = require('electron');

// directory with recipes
const RECIPES_DIR = path.join(__dirname, '../recipes/');
// directory with *recipe images*, NOT app images
const IMAGES_DIR = path.join(__dirname, '../recipes/images/');
// const indexDir = path.join(__dirname, '../../'); // directory with index.html

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

    app.on('activate', function() {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });

    cacheRecipesFromDisk();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function() {
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

        IOSystem.indexRecipe(fileAsJSON.name, fileAsJSON);
        IOSystem.indexFile(fileAsJSON.name, filePath);
    }
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

ipcMain.on('ADD', (event, recipeData, recipeName) => {
    try {
        IOSystem.dumpJSON(recipeData, RECIPES_DIR, `${recipeName}.json`);
        IOSystem.indexRecipe(recipeName, recipeData);
        event.returnValue = 'SUCCESS';
    } catch (err) {
        console.error(err);
        event.returnValue = 'FAILED';
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
        event.returnValue = 'FAILED';
    }
});

/**
 * Delete recipe
 * If error occur 'FAILED' will be returned.
 *  If success "SUCCESS" will be returned.
 */
ipcMain.on('DELETE', (event, recipeName) => {
    try {
        IOSystem.eraseFileAt(RECIPES_DIR, `${recipeName}.json`);
        delete IOSystem.recipesDict[recipeName];
        event.returnValue = 'SUCCESS';
    } catch (err) {
        event.returnValue = 'FAILED';
    }
});

ipcMain.on('ACQUIRE', (event, recipeName) => {
    let fileDir = RECIPES_DIR + `${recipeName}.json`;
    event.returnValue = require(fileDir);
});

/**
 * Acquire the dictionary of recipes
 */
ipcMain.on('CACHEDICT', (event) => {
    event.returnValue = IOSystem.recipesDict;
});