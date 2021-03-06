/**
 * @module IOSystem
 * @author Zane Wang @Lord-Scrubington-II
 */
const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');

const UTF8 = 'utf8'; // for encoding & decoding text to/from Blob types
const BINARY = 'base64'; // for encoding & decoding binary data to/from Blob types (e.g. images)
const JSON_EXT_LEN = 5;

/**
 * @class IOSystem
 * @classdesc The IOSystem class provides the data structures & methods for reading and writing JSON files to the disk, as well as caching recipe information at runtime.
 */
class IOSystem {
  static recipesDict = {};
  static filesDict = {};

  /**
   * Adds an entry to the recipesDict that maps
   * recipe IDs to JSON data.
   * @param {string} id id of recipe.
   * @param {object} data JSON data backing the recipe.
   */
  static indexRecipe(id, data) {
    this.recipesDict[id] = data;
  }

  /**
   * Adds an entry to the filesDict that maps recipe IDs to file paths.
   * @param {string} id id of recipe.
   * @param {string} filePath path to recipe JSON on disk.
   */
  static indexFile(id, filePath) {
    this.filesDict[id] = filePath;
  }

  /**
   * Removes an entry from the recipesDict that maps
   * recipe IDs to JSON data.
   * @param {string} id id of recipe.
   */
  static deIndexRecipe(id) {
    Reflect.deleteProperty(this.recipesDict, id);
  }

  /**
   * Removes an entry from the filesDict that maps
   * recipe IDs to filePaths.
   * @param {string} id id of recipe.
   */
  static deIndexFile(id) {
    Reflect.deleteProperty(this.filesDict, id);
  }

  /**
   * Is this filepath valid on this system?
   * @param {string} dir the path to check
   * @returns {boolean} true if the format is valid, false if not.
   */
  static pathFormatValid(dir) {
    if ((dir.charAt(dir.length - 1) != '/' && dir.charAt(dir.length - 1) != '\\') || !dir) {
      return false;
    }
    return true;
  }

  /**
   * Scans the files in a directory and returns a list
   * containing the file data retrieved. To be called once on startup.
   * Performs READ.
   * @param {string} dir The directory to scan.
   * @returns {object[]} a list of objects of the following form: {path: (string), data: (string)}.
   */
  static scanFiles(dir) {
    if (!this.pathFormatValid(dir)) {
      throw new Error(`"${dir}" is not a valid directory format!`);
    }

    let fileNames = fs.readdirSync(dir);
    let files = [];

    for (let fileName of fileNames) {
      // we need to ensure that the file extension is ".json" here
      const fileNameExt = fileName
        .substring(fileName.length - JSON_EXT_LEN, fileName.length)
        .toLowerCase();
      if (fileNameExt === '.json') {
        let thisFilePath = `${dir}${fileName}`;

        // get file handle from file path
        try {
          let thisFile = fs.readFileSync(thisFilePath, {encoding: UTF8});
          // let thisFile = fsPromises.readFile(thisFilePath, {encoding: BLOB_TO_STRING_ENCODING});
          files.push({path: thisFilePath, data: thisFile});
        } catch (error) {
          throw new Error('This file path does not exist or is not available.');
        }
      }
    }
    console.log(`All files from ${dir} have been read by the IOSystem and returned.`);
    return files;
  }

  /**
   * Given a pointer to a JS object and a directory path,
   * pack the object into a JSON file and dump it to the disk.
   * Performs CREATE and UPDATE.
   * @param {object} data the JS object to pack.
   * @param {string} dir the dir to dump the JSON file into.
   * @param {string} fileName the name of the file to dump.
   */
  static dumpJSON(data, dir, fileName) {
    // TESTME:
    /**
     * 1. Ensure that directory creation is working
     * 2. Ensure that the JSON dumped is correct
     */
    // Basic tests passed
    if (!this.pathFormatValid(dir) || !data || !fileName) {
      throw new Error(`"${dir}" is not a valid directory format!`);
    }
    console.log(`Name of file to dump: ${fileName}`);
    if (!fs.existsSync(dir)) {
      // does the directory exist?
      fs.mkdirSync(dir);
    }
    const location = `${dir}${fileName}`;
    const dataAsString = JSON.stringify(data);
    fs.writeFile(location, dataAsString, {encoding: UTF8}, () => {
      console.log(`JSON file written to ${location}.`);
    });
  }

  /**
   * Given a file path, copy the resident file into a dir that is "owned" by our app.
   * and write it to the disk.
   * @param {File} origin the File or Blob to pack.
   * @param {string} dir the dir to dump the file into.
   * @param {string} fileName the name of the file to dump.
   */
  static copyFile(origin, dir, fileName) {
    if (!this.pathFormatValid(dir) || !origin || !fileName) {
      throw `"${dir}" is not a valid directory format!`;
    }
    if (!fs.existsSync(dir)) {
      // does the directory exist?
      fs.mkdirSync(dir);
    }
    const destination = `${dir}${fileName}`;
    fs.copyFileSync(origin, destination);
    console.log(`File copied to ${destination} from ${origin} with name ${fileName}.`);
  }

  /**
   * Erases the file found at the given file path.
   * Possibly dangerous; use with safety checks.
   * Performs DELETE.
   * @param {string} dir the directory containing to the file to delete.
   * @param {string} fileName the name of the file to delete.
   */
  static eraseFileAt(dir, fileName) {
    // TESTME:
    /**
     * 1. Ensure that deleting a dummy file works
     * 2. Ensure that the proper errors are thrown by `fs`
     *  when the directory or file does not exist.
     */
    if (!this.pathFormatValid(dir)) {
      throw new Error(`"${dir}" is not a valid directory format!`);
    }
    const location = `${dir}${fileName}`;
    fs.unlink(location, (error) => {
      if (error) throw error;
      console.log(`File at ${location} was deleted successfully.`);
    });
  }

  /**
   * Given a list of recipe JSON data & a disk location, pack them into JSON & dump it to the disk.
   * @param {object[]} recipes the recipes to pack.
   * @param {string} dir directory to zip the .rcpkg file into.
   * @param {string} fileName name of the .rcpkg file *WITHOUT THE EXTENSION!*
   */
  static zipRCPackage(recipes, filePath) {
    // TESTME: check for the existence of the file after the async op has been completed
    let toDump = {
      recipeArray: recipes,
    };
    const fileName = path.basename(filePath);
    const dir = path.dirname(filePath) + '/';
    console.log(`BE: ${filePath}`);
    // .rcpkg files are really JSON with a single array inside.
    this.dumpJSON(toDump, dir, fileName + '.rcpkg');
  }

  /**
   * Given a filepath to a .rcpkg file, unpack the JSON and turn it into an array of objects.
   * @param {string} dir the directory with the .rcpkg file.
   * @param {string} fileName name of the .rcpkg file (including the extension).
   * @returns {object[]} an object array with the recipe JSON objects inside.
   */
  static unzipRCPackage(filePath) {
    // TESTME: ensure that:
    // 1. The JSON object has the correct array of items in it
    // 2. The files with the wrong extension are rejected
    // 3. No other items are in the JSON object
    let recArray = [];
    const fileName = path.basename(filePath);
    const dir = path.dirname(filePath) + '/';

    // confirm that the file has the right extension
    const fileNameExt = path.extname(fileName);
    if (fileNameExt === '.rcpkg') {
      let filePath = `${dir}${fileName}`;
      console.log(`Importing from ${filePath}`);

      // get file handle from file path
      try {
        // read into JSON object
        let rcJSONAsString = fs.readFileSync(filePath, {encoding: UTF8});
        let rcJSON = JSON.parse(rcJSONAsString);

        // extract the array of recipes
        recArray = rcJSON.recipeArray;
      } catch (error) {
        throw new Error('This file path does not exist or is not available.');
      }
    } else {
      console.error(`This file (named ${fileName}) is not a .rcpkg file!`);
    }

    return recArray;
  }

  // UNFINISHED METHODS:

  /**
   * Reads & converts a File's contents into a string.
   * Can be used for converting images & other Blob types into a JSON-compatible format.
   * @param {File} file the file to convert into a string.
   * @returns {string} the file's contents as a string.
   */
  static encodeFileToString(file) {
    const filePath = file.path;
    let str = fs.readFileSync(filePath, {encoding: UTF8});
    return str;
  }

  /**
   * Converts a string-encoded binary into an image by decoding using base64
   * and then write it to disk at the specified location.
   * @param {string} jString The string to convert into an image.
   */
  static decodeStringToImage(jString, dir, imageName) {}
}

module.exports = IOSystem;
