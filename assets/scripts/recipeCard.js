class recipeCard extends HTMLElement {
  DOMRef = null;
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }

  /**
   * Create a new JSON file on the data user enter
   * @param {dict} data the name of the json dictionary.
   */
  set data(data) {
    if (!data) return;

    // Used to access the actual data object
    // this.json = data;

    // Create a wrapper
    const card = document.createElement('div');
    const style = document.createElement('style');
    style.innerHTML = `
        .recipe {
            background-color: #eeeee4;
            border-radius: 16px;
            color: v#070705;
            font-family: 'Poppins', sans-serif;
            display: flex;
            flex-wrap: wrap;
            height: auto;
            max-width: 300px;
            margin-bottom: 30px
            column-gap: 10px;
            row-gap: 5px
            box-sizing: border-box;
            padding: 2px;
            overflow: visible
        }
        
        .image {
            width: 100%;
            height: 10rem;
            overflow: hidden;
            border-radius: 16px 16px 0 0;
            margin-bottom: 0.025 rem;
        }

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .recipe-tag {
            font-weight: 550;
            font-size: 15px;
            letter-spacing: -0.25px;
            color: #fff;
            margin: 5px ;
            background-color: #BB5274;
            padding: .125rem 1rem;
            border-radius: 100px;
        }
        
        h1[id ^= "name"] {
            margin: .25rem .5rem .25rem 1rem;
            font-size: 25px;
            font-weight: 700;
            letter-spacing: -1px;
        }
        
        p[id ^= "info"] {
            margin: .5rem .5rem .5rem 1rem;
            font-size: 20px;
            color: inhereit;
        }
        
        .recipe-time {
          margin-left: 20px;
          margin-bottom: 15px;
        }
        .recipe .buttons {
            display: flex;
            flex-wrap: wrap;;
        }
        .recipe .btn,  .recipe .dropbtn {
            display: inline-block;
            font-weight: 600;
            letter-spacing: -0.25px;
            color: #fff;
            padding:0.45em 1.5em;
            border:0.1em solid #FFFFFF;
            margin:0 0.3em 0.7em 0.9em;
            border-radius:0.12em;
            box-sizing: border-box;
            background-color: #2B3044;
            cursor: pointer;
        }

          .dropdown {
            position: relative;
            display: inline-block;
          }
          
          .dropdown-content {
            display: none;
            position: absolute;
            background-color: #f1f1f1;
            min-width: 100px;
            box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
            z-index: 1;
          }

          .dropdown:hover .dropdown-content {display: block;}

          .dropdown:hover .dropbtn {background-color: #3e8e41;}
          
          .dropdown-content a {
            color: black;
            padding: 12px 16px;
            display: block;
          }
          
          .dropdown-content a:hover {background-color: #ddd}
          
        `;
    card.classList.add('recipe');

    // Grab the thumbnail
    const imgWrapper = document.createElement('div');
    imgWrapper.classList.add('image');
    const imageUrl = data.image;
    const image = document.createElement('img');
    image.classList.add('img-fluid');
    image.setAttribute('src', imageUrl);
    image.setAttribute('alt', imageUrl);
    imgWrapper.appendChild(image);
    card.appendChild(imgWrapper);

    // Create recipe content
    const recipeContent = document.createElement('div');
    recipeContent.classList.add('recipe-content');

    // Create tags
    const tag = document.createElement('p');
    tag.classList.add('recipe-tags');
    tag.innerHTML = ` 
        <span class="recipe-tag">Gluten Free</span>
        <span class="recipe-tag">Breakfast</span>
        `;
    recipeContent.appendChild(tag);

    // Grab the title
    const title = document.createElement('h1');
    title.classList.add('title');
    title.id = 'name';
    title.textContent = data.name;
    recipeContent.appendChild(title);

    // Get description
    const desc = document.createElement('p');
    desc.classList.add('description');
    desc.id = 'info';
    desc.textContent = data.steps;
    recipeContent.appendChild(desc);

    // Get time
    const time = document.createElement('div');
    time.classList.add('recipe-time');
    let cookingTime = data.metrics.cook_time;
    time.innerHTML = `
        <i class="fas fa-clock"></i>
        <time>Cook time: ${cookingTime}</time>
        `;
    recipeContent.appendChild(time);
    card.appendChild(recipeContent);

    card.innerHTML += `
        <div class="buttons">
            <button type="button" class="btn" id="fav">Favorite</button>
            <div class="dropdown">
                <button onclick="myFunction()" class="dropbtn">Dropdown</button>
                <div id="myDropdown" class="dropdown-content">
                    <a href="#" class="edit">Edit</a>
                    <a href="#" class="delete">Delete</a>
                    <a href="#" class="share">Share</a>
                </div>
            </div>
        </div>
        `;
    this.DOMRef = card;
    this.shadowRoot.append(style, card);

    let edit = card.getElementsByClassName('edit').item(0);
    let delete_recipe = card.getElementsByClassName('delete').item(0);
    let share = card.getElementsByClassName('share').item(0);
    // Edit recipe
    edit.addEventListener('click', (event) => {
      let recipeData = window.electron.acquireRecipe(title.textContent);
      console.log(document.getElementById('add-recipe').classList);
      console.log(recipeData);
      fillData(recipeData);
      //clearData();
    });
  }
}

function fillData(recipeData) {
  document.getElementById('add-recipe').classList.remove('hidden');
  document.getElementById('add-recipe').style.display = 'grid';
  document.getElementById('RecipeName').value = recipeData.name;
  document.getElementById('Ingredients').value = recipeData.ingredients;
  document.getElementById('Instructions').value = recipeData.steps;
  document.getElementById('time-cook').value = recipeData.metrics.cook_time;
  document.getElementById('time-prep').value = recipeData.metrics.prep_time;
  document.getElementById('serving').value = recipeData.metrics.servings;
  // give the add-recipe form a state saying that it was opened from the "edit" option
  document.getElementById('add-recipe')['opened-from'] = recipeData.name;
}

customElements.define('recipe-card', recipeCard);

//   get data() {
//     // Stored in .json to avoid calling set data() recursively in a loop.
//     // .json is also exposed so you can technically use that as well
//     return this.json;
//   }
// }
