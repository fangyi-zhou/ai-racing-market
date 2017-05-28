var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 1024;
var hashMap = require('hashmap');
var raceBack = require('./environment/raceBack.js');

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

io.on('connection', function(socket){
    //send back the number of cars need to be rendered
    io.to(socket.id).emit('carNumber',{numCars:raceBack.numCars});
    console.log('user connection, socket id = '+socket.id);

    //iterate physics
    setInterval(function(){
        raceBack.animate();
        //socket.emit('updateClient',raceBack.packageGraphics());
    }, 200);
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
});


