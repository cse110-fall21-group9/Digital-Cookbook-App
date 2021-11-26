let frontEndRecipeDict = {};

const OPENED_FROM = 'data-opened-from';
const CARD_CONTAINER_SELECTOR = 'article.recipe-cards';

window.addEventListener('OnDOMContentLoaded', () => {
  frontEndRecipeDict = window.electron.acquireRecipesDictionary();
  console.log(frontEndRecipeDict);
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

  let recipeName = document.getElementById('RecipeName').value;
  let oldRecipeName = document.getElementById('add-recipe')[OPENED_FROM];

  if (document.getElementById('add-recipe')[OPENED_FROM] != '') {
    const parent = document.querySelector(CARD_CONTAINER_SELECTOR);
    console.log(parent);
    let oldCard = document.querySelector(`recipe-card[class="${oldRecipeName}"]`);
    parent.removeChild(oldCard);
  }

  let json = createJSON();
  createRecipeCard(json);

  // Save file to local storage
  recipeName = json['name'];
  let file = `${recipeName}.json`;
  let status = window.electron.addRecipe(json, recipeName);
  console.log(status);
  //   dumpJSON(json, "../assets/recipes", file);
});

function createRecipeCard(data) {
  const recipeCard = document.createElement('recipe-card');
  recipeCard.classList.add(data.name); // TODO: Might have to strip spaces for all recipe class names
  recipeCard.data = data;
  document.querySelector('.recipe-cards').appendChild(recipeCard);
}

/**
 * Create a new JSON file on the data user enter
 */
function createJSON() {
  const titleText = document.getElementById('RecipeName').value;

  let today = new Date();
  let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
  let tag = 'Gluten Free';
  let imgURL = '.png';
  if (document.getElementById('output').src !== undefined) {
    imgURL = document.getElementById('output').src;
  }

  let ingredients = document.getElementById('Ingredients').value.split('\n');
  let instruction = document.getElementById('Instructions').value.split('\n');
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

function clearData() {
  document.getElementById('RecipeName').value = '';
  document.getElementById('Ingredients').value = '';
  document.getElementById('Instructions').value = '';

  document.getElementById('time-cook').value = '';
  document.getElementById('time-prep').value = '';
  document.getElementById('serving').value = '';
  document.getElementById('output').src = '';
}
