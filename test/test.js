var chai = require('chai');
var expect = chai.expect;
var should = chai.should();

window.tick = require('../index.js');

var Tick = require('../index.js').Tick;

var raf = require('raf');
var caf = require('raf').caf;

/*

  Testing something like this turns out to be pretty tricky, which is why version
  one of this module had no tests at all. Mocha's ability to deal with asynchronisty, however, 
  has made it possible now. Some of these tests are very ugly, I'm afraid, but such is the complexity
  of making tests that work across all browsers irrespective of teh performance of teh system the tests
  are being run on.  

*/

describe('Animation Manager module', function (){

  it('passes a basic sanity checking test', function (){

    expect(tick).to.be.an('object');

  })

  describe("the Tick() object and methods", function (){

    it('provides a .now() method', function (done){

        // because tick.now() can come from a variety of sources - performance.now() if available 
        // or Date.now() if not, it's difficult to test this. We can, however, test that it's relatively
        // correct and that it's actually useful.

        var start = tick.now();

        setTimeout(function(){

          // allow 5ms for the this timeout to actually fire...
          expect(tick.now() - start).to.be.within(100, 105);
          done();

        }, 100)

      });

      it('exposes a isRunning() method', function (){

        // this is really a debug method. Desired behaviour is that tick does not 
        // request animation frames when there are no active callbacks waiting for them.

        expect(tick.isRunning).to.be.a('function');

        // so right now it shouldn't be running.
        expect(tick.isRunning()).to.equal(false);    

      });

      it('callbacks can be added, which fire on raf and get passed elapsed time, delta and a stop function', function (done){

        // this is really a debug method. Desired behaviour is that tick does not 
        // request animation frames when there are no active callbacks waiting for them.

        var tick = new Tick();

        var start = tick.now();

        var finished = false;

        var startedByUs = false;

        var handle = tick.add(function(elapsed, delta, stop){

          // make sure this wasn't called during tick.add()
          expect(startedByUs).to.equal(true);

          // make sure this isn't called ever again, thus confirming the 'stop' did in fact 'stop'
          expect(finished).to.equal(false);

          expect(tick.isRunning()).to.equal(true);

          expect(elapsed).to.be.a('number');
          expect(delta).to.be.a('number');

          expect(elapsed).to.be.greaterThan(0);
          expect(delta).to.be.greaterThan(0);

          expect(stop).to.be.a('function');
          // in which case...
          stop();
          finished = true;
          // which should result in..
          expect(tick.isRunning()).to.equal(false);
          done();

        });
        startedByUs = true;

      });

      it('reports whether listening for animation frames correctly with .isRunning() ', function (done){

        var tick = new Tick();

        var tickCount = 0;

        var start = tick.now();

        expect(tick.isRunning()).to.equal(false);

        var handle = tick.add(function (timestamp){});

        setTimeout(function(){

          expect(tick.isRunning()).to.equal(true);

        }, 50);

        setTimeout(function(){

          handle.stop();

          expect(tick.isRunning()).to.equal(false);

          done();

        }, 100);

      });

      it('calls our tick handler every animationFrame', function (done){

        var tick = new Tick();

        var tickCount = 0;
        var rafCount = 0;
        var testRunning = true;
        var handle;

        // count raf ticks.
        var countRafTicks = function (){
          rafCount ++;

          if(testRunning){
            rafId = raf(countRafTicks);
          }
        }

        // we wait until the next animation frame before triggering both of these 
        // to rule out problems with a raf firing after setting up one but before
        // setting up another.
        raf(function (){

          handle = tick.add(function (timestamp){

            tickCount ++;

          });
          raf(countRafTicks);
        });

        setTimeout(function(){

          handle.stop();
          testRunning = false;

          // make sure that the callbacks have actually been called...
          expect(tickCount).to.be.greaterThan(0);

          // check that tick has called our callback on every possible occasion
          expect(tickCount).to.equal(rafCount);

          done();

        }, 150);

      });

      it('has a valid FPS method', function (done){

        var tick = new Tick();

        var rawTicks = 0;
        var rawTotal = 0;

        var tickTicks = 0;
        var tickTotal = 0;

        var rafCount = 0;
        var testRunning = true;
        var handle;

        // count raf ticks.
        var lastTick = (new Date()).getTime();

        // okay generally speaking tick's .fps() is going to be a lot
        // more accurate than this one is. Can't really just assume 
        // we're going to get 60 fps from a phantomjs instance running
        // on a travis box so we need some sort of baseline...

        var keepAverageFPS = function (){
          
          var now = (new Date()).getTime();
          var delta =  now - lastTick;
          rawTotal += (1000 / delta);
          rawTicks ++;

          lastTick = now;

          if(testRunning){
            raf(keepAverageFPS);
          }
        }

        // we wait until the next animation frame before triggering both of these 
        // to rule out problems with a raf firing after setting up one but before
        // setting up another.
        raf(function (){

          handle = tick.add(function (timestamp){

              tickTotal += tick.FPS();
              tickTicks++;

          });
          raf(keepAverageFPS);

        });

        setTimeout(function(){

          handle.stop();
          testRunning = false;

          // check that tick has called our callback on every possible occasion
          expect(tickTicks).to.equal(rawTicks);

          expect(tickTotal / tickTicks).to.be.within( (rawTotal / rawTicks) - 5, (rawTotal / rawTicks) + 5);

          done();

        }, 150);

      });

      it('can immediately stop all callbacks, never firing handlers again', function (done){

        var tick = new Tick();
        var finished = false;

        expect(tick.isRunning()).to.equal(false);

        tick.add(function(){
          expect(finished).to.equal(false);
        });
        tick.add(function(){
          expect(finished).to.equal(false);
        });
        tick.add(function(){
          expect(finished).to.equal(false);
        });

        setTimeout(function(){



          expect(tick.isRunning()).to.equal(true);

          expect(tick.stop()).not.to.throw;    
          finished = true;

          expect(tick.isRunning()).to.equal(false);

          done();

        }, 100)

      });

      it('can pause and resume handlers.', function (done){

        // this tests that animations can be paused. We do this by checking that our 
        // callback never gets fired when 'paused === true', comparing the number of times
        // the handler has been fired compared with how often it should have been fired
        // and checking that the callbacks have been run at least once.

        var tick = new Tick();
        var paused = false;

        var tickCount = 0;
        var rafCount = 0;
        var testRunning = true;
        var handle;

        // count raf ticks.
        var countRafTicks = function (){
          if(!paused){
            rafCount ++;
          }

          if(testRunning){
            rafId = raf(countRafTicks);
          }
        }

        // we wait until the next animation frame before triggering both of these 
        // to rule out problems with a raf firing after setting up one but before
        // setting up another.
        raf(function (){

          tick.add(function(){
            tickCount++;
            expect(paused).to.equal(false);
          });
          raf(countRafTicks);

        });

        setTimeout(function(){

          tick.pause();
          paused = true;

        }, 50);

        setTimeout(function(){

          
          tick.resume();
          paused = false;

        }, 100);

        setTimeout(function(){

          tick.stop();
          testRunning = false;

          expect(tickCount).to.be.greaterThan(0);

          expect(tickCount).to.equal(rafCount);
          done();

        }, 150);

      });

  });

  describe("tick handler api", function (){

    it('generates a handle when adding tick handlers', function (){

      var tick = new Tick();

      var handle = tick.add(function(){});

      expect(handle).to.be.an('object');

      expect(handle.id).to.be.a('number');
      expect(handle.pause).to.be.a('function');
      expect(handle.resume).to.be.a('function');
      expect(handle.stop).to.be.a('function');

    });

    it('can stop individual animations with handle.stop()', function (done){

      var tick = new Tick();

      var stopped = false;
      var finished = false;

      var leaveRunning = tick.add(function(){

        expect(finished).to.equal(false);

      });

      var stopRunning = tick.add(function(){
        // check it's never called again after being stopped
        expect(stopped).to.equal(false);

      });

      setTimeout(function (){

        stopRunning.stop();
        stopped = true;

        // tick should continue to be listening for animationFrames because there's
        // another tick handler active
        expect(tick.isRunning()).to.equal(true);

      }, 50);

      setTimeout(function (){

        // now we stop the other process..
        leaveRunning.stop();
        finished = true;

        // tick should now be idle
        expect(tick.isRunning()).to.equal(false);

        done();

      }, 100);


    });

    it('can pause and resume individual animations with handles', function (done){

        var tick = new Tick();
        var paused = false;

        var pauseableTickCount = 0;
        var runningTickCount = 0;

        var totalFrames = 0;
        var unpausedFrames = 0;

        var testRunning = true;
        var handle;

        // count raf ticks.
        var countRafTicks = function (){
          if(!paused){
            unpausedFrames++;
          }
          totalFrames++;

          if(testRunning){
            rafId = raf(countRafTicks);
          }
        }

        var toBePaused, toLeaveRunning;

        // we wait until the next animation frame before triggering both of these 
        // to rule out problems with a raf firing after setting up one but before
        // setting up another.
        raf(function (){

          toBePaused = tick.add(function(){

            pauseableTickCount++;

            expect(testRunning).to.equal(true);
            expect(paused).to.equal(false);
          });

          toLeaveRunning = tick.add(function(){

            expect(testRunning).to.equal(true);
            runningTickCount++;

          });

          raf(countRafTicks);

        });

        setTimeout(function(){

          toBePaused.pause();
          paused = true;

        }, 50);

        setTimeout(function(){

          
          toBePaused.resume();
          paused = false;

        }, 100);

        setTimeout(function(){

          toBePaused.stop();
          toLeaveRunning.stop()

          testRunning = false;
          // make sure there's been some request animation frames...
          expect(totalFrames).to.be.greaterThan(0);

          // make sure the paused tick handler didn't fire when did didn't want it to
          expect(pauseableTickCount).to.equal(unpausedFrames);

          // make sure the other tick handler didn't get paused..
          expect(runningTickCount).to.equal(totalFrames);

          // just sanity check that the tick handler that didn't get paused got called more often
          expect(pauseableTickCount).to.be.lessThan(runningTickCount);
          done();

        }, 150);


    });


  });

});
