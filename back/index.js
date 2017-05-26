var HashMap = require('hashmap');
var p2  =  require('p2');
var PORT = process.env.PORT || 1140;
var io = require('socket.io').listen(PORT);

var FRAME_RATE = 30;

var BULLET_SPLASH = 800;

var allGameObjects = new HashMap();



