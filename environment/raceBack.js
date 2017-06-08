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

// Default map
let defaultMap = mapFS.readMap('./maps/map1.json');
let current_map = [defaultMap["segments"], defaultMap["gates"], defaultMap["startGate"]];

// Create the simulations
const numSimulations = 10;
let simulations = new Simulation.Simulations();
for (let i = 0; i < numSimulations; i++) {
    let mapCopy = util.arrayCopy(current_map);
    simulations.addSimulation(i, mapCopy);
}

// Loop the program
setInterval(function() {
    simulations.stepAll(fixedTimeStep);
    simulations.checkCheckpoints();
    // current_map.checkCheckpoints();

    // Update graphics
    simulations.updateGraphics();
}, 1000/30);


function getSim(simID) {
    return simulations.get(simID);
}
module.exports.getSim = getSim;
