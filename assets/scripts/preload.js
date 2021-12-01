const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // MUST USE SENDSYNC
  addRecipe: (recipeData, recipeName) => ipcRenderer.sendSync('ADD', recipeData, recipeName),
  saveImage: (imgPath, imgName) => ipcRenderer.sendSync('COPY_IMAGE', imgPath, imgName),
  removeRecipe: (recipeName) => ipcRenderer.sendSync('DELETE', recipeName),
  acquireRecipe: (recipeName) => ipcRenderer.sendSync('ACQUIRE', recipeName),
  acquireRecipesDictionary: () => ipcRenderer.sendSync('CACHEDICT'),
});
