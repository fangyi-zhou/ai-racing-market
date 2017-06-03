const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const index = require('./routes/index');
const races = require('./routes/races');
const dev = require('./routes/dev');
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
const mongodb = require('mongodb');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'dist')));
app.route('/*')
  .get(function (req, res) {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
app.use("/dev", express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/rooms',rooms);
app.use('/dev',dev);
app.use('/races', races);
app.use('/api', api);

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
  host.addAiCar(1, io);
  raceBack.addClient(socket.id);
  //send back the number of cars need to be rendered
  io.to(socket.id).emit('init', raceBack.initIO(socket.id));

  console.log('user connection, socket id = ' + socket.id);

  //iterate physics
  setInterval(function () {
    socket.emit('updateClient', raceBack.packageGraphics());
  }, 1000 / 30);

  socket.on('disconnect', function () {
    console.log('user disconnected, socket id = ' + socket.id);
    raceBack.removeUser(socket.id);
    socket.broadcast.emit('dc', {
      id: socket.id
    });
  });

  socket.on('movement', function (info) {
    raceBack.updateMovement(info, socket.id);
  });

  // ************** TODO: Change this to POST ************* //
  socket.on('saveMap', function (info) {
    /******** TODO: replace to save to database ********/
    socket.broadcast.emit('newMap', {
      map: raceBack.changeMap(info)
    });
  });

});

module.exports = {app: app, server: server};
