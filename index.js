var raf = require('raf'),
	getTime = Date.now || function(){ return (new Date()).getTime(); },
	start = getTime(),
	perf = window.performance,
	perfNow = perf && perf.now

(window.performance && window.performance.now)

// normalise the time functionality
if(window.performance && window.performance.now){

	time = function(){ return performance.now() };
	start = performance.timing.navigationStart;

} else {
	time = function(){ return getTime() - start; }
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
				runCallbacks.call( self, time() )
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
				update : function( time ){
					callback( time - start, stop);					
				}
			}
				
		};

		return function( callback ){

			var id = ++uuid;
			var stop = function(){
				delete(callbacks[id]);				
			}
			callbacks[id] = create( callback, time(), stop);
			return {
				id : id,
				stop : stop
			}
		}

	})(),

	time : function(){

		return time();

	}

};

var tick = new Tick();

module.exports = tick;