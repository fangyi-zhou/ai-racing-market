/**
 * Created by ruiaohu on 27/05/2017.
 */
const p2 = require('p2');
const hashMap = require('hashmap');
const RaceCar = require('./RaceCar');
const rays = require('./rays');

// Hyperparameters
var numCars = 5;
const carMass = 1;
const carWidth = 0.5;
const carHeight = 1;

const fixedTimeStep = 0.06;
const raceCars = new hashMap();
const maxSteer = Math.PI / 5;
// Create the world
const world = new p2.World({
    gravity : [0,0]
});

function createMapSegment (segment) {
  let map = new p2.Body({
      mass : 1,
      position:[0,0],
      type: p2.Body.STATIC,
  });
  map.fromPolygon(segment);
  world.addBody(map);

  /*************Blame the p2 author for bad API design **************/
  for(let i = 0; i<map.shapes.length;i++){
    map.shapes[i].collisionMask = -1;
    map.shapes[i].collisionGroup = -1;
  }
  /*******************************************************************/
}

var current_map = require('./maps/map1.js')["map1"]
var current_map_save = JSON.parse(JSON.stringify(current_map)); // Required since p2 manipulates array
for (let p = 0; p < current_map.length; p++) {
  createMapSegment(current_map[p])
}

// Gets map to send to users
function getMap() {
  return current_map_save;
}

// For now, set default friction between ALL objects
// In future may wish to have it vary between objects
world.defaultContactMaterial.friction = 0.001;

function packageGraphics () {
    let graphics_dict = [];
    raceCars.forEach(function (raceCar, key) {
        graphics_dict.push ({
            position: raceCar.box_graphic.position,
            angle: raceCar.box_graphic.angle,
            rayEnds: raceCar.rayEnds
        })
    });
    return graphics_dict;
}

// Create p2 cars
for (let i = 1; i <= numCars; i++) {
    let position = [i/2, i/2];
    raceCars.set (i, new RaceCar.RaceCar (i,world, position, carWidth, carHeight, carMass));
}
function addClient(id){
    let client = new RaceCar.RaceCar(raceCars.count()+1,world, [5,5], carWidth, carHeight, carMass);
    client.backWheel.engineForce = 0;
    client.frontWheel.steerValue = 0;
    raceCars.set(id, client);
    return client;
}

// Send details of p2 race car to its graphical counterpart
function updateGraphics () {
    raceCars.forEach(function (value, key) {
        //update information of each racer.
        value.updateGraphics();
        rays.constructRays(value,RaceCar.numRays,world);
    });

}
function updateMovement(keys, id){
    let control = {};
    control["steerValue"] = keys[37] - keys[39];
    if (keys[38] && keys[40]) control["engineForce"] = 0;
        else if (keys[38]) control["engineForce"] = 1;
        else if (keys[40]) control["engineForce"] = -0.5;
        else control["engineForce"] = 0;
    applyMove(control, id);
}

function applyMove(control, id) {
    let clientCar = raceCars.get(id);
    if (clientCar === null || clientCar === undefined) {
        console.error(`Applying a move to null car ${id}`);
        return;
    }
    // Steer value zero means straight forward. Positive is left and negative right.
    if (control["steerValue"] !== undefined && control["steerValue"] !== null) {
        let steerValue = maxSteer * Math.min(Math.max(control["steerValue"], -1), 1);
        clientCar.frontWheel.steerValue = steerValue;
    }
    if (control["engineForce"] !== undefined && control["engineForce"] !== null) {
        let engineForce = Math.min(Math.max(control["engineForce"], -0.5), 1);
        clientCar.backWheel.engineForce = engineForce;
        let breaking = (clientCar.backWheel.getSpeed() > 0.1 && engineForce < 0)
            || (clientCar.backWheel.getSpeed() < -0.1 && engineForce > 0);
        clientCar.backWheel.setBrakeForce(breaking ? 5 : 0);
    }
}

// p2 implementation of vehicle.removeFromWorld is buggy; doesn't remove the chassis
function removeVehicle(vehicle) {
    world.removeBody(vehicle.chassisBody);
    vehicle.removeFromWorld();
}

function removeUser(id){
    let car = raceCars.get(id);
    removeVehicle(car.vehicle);
    raceCars.remove(id);
}

function carCount(){
    let num = raceCars.count();
    return num;
}

function getCarById(carId) {
    return raceCars.get(carId);
}

// Loop the program
setInterval(function(){
    world.step(fixedTimeStep);

    // Update graphics
    updateGraphics ();
}, 1000/30);

function initIO(){
    return {
        numCars:carCount(),
        carWidth: carWidth,
        carHeight: carHeight,
        numRays: RaceCar.numRays,
        map: getMap()
    }
}

module.exports.packageGraphics = packageGraphics;
module.exports.addClient = addClient;
module.exports.updateMovement = updateMovement;
module.exports.applyMove = applyMove;
module.exports.removeUser= removeUser;
module.exports.getCarById = getCarById;
module.exports.initIO = initIO;