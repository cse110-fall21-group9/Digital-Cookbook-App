/**
 * File: preload.js
 * This file is used to expose ipcRenderer functions via the context bridge
 * to front-end scripts that live in the DOM.
 * These functions can be used to send messages to main.js via our
 * established transmission protocols.
 */
const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // Add a new lambda expression as a dictionary entry with the appropriate name
  // to provide methods for sending messages from DOM scripts to main.js.
  // MUST USE SENDSYNC
  addRecipe: (recipeData, recipeName) => ipcRenderer.sendSync('ADD', recipeData, recipeName),
  saveImage: (imgPath, imgName) => ipcRenderer.sendSync('COPY_IMAGE', imgPath, imgName),
  removeRecipe: (recipeName) => ipcRenderer.sendSync('DELETE', recipeName),
  acquireRecipe: (recipeName) => ipcRenderer.sendSync('ACQUIRE', recipeName),
  acquireRecipesDictionary: () => ipcRenderer.sendSync('CACHE_DICT'),
  export: (recipeArray, dir, fileNameNoExtension) => {
    ipcRenderer.sendSync('RC_PACK', recipeArray, dir, fileNameNoExtension);
  },
  import: (dir, fileNameWithExtension) => {
    ipcRenderer.sendSync('RC_UNPACK', dir, fileNameWithExtension);
  },
});
