const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const leaderboard = require('./routes/leaderboard');
const api = require('./routes/api');
const rooms = require('./routes/rooms');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server, {
  pingInterval: 2000,
  pingTimeout: 5000
});

const host = require('./usercode/host');
const raceBack = require('./environment/raceBack.js');
const numSimulations = 6;
const db = require('./db');

db.init(() => {
    raceBack.init(io, numSimulations);

    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(cookieParser());

    app.use(express.static(path.join(__dirname, 'dist')));

    app.use("/dev", express.static(path.join(__dirname, 'public')));
    app.use('/api', api);
    app.use('/api/leaderboard',leaderboard);

    app.route('/*')
        .get(function (req, res) {
            res.sendFile(path.join(__dirname, 'dist', 'index.html'));
        });

    app.use('/rooms',rooms);

//catch 404 and forward to error handler
    app.use(function (req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    /****** TODO error handler ********/
// app.use(function(err, req, res, next){
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};
//
//   // render the error page
//   res.status(err.status || 500);
//   res.send(err.status);
// });


    io.on('connection', function (socket) {
        let simId = undefined;
        io.to(socket.id).emit('connected');
        socket.on('join',function (info) {
            simId = info.simId;
            let sim = raceBack.getSim(simId);
            if (sim === undefined){
                //TODO
            } else {
                io.to(socket.id).emit('init', sim.initIO(socket.id));
                // sim.addClient(socket.id);
            }
        });


        //send back the number of cars need to be rendered


        console.log('user connection, socket id = ' + socket.id);

        //iterate physics
        setInterval(function () {
            let sim = raceBack.getSim(simId);
            if(sim !== undefined){
                socket.emit('updateClient', sim.packageGraphics());
            }

        }, 1000 / 30);

        socket.on('disconnect', function () {
            console.log('user disconnected, socket id = ' + socket.id);
            let sim = raceBack.getSim(simId);
            if(sim !== undefined)
                raceBack.getSim(simId).removeUser(socket.id);
            socket.broadcast.emit('dc', {
                id: socket.id
            });
        });

        socket.on('movement', function (info) {
            let sim = raceBack.getSim(simId);
            if(sim !== undefined)
            raceBack.getSim(simId).updateMovement(info, socket.id);
        });

        // // ************** TODO: Change this to POST ************* //
        // socket.on('saveMap', function (info) {
        //     /******** TODO: replace to save to database ********/
        //     socket.broadcast.emit('newMap', {
        //         map: raceBack.getSim(simID).changeMap(info)
        //     });
        // });
        socket.on('train', function (info) {
            // let sim = raceBack.getSim(simId);
            // if(sim !== undefined)
            raceBack.getSim(info.id).train(info.scriptId);
        });

        socket.on('clientPlayAI', function (info) {
            // let sim = raceBack.getSim(simId);
            // if(sim !== undefined)
            let sim = raceBack.getSim(info.id);
            sim.clientPlayAI(info.scriptId, socket.id);
            sim.addClient(socket.id);
        });

        socket.on('challenge', function (info) {
            // let sim = raceBack.getSim(simId);
            // if(sim !== undefined)
            raceBack.getSim(info.id).runChallenge(info.scriptId, info.level);
        });

        socket.on('tutorial', function (info) {
            raceBack.runTutorial(info.code, info.tutorialNumber);
        });
    });
});

module.exports = {app: app, server: server};
