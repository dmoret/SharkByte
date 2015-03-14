var HTTP = require('http');
var XRAY = require('x-ray');
var FS = require('fs');
var Looper = require('looper.js');

module.exports = SharkByte;

function SharkByte(){

	this.looper;
	this.manifestSet;

}

SharkByte.prototype.init = function( manifestDirectory ){
var sharkbyte = this;

	sharkbyte.manifestSet = [];
	sharkbyte.looper = new Looper();

	sharkbyte.looper.start( { lockingFunctions: true } , [

		function(){
			
			sharkbyte.readManifestFiles( manifestDirectory );
			
		}

	]);

	sharkbyte.looper.unlock();

};

SharkByte.prototype.readManifestFiles = function( manifestDirectory ){
var sharkbyte = this;
		
	console.log("Reading manifest files...")

	FS.readdir( manifestDirectory , function( err , files ){

		files.forEach(function( element , index , array ){

			var ext = element.split('.');

				ext = ext[ ext.length - 1 ];

			if( ext == "json" ){

				FS.readFile( manifestDirectory + '/' + element , 'utf8', function ( err,  data ){
					
					if( err ){

						console.log( "error reading file" + err );

					}else{

						sharkbyte.manifestSet[ element.split('.')[0].toLowerCase() ] = JSON.parse(data);

						if( index == array.length - 1 ){

							console.log("Done reading manifest files.")

							sharkbyte.looper.sleep( 1000 , function(){

								sharkbyte.looper.unlock();

							});
							
						}

					}

				}); // !FS.readFile( manifestDirectory + '/' + element , 'utf8', function ( err,  data ) 

			} // !if( ext == "json" )	

		}); // !files.forEach(function( element , index , array )

	}); // !FS.readdir( manifestDirectory , function( err , files )

};

SharkByte.prototype.callAPI = function( dataBuild , options , callback  ){
var sharkbyte = this;
	
	HTTP.get( dataBuild.url , function( res ){

		var rawData = "";

		res.on( 'data' , function( chunk ){

			rawData += chunk;

		});

		res.on( 'end' , function(){

			rawData = JSON.parse(rawData);
			reduceObject( rawData , dataBuild.root , function( reduction ){
				var collection = [];

				for (var i = 0; i < reduction.length; i++) {
					
					var paramLength = Object.keys( dataBuild ).length;
					var paramIndex = 0;

					var item = {};
            		for( var key in dataBuild ){
            			

            			if( key != "root" && key != "url" ){

            				reduceObject( reduction[i] , dataBuild[key] , function( reduction ){

            					item[key] = reduction;
            					paramIndex++;

            					if( paramIndex == paramLength ){

            						collection.push( item );

            					}

            				});


            			}else{ 

            				paramIndex++; 
            				if( paramIndex == paramLength ){

            					collection.push( item );

            				}

            			}

            		}

            		if( i == reduction.length - 1 ){

            			callback( collection );
            			sharkbyte.looper.unlock();

            		}

				}

			});

		});

	});

}

SharkByte.prototype.crawlDOM = function( dataBuild , options , callback  ){
var sharkbyte = this;

	var requestOpts = {

  		$root: dataBuild.root

	};

	var paramLength = Object.keys( dataBuild ).length;
	var paramCursor = 0;

	for( var param in dataBuild ){

	  	if( param != "root" && param != "url" ){

	  		requestOpts[ param ] = dataBuild[ param ];
	  		paramCursor++;


	  	}else{

	  		paramCursor++;

	  	}

	  	if( paramCursor == paramLength ){

	  		XRAY( dataBuild.url )
		    .select([ requestOpts ])
		    .run(function( err , array ){

		  		callback( array );

		    });

	  	}

	}

	sharkbyte.looper.unlock();

};

SharkByte.prototype.get = function( platform , dataType , options , callback ){
var sharkbyte = this;

	sharkbyte.looper.addToChain(function(){

		var manifest = sharkbyte.manifestSet[ platform ];
		var type = manifest.type;
		var dataBuild = manifest[dataType];

		switch( type ){

			case "dom":
				sharkbyte.looper.addToChain(function(){

					sharkbyte.mapOptionsToDataBuild( options , dataBuild , function(){

						sharkbyte.crawlDOM( dataBuild , options , callback );

					});

				});
				sharkbyte.looper.unlock();
				break;

			case "api":
				sharkbyte.looper.addToChain(function(){

					sharkbyte.mapOptionsToDataBuild( options , dataBuild , function(){

						sharkbyte.callAPI( dataBuild , options , callback );

					});

				});
				sharkbyte.looper.unlock();
				break;

			default:
				console.log("error with manifest request type");

		}

	});

};

SharkByte.prototype.mapOptionsToDataBuild = function( options , dataBuild , callback ){
var sharkbyte = this;

	if( Object.keys( options ).length != 0 ){
		
		var optionsLength = Object.keys( options ).length;
		var optionsIndex = 0;

		for( var key in options ){

			var optionTag = "{" + key + "}";
			var dataBuildLength = Object.keys( dataBuild ).length;
			var dataBuildIndex = 0;

			for( var param in dataBuild ){

				if( dataBuild[ param ].indexOf( optionTag ) != -1 ){

					var strIndex = dataBuild[ param ].indexOf( optionTag );
					var strPre = dataBuild[ param ].substring( 0 , strIndex );
					var strPost = dataBuild[ param ].substring( strIndex + optionTag.length );
					var newVal = strPre + options[ key ] + strPost;

					dataBuild[ param ] = newVal;

					dataBuildIndex++;
					

				}else{ dataBuildIndex++; }

				if( dataBuildIndex == dataBuildLength ){

					optionsIndex++;

				}

			}

			if( optionsIndex == optionsLength ){

				console.log("done mapping options");
				callback();

			}

		}

	}else{

		callback();

	}

};

function reduceObject( from , to , callback ){

	to = to.split('.');
	var cursor = from;
	var reduction;

	for (var i = 0; i < to.length; i++) {
				
		cursor = cursor[ to[i] ];

		if( i == to.length - 1 ){

			reduction = cursor;
			callback( reduction );
					
		}

	}	
	
}