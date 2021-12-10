/**
 * @module preload
 * @description This file is used to expose ipcRenderer functions via the context bridge
 * to front-end scripts that live in the DOM.
 * These functions can be used to send messages to main.js via our
 * established transmission protocols.
 */

const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // Add a new lambda expression as a dictionary entry with the appropriate name
  // to provide methods for sending messages from DOM scripts to main.js. MUST USE `sendSync()`!

  /**
   * Write a new recipe data file to the disk.
   * @param {object} recipeData the JSON data of the recipe to add.
   * @param {string} recipeId the id of the recipe to delete.
   * @returns SUCCESS if the addition succeeded, FAILURE if not.
   */
  addRecipe: (recipeData, recipeId) => ipcRenderer.sendSync('ADD', recipeData, recipeId),

  /**
   * Save an image to a subdirectory in our app.
   * @param {string} imgPath the path to the image.
   * @param {string} imgName the name of the image.
   * @returns SUCCESS if the image copy succeeded, FAILURE if not.
   */
  saveImage: (imgPath, imgName) => ipcRenderer.sendSync('COPY_IMAGE', imgPath, imgName),

  /**
   * Delete the data of a recipe from disk, as well as the associated image.
   * @param {string} recipeId the ID of the recipe to delete.
   * @returns SUCCESS if the deletion succeeded, FAILURE if not.
   */
  removeRecipe: (recipeId) => ipcRenderer.sendSync('DELETE', recipeId),

  /**
   * Retrieve the JSON data of a recipe on disk.
   * @param {string} recipeId the ID of the recipe.
   * @returns {string} the JSON data of the recipe on success, FAILURE on failure.
   */
  acquireRecipe: (recipeId) => ipcRenderer.sendSync('ACQUIRE', recipeId),

  /**
   * Retrieve a full copy of our "database," which is the dictionary of recipes in the backend.
   * @returns {object} the backend dictionary on success, FAILURE on failure.
   */
  acquireRecipesDictionary: () => ipcRenderer.sendSync('CACHE_DICT'),

  /**
   * Send an order to the back end requesting that a list of recipes be packed into
   * a `.rcpkg` file.
   * @param {object[]} recipeArray an array of recipe data as JSON.
   * @param {string} path the path to export to.
   */
  export: (recipeArray, path) => {
    ipcRenderer.sendSync('RC_PACK', recipeArray, path);
  },

  /**
   * Send an order to the backend to unpack a `.rcpkg` file into
   * an array of objects.
   * @param {string} path the location of the `.rcpkg` file.
   * @returns {[object]}
   */
  import: (path) => ipcRenderer.sendSync('RC_UNPACK', path),

  /**
   * Request that the file dialogue be shown.
   * @returns SUCCESS if succeeded, FAILURE if not.
   */
  showSaveFileDialog: () => ipcRenderer.sendSync('SAVE_DIALOG'),

  /**
   * Request that the file dialogue be shown.
   * @returns {string} returns the selected path
   */
  showOpenFileDialog: () => ipcRenderer.sendSync('OPEN_DIALOG'),

  /**
   * Request a new uuidv4 from the back end.
   * @returns {string} a new uuidv4 as a string.
   */
  generateNewId: () => ipcRenderer.sendSync('MAKE_ID'),
});
