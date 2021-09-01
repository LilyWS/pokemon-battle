/*Query strings:
p1: pokemon1, p2: pokemon2, loc: location
loc can be left blank to use players current location
looks like: ?p1=charizard&p2=pikachu&loc=
*/
var parameters = new URLSearchParams(window.location.search);

var weatherAPIKey = 'e93a9a6062496e0d1483164567d29081';
var pokemon1 = (parameters.get("p1")) ? parameters.get("p1") : "squirtle";
var pokemon2 = (parameters.get("p2")) ? parameters.get("p2") : "bulbasaur";
var pokemon = []; //will contain objects representing pokemon 1 and 2
var pokeURL1 = `https://pokeapi.co/api/v2/pokemon/${pokemon1}/`;
var pokeURL2 = `https://pokeapi.co/api/v2/pokemon/${pokemon2}/`;

//following code is tempory until better id's get assigned to pokemon slots
var pokeCards = document.querySelector("#live-battle");

//order is the same as pokemon array but order by speed instead of player. pokemon is used for rendering and order for logic
var order = [];//order in which pokemon will take turns
var battleTimer;

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
            return (data);
        });
}

function createPokemon(data, pokeIndex) { //pokeIndex is which index of the pokemon array we're accessing 
    //we have to do a second api call to get the specification of their type and how it relates to other types
    //let typeUrl = `https://pokeapi.co/api/v2/type/${}/`;
    //let typeData = getType()
    pokemon[pokeIndex] = {
        name: data.name,
        spriteBack: (!data.sprites.back_default) ? data.sprites.front_default : data.sprites.back_default,
        spriteForward: data.sprites.front_default,
        mHp: data.stats[0].base_stat, //max hp
        cHp: data.stats[0].base_stat, //current hp
        atk: data.stats[1].base_stat,
        def: data.stats[2].base_stat,
        sAtk: data.stats[3].base_stat,
        sDef: data.stats[4].base_stat,
        spd: data.stats[5].base_stat,
    }
    if (pokemon[0] && pokemon[1]) { //check if both pokemon are loaded
        renderPokemon()
        initBattle()
    }
}

/*
battles wil take place turn by turn
a turn comprises of both mon attacking
the faster one will go first 
they will use either atk or special atk, whichever is higher 
the other pokemon will defened with their corresponding defense stat
the damgage given will follow the following formula:
(Attack of pokemon/Defense of other pokemon)*(Math.random()*.15+.85)*(damage mutliplier from type interaction)
*/

function initBattle() { //set up the battle 
    let p1 = pokemon[0];
    let p2 = pokemon[1];
    order = (p1.spd > p2.spd) ? [p1, p2] : [p2, p1];
    //determine what the pokemon will attack and defend with
    p1.using = (p1.sAtk > p1.atk) ? 'sAtk' : 'atk';
    p2.defWith = (p1.using == 'sAtk') ? p2.sDef : p2.def;
    p2.using = (p2.sAtk > p2.atk) ? 'sAtk' : 'atk';
    p1.defWith = (p2.using == 'sAtk') ? p1.sDef : p1.def;
    //battleTimer = setInterval(battleStep, 250);
}

function battleStep() { //function to process one step of the battle (a turn for both players)
    for (let i = 0; i < order.length; i++) {
        let p1 = order[i]; //in this context p1 is the currently attacking pokemon and p2 is the defending one
        let p2 = (i) ? order[0] : order[1];
        let dmgVal = Math.round(((p1[p1.using] / p2.defWith) * (Math.random() * .15 + .85) * 1) * 10) / 10 //1 will become type multiplier later. we also round damage to one decimal place
        p2.cHp = Math.round((p2.cHp - dmgVal) * 10) / 10; //we round to tenths place because javascript sucks at floating point numbers

        if (p2.cHp < .1) {
            console.log(`${p2.name} is hit for ${dmgVal} and faints!`);
            console.log(`${p1.name} had ${p1.cHp} HP left.`);
            clearInterval(battleTimer);
            break;
        }
        console.log(`${p2.name} is hit for ${dmgVal}!`);
        console.log(`The have ${p2.cHp} HP left!`);
    }

}

function renderPokemon() {
    console.log(pokemon);
    let pokeImages = [pokemon[0].spriteBack, pokemon[1].spriteForward];
    for (let i = 0; i < pokeCards.querySelectorAll("img").length; i++) { //loop through each pokemon display and update it visually
        pokeCards.querySelectorAll("img")[i].setAttribute("src", pokeImages[i]) {
            if (pokeCards.querySelectorAll("img")[i].setAttribute("class", "flip-front-back"));
    }
    }
}

getPokemon(pokeURL1, pokeURL2);