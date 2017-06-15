/**
 * Created by ruiaohu on 27/05/2017.
 */
// Requires
const util = require('./util');
const Map = require('./maps/Map');
const Simulation = require('./Simulation');
const mapFS = require('./mapSave');

// Globals
let fixedTimeStep, raceDuration, numAIinRace;

// Default map
let defaultMap, current_map;

// Create the simulations
let simulations;

// log io
let io;

function init(io, maxSims) {
    this.io = io;
    defaultMap = mapFS.readMap('./maps/slalem2.json');
    current_map = [defaultMap["segments"], defaultMap["gates"], defaultMap["startGate"]];

    // Globals
    fixedTimeStep = 0.06;
    raceDuration = 10;
    numAIinRace = 3;

    simulations = new Simulation.Simulations(maxSims);

    let mapCopy = util.arrayCopy(current_map);
    simulations.addSimulation(1337, mapCopy, io, Simulation.SimMode.Training);
    for (let i = 0; i < maxSims; i++) {
        let mapCopy = util.arrayCopy(current_map);
        simulations.addSimulation(i, mapCopy, io, Simulation.SimMode.ClientDrive);
    }
    // simulations.get(9).mode = Simulation.SimMode.RankedRacing;
    // simulations.get(maxSims-1).train('5941a81569950300117904fb');

    // Loop the program
    setInterval(function() {
        // simulations.runNewRaces(raceDuration, numAIinRace);
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

function getAllSims(){
    return simulations.currentSims();
}

function addSim(id, mode, AI){
    let mapCopy = util.arrayCopy(current_map);
    simulations.addSimulation(id, mapCopy, io, mode);
    if(AI != ''){
        simulations.addAI(id,AI);
    }
}

module.exports.getSim = getSim;
module.exports.init = init;
module.exports.fixedTimeStep = fixedTimeStep;
module.exports.getAllSims = getAllSims;
module.exports.addSim = addSim;
