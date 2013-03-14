
# Tick

  A single animationFrame/timeout loop with normalised output across browsers. Callbacks are passed the time elapsed since the callback was added and a stop() function.

  Uses `requestAnimationFrame` and microsecond timings if the browser supports it.

## Installation

    $ component install charlottegore/tick

## API

    var tick = require('tick');

### .add()

  Adds a callback to the loop. When the callback fires is is passed `elapsed` - the time in milliseconds (and if available microseconds) since the callback was added. It also gets a function, `stop`, which can be called to prevent the callback firing again.

    tick.add( function( elapsed, stop ){

    	console.log( elapsed )
    	if( elapsed > 5000){
			stop(); // make sure the callback won't fire again 
			console.log('stopped');   		
    	}

    });

    > 1.12244043334424
    > 4.32443350003422
    > 14.2523500000012
    ...
    > 4994.00000000598
    > 5011.00000000422
    > stopped
    >

    var handle = tick.add( function( elapsed, stop ){

    	console.log( elapsed )
    	if( elapsed > 5000){
			stop(); 
			console.log('stopped');   		
    	}

    });  

    > 1.12244043334424
    > 4.32443350003422
    > 14.2523500000012
    > handle.stop(); // callback won't fire again
    >  

### .time()

  Returns the 'time' according to Tick, which may vary depending on whether it's using `performance` or `Date` for timings. `time()` returns the time elapsed since the page loaded.

## About

  This module is designed to replace Render-Loop and RenderLoopTask as the central 'tick' handler for my Tween module. It's smaller, more lightweight and more focused on simply handling a bunch of callbacks on tick events as fast and efficiently as possible. The scheduling stuff will come back in separate modules. Right now it's not required!

## License

  MIT
