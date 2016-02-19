var launcher = (function () {
  
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

      if (annyang) {
  // Let's define a command.
  var commands = {
    'hello *tag': function(tag) { alert('Hello' + tag + '!'); }
  };

  // Add our commands to annyang
  annyang.addCommands(commands);

      // Start listening.
      annyang.start({continuous: false});
    }

      //add the event listener for future hashchanges
      gestures.shake.start();
      window.addEventListener('shake', gestures.shakeEventDidOccur, false);
      window.addEventListener('hashchange', utils.processHash);
    }
  };
  return obj;
})();

(function(){launcher.init();}());
