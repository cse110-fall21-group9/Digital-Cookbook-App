const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');

const UTF8 = 'utf8'; // for encoding & decoding text to/from Blob types
const BINARY = 'base64'; // for encoding & decoding binary data to/from Blob types (e.g. images)
const JSON_EXT_LEN = 5;

/**
 * The IOSystem class provides the data structures & methods for
 * reading and writing JSON files to the disk, as well as caching
 * recipe information at runtime.
 * @member recipesDict a dictionary that maps recipe names to their JSON data.
 * @member filesDict a dictionary that maps recipe names to their file paths.
 * @method indexRecipe indexes recipes by name & maps them to JSON data.
 * @method indexFile indexes recipes by name & maps them to file locations.
 * @method scanFiles scans a dir for files and returns a list of objects containing the files' data.
 * @method dumpJSON takes a JS object and a file path, and writes it to that file path.
 * @method eraseFileAt takes a file path and erases the file found there. Dangerous; use with safety checks.
 * @method makeRCPackage takes a list of JS objects and packs them into a `.rcpkg` file.
 * @author @Lord-Scrubington-II
 */
class IOSystem {
  static recipesDict = {};
  static filesDict = {};

  /**
   * Adds an entry to the recipesDict that maps
   * recipe names to JSON data.
   * @param {string} name name of recipe.
   * @param {object} data JSON data backing the recipe.
   */
  static indexRecipe(name, data) {
    // REMARKS: after some reconsideration it is probably better to map a uuid to the JSON data.
    // however, we can just check for file existence for now.
    // Note that this is fairly expensive as filesystem calls are rather slow.
    this.recipesDict[name] = data;
  }

  /**
   * Adds an entry to the filesDict that maps recipe names to file paths.
   * @param {string} name name of recipe.
   * @param {string} filePath path to recipe JSON on disk.
   */
  static indexFile(name, filePath) {
    this.filesDict[name] = filePath;
  }

  /**
   * Removes an entry from the recipesDict that maps
   * recipe names to JSON data.
   * @param {string} name name of recipe.
   */
  static deIndexRecipe(name) {
    Reflect.deleteProperty(this.recipesDict, name);
  }

  /**
   * Removes an entry from the filesDict that maps
   * recipe names to filePaths.
   * @param {string} name name of recipe.
   */
  static deIndexFile(name) {
    Reflect.deleteProperty(this.filesDict, name);
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
      throw `"${dir}" is not a valid directory format!`;
    }
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
  static zipRCPackage(recipes, dir, fileName) {
    let toDump = {
      recipeArray: recipes,
    };

    // .rcpkg files are really JSON with a single array inside.
    dumpJSON(toDump, dir, fileName + '.rcpkg');
  }

  /**
   * Given a filepath to a .rcpkg file, unpack the JSON and turn it into an array of objects.
   * @param {string} dir the directory with the .rcpkg file.
   * @param {string} fileName name of the .rcpkg file (including the extension).
   * @returns {object[]} an object array with the recipe JSON objects inside.
   */
  static unzipRCPackage(dir, fileName) {
    let recArray = [];

    // confirm that the file has the right extension
    const fileNameExt = fileName
      .substring(fileName.length - JSON_EXT_LEN, fileName.length)
      .toLowerCase();
    if (fileNameExt === '.rcpkg') {
      let filePath = `${dir}${fileName}`;

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
   * Converts a string-encoded binary into an image and then write it to disk at
   * the specified location.
   * @param {string} jString The string to convert into an image.
   */
  static decodeStringToImage(jString, dir, imageName) {}

  /**
   * Unpacks a JSON file into a JS object.
   * TODO: may be unnecessary if we do not get JSON files directly from users.
   * @param {File} fileHandle the File to unpack.
   * @returns {object} the unpacked JS object.
   */
  static unpackJSON(fileHandle) {
    if (!fileHandle) {
      throw new Error(`This file handle is null!`);
    }

    // const fileAsString = encodeFileToString(fileHandle);
    // let fileAsObject = JSON.parse(fileAsString);

    return fileAsObject;
  }

  /**
   * Converts a Node Buffer into a JS Blob.
   * Facilitates insertion into JSON.
   * TODO: Might be unnecessary if no buffers are ever requested directly.
   * @param {Buffer} theBuffer the buffer to convert to a Blob
   */
  static bufferToJSBlob(theBuffer) {
    // convert buffer to JSON
    return theBuffer.toString('base64');
  }
}

module.exports = IOSystem;
