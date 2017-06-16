/**
 * Created by Robert on 06/06/2017.
 */
const hashMap = require('hashmap');
const p2 = require('p2');
const Map = require('./maps/Map');
const util = require('./util');
const rays = require('./rays');
const RaceCar = require('./RaceCar');
const AIHost = require('../usercode/host');

class Simulations{
    constructor (maxSims) {
        this.maxSims = maxSims;
        this.simulations = new hashMap.HashMap();

        this.addSimulation = function(simId, map, io, mode) {
            var newSim = new Simulation(simId, map, io, mode);
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
                if (sim.mode != SimMode.Training) {
                    sim.step(timeStep);
                }
            });
        };
        this.addAI = function(id, AI){
            let sim = this.simulations.get(id);
            sim.runRace(100,[AI]);
        }
        this.checkCheckpoints = function() {
            this.simulations.forEach(function(sim, id) {
                sim.checkCheckpoints();
            });
        };

        // Send details of p2 race car to its graphical counterpart
        this.updateGraphics = function () {
            this.simulations.forEach(function(sim, id) {
                sim.raceCars.forEach(function (raceCar, key) {
                    //update information of each racer.
                    raceCar.updateGraphics();
                    rays.constructRays(raceCar, RaceCar.numRays, sim.world);
                });
            });
        };

        // Runs races on all available Simulations
        this.runNewRaces = function(raceDuration, numAI) {
            // this.simulations.forEach(function (sim, id) {
            //     if (!sim.runningRace) {
            //         sim.runRandomRace(raceDuration, numAI);
            //     }
            // })
            // console.log(!this.simulations.get(0).runningRace);

            /*
                CURRENTLY JUST RUNNING RACES ON ROOM 9
             */

            // if (!this.simulations.get(9).runningRace) {
            //     this.simulations.get(9).runRandomRace(raceDuration, numAI);
            // }
            this.simulations.forEach(function(sim, id) {
                if (!sim.runningRace && sim.mode === SimMode.RankedRacing) {
                    sim.runRandomRace(raceDuration, numAI);
                }
            })
        }

        this.currentSims = function(){
            let sims = [];
            this.simulations.forEach(function(sim, id){
                if (sim.mode != 1){
                    sims.push({
                        id:id,
                        mode: 2,
                        name: 'foo'
                        //TODO add more information;
                    })
                }
            });
            return sims;
        }
    }
}

const SimMode = {
    RankedRacing : 0,
    Training : 1,
    ClientDrive: 2
};

class Simulation{
    constructor (id, map, io, mode) {
        this.id = id;
        this.io = io;
        this.mode = mode;//SimMode.ClientDrive;

        this.raceCars = new hashMap.HashMap();
        this.AIs = new hashMap.HashMap();

        this.world =  new p2.World();

        this.configureWorld = function() {
            this.world.gravity = [0,0];
            this.world.defaultContactMaterial.friction = 0.001;
            this.world.defaultContactMaterial.restitution = 0.6;
        };
        this.configureWorld();

        this.maxSteer = 2;//Math.PI / 5;

        this.rawMap = util.arrayCopy(map);

        this.setMap = function(map) {
            this.map = new Map.Map(map[0], map[1], map[2]);
            this.map.createMap(this.world, this.raceCars);
        };
        this.setMap(map);

        // Races on this simulation
        this.paused = false;
        this.runningRace = false;
        this.raceStartTime = 0;
        this.currentRaceDuration = Number.MAX_VALUE;

        this.findFirstPlaceCar = function() {
            let bestCar = undefined;
            let bestProgress = -Number.MAX_VALUE;
            this.raceCars.forEach(function(car, id) {
                if (car.progress > bestProgress) {
                    bestCar = car;
                    bestProgress = car.progress;
                }
            });
            return bestCar;
        };

        this.endRace = function() {
            if (this.raceCars.count() === 0) {
                console.log('Race ran between 0 cars');
                return;
            }
            // let winner = this.findFirstPlaceCar();
            // /********** Removed since winner is sometimes null *************/
            // console.log('Race ended. In first place is: ', winner.clientID, ' breaking ', winner.progress, ' gates!');
        };

        this.step = function(timeStep) {
            if (!this.paused) {
                this.world.step(timeStep);
                var wasRunning = this.runningRace;
                this.runningRace = (this.world.time - this.raceStartTime) <= this.currentRaceDuration;
                if (wasRunning && !this.runningRace) { // i.e. Race has ended
                    this.endRace();
                }
                this.paused = !this.runningRace;
            }
        };

        this.checkCheckpoints = function () {
            return this.map.checkCheckpoints(this.world);
        };

        // Adds a new race car to the world
        this.addRaceCarToWorld = function(raceCar) {
            this.raceCars.set(raceCar.clientID, raceCar);
            return raceCar;
        };

        this.addRaceCar = function (clientID, position) {
            let car = new RaceCar.RaceCar(this.raceCars.count()+1, clientID, this.world, position, 0);
            return this.addRaceCarToWorld(car);
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
        };

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
            if (this.mode === SimMode.ClientDrive) {
                console.log('USER', clientID);
                const initPosition = [0, 0];
                this.addRaceCar(clientID, initPosition);
            }
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
                let engineForce = Math.min(Math.max(control["engineForce"], -2), 4);
                clientCar.backWheel.engineForce = engineForce;
                let breaking = (clientCar.backWheel.getSpeed() > 0.1 && engineForce < 0)
                    || (clientCar.backWheel.getSpeed() < -0.1 && engineForce > 0);
                clientCar.backWheel.setBrakeForce(breaking ? 5 : 0);
            }
        };

        // Clears the world and then adds the map again
        this.reset = function() {
            this.AIs.forEach(function(child, id) {
                child.kill();
            });
            this.world.clear();
            this.configureWorld();
            this.AIs = new hashMap.HashMap();
            /************* VERY DODGY - Need to keep pointer ***************/
            this.raceCars = this.raceCars.clear();
            let newRaw = util.arrayCopy(this.rawMap);
            this.setMap(this.rawMap);
            this.rawMap = newRaw;
        };

        // Run a race between random AI
        this.runRandomRace = function (timeLength, numCars) {
            console.log('RUNNING RANDOM RACE')
            var scriptIDList = [0, 1, 2, 3, 4, 5];
            var scriptIDListCopy = util.arrayCopy(scriptIDList); // Dummy List
            var raceScriptIDs = [], randomlySelectedScriptID;
            for (let i = 0; i < numCars; i++) {
                randomlySelectedScriptID = '593fcaeea968db0011d55e16';//Math.floor(Math.random() * scriptIDList.length);
                raceScriptIDs.push(randomlySelectedScriptID);
            }
            this.runRace(timeLength, raceScriptIDs);
        };

        // Runs a race on this Simulation
        //TODO: Give timeout signal to script when race ends
        this.runRace = function (timeLength, scriptIDs) {
            this.reset();
            this.paused = true;
            for (let i = 0; i < scriptIDs.length; i++) {
                let startingPosition = [0, 0];
                let child = AIHost.createCar(io, scriptIDs[i], this.id, startingPosition, AIHost.ChildModes.Racing);
                // this.AIs.set(child.carId, child);
                this.AIs.set(child.carId, child);
                this.raceCars.set(child.carId, child.car);
            }

            // Begin the race
            this.currentRaceDuration = timeLength;
            this.raceStartTime = this.world.time;
            this.runningRace = true;
            this.paused = !this.runningRace;
        };

        // Training Mode
        // TODO: Add check in training mode
        this.childReset = function(child) {
            let car = this.raceCars.get(child.carId);
            if (car === undefined) {
                console.log('ERROR: Cannot reset child car if child.carId not in raceCars.');
                return;
            }
            car.vehicle.chassisBody.position = util.arrayCopy(child.initPosition);
            car.vehicle.chassisBody.angle = 0;
            this.addRaceCarToWorld(car);
        };

        this.train = function(scriptID) {
            this.mode = SimMode.Training;
            let startingPosition = [0.5, 0.5];
            let child = AIHost.createCar(io, scriptID, this.id, startingPosition, AIHost.ChildModes.Training);
        };
    }
}

module.exports.Simulations = Simulations;
module.exports.SimMode = SimMode;
