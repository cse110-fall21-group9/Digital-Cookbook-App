class recipeCard extends HTMLElement{
    constructor() {
        super();
        this.attachShadow({mode:"open"});
    }

    const card = document.createElement("article");

    let imgElem = document.createElement('img');
    imgElem.src = searchForKey(data, "thumbnailUrl");
    imgElem.alt = searchForKey(data, "headline");
    card.appendChild(imgElem);

}