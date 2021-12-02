let frontEndRecipeDict = {};

/**
 * Strip the spaces from a given string
 * @param {string} name a string to strip the spaces from
 * @returns the stripped string
 */
function strStrip(name) {
  return name.replace(/\s/g, '');
}

const OPENED_FROM = 'data-opened-from';
const IMAGES_DIR = './assets/recipes/images/'; // the directory for RECIPE IMAGES
const CARD_CONTAINER_SELECTOR = 'article.recipe-cards';
const RECIPE_FORM_ID = 'add-recipe';

window.addEventListener('DOMContentLoaded', () => {
  frontEndRecipeDict = window.electron.acquireRecipesDictionary();
  console.log(frontEndRecipeDict);
  Object.entries(frontEndRecipeDict).forEach(([key, val]) => {
    createRecipeCard(val);
  });
});

// Save button for add new recipe
let addButton = document.getElementById('add');
addButton.addEventListener('click', () => {
  document.getElementById(RECIPE_FORM_ID).classList.remove('hidden');
  document.getElementById(RECIPE_FORM_ID).style.display = 'grid';

  // tell the form that it was opened from the "add-recipe" button
  document.getElementById(RECIPE_FORM_ID)[OPENED_FROM] = '';
  console.log(document.getElementById(RECIPE_FORM_ID).classList);
  clearData();
});

// Close the add function
let close = document.getElementById('close');
close.addEventListener('click', () => {
  document.getElementById(RECIPE_FORM_ID).classList.add('hidden');
  document.getElementById(RECIPE_FORM_ID).style.display = 'none';
  console.log(document.getElementById(RECIPE_FORM_ID).classList);
});

// Create JSON file when click "Save"
let save = document.getElementById('save');
save.addEventListener('click', () => {
  // Collapse the window
  document.getElementById(RECIPE_FORM_ID).classList.add('hidden');
  document.getElementById(RECIPE_FORM_ID).style.display = 'none';
  console.log(document.getElementById(RECIPE_FORM_ID).classList);

  let recipeName = strStrip(document.getElementById('recipe-name').value);
  let oldRecipeName = document.getElementById(RECIPE_FORM_ID)[OPENED_FROM];

  //Save image
  let imageInput = document.getElementById('file');
  let imageFile = imageInput.files[0];
  console.log(imageFile);
  if (imageFile) {
    window.electron.saveImage(imageFile.path, imageFile.name);
  }
  if (oldRecipeName != '') {
    //check if opened from edit
    const parent = document.querySelector(CARD_CONTAINER_SELECTOR);
    let oldCard = document.querySelector(`recipe-card[class=${oldRecipeName}]`);
    parent.removeChild(oldCard);
    if (recipeName != oldRecipeName) {
      console.log(oldRecipeName);
      let status = window.electron.removeRecipe(oldRecipeName);
      console.log(status);
    }
  }

  let json = createJSON();
  createRecipeCard(json);

  // add to front-end copy of dictionary
  frontEndRecipeDict[json.name] = json;

  // Save file to local storage
  recipeName = strStrip(json['name']);
  let file = `${recipeName}.json`;
  let status = window.electron.addRecipe(json, recipeName);
  console.log(status);
});

/**
 * Make a new `recipe-card` and prepend it to the list of cards in the front end
 * @param {object} data as JSON
 */
function createRecipeCard(data) {
  const recipeCard = document.createElement('recipe-card');
  recipeCard.classList.add(strStrip(data.name));

  // FIXME: newly-added recipe cards seem to be unable to access images that were just saved.
  recipeCard.data = data;
  document.querySelector('.recipe-cards').appendChild(recipeCard);
}

/**
 * Create a new JSON file on the data user enter
 */
function createJSON() {
  const titleText = document.getElementById('recipe-name').value;

  let today = new Date();
  let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
  let tag = 'Gluten Free';
  let imgURL = '.png';
  if (document.getElementById('output').src !== undefined) {
    let imageInput = document.getElementById('file');
    let imageFile = imageInput.files[0];
    if (imageFile) {
      imgURL = IMAGES_DIR + imageFile.name;
    } else {
      imgURL = './assets/images/default-image.jpg';
    }
  }

  let ingredients = document.getElementById('ingredients').value.split('\n');
  let instruction = document.getElementById('instructions').value.split('\n');
  let cookTime = document.getElementById('time-cook').value;
  let timePrep = document.getElementById('time-prep').value;
  let serving = document.getElementById('serving').value;

  let newRecipe = {
    recipe_id: 12313,
    name: titleText,
    image: imgURL,
    metadata: {
      time_added: date,
      labels: tag,
      src_url: '#',
    },
    metrics: {
      cook_time: cookTime, // minutes
      prep_time: timePrep, // minutes
      servings: serving,
    },
    ingredients: ingredients,
    steps: instruction,
  };
  return newRecipe;
}

//let imageInput = document.querySelector('input#file[type="file"][name="image]');
const img = document.getElementById('output');
img.addEventListener('error', function (event) {
  event.target.src = './assets/images/default-image.jpg';
  event.onerror = null;
});

let imageInput = document.getElementById('file');
console.log(imageInput);
imageInput.addEventListener('change', (event) => {
  let image = document.getElementById('output');
  let imageFile = imageInput.files[0];

  // reference to this image for this session is only used to display the image preview
  image.src = URL.createObjectURL(imageInput.files[0]);

  // write image to local dir that we know the location of.
  // this write operation should happen RIGHT AFTER clicking the save recipe button and RIGHT BEFORE writing the JSON to disk
  console.log(imageFile.path);
});

function clearData() {
  if (document.getElementById('recipe-name') == null) {
    return;
  }
  document.getElementById('recipe-name').value = '';
  document.getElementById('ingredients').value = '';
  document.getElementById('instructions').value = '';
  document.getElementById('time-cook').value = '';
  document.getElementById('time-prep').value = '';
  document.getElementById('serving').value = '';
  document.getElementById('output').src = '';
}
