// Save button for add new recipe 
let addButton = document.getElementById("add");
addButton.addEventListener("click", function() {
  document.getElementById("add-recipe").classList.remove("hidden");
  document.getElementById("add-recipe").style.display = "grid";
  console.log(document.getElementById("add-recipe").classList);
});

// Close the add function
let close = document.getElementById("close");
close.addEventListener("click", function() {
  document.getElementById("add-recipe").classList.add("hidden");
  document.getElementById("add-recipe").style.display = "none";
  console.log(document.getElementById("add-recipe").classList);
});

// Create JSON file when click "Save"
let save = document.getElementById("save");
console.log(save);
save.addEventListener("click", function() {

  // Collapse the window
  document.getElementById("add-recipe").classList.add("hidden");
  document.getElementById("add-recipe").style.display = "none";
  console.log(document.getElementById("add-recipe").classList);

  let json = createJSON();

  // Reset field
  document.getElementById('RecipeName').value = "";
  document.getElementById('Ingredients').value = "";
  document.getElementById('Instructions').value = "";

  document.getElementById('time-cook').value = "";
  document.getElementById('time-prep').value = "";
  document.getElementById('serving').value = "";

  // Save file to local storage
  console.log(json);
  let recipeName = json["name"];
  let file = `${recipeName}.json`
  dumpJSON(json, "../assets/recipes", file);
});

 /**
   * Create a new JSON file on the data user enter 
   * @param {string} data the name of the file to delete.
   */
function createJSON() {
  const titleText = document.getElementById('RecipeName').value;

  let today = new Date();
  let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  let tag = "Gluten Free";

  let ingredients = document.getElementById('Ingredients').value.split('\n');
  let instruction = document.getElementById('Instructions').value.split('\n');
  let cookTime = document.getElementById('time-cook').value;
  let timePrep = document.getElementById('time-prep').value;
  let serving = document.getElementById('serving').value;


  let newRecipe = {
    "recipe_id":12313,
    "name": titleText,
    "image": ".png",
    "metadata": {
      "time_added": date,
      "labels": tag,
      "src_url": "#",
    },
    "metrics": {
        "cook_time": cookTime, // minutes
        "prep_time": timePrep, // minutes
        "servings": serving,
    },
  "ingredients": ingredients,
  "steps": instruction,
  };
  return newRecipe;
}
