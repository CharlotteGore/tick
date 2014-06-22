# Tick

  A single animationFrame/timeout loop with normalised output across browsers. Callbacks are passed as parameters the time elapsed since the callback was added and a function to stop the callback from being called again.

  Uses `requestAnimationFrame` and microsecond timings if the browser supports it.
  
  Supports global pause and resume, and pause and resume on the level of individual tasks.

  This module has been used extensively in co-ordination animations, supporting game loops and web audio stuff. It is solid. 

## Installation

Browserify/NPM

```sh
    $ npm install --save gm-tick
```

```js
  var tick = require('gm-tick');
```

Component

```sh
    $ component install charlottegore/tick
```

```js
  var tick = require('tick');
```

## API

### .add()

  Adds a callback to the loop to be called every tick. When the callback fires is is passed the time in milliseconds (and, if available, microseconds) since the callback was added. Returns a handle object.

#### Example

    var handle = tick.add( function( elapsed, stop ){

    	console.log( elapsed )
    	if( elapsed > 5000){
           stop(); // make sure the callback won't fire again 
           console.log('stopped');   		
    	}

    });

    > 1.12244043334424
    > 4.32443350003422
    ...
    > 4994.00000000598
    > 5011.00000000422
    > stopped

### .pause()

    require('tick').pause();

  Pause everything. No callbacks will fire as long as it remains paused.
  
### .resume()

    require('tick').resume();

  Resume everything. Elapsed time data passed to callbacks are adjusted to account for time spent paused.

### .time()

  Returns a normalised (relative to the timings passed to callbacks) 'time' according to Tick, which may vary depending on whether it's using `performance` or `Date` for timings. `time()` returns the time elapsed since the page loaded.

## Handle API

  When a callback is added to Tick, a handle object is returned. This is their API.
  
### .stop()

  Stop the callback from ever being fired again.

    > var handle = require('tick').add(callback);
    > // callback is being called on every tick
    > handle.stop();
    > // callback has been removed
    
### .pause()

  Prevent this callback from being called until resumed.

    > var handle = require('tick').add(callback);
    > // callback is being called on every tick
    > handle.pause();
    > // callback has been paused
    
### .resume()

  Let a callback be called after being paused.
  
    > handle.pause();
    > // callback won't fire until resumed
    > handle.resume();
    > // callback fires again.
 

## License

  MIT
