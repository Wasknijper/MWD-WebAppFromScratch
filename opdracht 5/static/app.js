(function(){
	"use strict";

	var app = {
		init: function(){
			this.startUrl = window.location.href;
			this.pages = document.getElementsByTagName('section');

			for(var i = 0; i < this.pages.length; i++){
    			this.pages[i].classList.add("invis");
			}

			routes.init();
		},
		startUrl : "",
		pages : "",
		startScreen: "home"
	};

	var routes = {
		newUrl : "",
		oldUrl : "",
		init: function(){
			sections.start();
			//https://developer.mozilla.org/en-US/docs/Web/Events/hashchange
			window.addEventListener('hashchange', function(e){
				this.newUrl = e.newURL.split('#')[1];
				this.oldUrl = e.oldURL.split('#')[1];
				sections.toggle(this.newUrl, this.oldUrl);
			});
		}
	};

	var sections = {
		start: function(){
			if (app.startUrl.indexOf('#') === -1){
				document.getElementById(app.startScreen).classList.remove("invis");
			} else {
				app.startScreen = app.startUrl.split('#')[1];
				document.getElementById(app.startScreen).classList.remove('invis');				
			}
		},
		toggle: function(newRoute, oldRoute){
			window.scrollTo(0,0);
			if (newRoute != oldRoute) {
				document.getElementById(newRoute).classList.remove('invis');

				if(oldRoute){
					document.getElementById(oldRoute).classList.add('invis');	
				} else {
					document.getElementById(app.startScreen).classList.add('invis');
				}
			}
		}
	};

	app.init();

}());