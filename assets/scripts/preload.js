const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // MUST USE SENDSYNC
  addRecipe: (recipeData, recipeName) => ipcRenderer.sendSync('ADD', recipeData, recipeName),
  removeRecipe: (recipeName) => ipcRenderer.sendSync('DELETE', recipeName),
  acquireRecipe: (recipeName) => ipcRenderer.sendSync('ACQUIRE', recipeName),
  acquireRecipesDictionary: () => ipcRenderer.sendSync('CACHEDICT'),
});
