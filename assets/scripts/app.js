// import { doc } from "prettier";
const OPENED_FROM = 'data-opened-from';
const RECIPE_FORM_ID = 'add-recipe';
const IMAGE_CHANGED = 'data-changed';
const RECIPE_ID_PROPERTY = 'data-recipe-id';
const IMAGES_DIR = './assets/recipes/images/'; // the directory for RECIPE IMAGES
const CARD_CONTAINER_SELECTOR = 'article.recipe-cards';
const IMAGE_UPLOAD_SELECTOR = 'input[type="file"][id="file"]';
const SEARCH_BAR = 'search-bar';
const TAG_LIST = 'tag-items';

export var frontEndRecipeDict = {};
var displayedList = []; // used for search bar
var tags = []; // used to store tags for each recipe

/**
 * Strip the spaces from a given string
 * TODO: Our goal is to update our code base to use UUIDv4, hence largely deprecating this function and others like it.
 * @param {string} name a string to strip the spaces from
 * @returns the stripped string
 */
function strStrip(name) {
  return name.replace(/\s/g, '');
}

window.addEventListener('DOMContentLoaded', () => {
  let backendRecipes = window.electron.acquireRecipesDictionary();
  refreshFrontend(backendRecipes);
  init();
});

function refreshFrontend(newList) {
  removeChildren(document.querySelector(CARD_CONTAINER_SELECTOR));
  frontEndRecipeDict = newList;
  console.log('Received from back end:');
  console.log(frontEndRecipeDict);
  displayedList = [];
  Object.entries(frontEndRecipeDict).forEach(([key, val]) => {
    displayedList.push(val);
  });
  refreshRecipeCards(displayedList);
}

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
    document.querySelector(IMAGE_UPLOAD_SELECTOR).value = null;

    console.log(document.getElementById(RECIPE_FORM_ID).classList);
    clearRecipeComposeForm();
  });

  // Search bar function
  let search = document.getElementById(SEARCH_BAR);
  let container = document.querySelector('.recipe-cards');

  // Normal Search
  search.addEventListener('keyup', (e) => {
    console.log(document.getElementById('tab').textContent.toLowerCase() === 'favorite');
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
    removeChildren(container);
    refreshRecipeCards(filteredRecipes);
  });

  // Favorite List
  let favBtn = document.getElementById('fav-btn');
  favBtn.addEventListener('click', showFavorite);

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
    // let recipeName = strStrip(document.getElementById('recipe-name').value);
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
    }

    let json = buildJSONFromForm(imgChanged, oldRecipeId);
    let status = createAddRecipeFromJSON(json);
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
  document.getElementById('export-button').addEventListener('click', exportRecipes);
  document.getElementById('import-button').addEventListener('click', importRecipes);
}

/**
 * Make a new `recipe-card` and prepend it to the list of cards in the front end
 * @param {object} data as JSON
 */
function createRecipeCard(data) {
  const recipeCard = document.createElement('recipe-card');
  recipeCard.id = data.recipe_id;
  recipeCard.data = data;
  return recipeCard;
}

/**
 * Appends the recipe card to the DOM
 * @param {recipe-card} recipeCardElem recipeCard element to add to the DOM
 */
function addRecipeCardToDOM(recipeCardElem) {
  console.log(`Adding to dom: ${recipeCardElem}`);
  document.querySelector('.recipe-cards').appendChild(recipeCardElem);
}

/**
 * Takes the list of recipes to display and makes the corresponding recipe cards.
 * Currently, this is done in reverse order because we push to the end of the list
 * when making new/editing new cards. Change this one when sorting is implemented.
 */
function refreshRecipeCards(cardList) {
  for (let i = cardList.length - 1; i >= 0; i--) {
    createAddRecipeFromJSON(cardList[i]);
  }
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
  // let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
  let date = today.toString();

  // List of Tags
  let tag = tags;
  let imgURL = '.png'; // placeholder

  if (document.getElementById('output').src !== undefined) {
    // only set a new image if it was changed by the user OR opened from the new recipe button
    let openedFromNewRecipe = document.getElementById(RECIPE_FORM_ID)[OPENED_FROM] === '';
    if (imgChanged) {
      let imageInput = document.getElementById('file');
      let imageFile = imageInput.files[0];

      // we expect the image to be in a known directory pending a file operation request
      if (!imageFile) {
        imgURL = './assets/images/default-image.jpg';
      } else {
        imgURL = IMAGES_DIR + imageFile.name;
      }
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

// Mark Favorite Button
// function markFavorite() {
//   let favList = JSON.parse(localStorage.getItem('favorites'));
//   for (let i = 0; i < favList.length; i++) {
//     let favBtn = document.querySelector(`.btn [id=${favList[i]}]`);
//     console.log(favBtn);
//     // btn.style.backgroundColor = '#ddca7e';
//   }
// }

export function showFavorite() {
  document.querySelector('div.input-group.rounded').classList.add('hidden');
  document.querySelector('h1').textContent = 'Favorite';
  document.getElementsByClassName('recipe-cards')[0].style.display = 'none';
  removeChildren(document.getElementById('view-recipe'));
  const container = document.getElementById('fav-recipe');
  removeChildren(container);
  console.log(container);
  let favList = JSON.parse(localStorage.getItem('favorites'));
  for (let i = 0; i < favList.length; i++) {
    const recipeCard = document.createElement('recipe-card');
    recipeCard.id = favList[i];
    recipeCard.data = frontEndRecipeDict[favList[i]];
    container.appendChild(recipeCard);
  }
  container.style.display = 'flex';
  console.log(container);
}

// The view recipe function for clicking on a recipe card
export function showRecipe(recipe) {
  let jsonData = frontEndRecipeDict[recipe.recipe_id];
  console.log(jsonData);
  document.querySelector('div.input-group.rounded').classList.add('hidden');
  document.getElementsByClassName('recipe-cards')[0].style.display = 'none';
  removeChildren(document.getElementById('fav-recipe'));
  document.getElementById('tab').textContent = '';
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
  viewIngredients.className = 'btn ingre';
  viewIngredients.classList.add('btn', 'ingre');
  viewIngredients.type = 'button';
  viewIngredients.innerHTML = 'View Ingredients';
  viewIngredients.id = 'view-ingredients';
  col1.appendChild(viewIngredients);
  row1.appendChild(col1);

  // View Directions Button
  const col2 = document.createElement('div');
  col2.className = 'col-3';
  col2.classList.add('col-3');
  const viewDirections = document.createElement('button');
  viewDirections.className = 'btn direct';
  viewDirections.classList.add('btn', 'direct');
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
  border.className = 'col-6 mt-4 box-style';
  border.classList.add('col-6', 'mt-4', 'box-style');
  // Recipe Inside Text
  const recipeText = document.createElement('div');
  recipeText.className = 'py-3 px-2';
  recipeText.classList.add('py-3', 'px-2');
  recipeText.id = 'making-recipe';
  if (jsonData.ingredients.length === 1) {
    const str = jsonData.ingredients[0];
    jsonData.ingredients = str.split(',');
  }
  if (jsonData.steps.length === 1) {
    const str = jsonData.steps[0];
    jsonData.steps = str.split(',');
  }
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
  metaData.className = 'meta-style px-3 py-3';
  metaData.classList.add('meta-style', 'px-3', 'py-3');
  // Prep Time
  const prepTime = document.createElement('li');
  prepTime.className = 'mb-2';
  prepTime.classList.add('mb-2');
  prepTime.id = 'prep';
  prepTime.innerHTML = `<b>Prep Time:</b> ${jsonData.metrics.prep_time} mins`;
  metaData.appendChild(prepTime);
  finalCol.appendChild(metaData);
  // Cook Time
  const cookTime = document.createElement('li');
  cookTime.className = 'mb-2';
  cookTime.classList.add('mb-2');
  cookTime.id = 'cook-time';
  cookTime.innerHTML = `<b>Cook Time:</b> ${jsonData.metrics.cook_time} mins`;
  metaData.appendChild(cookTime);
  row2.appendChild(finalCol);
  // Servings
  const servings = document.createElement('li');
  servings.className = 'mb-2';
  servings.classList.add('mb-2');
  servings.id = 'servings';
  servings.innerHTML = `<b>Serving:</b> ${jsonData.metrics.servings}`;
  metaData.appendChild(servings);
  // Tags
  const tagItems = document.createElement('li');
  tagItems.className = 'mb-2';
  tagItems.classList.add('mb-2');
  tagItems.id = 'tag-items-view';
  let stringTag = '';
  for (const element of jsonData.metadata.labels) {
    stringTag += element.toUpperCase() + ' ';
  }
  tagItems.innerHTML = `<b>Tags:</b> ${stringTag}`;
  metaData.appendChild(tagItems);
  row2.appendChild(finalCol);

  // Date Created
  const date = document.createElement('li');
  date.className = 'mb-2';
  date.classList.add('mb-2');
  date.id = 'date';
  date.innerHTML = `<b>Date Created:</b> ${jsonData.metadata.time_added}`;
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
  document.getElementById('tag-ip').value = '';
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
    let path = window.electron.showSaveFileDialog();
    if (!path) {
      return;
    }
    window.electron.export(recipesToExport, path);
  } catch (err) {
    console.log(err);
  }
}

function isSelected(recipeCardDiv) {
  return recipeCardDiv.getAttribute('data-selected') === 'true';
}

function getRecipeIdFromDOM(recipeCardDiv) {
  return recipeCardDiv.getAttribute('id');
}

function importRecipes() {
  try {
    let paths = window.electron.showOpenFileDialog();
    if (!paths || paths.length == 0) {
      return;
    }
    console.log(paths);
    for (let path of paths) {
      let importedRecs = window.electron.import(path);
      for (let recipeJSON of importedRecs) {
        recipeJSON.recipe_id = window.electron.generateNewId();
        createAddRecipeFromJSON(recipeJSON);
      }
    }
  } catch (err) {
    console.log(err);
  }
}

function deleteTag(t) {
  // Add functionality for close button functions
  let newTag = document.getElementById(`${t}`);
  newTag.addEventListener('click', function () {
    let parent = newTag.parentNode.parentNode;
    parent.removeChild(newTag.parentNode);
    let index = tags.indexOf(`${t}`);
    tags.splice(index, 1);
    console.log('after delete');
    console.log(tags);
  });
}

// Add new tag function
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
  console.log(tags);

  // Close button for new tag
  deleteTag(tag);
}

export function populateTags(recipeLabels) {
  // if not new recipe, then populate tag list with old one
  let oldRecipeId = document.getElementById(RECIPE_FORM_ID)[OPENED_FROM];
  if (oldRecipeId != '') {
    tags = recipeLabels;
  }
  console.log('before delete');
  console.log(tags);
  for (let i = 0; i < tags.length; i++) {
    // Add delete functionality for the tags that are just populated
    deleteTag(tags[i]);
  }
}

function createAddRecipeFromJSON(json) {
  let id = json.recipe_id;
  let card = createRecipeCard(json); // returns the HTMLElement recipe-card
  addRecipeCardToDOM(card);
  frontEndRecipeDict[id] = json;
  let status = window.electron.addRecipe(json, id);
  return status;
}
