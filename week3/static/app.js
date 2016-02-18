(function(){
	"use strict";
	var app = {
		apiUrl : 'http://pokeapi.co/',
		startUrl : "",
		pages : "",
		startScreen: "home",
		init: function(){
			this.startUrl = window.location.href;
			//get all the section elements
			this.pages = document.getElementsByTagName('section');
			this.pages.home.main = document.getElementById('homecontent');

			//Loop through all page elements and make them invisible 
			for(var i = 0; i < this.pages.length; i++){
				this.pages[i].classList.add("invis");
			}

			//check if pokedex is in local storage - bron:http://stackoverflow.com/questions/3262605/html5-localstorage-check-if-item-is-set
			pokedex.init();
			//run processHash to go to the right page
			utils.processHash();
			//add the event listener for future hashchanges
			window.addEventListener('hashchange', utils.processHash);
		},
		searchForm : function(){
			var form = document.getElementById('search');
			//returns an array
			var field = document.getElementsByName('searchPoke')[0];
			var fieldValue;
			console.log(field);

			form.onsubmit = function(e){
				//e.preventDefault();
				var searchResults = "";
				
				fieldValue = field.value.toLowerCase();
				searchResults = pokedex.national.filter(function(object){
					return object.name.includes(fieldValue);
				});
				app.pages.home.main.innerHTML = templates.Search.render({pokedex : searchResults});
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
  		if (pokedex.loaded === false){
  			//if pokedex is still being initilized show a loading message
  			app.pages.home.main.innerHTML = templates.Loading.render();
  		} else {
  			//otherwise just show the pokedex
  			app.pages.home.main.innerHTML = templates.Home.render({pokedex : pokedex.national});
  			app.searchForm();
   		}
	});

	//route for the pokemon detail page
	routes.add('pokemon/:name', function (route) {
		//convert it to string
		var pName = route.params.name.toString();
		//look up the pokemon in pokedex.national
		var found = utils.find(pokedex.national, pName, 'name');
		var url, currentPokemon;

		if (found === false){
			//if pokemon isnt found in pokedex it doesnt exist
			app.pages.pokemon.innerHTML = templates.Error.render();
		} else {
			//Start the loading template and execute load function to display the pokemon
  			app.pages.pokemon.innerHTML = templates.LoadingPoke.render({name : pName});

			url = pokedex.national[found].resource_uri;
			//start the load pokemon function to get the data on this pokemon
			pName = utils.capitalize(pName);
			pokedex.loadPokemon(pName, url);
		}

	});

	var sections = {
		oldRoute : "",
		newRoute: "",
		toggle: function(newR, oldR){
			//scroll to top incase the page is long
			window.scrollTo(0,0);
			newR = newR.split('/')[0];
			oldR = oldR.split('/')[0];

			//check if the newRoute is the same as the old route, only excecute if its changes
			if (newR != oldR) {
				if (newR){
					app.pages[newR].classList.remove('invis');
				} else {
					//if there is no hash then set it to the home
					app.pages[app.startScreen].classList.remove('invis');
				}
				//add invis to the old route, if it exists
				if(oldR){
					app.pages[oldR].classList.add('invis');	
				} else {
					//if it doesnt, its on the startscreen, so add invis to that
					app.pages[app.startScreen].classList.add('invis');
				}
			}

		}
	};

	// template objects
	var templates = {};
	templates.Loading = new t("<p>Loading all the Pokémon...</p>");
	templates.LoadingPoke = new t("<p>Loading data on {{=name}}</p>");
	templates.Home = new t("<ul>{{@pokedex}}<li><a href=\'#pokemon/{{%_val.name}}\'>{{=_val.name}}</a></li>{{/@pokedex}}</ul>");
	templates.Search = new t("<h1>Search results:</h1><ul>{{@pokedex}}<li><a href=\'#pokemon/{{%_val.name}}\'>{{=_val.name}}</a></li>{{/@pokedex}}</ul>");	
	templates.Error = new t("<p>This is not a pokemon! <a href=\'#\'>Return to Home</a></p>");
	templates.PokemonEvolve = new t("<h1>Meet {{=pokemon.name}}!</h1> <main> <section> <h2>Abilities</h2> {{@pokemon.abilities}}<li>{{=_val.name}}</a></li>{{/@pokemon.abilities}}</section> <h2>Stats</h2> <section> <li>Attack: {{=pokemon.attack}}</li><li>Defence: {{=pokemon.defence}}</li><li>Hitpoints: {{=pokemon.hp}}</li><li>Sp. Attack: {{=pokemon.sp_atk}}</li><li>Sp. Defence: {{=pokemon.sp_def}}</li><li>Speed: {{=pokemon.speed}}</li></section> <section>{{=pokemon.name}} evolves to <a href=\'#pokemon/{{=evoLink}}\'>{{=evolution}}</a></section></main>");
	templates.Pokemon = new t("<h1>Meet {{=pokemon.name}}!</h1><main> <section> <h2>Abilities</h2> {{@pokemon.abilities}}<li>{{=_val.name}}</a></li>{{/@pokemon.abilities}}</section> <h2>Stats</h2> <section> <li>Attack: {{=pokemon.attack}}</li><li>Defence: {{=pokemon.defence}}</li><li>Hitpoints: {{=pokemon.hp}}</li><li>Sp. Attack: {{=pokemon.sp_atk}}</li><li>Sp. Defence: {{=pokemon.sp_def}}</li><li>Speed: {{=pokemon.speed}}</li></section></main>");

	var pokedex = {
		loaded : false,
		//pokemon objects in the national array have a name(bulbasaur) and a resource_uri("api/v1/pokemon/1/")
		national : [],
		savedPokemon : [],
		init: function(){
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
				    	app.pages.home.main.innerHTML = templates.Home.render({pokedex : pokedex.national});
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
				app.pages.home.main.innerHTML = templates.Home.render({pokedex : pokedex.national});
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
		displayPokemon : function(pokemon){
			//check if the pokemon has an evolution to render the correct template
			if (pokemon.evolutions.length > 0){
	  			app.pages.pokemon.innerHTML = templates.PokemonEvolve.render({pokemon : pokemon, evolution: pokemon.evolutions[0].to, evoLink : pokemon.evolutions[0].to.toLowerCase()});
	  			//then we load the image from a different api
	  			this.getPokemonImg(pokemon.name);
	  		} else {
	  			app.pages.pokemon.innerHTML = templates.Pokemon.render({pokemon : pokemon});
				this.getPokemonImg(pokemon.name);
	  		}
		},
		getPokemonImg : function(pName){
			//I had to use a wrapper to get around CORS
			var mwjs = new MediaWikiJS('http://bulbapedia.bulbagarden.net/');
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
	    			var getImg = new MediaWikiJS('http://bulbapedia.bulbagarden.net/');

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

	var utils = {
		sort : function(array, key ){
			var result;
			result =  _.sortBy(array, function(obj){
				var number = obj[key].match(/\d/g);
				number = number.join("");
				var zerofilled = ('00000'+ number).slice(-5);
				return zerofilled;
	    	});
			return result;
		},
		//add capitalize function to string, source: http://stackoverflow.com/a/3291856
		capitalize : function(string) {
	    	return string.charAt(0).toUpperCase() + string.slice(1);
		},
		// Hash-based routing, get the hash and run the routes
		processHash: function() {
  			var hash = location.hash || '#';
  			sections.oldRoute = sections.newRoute;
  			sections.newRoute = hash.slice(1);
  			routes.run(sections.newRoute);
  			sections.toggle(sections.newRoute, sections.oldRoute);
		},
		request : function(options){
			//call pegasus libirary for the ajax get
			return pegasus(app.apiUrl + options);
		},
		find : function(array, value, key){
			//accepts the array to search in and the value we look for
			if(array.length !== 0){
				//if the array is not empty we start the for loop
				for(var i = 0, len = array.length; i < len; i++) {
    				if( array[i][key] == value ){
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
		}
	};

	//start the app
	app.init();

}());