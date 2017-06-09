/**
 * Created by ruiaohu on 27/05/2017.
 */
// Requires
const util = require('./util');
const Map = require('./maps/Map');
const Simulation = require('./Simulation');
const mapFS = require('./mapSave');

// Globals
const fixedTimeStep = 0.06;
const raceDuration = 3;
const numAIinRace = 2;

// Default map
let defaultMap, current_map;

// Create the simulations
let simulations;


function init(io, numSims) {
    defaultMap = mapFS.readMap('./maps/map1.json');
    current_map = [defaultMap["segments"], defaultMap["gates"], defaultMap["startGate"]];

    simulations = new Simulation.Simulations();
    for (let i = 0; i < numSims; i++) {
        let mapCopy = util.arrayCopy(current_map);
        simulations.addSimulation(i, mapCopy, io);
    }

    // Loop the program
    setInterval(function() {
        simulations.runNewRaces(raceDuration, numAIinRace);
        simulations.stepAll(fixedTimeStep);
        simulations.checkCheckpoints();
        // current_map.checkCheckpoints();

        // Update graphics
        simulations.updateGraphics();
    }, 1000/30);
}


function getSim(simID) {
    return simulations.get(simID);
}

module.exports.getSim = getSim;
module.exports.init = init;
