var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 1024;

const host = require('./usercode/host');
var isFirst =1;

var raceBack = require('./environment/raceBack.js');

server.listen(port, function () {
    console.log('Server listening at port %d', port);
    host.addAiCar(1);
});

// Routing
app.use(express.static(__dirname + '/public'));

var time = 0;
setInterval(function(){
   console.log('Server healthy...' + time);
   time++;
}, 2000);

io.on('connection', function(socket){
    if(isFirst){
        raceBack.addClient(socket.id);
        isFirst = 0;
    }
    //send back the number of cars need to be rendered
    io.to(socket.id).emit('carNumber',{
        numCars:raceBack.allCarNumber(),
        carWidth: raceBack.carWidth,
        carHeight: raceBack.carHeight
    });

    console.log('user connection, socket id = '+socket.id);

    //iterate physics
    setInterval(function(){
        socket.emit('updateClient',raceBack.packageGraphics());
    }, 1000/30);

    socket.on('disconnect', function(){
        console.log('user disconnected, socket id = '+socket.id);
        raceBack.removeUser(socket.id);
        socket.emit('updateClient',raceBack.packageGraphics());
    });

    socket.on('movement', function(info){
        raceBack.updateMovement(info, socket.id);
    });
});


