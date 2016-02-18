var router = (function(){

	//make a router
	var routes = new Rlite();

	var searchForm = function(){
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
        launcher.pages.home.main.innerHTML = templates.Search.render({pokedex : searchResults});
        return false;
      };

    };
	//route for no hash or empty hash
	routes.add('', function () {
  		document.title = 'Home';
  		launcher.pages.home.classList.remove("invis");
  		if (pokedex.loaded === false){
  			//if pokedex is still being initilized show a loading message
  			launcher.pages.home.main.innerHTML = templates.Loading.render();
  		} else {
  			//otherwise just show the pokedex
  			launcher.pages.home.main.innerHTML = templates.Home.render({pokedex : pokedex.national});
  			searchForm();
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
			launcher.pages.pokemon.innerHTML = templates.Error.render();
		} else {
			//Start the loading template and execute load function to display the pokemon
  			launcher.pages.pokemon.innerHTML = templates.LoadingPoke.render({name : pName});

			url = pokedex.national[found].resource_uri;
			//start the load pokemon function to get the data on this pokemon
			pName = utils.capitalize(pName);
			pokedex.loadPokemon(pName, url);
		}

	});

	return routes;

}());