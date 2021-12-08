// import { doc } from "prettier";
export var frontEndRecipeDict = {};
export var displayedList = [];
const TAG_LIST = 'tag-items';
var tags = [];

/**
 * Strip the spaces from a given string
 * TODO: Our goal is to update our code base to use UUIDv4, hence largely deprecating this function and others like it.
 * @param {string} name a string to strip the spaces from
 * @returns the stripped string
 */
function strStrip(name) {
  return name.replace(/\s/g, '');
}

const OPENED_FROM = 'data-opened-from';
const RECIPE_FORM_ID = 'add-recipe';
const IMAGE_CHANGED = 'data-changed';
const RECIPE_ID_PROPERTY = 'data-recipe-id';
const IMAGES_DIR = './assets/recipes/images/'; // the directory for RECIPE IMAGES
const CARD_CONTAINER_SELECTOR = 'article.recipe-cards';
const IMAGE_UPLOAD_SELECTOR = 'input[type="file"][id="file"]';
const SEARCH_BAR = 'search-bar';

window.addEventListener('DOMContentLoaded', () => {
  frontEndRecipeDict = window.electron.acquireRecipesDictionary();
  console.log('Received from back end:');
  console.log(frontEndRecipeDict);
  Object.entries(frontEndRecipeDict).forEach(([key, val]) => {
    displayedList.push(val);
    createRecipeCard(val);
  });
  init();
});

/**
 * Delete the children of a given DOM node.
 * Orphaned grandchildren do not need to be dealt with.
 * @param {Node} parent the parent whose children to destroy.
 */
export const removeChildren = (parent) => {
  while (parent.lastChild) {
    parent.removeChild(parent.lastChild);
  }
};

/**
 * Initialize all of our event handlers.
 */
function init() {
  // Tag function for recipe
  let tagInput = document.querySelector('.tag-input input');
  tagInput.addEventListener('keyup', addTag);

  // Retrieve reference to the button for *composing a new recipe*
  let addButton = document.getElementById('add');
  addButton.addEventListener('click', () => {
    document.getElementById(RECIPE_FORM_ID).classList.remove('hidden');
    document.getElementById(RECIPE_FORM_ID).style.display = 'grid';

    // tell the form that it was opened from the "add-recipe" button and is not bound to an existing card.
    document.getElementById(RECIPE_FORM_ID)[OPENED_FROM] = '';
    // by default, the image for a new recipe has been "changed"
    document.querySelector(IMAGE_UPLOAD_SELECTOR)[IMAGE_CHANGED] = true;
    console.log(document.getElementById(RECIPE_FORM_ID).classList);
    clearRecipeComposeForm();
  });

  // Search bar function
  let search = document.getElementById(SEARCH_BAR);
  search.addEventListener('keyup', (e) => {
    const searchString = e.target.value.toLowerCase();
    // Reset displayed list for search after deleting
    displayedList.splice(0, displayedList.length);
    Object.keys(frontEndRecipeDict).forEach((key) => {
      console.log(frontEndRecipeDict[key]);
      displayedList.push(frontEndRecipeDict[key]);
    });
    const filteredRecipes = displayedList.filter((recipe) => {
      return recipe.name.toLowerCase().includes(searchString);
    });

    let container = document.querySelector('.recipe-cards');
    removeChildren(container);

    for (let i = 0; i < filteredRecipes.length; i++) {
      createRecipeCard(filteredRecipes[i]);
    }
  });

  // Close the add function
  let close = document.getElementById('close');
  close.addEventListener('click', () => {
    document.getElementById(RECIPE_FORM_ID).classList.add('hidden');
    document.getElementById(RECIPE_FORM_ID).style.display = 'none';
    console.log(document.getElementById(RECIPE_FORM_ID).classList);
  });

  // Discard button
  let discard = document.getElementById('discard');
  discard.addEventListener('click', (event) => {
    clearRecipeComposeForm();
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

    // get stateful information from the form's data.
    let recipeName = strStrip(document.getElementById('recipe-name').value);
    let oldRecipeId = document.getElementById(RECIPE_FORM_ID)[OPENED_FROM];
    let imgChanged = document.querySelector(IMAGE_UPLOAD_SELECTOR)[IMAGE_CHANGED];

    // Save image
    let imageInput = document.getElementById('file');
    let imageFile = imageInput.files[0];
    console.log(imageFile);
    if (imageFile) {
      window.electron.saveImage(imageFile.path, imageFile.name);
    }
    //check if opened from edit
    if (oldRecipeId != '') {
      // delete the current version of the card & overwrite
      const parent = document.querySelector(CARD_CONTAINER_SELECTOR);
      let oldCard = document.querySelector(`recipe-card[id="${oldRecipeId}"]`); // this better work gdi
      parent.removeChild(oldCard);
      /*
      if (recipeName != oldRecipeId) {
        //TODO: if we save using UUID, there is no need to do this. just delete the file with the same name as the ID.
        console.log(oldRecipeId);
        let status = window.electron.removeRecipe(oldRecipeId);
        console.log(status);
      } */
    }

    let json = buildJSONFromForm(imgChanged, oldRecipeId);
    createRecipeCard(json);

    // debug directives
    console.log('JSON built from form:');
    console.log(json);
    // add to front-end copy of dictionary
    frontEndRecipeDict[json.recipe_id] = json;

    // Save file to local storage
    // recipeName = strStrip(json['name']);
    // let file = `${recipeName}.json`;
    let status = window.electron.addRecipe(json, json.recipe_id);
    console.log(status);
  });

  //let imageInput = document.querySelector('input#file[type="file"][name="image]');
  const img = document.getElementById('output');
  img.addEventListener('error', function (event) {
    event.target.src = './assets/images/default-image.jpg';
    event.onerror = null;
  });

  let imageInput = document.getElementById('file');
  console.log(imageInput);
  imageInput.addEventListener('change', (event) => {
    imageInput[IMAGE_CHANGED] = true;
    let image = document.getElementById('output');
    let imageFile = imageInput.files[0];

    // reference to this image for this session is only used to display the image preview
    if (imageFile) image.src = URL.createObjectURL(imageFile);

    // write image to local dir that we know the location of.
    // this write operation should happen RIGHT AFTER clicking the save recipe button and RIGHT BEFORE writing the JSON to disk
    console.log(imageFile.path);
  });
}

/**
 * Make a new `recipe-card` and prepend it to the list of cards in the front end
 * @param {object} data as JSON
 */
function createRecipeCard(data) {
  const recipeCard = document.createElement('recipe-card');
  recipeCard.id = data.recipe_id;
  recipeCard.data = data;
  document.querySelector('.recipe-cards').appendChild(recipeCard);
}

/**
 * Create a new JSON file on the data entered by the user.
 * @param {boolean} imgChanged was the image changed?
 * @param {string} openedFromRecipeId the UUID of the recipe that the form was opened from, if any. Empty if opened from new recipe button.
 * @returns {object} the JSON object representing the saved recipe.
 */
function buildJSONFromForm(imgChanged, openedFromRecipeId) {
  // name of recipe as entered
  const titleText = document.getElementById('recipe-name').value;

  // DateTime
  let today = new Date();
  let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

  // List of Tags
  let tag = tags;
  let imgURL = '.png'; // placeholder

  if (document.getElementById('output').src !== undefined) {
    // only set a new image if it was changed by the user OR opened from the new recipe button
    if (imgChanged) {
      let imageInput = document.getElementById('file');
      let imageFile = imageInput.files[0];

      // we expect the image to be in a known directory pending a file operation request
      if (!imageFile) {
        imgURL = './assets/images/default-image.jpg';
      } else {
        imgURL = IMAGES_DIR + imageFile.name;
      }
      // if (imageFile) {
      //   imgURL = IMAGES_DIR + imageFile.name;
      // } else {
      //   imgURL = './assets/images/default-image.jpg';
      // }
    } else {
      console.log(`This form was opened from: ${openedFromRecipeId}`);
      // imgURL = frontEndRecipeDict[strStrip(recipeName)].image; // restore original image URL it it was not changed
      // restore original image URL it it was not changed
      imgURL = frontEndRecipeDict[openedFromRecipeId].image;
    }
  }

  let ingredients = document.getElementById('ingredients').value.split('\n');
  let instruction = document.getElementById('instructions').value.split('\n');
  let cookTime = document.getElementById('time-cook').value;
  let timePrep = document.getElementById('time-prep').value;
  let serving = document.getElementById('serving').value;

  // request a new uuidv4 here ONLY IF the recipe is new.
  console.log(`Opened from recipe with ID ${openedFromRecipeId}`);
  let recID = openedFromRecipeId === '' ? window.electron.generateNewId() : openedFromRecipeId;
  console.log(`Recipe ID: ${recID}`);

  let newRecipe = {
    recipe_id: recID,
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

// The view recipe function for clicking on a recipe card
export function showRecipe(recipe) {
  let jsonData = frontEndRecipeDict[recipe.recipe_id];
  console.log(jsonData);
  document.getElementsByClassName('recipe-cards')[0].style.display = 'none';
  const container = document.getElementById('view-recipe');
  // First row to hold the Buttons and Recipe Name
  const row1 = document.createElement('div');
  row1.className = 'row';
  row1.classList.add('row');
  // View Ingredients Button
  const col1 = document.createElement('div');
  col1.className = 'col-3';
  col1.classList.add('col-3');
  const viewIngredients = document.createElement('button');
  viewIngredients.className = 'btn btn-outline-success btn-lg';
  viewIngredients.classList.add('btn', 'btn-outline-success', 'btn-lg');
  viewIngredients.type = 'button';
  viewIngredients.innerHTML = 'View Ingredients';
  viewIngredients.id = 'view-directions';
  col1.appendChild(viewIngredients);
  row1.appendChild(col1);

  // View Directions Button
  const col2 = document.createElement('div');
  col2.className = 'col-3';
  col2.classList.add('col-3');
  const viewDirections = document.createElement('button');
  viewDirections.className = 'btn btn-outline-danger btn-lg';
  viewDirections.classList.add('btn', 'btn-outline-danger', 'btn-lg');
  viewDirections.type = 'button';
  viewDirections.innerHTML = 'View Directions';
  viewDirections.id = 'view-directions';
  col2.appendChild(viewDirections);
  row1.appendChild(col2);

  // Recipe Name
  const col3 = document.createElement('div');
  col3.className = 'recipe-name col-6 text-center fs-2';
  col3.classList.add('recipe-name', 'col-6', 'text-center', 'fs-2');
  col3.innerHTML = jsonData.name;
  row1.appendChild(col3);
  container.appendChild(row1);

  // Second Row
  const row2 = document.createElement('div');
  row2.className = 'row';
  row2.classList.add('row');
  // Border
  const border = document.createElement('div');
  border.className = 'col-6 mt-4 border border-dark rounded';
  border.classList.add('col-6', 'mt-4', 'border', 'border-dark', 'rounded');
  // Recipe Inside Text
  const recipeText = document.createElement('div');
  recipeText.className = 'py-3 px-2';
  recipeText.classList.add('py-3', 'px-2');
  recipeText.id = 'making-recipe';
  for (let i = 0; i < jsonData.ingredients.length; i++) {
    recipeText.innerHTML += `${jsonData.ingredients[i]}<br>`;
  }
  border.appendChild(recipeText);
  row2.appendChild(border);

  const finalCol = document.createElement('div');
  finalCol.className = 'col-6';
  finalCol.classList.add('col-6');
  // Recipe Image
  const img = document.createElement('img');
  img.src = jsonData.image;
  img.className = 'img-thumbnail mb-5';
  img.classList.add('img-thumbnail', 'mb-5');
  img.alt = `Picture of ${jsonData.name}`;
  finalCol.appendChild(img);
  // Recipe Meta Data UL
  const metaData = document.createElement('ul');
  metaData.className = 'list-unstyled border border-dark rounded px-3 py-3';
  metaData.classList.add('list-unstyled', 'border', 'border-dark', 'rounded', 'px-3', 'py-3');
  // Prep Time
  const prepTime = document.createElement('li');
  prepTime.className = 'mb-2';
  prepTime.classList.add('mb-2');
  prepTime.id = 'prep';
  prepTime.innerHTML = `Prep Time: ${jsonData.metrics.prep_time}`;
  metaData.appendChild(prepTime);
  finalCol.appendChild(metaData);
  // Cook Time
  const cookTime = document.createElement('li');
  cookTime.className = 'mb-2';
  cookTime.classList.add('mb-2');
  cookTime.id = 'cook-time';
  cookTime.innerHTML = `Cook Time: ${jsonData.metrics.cook_time}`;
  metaData.appendChild(cookTime);
  row2.appendChild(finalCol);
  // Servings
  const servings = document.createElement('li');
  servings.className = 'mb-2';
  servings.classList.add('mb-2');
  servings.id = 'servings';
  servings.innerHTML = `Servings: ${jsonData.metrics.servings}`;
  metaData.appendChild(servings);
  // Date Created
  const date = document.createElement('li');
  date.className = 'mb-2';
  date.classList.add('mb-2');
  date.id = 'date';
  date.innerHTML = `Date Created: ${jsonData.metadata.time_added}`;
  metaData.appendChild(date);
  row2.appendChild(finalCol);

  // Attach the whole container to the shadow DOM
  container.appendChild(row2);
  // Change what is displaying
  viewIngredients.addEventListener('click', (event) => {
    recipeText.innerHTML = '';
    for (let i = 0; i < jsonData.ingredients.length; i++) {
      recipeText.innerHTML += `${jsonData.ingredients[i]}<br>`;
    }
  });
  // console.log(viewDirections);
  viewDirections.addEventListener('click', (event) => {
    recipeText.innerHTML = '';
    for (let i = 0; i < jsonData.steps.length; i++) {
      recipeText.innerHTML += `${i + 1}. ${jsonData.steps[i]}<br>`;
    }
  });
}

function clearRecipeComposeForm() {
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
  removeChildren(document.getElementById('tag-items'));
  tags = [];
}

function exportRecipes() {
  let recipeCardsContainer = document.querySelector('.recipe-cards');
  let recipeCardsDivs = Array.from(recipeCardsContainer.children);
  let recipesToExport = [];
  for (let div of recipeCardsDivs) {
    if (isSelected(div)) {
      console.log(div);
      recipesToExport.push(frontEndRecipeDict[getRecipeIdFromDOM(div)]);
    }
  }

  if (recipesToExport.length === 0) {
    return;
  }

  try {
    let path = window.electron.showFileDialog();
    window.electron.export(recipesToExport, path);
  } catch (err) {
    console.log(err);
  }
}
document.getElementById('export-button').addEventListener('click', exportRecipes);

function isSelected(recipeCardDiv) {
  return recipeCardDiv.getAttribute('data-selected') === 'true';
}

function getRecipeIdFromDOM(recipeCardDiv) {
  return recipeCardDiv.classList[0];
}

// Tag function
function addTag(e) {
  let code = e.keyCode ? e.keyCode : e.which;
  // If user hit "Enter"
  if (code != 13) {
    return;
  }

  let tag = e.target.value.trim();
  if (tag.length < 1 || tags.includes(tag) || tags.length >= 3) {
    e.target.value = '';
    return;
  }

  // Add tag
  let index = tags.push(tag);
  let tagItem = document.createElement('div');
  tagItem.classList.add('item');
  tagItem.innerHTML = `
    <span class="delete-btn" id='${tag}'>
    &times;
    </span>
    <span>${tag}</span>
  `;
  document.getElementById(TAG_LIST).appendChild(tagItem);
  e.target.value = '';

  // Close button for new tag
  let newTag = document.getElementById(`${tag}`);
  newTag.addEventListener('click', function () {
    let parent = newTag.parentNode.parentNode;
    parent.removeChild(newTag.parentNode);
    let index = tags.indexOf(`${tag}`);
    tags.splice(index);
  });
}
