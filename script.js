/*Query strings:
p1: pokemon1, p2: pokemon2, loc: location
loc can be left blank to use players current location
looks like: ?p1=charizard&p2=pikachu&loc=
*/
var parameters = new URLSearchParams(window.location.search);

var weatherAPIKey = 'e93a9a6062496e0d1483164567d29081';
var pokemon1= (parameters.get("p1")) ? parameters.get("p1") : "squirtle";
var pokemon2= (parameters.get("p2")) ? parameters.get("p2") : "bulbasaur";
var pokemon = []; //will contain objects representing pokemon 1 and 2
var pokeURL1 = `https://pokeapi.co/api/v2/pokemon/${pokemon1}/`;
var pokeURL2 = `https://pokeapi.co/api/v2/pokemon/${pokemon2}/`;

//following code is tempory until better id's get assigned to pokemon slots
var pokeCards = document.querySelectorAll(".choice-of-pokemon");

function getPokemon(url, url2) {
    fetch(url)
    .then(function (response) {
        return response.json();
      })
    .then(function (data) {
        console.log(data);
        createPokemon(data, 0);
    });
    fetch(url2)
    .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        console.log(data);
        createPokemon(data, 1);
    });
}

function getType(url) {
    fetch(url)
    .then(function (response) {
        return response.json();
      })
    .then(function (data) {
        console.log(data);
        return(data);
    });
}

function createPokemon(data, pokeIndex){ //pokeIndex is which index of the pokemon array we're accessing 
    //we have to do a second api call to get the specification of their type and how it relates to other types
    //let typeUrl = `https://pokeapi.co/api/v2/type/${}/`;
    //let typeData = getType()
    pokemon[pokeIndex] = {
        name: data.name,
        spriteBack: data.sprites.back_default,
        spriteForward: data.sprites.front_default,
        mHp: data.stats[0].base_stat, //max hp
        cHp: data.stats[0].base_stat, //current hp
        atk: data.stats[1].base_stat,
        def: data.stats[2].base_stat,
        sAtk: data.stats[3].base_stat,
        sDef: data.stats[4].base_stat,
        spd: data.stats[5].base_stat,
    }
    renderPokemon()
}

function battleStep() { //function to process one step of the battle (a turn for both players)
    let p1 = pokemon[0];
    let p2 = pokemon[1];
}

function renderPokemon(){
    let pokeImages = [pokemon[0].spriteBack, pokemon[1].spriteForward];
    for(let i=0; i<pokeCards.length;i++){ //loop through each pokemon display and update it visually
        pokeCards[i].querySelector("img").setAttribute("src", pokeImages[i])
    }
    
}
getPokemon(pokeURL1, pokeURL2);