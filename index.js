var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 1140;
var hashMap = require('hashmap');

server.listen(port, function () {
    console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));

var allRacers = new hashMap();

var time = 0;
setInterval(function(){
   allRacers.forEach(function (value, key) {
       //update information of each racer.
   });
   console.log('Server healthy...' + time);
   time++;
}, 2000);


function onConnection(socket){
    //Add emitting code here
}

io.on('connection', onConnection);


