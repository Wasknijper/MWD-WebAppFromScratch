var pokedex = (function(){

	var getDescription = function(pokemon){
		if(!pokemon.descriptions[0]){
			displayPokemon(pokemon);
		} else {
			var descriptionRequest = utils.request(pokemon.descriptions[0].resource_uri);
			descriptionRequest.then(
				function(data){
					var description = data;
					console.log(pokemon);
					displayPokemon(pokemon, description);
				}
			);	
		}
		
	}

	var displayPokemon = function(pokemon, d){
		var type = pokemon.types[0].name;
		var description;
		if(!d){
			description = "No description found for this pokemon";
		} else {
			description = d.description;	
		}
		console.log(description);
		// it already exists in savedPokemon run displayPokemon
		launcher.pages.pokemon.classList.add(type);
		//check if the pokemon has an evolution to render the correct template
		if (pokemon.evolutions.length > 0){
  			launcher.pages.pokemon.innerHTML = templates.PokemonEvolve.render({pokemon : pokemon, descript : description, evolution: pokemon.evolutions[0].to, evoLink : pokemon.evolutions[0].to.toLowerCase()});
  			//then we load the image from a different api
  			getPokemonImg(pokemon.name);
  		} else {
  			launcher.pages.pokemon.innerHTML = templates.Pokemon.render({pokemon : pokemon, descript : description});
			getPokemonImg(pokemon.name);
  		}
	};

	var getPokemonImg = function(pName){
		//I had to use a wrapper to get around CORS
		var mwjs = new MediaWikiJS('http://bulbapedia.bulbagarden.net/');
		//make a page name and a div to display the pokemon in
		var pageName = pName + '_(Pokémon)';
		var imgDiv = document.createElement('div');
			////pokeball icon is from http://nintendo-papercraft.com/category/video-game/pokemon/
			imgDiv.style.backgroundImage = "url('img/load.png')";
			imgDiv.classList.add('loader');
		//we append it so the user knows an image is being loaded
		launcher.pages.pokemon.appendChild(imgDiv);

		//make another request to get the image we want from the page
		mwjs.send({action: 'parse', page: pageName , prop: 'images'}, function (data) {
			if(data.error){
				//if it throws an error show an error message. Not all pokémon have a seperate img, like rotom-wash or any mega evolution
    			imgDiv.style.backgroundImage = "url('img/error.png')";
    			imgDiv.classList.remove('loader');
			} else {
				//The main image is always the 3rd in the array.
    			var imgName = data.parse.images[2];
    			var getImg = new MediaWikiJS('http://bulbapedia.bulbagarden.net/');

    			//now we have to do another request to get the direct link to the img
    			getImg.send({action: 'query', titles: "File:" + imgName, prop: 'imageinfo', iiprop: 'url', rawcontinue:""},function(dataImg){
    				//object in objects in objects in arrays in objects...
    				var imgUrl = dataImg.query.pages[-1].imageinfo[0].url;
    				//make a preloader so we only replace the image when its finished loading
    				var preloader = new Image();
    				preloader.onload = function(){
    					imgDiv.classList.remove('loader');
    					imgDiv.classList.add('pop-in');
    					imgDiv.style.backgroundImage = "url(" + imgUrl +")";	
    				};
    				preloader.src = imgUrl;

    			});
			}
		});
	};

	return {
		loaded : false,
		//pokemon objects in the national array have a name(bulbasaur) and a resource_uri("api/v1/pokemon/1/")
		national : [],
		savedPokemon : [],
		init: function(){
			//check if pokedex is in local storage - bron:http://stackoverflow.com/questions/3262605/html5-localstorage-check-if-item-is-set
			if(localStorage.getItem('pokedex') === null) {
				//get the data from the api
				var pokeData = utils.request('api/v1/pokedex/1');
				var curObj = this;

				pokeData.then(
				    // success handler, so if the request is done this happens
				    //xhr = xml http request
				    function(data, xhr) {
				    	// load the list of pokemon into the pokedex, since it contains all the pokemon its the national pokedex.
				    	// Api returns an object, not a string
				    	curObj.national = data.pokemon;
				    	//get numbers from a string http://stackoverflow.com/a/14164576
				    	//and zero fill to 5 numbers http://stackoverflow.com/a/20460414
				    	curObj.national = utils.sort(curObj.national, 'resource_uri');
				    	//but for us to save in local storage we do need to stringify
				    	localStorage.pokedex = JSON.stringify(curObj.national);
				 	    curObj.loaded = true;
				 	    //render the template
				    	launcher.pages.home.main.innerHTML = templates.Home.render({pokedex : pokedex.national});
				    	//console.log(curObj.national);
				    },
				    // error handler
				    function(data, xhr) {
				    	console.error(data, xhr.status);
				    }
				);
			} else {
				//if the pokedex already exists in localStorage, set it to pokedex.national
				pokedex.national = JSON.parse(localStorage.pokedex);

				//if there are any pokemon already saved load them to pokedex.savedPokemon
				if(localStorage.getItem('savedPokemon')){
					pokedex.savedPokemon = JSON.parse(localStorage.savedPokemon);
				}

				pokedex.loaded = true;
				//render the template
				pokedex.national = utils.sort(pokedex.national, 'resource_uri');
				launcher.pages.home.main.innerHTML = templates.Home.render({pokedex : pokedex.national});
				//console.log(pokedex.national);
			}
		},
		loadPokemon : function(pName, uri) {
			var curObj = this;
			//check if the pokemon exists in the savedPokemon array
			var isSaved = utils.find(this.savedPokemon, pName, 'name');
			if (isSaved === false){
				//make the request to the pokeApi if it isnt saved
				var result = utils.request(uri);
				result.then(
					function(data, xhr) {
						var pokemon = data;
						curObj.savedPokemon.push(data);
						localStorage.savedPokemon = JSON.stringify(curObj.savedPokemon);
						//pass the pokemon object to the getDescription function
						getDescription(pokemon);
					}, function(data, xhr) {
						//otherwise show the error
						console.error(data, xhr.status);
					}
				);
			} else {
				var pokemon = this.savedPokemon[isSaved]
				getDescription(pokemon);
			}

		},
		randomPokemon: function(){
			var randomPoke = _.random(0, this.national.length);
			pName = this.national[randomPoke].name;
			window.location = '#pokemon/' + pName;
		}
	};
}());