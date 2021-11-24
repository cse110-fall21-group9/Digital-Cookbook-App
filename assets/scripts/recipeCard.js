class recipeCard extends HTMLElement{
    constructor() {
        super();
        this.attachShadow({mode:"open"});
    }

    /**
   * Create a new JSON file on the data user enter 
   * @param {string} data the name of the file to delete.
   */
//     set data(data) {
//         if (!data) return;
    
//         // Used to access the actual data object
//         this.json = data;
    
//         const style = document.createElement('style');
//         const card = document.createElement('div');

//         // Grab the title
        
//         title.classList.add('title');
//         title.id = 'name';

//         // Grab the recipe link
//         const href = getUrl(data);
//         const link = document.createElement('a');
//         link.setAttribute('href', href);
//         link.innerText = titleText;
//         title.appendChild(link); // Make the title a link

//         // Grab the thumbnail
//         const imageUrl = getImage(data);
//         const image = document.createElement('img');
//         image.setAttribute('src', imageUrl);
//         image.setAttribute('alt', titleText);

//         // Grab the organization name
//         const organizationText = getOrganization(data);
//         const organization = document.createElement('p');
//         organization.classList.add('organization');
//         organization.innerText = organizationText;

//         // Grab the reviews
//         const ratingVal = searchForKey(data, 'ratingValue');
//         const ratingTotal = searchForKey(data, 'ratingCount');
//         const rating = document.createElement('div');
//         rating.classList.add('rating');
//         const numStars = Math.round(ratingVal);
//         if (ratingVal) {
//         rating.innerHTML = `
//             <span>${ratingVal}</span>
//             <img src="./assets/images/icons/${numStars}-star.svg" >
//         `;
//         if (ratingTotal) {
//             rating.innerHTML += `<span>(${ratingTotal})</span>`;
//         }
//         } else {
//         rating.innerHTML = `
//             <span>No Reviews</span>
//         `;
//         }

//         // Grab the total time
//         const totalTime = searchForKey(data, 'totalTime');
//         const time = document.createElement('time');
//         time.innerText = convertTime(totalTime);

//         // Grabt the ingredients
//         const ingredientsArr = searchForKey(data, 'recipeIngredient');
//         const ingredientsList = createIngredientList(ingredientsArr);
//         const ingredients = document.createElement('p');
//         ingredients.classList.add('ingredients');
//         ingredients.innerText = ingredientsList;

//         // Add all of the elements to the card
//         card.appendChild(image);
//         card.appendChild(title);
//         card.appendChild(organization);
//         card.appendChild(rating);
//         card.appendChild(time);
//         card.appendChild(ingredients);

//         this.shadowRoot.append(style, card);
//   }

//   get data() {
//     // Stored in .json to avoid calling set data() recursively in a loop.
//     // .json is also exposed so you can technically use that as well
//     return this.json;
//   }
// }
    

    

}