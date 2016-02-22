var gestures = (function(){
	var myShakeEvent = new Shake({
    	threshold: 15, // optional shake strength threshold
    	timeout: 1000 // optional, determines the frequency of event generation
	});


	return {
		shake : myShakeEvent,
		shakeEventDidOccur : function(){
			pokedex.randomPokemon();
		}
	}
}());