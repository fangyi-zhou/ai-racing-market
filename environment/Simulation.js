/**
 * Created by Robert on 06/06/2017.
 */
const hashMap = require('hashmap');
const p2 = require('p2');
const Map = require('./maps/Map');
const util = require('./util');

class Simulations{
    constructor () {
        this.simulations = new hashMap.HashMap();
        this.addSimulation = function(simId, map) {
            var newSim = new Simulation(simId, map);
            this.simulations.set(newSim.id, newSim);
        };
        this.removeSimulation = function(simulationId) {
            this.simulations.remove(simulationId);
        };
        this.get = function(simulationId) {
            return this.simulations.get(simulationId);
        };
        this.stepAll = function(timeStep) {
            this.simulations.forEach(function(sim, id) {
                sim.step(timeStep);
            });
        }
    }
}

class Simulation{
    constructor (id, map) {
        this.id = id;

        this.raceCars = new hashMap.HashMap();

        this.world =  new p2.World({
            gravity : [0,0]
        });
        this.world.defaultContactMaterial.friction = 0.001;

        this.rawMap = util.arrayCopy(map);
        this.map = new Map.Map(map[0], map[1], map[2]);
        this.map.createMap(this.world, this.raceCars);

        this.step = function(timeStep) {
            this.world.step(timeStep);
        };

        this.checkCheckpoints = function () {
            return this.map.checkCheckpoints(this.world);
        }
    }
}

module.exports.Simulations = Simulations;
