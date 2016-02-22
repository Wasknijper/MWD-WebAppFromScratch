var utils = (function(){

	return {
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
		// Hash-based routing, get the hash and run the router
		processHash: function() {
  			var hash = location.hash || '#';
  			sections.oldRoute = sections.newRoute;
  			sections.newRoute = hash.slice(1);
  			router.run(sections.newRoute);
  			sections.toggle(sections.newRoute, sections.oldRoute);
		},
		request : function(options){
			//call pegasus libirary for the ajax get
			return pegasus(launcher.apiUrl + options);
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

}());

