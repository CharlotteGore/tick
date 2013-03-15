var raf = require('raf'),
	time = Date.now || function(){ return (new Date()).getTime(); },
	start = time(),
	now;

// normalise the time functionality
if(window.performance && window.performance.now){

	now = function(){ return performance.now() };
	start = performance.timing.navigationStart;

} else {
	now = function(){ return time() - start; }
}

var callbacks = {};
var uuid = 0;

var runCallbacks = function( timestamp ){

	var self = this;
	for(i in callbacks){
		if(callbacks.hasOwnProperty(i)){
			callbacks[i].update( timestamp );
		}
	}
	return true;
};

var Tick = function(){

	var self = this;

	var tick;

	raf(function( elapsed ){

		if(window.performance && window.performance.now){

			if(elapsed && /\./.test(elapsed.toString())){
				// requestAnimationFrame returns sexy sub-millisecond elapsed time
				tick = function tick( timestamp ){
					runCallbacks.call( self, timestamp );
					raf(tick);
				} 

 			} else {
 				// requestAnimationFrame returns a lame unix timestamp. At least we've got performance.now() though.
 				tick = function tick(){
 					runCallbacks.call( self, performance.now() );
 					raf(tick);
 				}
 			}

		} else {

			tick = function tick(){
				runCallbacks.call( self, now() )
				raf(tick);
			}

		}

		// go go go!
		raf(tick);

	})

	return this;

};

Tick.prototype = {

	add : (function( task ){

		var create = function(callback, start, stop){
			return {
				update : function( now ){
					callback( now - start, stop);					
				}
			}
				
		};

		return function( callback ){

			var id = ++uuid;
			var stop = function(){
				delete(callbacks[id]);				
			}
			callbacks[id] = create( callback, now(), stop);
			return {
				id : id,
				stop : stop
			}
		}

	})(),

	now : function(){

		return now();

	}

};

var tick = new Tick();

module.exports = tick;