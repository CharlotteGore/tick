# Animation Loops / Tick

[![browser support](https://ci.testling.com/CharlotteGore/animation-timer.png)](https://ci.testling.com/CharlotteGore/animation-timer)

[![Build Status](https://travis-ci.org/CharlotteGore/tick.png?branch=master)](https://travis-ci.org/CharlotteGore/tick)

Low level games and graphics utility. Any situation where you need something to run around 60 times a second, `animation-loops` is your friend.

- Add callbacks to be executed every requestAnimationFrame
- All callbacks get the highest precision `time elapsed` and `delta` information available
- Pause, resume and stop individual animations.
- Globally Pause, resume and stop all animations.
- Applications: Game loops, animation loops etc.
- Covered by tests
- Uses a polyfilled/shimed requestAnimationFrame

## Installation

Browserify/NPM

Current tested version:

```sh
    $ npm install --save animation-loops
```

```js
  var tick = require('animation-loops');
```

## API

### .add( function(elased, delta, stop) { ... }  [, start])

Adds a callback to be executed every animationFrame which, when executed, is passed
the amount of time elapsed and the time since the last frame.

#### Example

```js
var handle = tick.add( function( elapsed, delta, stop ){

	console.log( elapsed, delta );

	if( elapsed > 5000){
       stop(); // make sure the callback won't fire again 
       console.log('stopped');   		
	}

});
```

Optionally a 'start' parameter can be passed to .add(). Callbacks begin firing on animationFrames 
immediately, but the elapsed parameter will be negative, counting up to zero until the start time arrives, at 
which point it continues as normal. Very NASA. 

### .pause()

Globally pauses all running animations. When they resume, the `elapsed` and `delta` parameters 
in your callbacks are automatically adjusted to remove the time spent paused.

```js
tick.pause();
```
  
### .resume()

Globally resume all paused animations. 

```js
tick.resume();
```

### .time()

Returns the current time using the highest precision timer available in the environment. This is to ensure 
that developers can code against one single source of time that will be consistent with `animation-loops` and 
not have to worry about differences between `Date` and `performance`. 

### .FPS()

Yay metrics! Returns the current FPS. It is not averaged.

```js
var lastFPS = tick.FPS();
```

## Handle API

When a callback is added to `animation-loops`, a handle object is returned, which gives control
to individual animations/loops. 

```js
var handle = tick.add(function (){
    //
})
```
  
### handle.stop()

Immediately stop an animation/loop. It cannot be restarted.

```js
// run our callback for about 100ms then stop.
var handle = tick.add(callback);
setTimeout(function(){
  // this stops just this animation but leaves the others running.
  handle.stop();
}, 100)
```
    
### .pause()

Pause the animation/loop. 

```js
// run the animation for 100ms then pause
var handle = tick.add(callback);
setTimeout(function (){
  handle.pause();
}, 100)
```
    
### .resume()

Resume the animation/loop

```js
// run the animation for 100ms, pause for 100ms, then resume it again..
var handle = tick.add(callback);
setTimeout(function (){
  handle.pause();
}, 100)
setTimeout(function (){
  handle.resume();
}, 200)
```

## Tests

Assuming you have `grunt-cli` already installed, and you've cloned the repo:

```sh
# Just the once...
$ npm install
```

```sh
grunt test
```

## History

This module used to be known as `tick`. That module is still avaliable on npm as `gm-tick` but this 
version, which adds FPS metrics, optimisations and test coverage is to be prefered.

## License

  MIT
