let frontEndRecipeDict = {};

function strStrip(name) {
  return name.replace(/\s/g, '');
}

const OPENED_FROM = 'data-opened-from';
const IMAGES_DIR = './assets/images/';
const CARD_CONTAINER_SELECTOR = 'article.recipe-cards';

window.addEventListener('DOMContentLoaded', () => {
  frontEndRecipeDict = window.electron.acquireRecipesDictionary();
  console.log(frontEndRecipeDict);
  Object.entries(frontEndRecipeDict).forEach(([key, val]) => {
    createRecipeCard(val);
  });
});

// Save button for add new recipe
let addButton = document.getElementById('add');
addButton.addEventListener('click', function () {
  document.getElementById('add-recipe').classList.remove('hidden');
  document.getElementById('add-recipe').style.display = 'grid';

  // tell the form that it was opened from the "add-recipe" button
  document.getElementById('add-recipe')[OPENED_FROM] = '';
  console.log(document.getElementById('add-recipe').classList);
  clearData();
});

// Close the add function
let close = document.getElementById('close');
close.addEventListener('click', function () {
  document.getElementById('add-recipe').classList.add('hidden');
  document.getElementById('add-recipe').style.display = 'none';
  console.log(document.getElementById('add-recipe').classList);
});

// Create JSON file when click "Save"
let save = document.getElementById('save');
console.log(save);
save.addEventListener('click', function () {
  // Collapse the window
  document.getElementById('add-recipe').classList.add('hidden');
  document.getElementById('add-recipe').style.display = 'none';
  console.log(document.getElementById('add-recipe').classList);

  let recipeName = strStrip(document.getElementById('recipe-name').value);
  let oldRecipeName = document.getElementById('add-recipe')[OPENED_FROM];

  //Save image
  let imageInput = document.getElementById('file');
  let imageFile = imageInput.files[0];
  window.electron.saveImage(imageFile.path, imageFile.name);

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

  // Save file to local storage
  recipeName = strStrip(json['name']);
  let file = `${recipeName}.json`;
  let status = window.electron.addRecipe(json, recipeName);
  console.log(status);
  //   dumpJSON(json, "../assets/recipes", file);
});

function createRecipeCard(data) {
  const recipeCard = document.createElement('recipe-card');
  recipeCard.classList.add(strStrip(data.name));
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
    imgURL = IMAGES_DIR + imageFile.name;
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
  image.src = URL.createObjectURL(imageInput.files[0]);

  // write image to local dir that we know the location of
  // FIXME: THIS IS A TEST!!! This write operation should happen RIGHT AFTER clicking the save recipe button and RIGHT BEFORE writing the JSON to disk
  console.log(imageFile.path);
});

export function showRecipe(recipeName) {
  console.log(recipeName);
}

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
