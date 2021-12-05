// import { doc } from "prettier";
export var frontEndRecipeDict = {};
var displayedList = []

/**
 * Strip the spaces from a given string
 * @param {string} name a string to strip the spaces from
 * @returns the stripped string
 */
function strStrip(name) {
  return name.replace(/\s/g, '');
}

const OPENED_FROM = 'data-opened-from';
const IMAGE_CHANGED = 'data-changed';
const IMAGES_DIR = './assets/recipes/images/'; // the directory for RECIPE IMAGES
const CARD_CONTAINER_SELECTOR = 'article.recipe-cards';
const IMAGE_UPLOAD_SELECTOR = 'input[type="file"][id="file"]';
const RECIPE_FORM_ID = 'add-recipe';
const SEARCH_BAR = 'search-bar';


window.addEventListener('DOMContentLoaded', () => {
  frontEndRecipeDict = window.electron.acquireRecipesDictionary();
  console.log('Received from back end:');
  console.log(frontEndRecipeDict);
  Object.entries(frontEndRecipeDict).forEach(([key, val]) => {
    displayedList.push(val);
    createRecipeCard(val);
  });
});

const removeChildren = (parent) => {
  while (parent.lastChild) {
      parent.removeChild(parent.lastChild);
  }
};

// Search bar function
let search = document.getElementById(SEARCH_BAR);
search.addEventListener('keyup', (e) => {
  const searchString = e.target.value.toLowerCase();
  const filteredRecipes = displayedList.filter( recipe => {
    return recipe.name.toLowerCase().includes(searchString);
  });
  
  let container = document.querySelector('.recipe-cards');
  removeChildren(container);

  for (let i = 0; i < filteredRecipes.length; i++) {
    createRecipeCard(filteredRecipes[i]);
  }
});

// Save button for add new recipe
let addButton = document.getElementById('add');
addButton.addEventListener('click', () => {
  document.getElementById(RECIPE_FORM_ID).classList.remove('hidden');
  document.getElementById(RECIPE_FORM_ID).style.display = 'grid';

  // tell the form that it was opened from the "add-recipe" button
  document.getElementById(RECIPE_FORM_ID)[OPENED_FROM] = '';

  // by default, the image for a new recipe has been "changed"
  document.querySelector(IMAGE_UPLOAD_SELECTOR)[IMAGE_CHANGED] = true;
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

  let discard = document.getElementById('discard');
  discard.addEventListener('click', (event) => {
    clearData();
    document.getElementById(RECIPE_FORM_ID).classList.add('hidden');
    document.getElementById(RECIPE_FORM_ID).style.display = 'none';
  });

  let json = buildJSONFromForm();
  createRecipeCard(json);

  // add to front-end copy of dictionary
  frontEndRecipeDict[strStrip(json.name)] = json;

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
  recipeCard.data = data;
  document.querySelector('.recipe-cards').appendChild(recipeCard);
}

/**
 * Create a new JSON file on the data user enter
 */
function buildJSONFromForm() {
  const titleText = document.getElementById('recipe-name').value;

  let today = new Date();
  let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
  let tag = 'Gluten Free';
  let imgURL = '.png';
  let imgChanged = document.querySelector(IMAGE_UPLOAD_SELECTOR)[IMAGE_CHANGED];
  if (document.getElementById('output').src !== undefined) {
    if (imgChanged) {
      let imageInput = document.getElementById('file');
      let imageFile = imageInput.files[0];
      if (imageFile) {
        imgURL = IMAGES_DIR + imageFile.name;
      } else {
        imgURL = './assets/images/default-image.jpg';
      }
    } else {
      let recipeName = document.getElementById(RECIPE_FORM_ID)[OPENED_FROM];
      console.log(recipeName);
      imgURL = frontEndRecipeDict[strStrip(recipeName)].image; // restore original image URL it it was not changed
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
  imageInput[IMAGE_CHANGED] = true;
  let image = document.getElementById('output');
  let imageFile = imageInput.files[0];

  // reference to this image for this session is only used to display the image preview
  if (imageFile) image.src = URL.createObjectURL(imageFile);

  // write image to local dir that we know the location of.
  // this write operation should happen RIGHT AFTER clicking the save recipe button and RIGHT BEFORE writing the JSON to disk
  console.log(imageFile.path);
});

// The view recipe function for clicking on a recipe card
export function showRecipe(recipe) {
  let jsonData = frontEndRecipeDict[strStrip(recipe.name)];
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

/* <div class="container-fluid">
  <!-- View Ingredients/Directions Buttons  -->
  <div class="row">
      <div class="col-3">
          <button type="button" class="btn btn-outline-success btn-lg">View
              Ingredients</button>
      </div>
      <div class="col-3">
          <button type="button" class="btn btn-outline-danger btn-lg">View Directions</button>
      </div>
      <div class="recipe-name col-6 text-center text-nowrap">Recipe Name Here</div>
  </div>
  <div class="row">
      <div class="col-6 mt-4 border border-dark rounded">
          <!-- This is where Ingredients/Directions should go -->
          <div class="py-3 px-2" id="making-recipe">
              Some default text...
          </div>
      </div>
      <div class="col-6">
          <img src="../images/burrito.jpeg" class="img-thumbnail mb-5" alt="stock image">
          <ul class="list-unstyled border border-dark rounded px-3 py-3">
              <li class="mb-2" id="prep"> Prep Time: </li>
              <li class="mb-2" id="cook-time"> Cook Time: </li>
              <li class="mb-2" id="servings"> Servings Yield: </li>
              <li id="url"> URL: </li>
          </ul>
          <div class="border border-dark">
              Future Timer coming soon...
          </div>
      </div>
  </div>
</div> */
