(function(){
	"use strict";

	var app = {
		init: function(){
			routes.init();
		}
	};

	var routes = {
		newUrl : "",
		oldUrl : "",
		startScreen: "home",
		init: function(){
			//https://developer.mozilla.org/en-US/docs/Web/Events/hashchange
			window.addEventListener('hashchange', function(e){
				this.newUrl = e.newURL.split('#')[1];
				this.oldUrl = e.oldURL.split('#')[1];
				sections.toggle(this.newUrl, this.oldUrl);
			});
		}
	};

	var sections = {
		toggle: function(route, oldRoute){
			window.scrollTo(0,0);
			if (route != oldRoute) {
				document.getElementById(route).classList.remove('invis');

				if(oldRoute){
					document.getElementById(oldRoute).classList.add('invis');	
				} else {
					document.getElementById(routes.startScreen).classList.add('invis');
				}
			}
		}
	};

	app.init();

}());