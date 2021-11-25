const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('electron', {
  addRecipe: (recipeData, recipeName) => ipcRenderer.sendSync('ADD', recipeData, recipeName),
  removeRecipe: (recipeName) => ipcRenderer.sendSync('DELETE', recipeName),
});
