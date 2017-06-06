var fs = require("fs");

function readMap(map_path) {
  var map = require(map_path)
  return (map);
}

function writeMap(map_path, map) {
  fs.writeFile(map_path, JSON.stringify(map), function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("_Map saved");
  });
}

module.exports.fs = fs;
module.exports.readMap = readMap;
module.exports.writeMap = writeMap;

// var fs = require('./fileTest')
// var map_path_r = './maps/map1.json';
// var map_path_w = 'environment/maps/map1.json';
