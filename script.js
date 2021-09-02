/*Query strings:
p1: pokemon1, p2: pokemon2, loc: location
loc can be left blank to use players current location
looks like: ?p1=charizard&p2=pikachu&loc=
*/
var parameters = new URLSearchParams(window.location.search);

var weatherAPIKey = 'e93a9a6062496e0d1483164567d29081';
var city = (parameters.get("loc")) ? parameters.get("loc").toLowerCase() : "Charlotte";
//TODO: account for spaces by adding hyphens (tapu lele)
var pokemon1 = (parameters.get("p1")) ? parameters.get("p1").toLowerCase() : "squirtle";
var pokemon2 = (parameters.get("p2")) ? parameters.get("p2").toLowerCase() : "bulbasaur";

var weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${weatherAPIKey}`;
var environmentStats = {};

var pokemon = []; //will contain objects representing pokemon 1 and 2
var pokeURL1 = `https://pokeapi.co/api/v2/pokemon/${pokemon1}/`;
var pokeURL2 = `https://pokeapi.co/api/v2/pokemon/${pokemon2}/`;

//render variables
var pokeCards = document.querySelector("#live-battle");
var p1StatDisplay = document.getElementById('left-stats');
var p2StatDisplay = document.getElementById('right-stats');
var p1Name = p1StatDisplay.querySelector("#left-pokemon-name");
var p2Name = p2StatDisplay.querySelector("#right-pokemon-name");
var p1HealthBar = p1StatDisplay.querySelector(".health-bar");
var p2HealthBar =  p2StatDisplay.querySelector(".health-bar");

//order is the same as pokemon array but order by speed instead of player. pokemon is used for rendering and order for logic
var order = [];//order in which pokemon will take turns
var battleTimer;



function getWeather(url) {

    var cityName = document.getElementById('city-name');
    var cityTime = document.getElementById('time');
    var cityTemp = document.getElementById('temp');
    cityTime.textContent = moment().format('h:mm a');

    fetch(url)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log(data);
            cityName.textContent = data.name;
            cityTemp.textContent = parseInt(data.main.temp) + "°";
            var icon = data.weather[0].icon;
            var iconUrl = "http://openweathermap.org/img/w/" + icon + ".png";
            document.getElementById('icon').setAttribute('src', iconUrl);
            setWeather(data);
            return data;
        });
}

function setWeather(data) {
    environmentStats.weatherType = data.weather[0].main;
    environmentStats.time = moment(moment.utc()).add(data.timezone, 'seconds').format('H:mm');
    console.log(environmentStats)
}

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

function getType(url, url2) {
    fetch(url)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            pokemon[0].typeData = data;
            loadTypes(0)
            return
        });
    fetch(url2)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            pokemon[1].typeData = data;
            loadTypes(1)
            return (data);
        });
}

function createPokemon(data, pokeIndex) { //pokeIndex is which index of the pokemon array we're accessing 
    //we have to do a second api call to get the specification of their type and how it relates to other types
    //let typeUrl = `https://pokeapi.co/api/v2/type/${}/`;
    //let typeData = getType()

    //TODO: catch edge cases where the pokemon has no back sprite or front sprite
    pokemon[pokeIndex] = {
        name: data.name,
        spriteBack: (!data.sprites.back_default) ? data.sprites.front_default : data.sprites.back_default,
        spriteForward: data.sprites.front_default,
        type: data.types[0].type.name,
        mHp: data.stats[0].base_stat, //max hp
        cHp: data.stats[0].base_stat, //current hp
        atk: data.stats[1].base_stat,
        def: data.stats[2].base_stat,
        sAtk: data.stats[3].base_stat,
        sDef: data.stats[4].base_stat,
        spd: data.stats[5].base_stat,
    }

    if (pokemon[0] && pokemon[1]) { //check if both pokemon are loaded
        getType(`https://pokeapi.co/api/v2/type/${pokemon[0].type}/`, `https://pokeapi.co/api/v2/type/${pokemon[1].type}/`);
        renderPokemon()
    }
}

function loadTypes(pokeIndex) { //this function exists so that the game will not try to run before the type api call completes
    if (pokemon[0].typeData && pokemon[1].typeData) { //check if both pokemon are loaded
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
    //determine what stat the pokemon will attack and defend with
    p1.using = (p1.sAtk > p1.atk) ? 'sAtk' : 'atk';
    p2.defWith = (p1.using == 'sAtk') ? p2.sDef : p2.def;
    p2.using = (p2.sAtk > p2.atk) ? 'sAtk' : 'atk';
    p1.defWith = (p2.using == 'sAtk') ? p1.sDef : p1.def;
    //determine how type will multiply their attacks

    p1.atkMult = getAtkMult(p1.typeData.damage_relations, p2.type);
    p2.atkMult = getAtkMult(p2.typeData.damage_relations, p1.type);
    battleTimer = setInterval(battleStep, 250);
}

function getAtkMult(dmgRelations, targetType) {
    if (dmgRelations.double_damage_to.some(e => e.name === targetType)) {
        return (2);
    } else if (dmgRelations.half_damage_to.some(e => e.name === targetType)) {
        return (.5);
    } else if (dmgRelations.no_damage_to.some(e => e.name === targetType)) {
        return (.25);
    }
}

function battleStep() { //function to process one step of the battle (a turn for both players)
    for (let i = 0; i < order.length; i++) {
        let p1 = order[i]; //in this context p1 is the currently attacking pokemon and p2 is the defending one
        let p2 = (i) ? order[0] : order[1];
        let dmgVal = Math.round(((p1[p1.using] / p2.defWith) * (Math.random() * .15 + .85) * p1.atkMult) * 10) / 10 //we round damage to one decimal place
        p2.cHp = Math.round((p2.cHp - dmgVal) * 10) / 10; //we round health to tenths place because javascript sucks at floating point numbers

        if (p2.cHp < .1) {
            console.log(`${p2.name} is hit for ${dmgVal} and faints!`);
            console.log(`${p1.name} had ${p1.cHp} HP left.`);
            clearInterval(battleTimer);
            break;
        }
        console.log(`${p2.name} is hit for ${dmgVal}!`);
        console.log(`The have ${p2.cHp} HP left!`);
    }
    renderStats();

}

function renderStats() {


    p1Name.textContent = pokemon1.charAt(0).toUpperCase() + pokemon1.slice(1).toLowerCase();
    p2Name.textContent = pokemon2.charAt(0).toUpperCase() + pokemon2.slice(1).toLowerCase();

    p1HealthBar.setAttribute('max', pokemon[0].mHp);
    p1HealthBar.setAttribute('value', pokemon[0].cHp);
    p2HealthBar.setAttribute('max', pokemon[1].mHp);
    p2HealthBar.setAttribute('value', pokemon[1].cHp);
}

function renderPokemon() {
    console.log(pokemon);
    renderStats();

    //render image to Battle
    let pokeImages = [pokemon[0].spriteBack, pokemon[1].spriteForward];
    for (let i = 0; i < pokeCards.querySelectorAll("img").length; i++) { //loop through each pokemon display and update it visually
        pokeCards.querySelectorAll("img")[i].setAttribute("src", pokeImages[i])
        if (pokemon[i].spriteBack == pokemon[i].spriteForward && !i) {
            pokeCards.querySelectorAll("img")[i].setAttribute("class", "flip-front-back")
        }
    }

}
getWeather(weatherURL);
getPokemon(pokeURL1, pokeURL2);
showNames();