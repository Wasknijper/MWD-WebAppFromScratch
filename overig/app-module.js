var app = (function () {
  
  var obj = {
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
  return obj;
})();

app.init();