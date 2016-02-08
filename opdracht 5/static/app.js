(function(){
	"use strict";

	var app = {
		startUrl : "",
		pages : "",
		startScreen: "",
		init: function(){
			this.startUrl = window.location.href;

			//get all the section elements
			this.pages = document.getElementsByTagName('section');
			this.startScreen = this.pages.home;

			//Loop through all page elements and make them invisible 
			for(var i = 0; i < this.pages.length; i++){
				this.pages[i].classList.add("invis");
			}

			//add route event listeners by initializing routes
			routes.init();
		}
	};

	var routes = {
		newUrl : "",
		oldUrl : "",
		init: function(){
			//run start function from sections to show the correct section to start with
			sections.start();
			//https://developer.mozilla.org/en-US/docs/Web/Events/hashchange
			window.addEventListener('hashchange', function(e){
				//get the hash from the url, event listener passes the url in the e parameter
				this.newUrl = e.newURL.split('#')[1];
				this.oldUrl = e.oldURL.split('#')[1];
				//call the toggle method from sections to show the correct section
				sections.toggle(this.newUrl, this.oldUrl);
			});
		}
	};

	var sections = {
		start: function(){
			//check if the url contains a hash, returns -1 if false, anything else is true
			if (app.startUrl.indexOf('#') >= 0){
				var hashName = app.startUrl.split('#')[1];
				//remove the invis class from the section
				app.pages[hashName].classList.remove('invis');	
			} else {
				//if no hash found its on the startscreen, so remove the invis class from that
				app.startScreen.classList.remove("invis");					
			}
		},
		toggle: function(newRoute, oldRoute){
			//scroll to top incase the page is long
			window.scrollTo(0,0);

			//check if the newRoute is the same as the old route, only excecute if its changes
			if (newRoute != oldRoute) {
				app.pages[newRoute].classList.remove('invis');

				//add invis to the old route, if it exists
				if(oldRoute){
					app.pages[oldRoute].classList.add('invis');	
				} else {
					//if it doesnt, its on the startscreen, so add invis to that
					app.startScreen.classList.add('invis');
				}
			}
		}
	};

	//start the app
	app.init();

}());