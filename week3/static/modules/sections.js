var sections = (function(){

	return {
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
					launcher.pages[newR].classList.remove('invis');
				} else {
					//if there is no hash then set it to the home
					launcher.pages[launcher.startScreen].classList.remove('invis');
				}
				//add invis to the old route, if it exists
				if(oldR){
					launcher.pages[oldR].classList.add('invis');	
				} else {
					//if it doesnt, its on the startscreen, so add invis to that
					launcher.pages[launcher.startScreen].classList.add('invis');
				}
			}

		}
	};

}());
