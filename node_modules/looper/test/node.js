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

// these are very basic examples of how to use looper.js. things get quite complex once you get into adding and controlling functions dynamically so tread carefully.
// uncomment w/e example you want to run

var LOOPER = require('../Looper.js');// import looper.js
var HTTP = require('http'); // for locking example
var LOOPER_1 = new LOOPER();// our test looper

console.log(LOOPER);

// Example 1 - lets run a few functions, pausing and concentrically calling the function at index 2, which also sleeps one second before printing its message.

// LOOPER_1.start({} , [

// 	function(){

// 		LOOPER_1.consolePrint( "hello" );

// 	},
// 	function(){

// 		LOOPER_1.consolePrint( "world" );

// 	},
// 	function(){

// 		LOOPER_1.loopThis( 3 );
// 		LOOPER_1.sleep( 1000 , function(){

// 			console.log( "." );

// 		});
		
// 	},
// 	function(){

// 		LOOPER_1.consolePrint( "lol" );

// 	}

// ]);

/////////////////////////////////////////////////////////////////////////////////// !Example 1

// Example 2 - adding functions to the chain. we also show the use of locking functions. debug is set to true in this example so you can see the system in action

// LOOPER_1.start( { delay: 1000 , lockingFunctions: true , debug: true } , [

// 	function(){

// 		LOOPER_1.addToChain( function(){

// 			console.log("I");
// 			LOOPER_1.unlock();

// 		});

// 		LOOPER_1.addToChain( function(){

// 			console.log("am");
// 			LOOPER_1.unlock();

// 		});

// 		LOOPER_1.addToChain( function(){

// 			console.log("locked");
// 			LOOPER_1.unlock();
			
// 		});

// 		LOOPER_1.addToChain( function(){

// 			console.log("up");
// 			LOOPER_1.unlock();

// 		});

// 		LOOPER_1.unlock();

// 	}

// ]);

// LOOPER_1.unlock();

/////////////////////////////////////////////////////////////////////////////////// !Example 2

// Example 3 - using locking functions we can ensure one http request before starting the second, and we use the init function to set up our looper data for us.
// by using persistData: true we can maintain our loopData between function calls

// LOOPER_1.start({ delay: 1000 , lockingFunctions: true , persistData: true } , [
// 	function(){

// 		init();

// 	},
// 	function(){

// 		getData();

// 	},
// 	function(){

// 		getMoreData();

// 	},
// 	function(){

// 		printData();

// 	}

// ]);

// LOOPER_1.unlock();

// function init(){

// 	LOOPER_1.loopData.thing = "";
// 	LOOPER_1.unlock();

// }

// function getData(){

// 	HTTP.get( 'http://www.reddit.com/r/funny/new/.json' , function( res ){

// 		res.on('data' , function( chunk ){

// 			LOOPER_1.loopData.thing += chunk;

// 		});

// 		res.on('end' , function(){

// 			LOOPER_1.consolePrint( "function " + LOOPER_1.getFunctionIndex() + " complete" );
// 			LOOPER_1.unlock();

// 		});

// 	});

// }

// function getMoreData(){

// 	HTTP.get( 'http://www.reddit.com/r/news/new/.json' , function( res ){

// 		res.on('data' , function( chunk ){

// 			LOOPER_1.loopData.thing += chunk;

// 		});

// 		res.on('end' , function(){

// 			LOOPER_1.consolePrint( "function " + LOOPER_1.getFunctionIndex() + " complete" );
// 			LOOPER_1.unlock();

// 		});

// 	});

// }

// function printData(){

// 	LOOPER_1.consolePrint( LOOPER_1.loopData.thing );
// 	LOOPER_1.unlock();

// }

/////////////////////////////////////////////////////////////////////////////////// !Example 3