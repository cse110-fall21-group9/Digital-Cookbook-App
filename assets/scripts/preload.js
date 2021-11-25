const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('electron', {
  addRecipe: (recipeData, recipeName) => ipcRenderer.sendSync('ADD', recipeData, recipeName),
});
