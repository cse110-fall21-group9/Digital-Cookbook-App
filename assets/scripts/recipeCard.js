/**
 * @module recipeCard
 * @description defines the custom type recipe-card
 */

import {frontEndRecipeDict} from './app.js';
import {showRecipe} from './app.js';
import {removeChildren} from './app.js';
import {populateTags} from './app.js';
import {showFavorite} from './app.js';

const IMAGE_UPLOAD_SELECTOR = 'input[type="file"][id="file"]';
const IMAGE_CHANGED = 'data-changed';
const TAG_LIST = 'tag-items';
const OPENED_FROM = 'data-opened-from';
const RECIPE_FORM_ID = 'add-recipe';
const RECIPE_ID_PROPERTY = 'data-recipe-id'; // defunct, no longer needed

export var recipeLabels = [];

function strStrip(name) {
  return name.replace(/\s/g, '');
}

/**
 * @class RecipeCard
 * @extends HTMLElement
 * @classdesc describes how to create a new recipe-card HTML element that we put on screen
 */
class recipeCard extends HTMLElement {
  DOMRef = null;
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }

  get data() {
    return this.json;
  }

  /**
   * Create a new JSON file on the data user enter
   * @param {dict} data the name of the json dictionary.
   */
  set data(data) {
    if (!data) return;

    // Used to access the actual data object
    this.json = data;

    // Create a wrapper
    const card = document.createElement('div');
    const style = document.createElement('style');
    style.innerHTML = `
        .recipe {
          background-color: #f2eee2;
          border: 2px solid rgba(0,0,0,1);
          border-radius: 16px;
          color: v#070705;
          font-family: 'Poppins', sans-serif;
          display: flex;
          flex-wrap: wrap;
          height: auto;
          width: 250px;
          margin-bottom: 30px
          column-gap: 10px;
          row-gap: 5px;
          box-sizing: border-box;
          overflow: visible;
          word-break: break-all;
        }
        
        .recipe:hover {
          cursor: pointer;
          box-shadow: .5rem .5rem .1rem rgb(243, 195, 131);
          transform: scale(1.05);
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

        .empty-recipe-tag {
          color: none;
          margin: .25rem .5rem .25rem .5rem;
        }

        .recipe-tag {
          font-weight: 550;
          font-size: 13px;
          letter-spacing: -0.25px;
          color: #fff;
          margin: .25rem .05rem .25rem .05rem;
          background-color: #BB5274;
          padding: .15rem 1rem;
          border-radius: 100px;
        }

        p.recipe-tags {
          margin: .25rem .5rem .25rem .9rem;
        }

        input[id ^= check-box] {
          width: 1rem;
          height: 1rem;
          border-radius: 10%;
          border-style: solid;
          border-width: 0.1rem;
          margin: .25rem .5rem .25rem 1rem;
        }
        
        h1[id ^= "name"] {
          margin: .25rem .5rem .05rem 1rem;
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -1px;
          height: 32px;
          line-height: 16px;
          word-break: keep-all;
        }
        
        p[id ^= "info"] {
          margin: .5rem 1rem .5rem 1rem;
          font-size: 15px;
          color: inhereit;
          height: 32px;
          line-height: 16px;
          overflow: hidden;
        }
        
        .recipe-time {
          margin: .5rem .5rem .5rem 1rem
        }

        .recipe .buttons {
          display: flex;
          flex-wrap: wrap;;
        }

        #fav:hover {
          background-color: #ddca7e;
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
    card['data-selected'] = false;

    // Grab the thumbnail
    const imgWrapper = document.createElement('div');
    imgWrapper.classList.add('image');
    const imageUrl = data.image;
    const image = document.createElement('img');
    image.classList.add('img-fluid');

    // ONLY SET THE SRC if the image was changed
    //let imageWasChanged = document.querySelector(IMAGE_UPLOAD_SELECTOR)['data-changed'];
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
    if (data.metadata.labels.length === 0) {
      tag.innerHTML += ` 
      <span class="empty-recipe-tag"></span>
      `;
    } else {
      for (let i = 0; i < data.metadata.labels.length; i++) {
        tag.innerHTML += ` 
        <span class="recipe-tag">${data.metadata.labels[i]}</span>
        `;
      }
    }
    console.log(tag);
    recipeContent.appendChild(tag);

    // Grab the title
    const title = document.createElement('h1');
    title.classList.add('title');
    title.id = 'name';
    title.textContent = data.name;
    recipeContent.appendChild(title);

    // Create checkbox
    const select = document.createElement('div');
    select.classList.add('check-box');
    select.innerHTML = ` 
         <input type="checkbox" id = "check-box">
         `;
    recipeContent.appendChild(select);
    const select_callback = () => {
      let div = document.querySelector(`recipe-card[id="${this.json.recipe_id}"]`);
      let before = div.getAttribute('data-selected');
      div.setAttribute('data-selected', before !== 'true');
    };

    // Get description
    const desc = document.createElement('p');
    desc.classList.add('description');
    desc.id = 'info';
    desc.textContent = data.steps;
    recipeContent.appendChild(desc);

    card.appendChild(recipeContent);

    // Button
    card.innerHTML += `
        <div class="buttons">
            <button type="button" class="btn" id="fav">Favorite</button>
            <div class="dropdown">
                <button id="dropDownBtn" class="dropbtn">Actions</button>
                <div id="myDropdown" class="dropdown-content">
                    <a href="#" class="edit" id="edit">Edit</a>
                    <a href="#" class="delete" id="delete">Delete</a>
                </div>
            </div>
        </div>
        `;

    this.DOMRef = card;
    this.shadowRoot.append(style, card);

    // View Recipe
    card.addEventListener('click', (event) => {
      if (event.target.id === 'check-box') {
        select_callback();
        return;
      }
      if (
        event.target.id === 'fav' ||
        event.target.id === 'edit' ||
        event.target.id === 'delete' ||
        event.target.id === 'share' ||
        event.target.id === 'dropDownBtn'
      ) {
        return;
      } else {
        showRecipe(data);
      }
    });

    let edit = card.getElementsByClassName('edit').item(0);
    let deleteRecipe = card.getElementsByClassName('delete').item(0);
    let fav = card.getElementsByClassName('btn').item(0);

    // Favorite a recipe
    fav.addEventListener('click', () => {
      let favList = JSON.parse(localStorage.getItem('favorites')) || [];
      let index = favList.indexOf(data.recipe_id);

      // Not in fav yet
      if (index == -1) {
        fav.style.backgroundColor = '#ddca7e';
        favList.push(data.recipe_id);
      } else {
        fav.style.backgroundColor = '#2B3044';
        favList.splice(index, 1);
      }
      localStorage.setItem('favorites', JSON.stringify(favList));
    });

    // Edit recipe
    edit.addEventListener('click', (event) => {
      let recipeData = frontEndRecipeDict[data.recipe_id]; // this shouldn't cause any bugs as the data should get updated whenever the name is changed
      console.log(document.getElementById('add-recipe').classList);
      fillComposeRecipeFormData(recipeData);
      //clearData();`
    });

    deleteRecipe.addEventListener('click', (event) => {
      if (!confirm('Are you sure you want to delete this recipe?')) {
        event.preventDefault();
      } else {
        // Remove from fav List
        let favList = JSON.parse(localStorage.getItem('favorites'));
        if (favList) {
          let index = favList.indexOf(data.recipe_id);
          if (index !== -1) {
            favList.splice(index, 1);
            localStorage.setItem('favorites', JSON.stringify(favList));
          }
        }
        // Remve recipe from current list
        window.electron.removeRecipe(data.recipe_id);
        const parent = document.querySelector('article.recipe-cards');
        let removeCard = document.querySelector(`recipe-card[id="${this.json.recipe_id}"]`);

        console.log('Card Element to remove: ');
        console.log(removeCard);

        Reflect.deleteProperty(frontEndRecipeDict, data.recipe_id);
        parent.removeChild(removeCard);
        if (document.getElementsByClassName('recipe-cards').classList === 2) {
          console.log('in-here');
          showFavorite();
        }
      }
    });
  }
}

/**
 * Used to populate the recipe form when user requests to edit a recipe
 * @param {object} recipeData JSON object with recipe information
 */
function fillComposeRecipeFormData(recipeData) {
  document.getElementById('add-recipe').classList.remove('hidden');
  document.getElementById('add-recipe').style.display = 'grid';
  document.getElementById('recipe-name').value = recipeData.name;
  document.getElementById('ingredients').value = recipeData.ingredients;
  document.getElementById('instructions').value = '';
  for (let i = 0; i < recipeData.steps.length; i++) {
    if (recipeData.steps[i] === '') {
      continue;
    } else {
      document.getElementById('instructions').value += `${recipeData.steps[i]} \n`;
    }
  }
  document.getElementById('time-cook').value = recipeData.metrics.cook_time;
  document.getElementById('time-prep').value = recipeData.metrics.prep_time;
  document.getElementById('serving').value = recipeData.metrics.servings;
  // give the add-recipe form a state saying that it was opened from the "edit" option
  document.getElementById(RECIPE_FORM_ID)[OPENED_FROM] = recipeData.recipe_id;
  document.getElementById('output')['src'] = recipeData.image;
  // give the image upload form a state saying that it was opened from "edit" and should only apply itself
  // if the image was changed.
  document.querySelector(IMAGE_UPLOAD_SELECTOR)[IMAGE_CHANGED] = false;

  // Populate the tags
  removeChildren(document.getElementById('tag-items'));
  recipeLabels = recipeData.metadata.labels;
  for (let i = 0; i < recipeLabels.length; i++) {
    let tagItem = document.createElement('div');
    tagItem.classList.add('item');
    tagItem.innerHTML = `
      <span class="delete-btn" id='${recipeLabels[i]}'>
      &times;
      </span>
      <span>${recipeLabels[i]}</span>
    `;
    document.getElementById(TAG_LIST).appendChild(tagItem);
  }
  populateTags(recipeLabels);
  console.log('Form Data filled with: ');
  console.log(recipeData);
}

customElements.define('recipe-card', recipeCard);
