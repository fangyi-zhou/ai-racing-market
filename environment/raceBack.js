/**
 * Created by ruiaohu on 27/05/2017.
 */
const p2 = require('p2');
const hashMap = require('hashmap');
const RaceCar = require('./RaceCar');
const rays = require('./rays');

const result = new p2.RaycastResult();
const hitPoint = p2.vec2.create();

const fixedTimeStep = 0.06;
const raceCars = new hashMap.HashMap();
const maxSteer = Math.PI / 5;

const numSimulations = 10;

class map{
  constructor (segments, checkpoints, startGate) {
    this.segments = segments;
    this.checkpoints = checkpoints;
    this.startGate = startGate;

    this.save = JSON.parse(JSON.stringify(segments));// Required since p2 manipulates array
    this.mapPolys = [];
    this.mapCheckpoints = new hashMap.HashMap();
    this.mapStartGate;

    this.removeMap = function (world) {
      for (let i in this.mapPolys) {
        world.removeBody(this.mapPolys[i]);
      }
      this.mapCheckpoints.clear();
    };

    this.checkCheckpoints = function(world) {
      this.mapCheckpoints.forEach(function(value, ray){
        p2.vec2.copy(ray.from, value[1]);
        p2.vec2.copy(ray.to, value[2]);
        ray.update();
        result.reset();
        world.raycast(result, ray);
      });
    };

    this._createp2MapSegment = function (world, segment) {
      let p2map = new p2.Body({
        mass : 1,
        position:[0,0],
        type: p2.Body.STATIC,
      });
      p2map.fromPolygon(segment);
      world.addBody(p2map);

      /*************Blame the p2 author for bad API design **************/
      for(let i = 0; i < p2map.shapes.length; i++){
        p2map.shapes[i].collisionMask = -1;
        p2map.shapes[i].collisionGroup = Math.pow(2,31);
      }
      /*******************************************************************/
      return p2map
    }

    this.createMap = function (world) {
      // Create physical polygons
      for (let p = 0; p < this.segments.length; p++) {
        this.mapPolys.push(this._createp2MapSegment(world, this.segments[p]));
      }

      // Create checkpoint rays
      for (let i = 0; i < this.checkpoints.length;i++){
        let checkpoint = new p2.Ray({
          mode: p2.Ray.ALL,
          collisionMask:-1^Math.pow(2,31),
          callback: function(result){
            checkpointResult(result, this);
          }
        });
        this.mapCheckpoints.set(checkpoint, [i,checkpoints[i][0], checkpoints[i][1]]);
      }

      // Create start point ray
      this.mapStartGate = new p2.Ray({
        mode: p2.Ray.ALL,
        collisionMask:-1^Math.pow(2,31),
        callback: function(result){
          checkpointResult(result, this);
        }
      })
    }
  }
}

class Simulation{
  constructor (id, map) {
    this.world =  new p2.World({
                    gravity : [0,0]
                  });;
    this.world.defaultContactMaterial.friction = 0.001;

    // THIS IS VERY BROKEN
    this.map = map;// this.map = map.createMap(this.world);

    this.id = id;

    this.step = function(timeStep) {
      this.world.step(timeStep);
    }

    this.checkCheckpoints = function () {
      return this.map.checkCheckpoints(this.world);
    }
  }
}

function checkpointResult(result, ray){
    result.getHitPoint(hitPoint, ray);
    let car = raceCars.get(result.body.id);

  // TODO: send checkpoint to AI (reward signal);
}

// Default map
let current_map = new map(require('./maps/map1.js')["map1"], [[[0,0],[0,0]]], [[0, 0], [0, 1]]);

// Create the simulations
var simulations = [];
for (let i = 0; i < numSimulations; i++) {
  simulations.push(new Simulation(i, current_map));
}
current_map.createMap(simulations[0].world);

// Gets map to send to users
function getMap() {
  return current_map.save;
}

function packageGraphics () {
    let graphics_dict = {};
    raceCars.forEach(function (raceCar, key) {
        graphics_dict[raceCar.clientID] = {
            position: raceCar.box_graphic.position,
            angle: raceCar.box_graphic.angle,
            rayEnds: raceCar.rayEnds,
            colour: raceCar.colour,
            clientID: raceCar.clientID
        }
    });
    return graphics_dict;
}

function addRaceCar(clientID, position) {
    let car = new RaceCar.RaceCar(raceCars.count()+1, clientID, simulations[0].world, position);
    raceCars.set(clientID, car);
    return car;
}

function addClient(id){
    console.log('USER', id);
    const initPosition = [5, 5];
    addRaceCar(id, initPosition);
}

// Send details of p2 race car to its graphical counterpart
function updateGraphics () {
    raceCars.forEach(function (value, key) {
        //update information of each racer.
        value.updateGraphics();
        rays.constructRays(value,RaceCar.numRays,simulations[0].world);
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
  simulations[0].world.removeBody(vehicle.chassisBody);
  vehicle.removeFromWorld();
}

function removeUser(id){
    let car = raceCars.get(id);
    if (car !== undefined && car !== null)
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
    simulations[0].world.step(fixedTimeStep);
    simulations[0].checkCheckpoints();
    // current_map.checkCheckpoints();

    // Update graphics
    updateGraphics ();
}, 1000/30);

function initIO(clientID){
    return {
        numCars:carCount(),
        carWidth: RaceCar.carWidth,
        carHeight: RaceCar.carHeight,
        numRays: RaceCar.numRays,
        id: clientID,
        cars: packageGraphics(),
        map: getMap(),
        checkpoints: current_map.checkpoints,
        startGate: current_map.startGate
    }
}

function changeMap(info) {
  let segments = info.map.segments;
  let checkpoints = info.map.gates;
  let startGate = info.map.startGate;
  current_map.removeMap(simulations[0].world);
  current_map = new map(segments, checkpoints, startGate);
  current_map.createMap();
  return getMap();
}

module.exports.packageGraphics = packageGraphics;
module.exports.addClient = addClient;
module.exports.addRaceCar = addRaceCar;
module.exports.updateMovement = updateMovement;
module.exports.applyMove = applyMove;
module.exports.removeUser= removeUser;
module.exports.getCarById = getCarById;
module.exports.initIO = initIO;
module.exports.changeMap = changeMap;
