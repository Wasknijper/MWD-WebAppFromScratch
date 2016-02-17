(function(){
	"use strict";
	var app = {
		apiUrl : '//pokeapi.co/',
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
				pokeData = this.request('api/v1/pokedex/1');
				curObj = this;

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
				    	curObj.pages.home.innerHTML = templateHome.render({pokedex : pokedex.national});
				    	console.log(pokedex.national);
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
				console.log(pokedex.national);
			}


			if (annyang) {
		  // Let's define a command.
		  		var commands = {
			    'show me *tag': logPokemon 
				};

			  var logPokemon = function(tag){
			  	console.log(tag);
			  };

			  // Add our commands to annyang
			  annyang.addCommands(commands);

			  // Start listening.
			  annyang.start();
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
			var fieldValue;
			console.log(field);

			form.onsubmit = function(event){
				event.preventDefault();
				fieldValue = field.value.toLowerCase();
				var searchResults = pokedex.national.filter(function(object){
					return object.name.includes(fieldValue);
				});
				app.pages.home.innerHTML = templateSearch.render({pokedex : searchResults});
			};

		}
	};

	//make a router
	var routes = new Rlite();

	//route for no hash or empty hash
	routes.add('', function () {
  		document.title = 'Home';
  		app.pages.home.classList.remove("invis");
  		if (pokedex.loaded === false){
  			//if pokedex is still being initilized show a loading message
  			app.pages.home.innerHTML = templateLoading.render();
  		} else {
  			//otherwise just show the pokedex
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
			//start the load pokemon function to get the data on this pokemon
			pokedex.loadPokemon(pName.capitalize(), url);
		}

	});

	// Hash-based routing, get the hash and run the routes
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
	var templateSearch = new t("<form id=\'search\'><input type=\'text\' name=\'searchPoke\' placeholder=\'Enter the pokemon you want to find\' /><button type=\'submit\'>Find that Pokémon!</button></form><h1>Search results:</h1><ul>{{@pokedex}}<li><a href=\'#pokemon/{{%_val.name}}\'>{{=_val.name}}</a></li>{{/@pokedex}}</ul>");	
	var templateError = new t("<p>This is not a pokemon! <a href=\'#\'>Return to Home</a></p>");
	var templatePokemonEvolve = new t("<h1>Meet {{=pokemon.name}}!</h1> <main> <section> <h2>Abilities</h2> {{@pokemon.abilities}}<li>{{=_val.name}}</a></li>{{/@pokemon.abilities}}</section> <h2>Stats</h2> <section> <li>Attack: {{=pokemon.attack}}</li><li>Defence: {{=pokemon.defence}}</li><li>Hitpoints: {{=pokemon.hp}}</li><li>Sp. Attack: {{=pokemon.sp_atk}}</li><li>Sp. Defence: {{=pokemon.sp_def}}</li><li>Speed: {{=pokemon.speed}}</li></section> <section>{{=pokemon.name}} evolves to <a href=\'#pokemon/{{=evoLink}}\'>{{=evolution}}</a></section></main>");
	var templatePokemon = new t("<h1>Meet {{=pokemon.name}}!</h1><main> <section> <h2>Abilities</h2> {{@pokemon.abilities}}<li>{{=_val.name}}</a></li>{{/@pokemon.abilities}}</section> <h2>Stats</h2> <section> <li>Attack: {{=pokemon.attack}}</li><li>Defence: {{=pokemon.defence}}</li><li>Hitpoints: {{=pokemon.hp}}</li><li>Sp. Attack: {{=pokemon.sp_atk}}</li><li>Sp. Defence: {{=pokemon.sp_def}}</li><li>Speed: {{=pokemon.speed}}</li></section></main>");

	var pokedex = {
		loaded : false,
		//pokemon objects in the national array have a name(bulbasaur) and a resource_uri("api/v1/pokemon/1/")
		national : [],
		savedPokemon : [],
		loadPokemon : function(pName, uri) {
			var curObj = this;
			//check if the pokemon exists in the savedPokemon array
			var isSaved = this.findPokemon(this.savedPokemon, pName);
			if (isSaved === false){
				//make the request to the pokeApi if it isnt saved
				var result = app.request(uri);
				result.then(
					function(data, xhr) {
						var pokemon = data;
						curObj.savedPokemon.push(data);
						localStorage.savedPokemon = JSON.stringify(curObj.savedPokemon);
						//pass the pokemon object to the displayPokemon function
						curObj.displayPokemon(pokemon);
					}, function(data, xhr) {
						//otherwise show the error
						console.error(data, xhr.status);
					}
				);
			} else {
				// it already exists in savedPokemon run displayPokemon
				this.displayPokemon(this.savedPokemon[isSaved]);
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
			if (pokemon.evolutions.length > 0){
	  			app.pages.pokemon.innerHTML = templatePokemonEvolve.render({pokemon : pokemon, evolution: pokemon.evolutions[0].to, evoLink : pokemon.evolutions[0].to.toLowerCase()});
	  			//then we load the image from a different api
	  			this.getPokemonImg(pokemon.name);
	  		} else {
	  			app.pages.pokemon.innerHTML = templatePokemon.render({pokemon : pokemon});
				this.getPokemonImg(pokemon.name);
	  		}
		},
		getPokemonImg : function(pName){
			//I had to use a wrapper to get around CORS
			var mwjs = new MediaWikiJS('//bulbapedia.bulbagarden.net/');
			//make a page name and a div to display the pokemon in
			var pageName = pName + '_(Pokémon)';
			var imgDiv = document.createElement('div');
				imgDiv.style.backgroundImage = "url('load.gif')";
			//we append it so the user knows an image is being loaded
			app.pages.pokemon.appendChild(imgDiv);

			//make another request to get the image we want from the page
			mwjs.send({action: 'parse', page: pageName , prop: 'images'}, function (data) {
    			if(data.error){
    				//if it throws an error show an error message. Not all pokémon have a seperate img, like rotom-wash or any mega evolution
	    			imgDiv.style.backgroundImage = "url('error.png')";
    			} else {
    				//The main image is always the 3rd in the array.
	    			var imgName = data.parse.images[2];
	    			var getImg = new MediaWikiJS('//bulbapedia.bulbagarden.net/');

	    			//now we have to do another request to get the direct link to the img
	    			getImg.send({action: 'query', titles: "File:" + imgName, prop: 'imageinfo', iiprop: 'url', rawcontinue:""},function(dataImg){
	    				//object in objects in objects in arrays in objects...
	    				var imgUrl = dataImg.query.pages[-1].imageinfo[0].url;
	    				//make a preloader so we only replace the image when its finished loading
	    				var preloader = new Image();
	    				preloader.onload = function(){
	    					imgDiv.style.backgroundImage = "url(" + imgUrl +")";	
	    				};
	    				preloader.src = imgUrl;

	    			});
    			}
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