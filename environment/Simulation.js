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
        };

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
        this.maxSteer = Math.PI / 5;

        this.rawMap = util.arrayCopy(map);
        this.map = new Map.Map(map[0], map[1], map[2]);
        this.map.createMap(this.world, this.raceCars);

        this.step = function(timeStep) {
            this.world.step(timeStep);
        };

        this.checkCheckpoints = function () {
            return this.map.checkCheckpoints(this.world);
        };

        // Adds a new race car to the world
        this.addRaceCar = function (clientID, position) {
            let car = new RaceCar.RaceCar(this.raceCars.count()+1, clientID, this.world, position);
            this.raceCars.set(clientID, car);
            return car;
        };

        // Change the map in the world
        this.changeMap = function (info) {
            let segments = info.map.segments;
            let checkpoints = info.map.gates;
            let startGate = info.map.startGate;
            this.map.removeMap(this.world);
            this.map = new Map.Map(segments, checkpoints, startGate);
            this.map.createMap(this.world);
            return this.save;
        };

        // Prepare graphical representation for front end
        this.packageGraphics = function() {
            let graphics_dict = {};
            this.raceCars.forEach(function (raceCar, key) {
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

        // Initialise IO with this simulation and the client
        this.initIO = function (clientID) {
            return {
                numCars: this.raceCars.count(),
                carWidth: RaceCar.carWidth,
                carHeight: RaceCar.carHeight,
                numRays: RaceCar.numRays,
                id: clientID,
                cars: this.packageGraphics(),
                map: this.map.save,
                checkpoints: this.map.checkpoints,
                startGate: this.map.startGate
            }
        };

        // p2 implementation of vehicle.removeFromWorld is buggy; doesn't remove the chassis
        this.removeVehicle = function(vehicle) {
            this.world.removeBody(vehicle.chassisBody);
            vehicle.removeFromWorld();
        };

        this.removeUser = function(clientID) {
            let car = this.raceCars.get(clientID);
            if (car !== undefined && car !== null)
                this.removeVehicle(car.vehicle);
            this.raceCars.remove(clientID);
        };

        // Adds a client car to the simulation that the client can control
        this.addClient = function(clientID) {
            console.log('USER', clientID);
            const initPosition = [-2.7, 0];
            this.addRaceCar(clientID, initPosition);
        };

        // Updates a car's movement instructions in the simulation and then applies them to the car
        this.updateMovement = function(keys, clientID) {
            let control = {};
            control["steerValue"] = keys[37] - keys[39];
            if (keys[38] && keys[40]) control["engineForce"] = 0;
            else if (keys[38]) control["engineForce"] = 2;
            else if (keys[40]) control["engineForce"] = -0.5;
            else control["engineForce"] = 0;
            this.applyMove(control, clientID);
        };

        // Applies movement instructions to the physical car
        this.applyMove = function(control, clientID) {
            let clientCar = this.raceCars.get(clientID);
            if (clientCar === null || clientCar === undefined) {
                console.error(`Applying a move to null car ${clientID}`);
                return;
            }
            // Steer value zero means straight forward. Positive is left and negative right.
            if (control["steerValue"] !== undefined && control["steerValue"] !== null) {
                let steerValue = this.maxSteer * Math.min(Math.max(control["steerValue"], -1), 1);
                clientCar.frontWheel.steerValue = steerValue;
            }
            if (control["engineForce"] !== undefined && control["engineForce"] !== null) {
                let engineForce = Math.min(Math.max(control["engineForce"], -0.5), 2);
                clientCar.backWheel.engineForce = engineForce;
                let breaking = (clientCar.backWheel.getSpeed() > 0.1 && engineForce < 0)
                    || (clientCar.backWheel.getSpeed() < -0.1 && engineForce > 0);
                clientCar.backWheel.setBrakeForce(breaking ? 5 : 0);
            }
        };

        // Runs a race on this Simulation
        this.runRace = function () { // Parameters: Child cars (AI)
            // Reset simulation
            // Run race for set amount of time
            // Give timeout signal when finished
            // Update rankings
        }
    }
}

module.exports.Simulations = Simulations;
