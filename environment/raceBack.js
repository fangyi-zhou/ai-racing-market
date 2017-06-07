/**
 * Created by ruiaohu on 27/05/2017.
 */
// Requires
const util = require('./util');
const RaceCar = require('./RaceCar');
const Map = require('./maps/Map');
const Simulation = require('./Simulation');
const mapFS = require('./mapSave');

// Globals
const fixedTimeStep = 0.06;
const maxSteer = Math.PI / 5;

// Default map
let x = mapFS.readMap('./maps/map1.json');
let current_map = [x["segments"], x["gates"], x["startGate"]];

// Create the simulations
// var simulations = [];
const numSimulations = 10;
let simulations = new Simulation.Simulations();
for (let i = 0; i < numSimulations; i++) {
    let mapCopy = util.arrayCopy(current_map);
    simulations.addSimulation(i, mapCopy);
}

function packageGraphics (simID) {
    let graphics_dict = {};
    let sim = simulations.get(simID);
    sim.raceCars.forEach(function (raceCar, key) {
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

function addRaceCar(clientID, position, simID) {
    let sim = simulations.get(simID);
    let car = new RaceCar.RaceCar(sim.raceCars.count()+1, clientID, sim.world, position);
    sim.raceCars.set(clientID, car);
    return car;
}

function addClient(clientID, simID){
    console.log('USER', clientID);
    const initPosition = [-2.7, 0];
    addRaceCar(clientID, initPosition, simID);
}

function updateMovement(keys, clientID, simID){
    let control = {};
    control["steerValue"] = keys[37] - keys[39];
    if (keys[38] && keys[40]) control["engineForce"] = 0;
        else if (keys[38]) control["engineForce"] = 1;
        else if (keys[40]) control["engineForce"] = -0.5;
        else control["engineForce"] = 0;
    applyMove(control, clientID, simID);
}

function applyMove(control, clientID, simID) {
    let sim = simulations.get(simID);
    let clientCar = sim.raceCars.get(clientID);
    if (clientCar === null || clientCar === undefined) {
        console.error(`Applying a move to null car ${clientID}`);
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
function removeVehicle(vehicle, simID) {
    let sim = simulations.get(simID);
    sim.world.removeBody(vehicle.chassisBody);
  vehicle.removeFromWorld();
}

function removeUser(clientID, simID){
    let sim = simulations.get(simID);
    let car = sim.raceCars.get(clientID);
    if (car !== undefined && car !== null)
        removeVehicle(car.vehicle, simID);
    sim.raceCars.remove(clientID);
}

// Loop the program
setInterval(function() {
    simulations.stepAll(fixedTimeStep);
    simulations.checkCheckpoints();
    // current_map.checkCheckpoints();

    // Update graphics
    simulations.updateGraphics();
}, 1000/30);

function initIO(clientID, simID){
    let sim = simulations.get(simID);
    return {
        numCars: sim.raceCars.count(),
        carWidth: RaceCar.carWidth,
        carHeight: RaceCar.carHeight,
        numRays: RaceCar.numRays,
        id: clientID,
        cars: packageGraphics(simID),
        map: sim.map.save,
        checkpoints: sim.map.checkpoints,
        startGate: sim.map.startGate
    }
}

function changeMap(info, simID) {
    let sim = simulations.get(simID);
  let segments = info.map.segments;
  let checkpoints = info.map.gates;
  let startGate = info.map.startGate;
    sim.map.removeMap(sim.world);
    sim.map = new Map.Map(segments, checkpoints, startGate);
    sim.map.createMap(sim.world);
  return sim.save;
}

module.exports.packageGraphics = packageGraphics;
module.exports.addClient = addClient;
module.exports.addRaceCar = addRaceCar;
module.exports.updateMovement = updateMovement;
module.exports.applyMove = applyMove;
module.exports.removeUser= removeUser;
module.exports.initIO = initIO;
module.exports.changeMap = changeMap;
module.exports.simulations = simulations;
