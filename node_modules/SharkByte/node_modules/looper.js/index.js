// Copyright (C) 2015  Michael A Sirizzotti
// Looper.js by mikesizz
// This program is free software; you can redistribute it and/or modify
//     it under the terms of the GNU General Public License as published by
//     the Free Software Foundation; only version 2 of the License.

//     This program is distributed in the hope that it will be useful,
//     but WITHOUT ANY WARRANTY; without even the implied warranty of
//     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//     GNU General Public License for more details.

//     You should have received a copy of the GNU General Public License along
//     with this program; if not, write to the Free Software Foundation, Inc.,
//     51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.

/////////////////////////////////////////////////////////////////////////

module.exports = Looper;

var DEFAULT_WAIT_TIME = 0;

function Looper(){

	this.loopCount; // how many loop functions to run
	this.loopIndex; // which loop function we are on
	this.loopData; // data to be used in the looper
	this.loopLength; // how many cycles the current function will run for
	this.loopCyclesCompleted; // how many cycles the current function has completed
	this.loopWaitTime; // how long looper will wait in between function calls
	this.defaultCallback; // holder for what function to call immediately after every chain function call. this is different than afterCallback and should not be mixed up
	this.loopCallback; // function to call immediately after every chain function call
	this.beforeCallback; // optional function to call immediately before every chain function 
	this.afterCallback; // optional function to call immediately after every loopCallback call. used in conjuction with before and after calls to allow for unique cycle callbacks
	this.onCompleteCallback;// optional function to call immediately after the looper process finishes
	this.loopLastCycle; // flag to keep track of which cycle was run last. this will help to ensure that we do not run the same cycle over again due to any hiccups or delays
	this.isNewLoop; // flag to identify if we are at the beginning of a new looper loop. loops by default will be stuck in an infinite cycle if not unlocked
	this.isPaused; // flag to determine if the loop is currently paused
	this.functionSet;// array to hold the looper's function chain
	this.infiniteIndex;// flag to keep track of how many times an infinite loop has ran
	this.instanceName;// identifier for a looper instance

	this.opts_isInfinite;// user supplied bool to determine if the looper should run its function chain infinitely
	this.opts_debugEnabled; // user supplied bool to determine if debugging messages should be shown
	this.opts_persistData; // user supplied bool to determine if data stored in the loopData object should persist through loop iterations
	this.opts_lockingFunctions; // user supplied bool to determine if the function chain should lock after running a function. the user must then unlock each function to continue work
	this.opts_delay; //  user supplied bool to set the length of time looper will wait in between function calls
	
};

// Main Logic Loop

Looper.prototype.loop = function(){
var looper = this;
	
	// set the loop count to the amount of functions we need to run
	looper.loopCount = looper.functionSet.length;
	
	// mainLoop will handle the cycling of all scraping processes
	var mainLoop = function(){

		setTimeout(function(){

		// if the function chain is not paused or locked...
		if( !looper.isPaused && !looper.isLocked ){

			// if we are on the last cycle lets reset the looper for more work. 
			// this must be done at the beginning of each process to avoid wiping of data during previous function execution
			if( looper.loopCyclesCompleted == looper.loopLength ){

				looper.debugPrint( "Function " + looper.getFunctionIndex() + " complete." );
					
				// reset the loop flags so we can do potential work
				looper.resetLoopFlags();

				// increment the loop index so we can check for more functions
				looper.loopIndex++;

			}

			// these flags will help us to check if we are out of work and to ensure we arent doing the same work over again
			var sameCycle   = ( looper.loopCyclesCompleted > looper.loopLastCycle ? false : true );
			var outOfLoops  = ( looper.loopIndex < looper.loopCount ? false : true );
			
			// if we are at cycle zero and we are at the beginning of a new loop... 
			// we have to unlock the infinite loop caused by the sameCycle check
			if( looper.loopCyclesCompleted == 0 && looper.isNewLoop ){ 

				looper.debugPrint('Unlocking function chain for new Looper.js process.')
				sameCycle = false; 	
				looper.isNewLoop = false;

			}

			if( !outOfLoops ){ /* if we arent out of functions to run */
							      /* && */
				if( !sameCycle ){ /* if we arent trying to run the previous cycle over again */
						
					// set the last cycle flag as the current cycle index
					looper.loopLastCycle = looper.loopCyclesCompleted; 	
						
					// relock the function chain if the user has opted to use locking functions
					if( looper.opts_lockingFunctions == true ){ 

						looper.isLocked = true; 

					} 

					// call the loopers callback set as well as the current function
					looper.beforeCallback();
					looper.debugPrint( "Executing function: " + looper.getFunctionIndex() );
					looper.functionSet[ looper.loopIndex ].call();
					looper.loopCallback();
					looper.afterCallback();
					looper.advance();
							

				}else /* if it is the same cycle */{

					// waiting for last cycle to complete
					looper.debugPrint( "Function " + looper.getFunctionIndex() + " attempted to run a previous cycle. Skipping this cycle." );

				}

				// recall data loop to continue process. 
				// we have to start new work or finish the process out
				mainLoop();

			}else /* if we are out of functions to run */{

				looper.debugPrint("All loops complete.");

				// if the user chose to run the loop chain infinitely...
				// lets start the process over
				if( looper.opts_isInfinite ){

					looper.infiniteIndex++;
					looper.resetLoopFlags();
					looper.loopIndex = 0; // rollback to the first function
					looper.loopWaitTime = 0; // set the wait time to zero for the next cycle. we dont want to wait the loop wait time before we restart
					mainLoop();

				}else /* if we are actually done working lets call the completion callback */{ looper.onCompleteCallback.call(); }

			}

		}else /* if the looper is paused or locked */{ 

			mainLoop(); 
			looper.loopWaitTime = 0; // set the wait time to zero for the next cycle. we want to check for work availability asap

		}

		} , looper.loopWaitTime ); // !mainLoop setTimeout

	} //!mainLoop

	// start the data loop
	mainLoop();

};

// Loop Control Functions


// This will configure the looper and start the looper process
Looper.prototype.start = function( opts , functionArray ){
var looper = this;
	
	looper.opts_debugEnabled     = ( opts.debug == true ? true : false );
	looper.opts_persistData	     = ( opts.persistData == true ? true : false );
	looper.opts_lockingFunctions = ( opts.lockingFunctions == true ? true : false );
	looper.opts_delay			 = ( opts.delay != null ? opts.delay : DEFAULT_WAIT_TIME );
	looper.opts_isInfinite		 = ( opts.infiniteLoop == true ? true : false );

	looper.loopWaitTime 		= looper.opts_delay;
	looper.loopData 			= {};
	looper.loopCyclesCompleted  = 0;
	looper.loopIndex			= 0;
	looper.loopLastCycle 		= 0;	
	looper.infiniteIndex 		= 0;
	looper.loopLength           = 1;
	looper.isNewLoop 			= true;
	looper.isLocked 			= ( looper.opts_lockingFunctions ? true : false);
	looper.defaultCallback		= ( opts.loopCallback != null ? opts.loopCallback : function(){} );
	looper.beforeCallback		= ( opts.before != null ? opts.before : function(){} );
	looper.afterCallback		= ( opts.after != null ? opts.after : function(){} );
	looper.onCompleteCallback   = ( opts.complete != null ? opts.complete : function(){} );
	looper.loopCallback			= looper.defaultCallback;
	looper.functionSet			= functionArray;
	looper.instanceName 		= ( opts.instanceName != null ? opts.looperName : looper.generateInstanceName() );

	looper.loop();

};

// completely stop the looper process. exit the system. keep in mind if infinite looping is set this will merely reset the looper process
// if you want to stop the system completely you still need to disable the infinite loop with disableInfiniteLoop()
Looper.prototype.stop = function(){
var looper = this;

	looper.loopIndex = looper.loopCount;
	looper.loopCyclesCompleted = looper.loopLength;
	looper.loopWaitTime = 0;

};

// make the system wait for the supplied time before it continues work. 
// you can supply an optional callback that will execute after the sleep
Looper.prototype.sleep = function( sleepTime , callback ){
var looper = this;
	
	looper.debugPrint("Going to sleep for " + sleepTime + " milliseconds");
	looper.pause();

	setTimeout( function(){

		if( typeof callback != "undefined" ){

			callback();
			looper.play();

		}else{ looper.play(); }

	} , sleepTime );

}

// pause the system. you must unpause to continue work
Looper.prototype.pause = function(){
var looper = this;
	
	looper.debugPrint( looper.instanceName + " is now paused." );
	looper.isPaused = true;
	
}

// unpause the system if paused
Looper.prototype.play = function( functionIndex ){
var looper = this;
	
	looper.debugPrint( looper.instanceName + " is now unpaused." );
	looper.isPaused = false;
	
}

// tell the system to start doing work from a specific function index after the calling function is done executing.
// you can use an index before or after the current function
Looper.prototype.playFrom = function( functionIndex ){
var looper = this;
	
	looper.debugPrint( "Setting function chain to play from function index " + functionIndex );
	var newIndex = functionIndex - 1; // this would be called inside a protocol function which means that the index would be incremented after it is rewound. we have to go back one to account for this

	looper.loopIndex = newIndex;

}

// replay a function from the function chain at the given index.
// you can use an index before or after the current function 
Looper.prototype.replay = function( functionIndex ){
var looper = this;
	
	looper.debugPrint( "Playing function at index " + functionIndex );
	looper.functionSet[ functionIndex ].call();

}

// if locking functions are enabled you must use this to unlock the function chain before any function is executed. this includes starting and stopping the system
Looper.prototype.unlock = function(){
var looper = this;
	
	if( looper.isLocked ){ 

		looper.debugPrint( "Unlocking function chain." );
		looper.isLocked = false; 

	}else{ looper.debugPrint( "Function chain is not locked. Discarding unlock request." ); }

}

// cause a function in the function chain to be called for the amount of cycles provided
Looper.prototype.loopThis = function( cycleCount ){
var looper = this;
	
	looper.loopLength = cycleCount;
	looper.debugPrint( "Executing function " + looper.getFunctionIndex() + " for " + cycleCount + " cycles. Current Cycle: " + looper.getLoopIndex() + " | Cycles Remaining: " + ( looper.loopLength - ( looper.getLoopIndex() ) ) );

}

// disable the system's looping if it is set to execute infinitely
Looper.prototype.disableInfiniteLoop = function(){
var looper = this;

	looper.opts_isInfinite = false;
	looper.debugPrint( "Disabling infinite loop. " + looper.instanceName + " will now terminate after all functions are complete." );

}

// add a function to the function chain to be executed
Looper.prototype.addToChain = function( newChainFunction ){
var looper = this;
	
	looper.functionSet.push( newChainFunction );
	looper.loopCount++;

};

// prematurely end the current loop cycle
Looper.prototype.endCycle = function(){
var looper = this;
	
	looper.debugPrint("Ending cycle now.");
	looper.resetLoopFlags();
	looper.loopIndex++;

};

// Index Functions

// get the index of the current loop's cycle
Looper.prototype.getLoopIndex = function(){
var looper = this;

	return looper.loopCyclesCompleted;

}

// get the index of the systems infinite loop iteration. this is only for use with inifinite looping
Looper.prototype.getInfiniteLoopIndex = function(){
var looper = this;

	return looper.infiniteIndex;

}

// get the index of the function you are currently running. 
// this differs from getLoopIndex because function index is not advanced with concentric looping ( aka a function using loopThis )
Looper.prototype.getFunctionIndex = function(){
var looper = this;

	return looper.loopIndex;

}

// Utility Functions

// move the system one cycle forward
Looper.prototype.advance = function(){
var looper = this;

	looper.loopCyclesCompleted++;
	looper.debugPrint( "Moving to next cycle." );

}

// reset the necessary flags and counters to allow the system to move to a new cycle
Looper.prototype.resetLoopFlags = function(){
var looper = this;
	
	looper.debugPrint( "Resetting looper data for new cycle." );
	looper.loopCyclesCompleted = 0;
	looper.loopLength = 1;
	looper.loopLastCycle = 0;
	looper.loopData = ( !looper.opts_persistData ? {} : looper.loopData );
	looper.isNewLoop = true;
	looper.loopWaitTime = looper.opts_delay;
	looper.loopCallback = looper.defaultCallback;

}

// print a message to the console as the current looper iteration. only shows up with debug: true
Looper.prototype.debugPrint = function( debugMessage ){
var looper = this;
	
	if( looper.opts_debugEnabled ){

		console.log(":: Looper.js - " + looper.instanceName + " | " + debugMessage + " ::");

	}

}

// print a message to the console as the current looper instance. ignores debug option
Looper.prototype.consolePrint = function( debugMessage ){
var looper = this;

	console.log(":: Looper.js - " + looper.instanceName + " | " + debugMessage + " ::");

}

// generate a name for the current looper instance. FF7 is the shit, yall
Looper.prototype.generateInstanceName = function(){

	var nameList = ["Cloud Strife","Barret Wallace","Tifa Lockhart","Aeris Gainsborough","Red XIII","Cait Sith","Cid Highwind","Yuffie Kisaragi","Vincent Valentine","Sephiroth","Rufus Shinra","President Shinra","Professor Hojo","Tseng","Reno","Rude","Elena","Heidegger","Scarlet","Palmer","Reeve Tuesti","Gast Faremis","Lucrecia Crescent","Zack Fair","Biggs","Elder Bughe","Bugenhagen","Butch","Chole","Choco Billy","Chocobo Sage","Mr. Coates","Dio","Don Corneo","Dyne","Barrier","Berserk","Bio","Bio2","Bio3","Break","Bolt","Bolt2","Bolt3","Comet","Comet2","Confu","Cure","Cure2","Cure3","Death","DeBarrier","Demi","Demi2","Demi3","DeSpell","Escape","Esuna","Fire","Fire2","Fire3","Flare","Freeze","Full Cure","Haste","Ice","Ice2","Ice3","Life","Life2","MBarrier","Mini","Poisona","Quake","Quake2","Quake3","Reflect","Regen","Remove","Resist","Shield","Silence","Sleepel","Slow","Stop","Toad","Tornado","Ultima","Wall","2x Cut","4x Cut","Coin","Deathblow","Enemy Skill","Flash","Manipulate","Mime","Morph","Mug","Sense","Slash-All","Steal","Throw","W-Item","W-Magic","W-Summon","Choco/Mog","Shiva","Ifrit","Ramuh","Titan","Odin","Bahamut","Leviathan","Kjata","Alexander","Neo Bahamut","Phoenix","Hades","Bahamut ZERO","Typhon","Knights of the Round","Added Cut","Added Effect","All","Counter","Elemental","Final Attack","HP Absorb","Magic Counter","MP Absorb","MP Turbo","Quadra Magic","Sneak Attack","Steal as well","Cover","Chocobo Lure","Counter Attack","Enemy Away","Enemy Lure","EXP Plus","Gil Plus","HP↔MP","HP Plus","Long Range","Luck Plus","Magic Plus","Mega-All","MP Plus","Pre-Emptive","Speed Plus","Underwater"]
	return nameList[Math.floor(Math.random() * nameList.length)];

}

// get the name of the current looper instance. hopefully you get someone awesome like Vincent Valentine, but knowing your luck probably not.
Looper.prototype.getInstanceName = function(){
var looper = this;

	return looper.instanceName;

}
