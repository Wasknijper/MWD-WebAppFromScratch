(function(){
	"use strict";
	var app = {
		apiUrl : 'http://pokeapi.co/',
		startUrl : "",
		pages : "",
		startScreen: "home",
		oldRoute : "",
		newRoute: "",
		init: function(){
			this.startUrl = window.location.href;

			//get all the section elements
			this.pages = document.getElementsByTagName('section');

			//Loop through all page elements and make them invisible 
			for(var i = 0; i < this.pages.length; i++){
				this.pages[i].classList.add("invis");
			}

			var pokeData, curObj, name, loading;
			//check if pokedex is in local storage - bron:http://stackoverflow.com/questions/3262605/html5-localstorage-check-if-item-is-set
			if(localStorage.getItem('pokedex') === null) {
				pokeData = this.request('api/v1/pokedex/1');
				curObj = this;

				pokeData.then(
				    // success handler
				    //xhr = xml http request
				    function(data, xhr) {
				      // load the list of pokemon into the pokedex, since it contains all the pokemon its the national pokedex.
				      // its not a string, so no need to parse the JSON
				      pokedex.national = data.pokemon;
				      localStorage.pokedex = JSON.stringify(pokedex.national);
				      //log to check
				      pokedex.loaded = true;
				      curObj.pages.home.innerHTML = templateHome.render({pokedex : pokedex.national});

				    },
				    // error handler
				    function(data, xhr) {
				      console.error(data, xhr.status);
				    }
				);
			} else {
				//if the pokedex already exists in localStorage, set it to pokedex.national
				pokedex.national = JSON.parse(localStorage.pokedex);

				if(localStorage.getItem('savedPokemon')){
					pokedex.savedPokemon = JSON.parse(localStorage.savedPokemon);
				}

				console.log(pokedex.national);
				console.log(pokedex.savedPokemon);

				pokedex.loaded = true;
				this.pages.home.innerHTML = templateHome.render({pokedex : pokedex.national});
				//var pokemon = this.national.indexOf(searchElement[, fromIndex = 0])
			}

			//add route event listeners by initializing routes
			//routes.init();
			//initialize pokedex
			processHash();
			window.addEventListener('hashchange', processHash);
		},
		request : function(options){
			//call pegasus libirary for the ajax get
			return pegasus(this.apiUrl + options);
		}
	};

	var routes = new Rlite();

	routes.add('', function () {
  		document.title = 'Home';
  		app.pages.home.classList.remove("invis");
  		console.log(pokedex.national);
  		if (pokedex.loaded === false){
  			app.pages.home.innerHTML = templateLoading.render();
  		} else {
  			app.pages.home.innerHTML = templateHome.render({pokedex : pokedex.national});
   		}
	});

	routes.add('pokemon/:name', function (route) {
		var pName = route.params.name.toString();
		console.log(pName);
		var found = pokedex.findPokemon(pokedex.national, pName);
		var url, currentPokemon;

		if (found === false){

		} else {
  			app.pages.pokemon.innerHTML = templateLoadingPoke.render({name : pName});
			url = pokedex.national[found].resource_uri;
			pokedex.loadPokemon(pName.capitalize(), url);
		}

	});

	// Hash-based routing
	function processHash() {
  		var hash = location.hash || '#';
  		app.oldRoute = app.newRoute;
  		app.newRoute = hash.slice(1);
  		routes.run(app.newRoute);
  		sections.toggle(app.newRoute, app.oldRoute);
	}

	var sections = {
		toggle: function(newRoute, oldRoute){
			//scroll to top incase the page is long
			window.scrollTo(0,0);
			newRoute = newRoute.split('/')[0];
			oldRoute = oldRoute.split('/')[0];
			//console.log(newRoute);
			//check if the newRoute is the same as the old route, only excecute if its changes
			if (newRoute != oldRoute) {
				if (newRoute){
					app.pages[newRoute].classList.remove('invis');
				} else {
					//if there is no hash then set it to the home
					app.pages[app.startScreen].classList.remove('invis');
				}
				//add invis to the old route, if it exists
				if(oldRoute){
					app.pages[oldRoute].classList.add('invis');	
				} else {
					//if it doesnt, its on the startscreen, so add invis to that
					app.pages[app.startScreen].classList.add('invis');
				}
			}

		}
	};

	// templates
	var templateLoading = new t("<p>Loading all the Pokémon...</p>");
	var templateLoadingPoke = new t("<p>Loading data on {{=name}}</p>");
	var templateHome = new t("<ul>{{@pokedex}}<li><a href=\'#pokemon/{{%_val.name}}\'>{{=_val.name}}</a></li>{{/@pokedex}}</ul>");
	var templateError = new t("<p>This is not a pokemon! <a href=\'#\'>Return to Home</a></p>");
	var templatePokemonEvolve = new t("<h1>Meet {{=pokemon.name}}!</h1> <section> <h2>Abilities</h2> {{@pokemon.abilities}}<li>{{=_val.name}}</a></li>{{/@pokemon.abilities}}</section> <h2>Stats</h2> <section> <li>Attack: {{=pokemon.attack}}</li><li>Defence: {{=pokemon.defence}}</li><li>Hitpoints: {{=pokemon.hp}}</li><li>Sp. Attack: {{=pokemon.sp_atk}}</li><li>Sp. Defence: {{=pokemon.sp_def}}</li><li>Speed: {{=pokemon.speed}}</li></section> <section>{{=pokemon.name}} evolves to <a href=\'#pokemon/{{=evoLink}}\'>{{=evolution}}</a></section>");
	var templatePokemon = new t("<h1>Meet {{=pokemon.name}}!</h1> <section> <h2>Abilities</h2> {{@pokemon.abilities}}<li>{{=_val.name}}</a></li>{{/@pokemon.abilities}}</section> <h2>Stats</h2> <section> <li>Attack: {{=pokemon.attack}}</li><li>Defence: {{=pokemon.defence}}</li><li>Hitpoints: {{=pokemon.hp}}</li><li>Sp. Attack: {{=pokemon.sp_atk}}</li><li>Sp. Defence: {{=pokemon.sp_def}}</li><li>Speed: {{=pokemon.speed}}</li></section>");

	var pokedex = {
		//pokemon objects in the national array have a name(bulbasaur) and a resource_uri("api/v1/pokemon/1/")
		loaded : false,
		national : [],
		savedPokemon : [],
		loadPokemon : function(pName, uri, pokemon) {
			var result = app.request(uri);
			var curObj = this;
			var isSaved = this.findPokemon(this.savedPokemon, pName);
			//check if the pokemon exists in the savedPokemon array
			if (isSaved === false){
				//
				result.then(
					function(data, xhr) {
						var pokemon = data;
						console.log(data);
						curObj.savedPokemon.push(data);
						localStorage.savedPokemon = JSON.stringify(curObj.savedPokemon);
						//return the loaded pokemon so we can use it in a function
						curObj.displayPokemon(pokemon);
					}, function(data, xhr) {
						console.error(data, xhr.status);
					}
				);
			} else {
				console.log(this.savedPokemon[isSaved]);
				this.displayPokemon(this.savedPokemon[isSaved]);
			}

		},
		findPokemon : function(array, value){
			if(array.length !== 0){
				for(var i = 0, len = array.length; i < len; i++) {
    				if( array[i].name == value ){
        				return i;
					} else if (array.length-1 === i){
						return false;
					}
				}
			} else {
				return false;
			}
		},
		displayPokemon : function(pokemon){
			if (pokemon.evolutions.length > 0){
	  			app.pages.pokemon.innerHTML = templatePokemonEvolve.render({pokemon : pokemon, evolution: pokemon.evolutions[0].to, evoLink : pokemon.evolutions[0].to.toLowerCase()});
	  		} else {
	  			app.pages.pokemon.innerHTML = templatePokemon.render({pokemon : pokemon});	
	  		}
		}
	};

	//add capitalize function to string, source: http://stackoverflow.com/a/3291856
	String.prototype.capitalize = function() {
    	return this.charAt(0).toUpperCase() + this.slice(1);
	};

	//start the app
	app.init();

}());