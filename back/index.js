var hashMap = require('hashmap');
var p2  =  require('p2');
var PORT = process.env.PORT || 1140;
var io = require('socket.io').listen(PORT);

var allRacers = new hashMap();

console.log('Server Started. Listening......\n');

// on add to client to observer when on connection.
io.sockets.on('connection', function(connection){
    //add emitting code here
});

var time = 0;
setInterval(function(){
   allRacers.forEach(function (value, key) {
       //update information of each racer.
   });
   console.log('Server healthy...' + time);
   time++;
}, 2000);