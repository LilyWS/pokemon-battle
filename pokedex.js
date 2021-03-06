var pokedex = document.getElementById("pokedex");
var fetchPokemon = () => {
  var promises = [];
  for (let i = 1; i < 889; i++){
      var url = `https://pokeapi.co/api/v2/pokemon/${i}`;
      promises.push(fetch(url).then((res) => res.json()));
  };
  
    Promise.all(promises).then((results) => {
        var pokemon = results.map((data) => ({
            name: data.name.charAt(0).toUpperCase() + data.name.slice(1),
            id: data.id,
            image: data.sprites[`front_default`],
            type: data.types.map((type) => type.type.name).join(", ")
        }));
        displayPokemon(pokemon);
    });
};
    var displayPokemon = (pokemon) => {
        var pokemonHTMLString = pokemon.map(pokeman => `
        <li class= "card">
            <img class = "card-img" src="${pokeman.image}"/>
            <h2 class = "card-title">${pokeman.id}. ${pokeman.name}</h2>
            <p class = "card-subtitle">Type:${pokeman.type}</p>
        </li>

        `) 
        
        .join ("");
        pokedex.innerHTML = pokemonHTMLString;
    };

fetchPokemon();
