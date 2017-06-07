/**
 * Created by Robert on 06/06/2017.
 */
const hashMap = require('hashmap');
const p2 = require('p2');
const Map = require('./maps/Map');
const util = require('./util');
const rays = require('./rays');
const RaceCar = require('./RaceCar');

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
        };
        this.checkCheckpoints = function() {
            this.simulations.forEach(function(sim, id) {
                sim.checkCheckpoints();
            });
        }
        // Send details of p2 race car to its graphical counterpart
        this.updateGraphics = function () {
            this.simulations.forEach(function(sim, id) {
                sim.raceCars.forEach(function (value, key) {
                    //update information of each racer.
                    value.updateGraphics();
                    rays.constructRays(value, RaceCar.numRays, sim.world);
                });
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
        this.world.defaultContactMaterial.restitution = 0.5;

        this.rawMap = util.arrayCopy(map);
        this.map = new Map.Map(map[0], map[1], map[2]);
        this.map.createMap(this.world, this.raceCars);

        this.step = function(timeStep) {
            this.world.step(timeStep);
        };

        this.checkCheckpoints = function () {
            return this.map.checkCheckpoints(this.world);
        }

        // Adds a new race car to the world
        this.addRaceCar = function (clientID, position) {
            let car = new RaceCar.RaceCar(this.raceCars.count()+1, clientID, this.world, position);
            this.raceCars.set(clientID, car);
            return car;
        }
    }
}

module.exports.Simulations = Simulations;
