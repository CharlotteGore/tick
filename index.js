// binding polyfill
require('bindpolyfill');

var raf = require('raf'),
  caf = require('raf').cancel,
  hasOwn = Object.prototype.hasOwnProperty,
  time = Date.now || function(){ return (new Date()).getTime(); },
  start = time(),
  now,
  precise = false;

// use the highest precision timer available
if ('performance' in window && window.performance.now){

  now = function(){ return window.performance.now(); };
  start = window.performance.timing.navigationStart;
  precise = true;

} else {

  now = function(){ return time() - start; };

}

var uuid = 0;


var Tick = function(){

  this.fns = {};
  this.activeCallbacks = 0;

  // get our frame handler and our runners sorted..
  this.frameHandler = frameHandler.bind(this);
  raf(capabilityChecker.bind(this));

  this._requestid = null;

  return this;

};

Tick.prototype = {

  add : function (callback){

    var id = ++uuid;

    var _stop = stop.bind(this, id);

    this.fns[id] = create.call(this, callback, now(), _stop);
    this.activeCallbacks++;
    // trigger requesting animationFrames if this it the first handler..
    if (this.activeCallbacks === 1){
      this._lastTick = now();
      this._requestid = raf(this.frameHandler);
    }
    return {
      id : id,
      stop : _stop,
      pause : this.fns[id].pause,
      resume : this.fns[id].resume
    };
  },

  now : function (){
    return now();
  },

  pause : function(){
    for (var id in this.fns){
      if (hasOwn.call(this.fns, id)){
        this.fns[id].pause();
      }
    }
  },

  resume : function(){
    for (var id in this.fns){
      if (hasOwn.call(this.fns, id)){
        this.fns[id].resume();
      }
    }
  },

  stop : function(){
    var fns = [];
    for (var id in this.fns){
      if (hasOwn.call(this.fns, id)){
        // call stop and get a destructor function back..
        fns.push(this.fns[id].stop('defer'));
      }
    }
    // run all the destructor functions
    for (var i = 0; i < fns.length; i++){
      fns[i].call(this);
    }
  },

  isRunning : function (){
    return (this._requestid !== null);
  },

  runningHandlers : function (){
    return this.activeCallbacks;
  },

  FPS : function (){
    return Math.floor((1000 / this._tickDelta) * 100) / 100;
  }

};

function create (callback, start, stop){

  var paused = false;
  var pausedAt;

  return {
    update : function( now, delta ){
      if(!paused){
        callback( now - start, delta, stop);
      }
    },
    pause : function(){
      paused = true;
      pausedAt = now();
    },
    resume : function(){
      start = start + now() - pausedAt;
      paused = false;
    },
    stop : stop
  };
}

function stop (id, defer){
  // stop requesting animationFrames if there's no more handlers..
  this.activeCallbacks--;
  if (this.activeCallbacks === 0){
    caf(this._requestid);
    this._requestid = null;
  }
  if(!defer){
    delete(this.fns[id]);
  } else {
    return function(){
      delete(this.fns[id]);
    };
  }
}

function frameHandler(possibleTimestamp){
  if (this.activeCallbacks){
    // establish time passed since last frame...
    var curr = now();
    this._tickDelta = curr - this._lastTick;
    this._lastTick = curr;
    this._runner(possibleTimestamp, this._tickDelta);
    this._requestid = raf(this.frameHandler);
  }
}

function capabilityChecker (possibleTimestamp){
  if (precise){
    this._runner = fallbackPrecisionRunner.bind(this);
  } else {
    // and some browsers are just entirely without hope or remorse.
    this._runner = fallbackRunner.bind(this);
  }

}

/*
  // for some reason the timestamp being passed from 
  // raf is totally broken therefore I can't use this mode...

function precisionRunner (timestamp, delta){
  for (var id in this.fns){
    if (hasOwn.call(this.fns, id)){
      this.fns[id].update(timestamp, delta);
    }
  }
}
*/

function fallbackPrecisionRunner (delta){
  var timestamp = window.performance.now();
  for (var id in this.fns){
    if (hasOwn.call(this.fns, id)){
      this.fns[id].update(timestamp, delta);
    }
  }
}

function fallbackRunner (delta){
  var timestamp = now();
  for (var id in this.fns){
    if (hasOwn.call(this.fns, id)){
      this.fns[id].update(timestamp, delta);
    }
  }
}

var tick = new Tick();

module.exports = tick;

module.exports.Tick = Tick;