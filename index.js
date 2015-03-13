var SharkByte = require("SharkByte");
var scraper = new SharkByte();

scraper.init( "./manifest/" );

scraper.get( "reddit" , "subreddit_listing" , {} , function(){} );
scraper.get( "vine" , "channel" , { channel: "comedy" } , function(){} );

// scraper.init( manifestArray );
// scraper.start( functionArray );

// read data from database
// determine what to look for next
// provide sharkbyte the necessary steps


