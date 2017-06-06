/**
 * Created by ruiaohu on 27/05/2017.
 */
// Requires
const p2 = require('p2');
const util = require('./util');
const hashMap = require('hashmap');
const RaceCar = require('./RaceCar');
const rays = require('./rays');
const Map = require('./maps/Map');
const Simulation = require('./Simulation');

// Globals
const fixedTimeStep = 0.06;
const maxSteer = Math.PI / 5;


// Default map
let current_map = [require('./maps/map1.js')["map1"], [[[0,0],[0,0]]], [[0, 0], [0, 1]]];

// Create the simulations
// var simulations = [];
const numSimulations = 10;
var simulations = new Simulation.Simulations();
for (let i = 0; i < numSimulations; i++) {
    var mapCopy = util.arrayCopy(current_map);
    simulations.addSimulation(i, mapCopy);
}

// TODO: Change the 0 to be the chosen simulation
function packageGraphics () {
    let graphics_dict = {};
    simulations.get(0).raceCars.forEach(function (raceCar, key) {
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

// TODO: Change the 0 to be the chosen simulation
function addRaceCar(clientID, position) {
    let car = new RaceCar.RaceCar(simulations.get(0).raceCars.count()+1, clientID, simulations.get(0).world, position);
    simulations.get(0).raceCars.set(clientID, car);
    return car;
}

function addClient(id){
    console.log('USER', id);
    const initPosition = [5, 5];
    addRaceCar(id, initPosition);
}

// Send details of p2 race car to its graphical counterpart
// TODO: Change the 0 to be the chosen simulation
function updateGraphics () {
    simulations.get(0).raceCars.forEach(function (value, key) {
        //update information of each racer.
        value.updateGraphics();
        rays.constructRays(value,RaceCar.numRays,simulations.get(0).world);
    });
}

// TODO: Change the 0 to be the chosen simulation
function updateMovement(keys, id){
    let control = {};
    control["steerValue"] = keys[37] - keys[39];
    if (keys[38] && keys[40]) control["engineForce"] = 0;
        else if (keys[38]) control["engineForce"] = 1;
        else if (keys[40]) control["engineForce"] = -0.5;
        else control["engineForce"] = 0;
    applyMove(control, id);
}

// TODO: Change the 0 to be the chosen simulation
function applyMove(control, id) {
    let clientCar = simulations.get(0).raceCars.get(id);
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
// TODO: Change the 0 to be the chosen simulation
function removeVehicle(vehicle) {
  simulations.get(0).world.removeBody(vehicle.chassisBody);
  vehicle.removeFromWorld();
}

// TODO: Change the 0 to be the chosen simulation
function removeUser(id){
    let car = simulations.get(0).raceCars.get(id);
    if (car !== undefined && car !== null)
        removeVehicle(car.vehicle);
    simulations.get(0).raceCars.remove(id);
}

// TODO: Change the 0 to be the chosen simulation
function carCount(){
    let num = simulations.get(0).raceCars.count();
    return num;
}

// TODO: Change the 0 to be the chosen simulation
function getCarById(carId) {
    return simulations.get(0).raceCars.get(carId);
}

// Loop the program
setInterval(function() {
    simulations.stepAll(fixedTimeStep);
    simulations.get(0).checkCheckpoints();
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
        map: simulations.get(0).map.save,
        checkpoints: simulations.get(0).map.checkpoints,
        startGate: simulations.get(0).map.startGate
    }
}

// TODO: Change the 0 to be the chosen simulation
function changeMap(info) {
  let segments = info.map.segments;
  let checkpoints = info.map.gates;
  let startGate = info.map.startGate;
    simulations.get(0).map.removeMap(simulations.get(0).world);
    simulations.get(0).map = new Map.Map(segments, checkpoints, startGate);
    simulations.get(0).map.createMap(simulations.get(0).world);
  return simulations.get(0).save;
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
