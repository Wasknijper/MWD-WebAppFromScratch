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

			//check if pokedex is in local storage - bron:http://stackoverflow.com/questions/3262605/html5-localstorage-check-if-item-is-set
			if(localStorage.getItem('pokedex') === null) {
				//get the data from the api
				var pokeData = this.request('api/v1/pokedex/1');
				var curObj = this;

				pokeData.then(
				    // success handler, so if the request is done this happens
				    //xhr = xml http request
				    function(data, xhr) {
				    	// load the list of pokemon into the pokedex, since it contains all the pokemon its the national pokedex.
				    	// Api returns an object, not a string
				    	pokedex.national = data.pokemon;
				    	//but for us to save in local storage we do need to stringify
				    	localStorage.pokedex = JSON.stringify(pokedex.national);
				 	    pokedex.loaded = true;
				 	    //render the template
				 	    console.log(pokedex.national);
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

				//if there are any pokemon already saved load them to pokedex.savedPokemon
				if(localStorage.getItem('savedPokemon')){
					pokedex.savedPokemon = JSON.parse(localStorage.savedPokemon);
				}

				pokedex.loaded = true;
				//render the template
				this.pages.home.innerHTML = templateHome.render({pokedex : pokedex.national});
			}


			//run processHash to go to the right page
			processHash();
			//add the event listener for future hashchanges
			window.addEventListener('hashchange', processHash);
		},
		request : function(options){
			//call pegasus libirary for the ajax get
			return pegasus(this.apiUrl + options);
		},
		searchForm : function(){
			var form = document.getElementById('search');
			//returns an array
			var field = document.getElementsByName('searchPoke')[0];
			form.onsubmit = function(event){
				event.preventDefault();
				var found = pokedex.findPokemon(pokedex.national, field.value);
				var p = document.createElement('p');
				var message, pName, uri, goTo;

				console.log(found);
				if(found === false){
					p.appendChild(message);
					app.pages.home.appendChild(p);
					p.innerHTML = "Pokemon not found!";
				} else {
					pName = pokedex.national[found].name;
					uri = pokedex.national[found].resource_uri;
					pokedex.loadPokemon(pName, uri);
					window.location.hash = ('pokemon/' + pName);
				}
				return false;
			};

		}
	};

	//make a router
	var routes = new Rlite();

	//route for no hash or empty hash
	routes.add('', function () {
  		document.title = 'Home';
  		app.pages.home.classList.remove("invis");
  		console.log(pokedex.national);
  		if (pokedex.loaded === false){
  			//if pokedex is still being initilized show a loading message
  			app.pages.home.innerHTML = templateLoading.render();
  		} else {
  			app.pages.home.innerHTML = templateHome.render({pokedex : pokedex.national});
  			app.searchForm();
   		}
	});

	//route for the pokemon detail page
	routes.add('pokemon/:name', function (route) {
		//convert it to string
		var pName = route.params.name.toString();
		//look up the pokemon in pokedex.national
		var found = pokedex.findPokemon(pokedex.national, pName);
		var url, currentPokemon;

		if (found === false){
			//if pokemon isnt found in pokedex it doesnt exist
			app.pages.pokemon.innerHTML = templateError.render();
		} else {
			//Start the loading template and execute load function to display the pokemon
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
	var templateHome = new t("<form id=\'search\'><input type=\'text\' name=\'searchPoke\' placeholder=\'Enter the pokemon you want to find\' /><button type=\'submit\'>Find that Pokémon!</button></form><ul>{{@pokedex}}<li><a href=\'#pokemon/{{%_val.name}}\'>{{=_val.name}}</a></li>{{/@pokedex}}</ul>");
	var templateError = new t("<p>This is not a pokemon! <a href=\'#\'>Return to Home</a></p>");
	var templatePokemonEvolve = new t("<h1>Meet {{=pokemon.name}}!</h1> <main> <section> <h2>Abilities</h2> {{@pokemon.abilities}}<li>{{=_val.name}}</a></li>{{/@pokemon.abilities}}</section> <h2>Stats</h2> <section> <li>Attack: {{=pokemon.attack}}</li><li>Defence: {{=pokemon.defence}}</li><li>Hitpoints: {{=pokemon.hp}}</li><li>Sp. Attack: {{=pokemon.sp_atk}}</li><li>Sp. Defence: {{=pokemon.sp_def}}</li><li>Speed: {{=pokemon.speed}}</li></section> <section>{{=pokemon.name}} evolves to <a href=\'#pokemon/{{=evoLink}}\'>{{=evolution}}</a></section></main>");
	var templatePokemon = new t("<h1>Meet {{=pokemon.name}}!</h1><main> <section> <h2>Abilities</h2> {{@pokemon.abilities}}<li>{{=_val.name}}</a></li>{{/@pokemon.abilities}}</section> <h2>Stats</h2> <section> <li>Attack: {{=pokemon.attack}}</li><li>Defence: {{=pokemon.defence}}</li><li>Hitpoints: {{=pokemon.hp}}</li><li>Sp. Attack: {{=pokemon.sp_atk}}</li><li>Sp. Defence: {{=pokemon.sp_def}}</li><li>Speed: {{=pokemon.speed}}</li></section></main>");

	var pokedex = {
		//pokemon objects in the national array have a name(bulbasaur) and a resource_uri("api/v1/pokemon/1/")
		loaded : false,
		national : [],
		savedPokemon : [],
		loadPokemon : function(pName, uri, callBack) {
			//make the request to the api
			var curObj = this;
			//check if this pokemon already exists in the array
			var isSaved = this.findPokemon(this.savedPokemon, pName);
			//check if the pokemon exists in the savedPokemon array
			if (isSaved === false){
				var result = app.request(uri);
				//if it doesnt we store the data in savedPokemon and launch displayPokemon for it to render
				result.then(
					function(data, xhr) {
						var pokemon = data;
						console.log(data);
						curObj.savedPokemon.push(data);
						localStorage.savedPokemon = JSON.stringify(curObj.savedPokemon);
						//return the loaded pokemon so we can use it in a function
						curObj.displayPokemon(pokemon);

						if(typeof callBack === "function"){
							callBack(pName);
						}
					}, function(data, xhr) {
						console.error(data, xhr.status);
					}
				);
			} else {
				// it already exists in savedPokemon run displayPokemon
				this.displayPokemon(this.savedPokemon[isSaved]);
				if(typeof callBack === "function"){
					callBack();
				}
			}

		},
		findPokemon : function(array, value){
			//accepts the array to search in and the value we look for
			if(array.length !== 0){
				//if the array is not empty we start the for loop
				for(var i = 0, len = array.length; i < len; i++) {
    				if( array[i].name == value ){
    					//if we find the pokemon we return the index from the array
        				return i;
					} else if (array.length-1 === i){
						//otherwise we return false, so we know it doesnt exist in the array
						return false;
					}
				}
			} else {
				//return false if the array is not an array or empty
				return false;
			}
		},
		displayPokemon : function(pokemon){
			//check if the pokemon has an evolution to render the correct template
			var imgDiv = document.createElement('div');
				imgDiv.style.backgroundImage = "url('load.gif')";
				
			if (pokemon.evolutions.length > 0){
	  			app.pages.pokemon.innerHTML = templatePokemonEvolve.render({pokemon : pokemon, evolution: pokemon.evolutions[0].to, evoLink : pokemon.evolutions[0].to.toLowerCase()});
	  			app.pages.pokemon.appendChild(imgDiv);
	  			this.getPokemonImg(pokemon.name, imgDiv);
	  		} else {
	  			app.pages.pokemon.innerHTML = templatePokemon.render({pokemon : pokemon});
	  			app.pages.pokemon.appendChild(imgDiv);
	  			this.getPokemonImg(pokemon.name, imgDiv);	
	  		}
		},
		getPokemonImg : function(pName, img){
			var mwjs = new MediaWikiJS('http://bulbapedia.bulbagarden.net/');
			var pageName = pName + '_(Pokémon)';
			//console.log(pageName);
			mwjs.send({action: 'parse', page: pageName , prop: 'images'}, function (data) {
    			var imgName = data.parse.images[2]; 
    			//console.log(imgName);

    			var getImg = new MediaWikiJS('http://bulbapedia.bulbagarden.net/');

    			getImg.send({action: 'query', titles: "File:" + imgName, prop: 'imageinfo', iiprop: 'url', rawcontinue:""},function(dataImg){
    				var imgUrl = dataImg.query.pages[-1].imageinfo[0].url;
    				img.style.backgroundImage = "url(" + imgUrl +")";
    			});
			});
		}
	};

	//add capitalize function to string, source: http://stackoverflow.com/a/3291856
	String.prototype.capitalize = function() {
    	return this.charAt(0).toUpperCase() + this.slice(1);
	};

	//start the app
	app.init();
}());