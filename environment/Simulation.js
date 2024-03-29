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
const mapFS = require('./mapSave');
const db = require('../db');
const maxEngineForce = 3;
const minEngineForce = -2;

class Simulations{
    constructor (maxSims) {
        this.maxSims = maxSims;
        this.simulations = new hashMap.HashMap();

        this.addSimulation = function(simId, map, io, mode) {
            let newSim = new Simulation(simId, map, io, mode, this);
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
            sim.runRace(70,AI);
        };
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

        this.currentSims = function(){
            let sims = [];
            this.simulations.forEach(function(sim, id){
                if (sim.mode == 0){
                    sims.push({
                        id:id,
                        mode: 0,
                        name: 'foo'
                        //TODO add more information;
                    })
                }
            });
            return sims;
        };
    }
}

const SimMode = {
    RankedRacing : 0,
    Training : 1,
    ClientDrive: 2,
    Challenges: 3
};

class Simulation{
    constructor (id, map, io, mode,simulations) {
        this.id = id;
        this.io = io;
        this.mode = mode;//SimMode.ClientDrive;
        this.simulations = simulations;

        this.raceCars = new hashMap.HashMap();
        this.AIs = new hashMap.HashMap();
        this.carScripts = new hashMap.HashMap();

        this.world =  new p2.World();

        this.configureWorld = function() {
            this.world.gravity = [0,0];
            this.world.defaultContactMaterial.friction = 0.001;
            this.world.defaultContactMaterial.restitution = 0.8;
        };
        this.configureWorld();

        this.maxSteer = 2;//Math.PI / 5;

        this.rawMap;

        this.setMap = function(map) {
            this.rawMap = util.arrayCopy(map);
            this.map = new Map.Map(map[0], map[1], map[2]);
            this.map.createMap(this.world, this.raceCars);
        };
        this.setMap(map);

        // Races on this simulation
        this.paused = false;
        this.runningRace = false;
        this.raceStartTime = 0;
        this.currentRaceDuration = Number.MAX_VALUE;

        this.endRace = function() {
            let result;
            if (this.raceCars.count() === 0) {
                console.log('Race ran between 0 cars');
                result = 'Race ran between 0 cars';
                this.io.emit('raceFinish', {
                    id: this.id,
                    winner: result
                });
            }else{
                let raceSorted = this.raceCars.values();
                raceSorted.sort(function(b,a){return a.lastGate - b.lastGate;});
                this.io.emit('raceFinish', {winner: "Race ended."});
                for (let i in raceSorted){
                    if (raceSorted.hasOwnProperty(i)) {
                        result = 'In place '+ (parseInt(i)+1) + ' is: '+ raceSorted[i].scriptName +' of '+raceSorted[i].scriptOwner + ', breaking '+ raceSorted[i].lastGate+ ' gates!';
                        this.io.emit('raceFinish', {
                            id: this.id,
                            winner: result
                        });
                        this.simulations.removeSimulation(this.id);
                    }
                }
                this.AIs.forEach(function(id, child) {
                    child.kill();
                });
            }

            // this.raceCars.forEach(function(car, id) {
            //     console.log('Car: ', id, ' broke: ', car.lastGate, ' gates!');
            // });
        };

        this.step = function(timeStep) {
            if (!this.paused) {
                this.world.step(timeStep);
                let wasRunning = this.runningRace;
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
        this.changeMap = function (map) {
            this.map.removeMap(this.world);
            this.setMap(map);
        };
        this.changeMap(this.rawMap);

        // Prepare graphical representation for front end
        this.packageGraphics = function() {
            let graphics_dict = {};
            let simID = this.id;
            this.raceCars.forEach(function (raceCar, key) {
                graphics_dict[raceCar.clientID] = {
                    position: raceCar.box_graphic.position,
                    angle: raceCar.box_graphic.angle,
                    rayEnds: raceCar.rayEnds,
                    colour: raceCar.colour,
                    clientID: raceCar.clientID,
                    simID: simID
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
            // if (this.mode === SimMode.ClientDrive) {
                console.log('USER', clientID);
                const initPosition = [0.5, 0.5];
                this.addRaceCar(clientID, initPosition);
            // }
        };

        // Updates a car's movement instructions in the simulation and then applies them to the car
        this.updateMovement = function(keys, clientID) {
            let control = {};
            control["steerValue"] = keys[37] - keys[39];
            if (keys[38] && keys[40]) control["engineForce"] = 0;
            else if (keys[38]) control["engineForce"] = maxEngineForce;
            else if (keys[40]) control["engineForce"] = minEngineForce;
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
                let engineForce = Math.min(Math.max(control["engineForce"], minEngineForce), maxEngineForce);
                clientCar.backWheel.engineForce = engineForce;
                let breaking = (clientCar.backWheel.getSpeed() > 0.1 && engineForce < 0)
                    || (clientCar.backWheel.getSpeed() < -0.1 && engineForce > 0);
                clientCar.backWheel.setBrakeForce(breaking ? 5 : 0);
            }
        };

        // Clears the world and then adds the map again
        this.reset = function() {
            this.AIs.forEach(function(id, child) {
                child.kill();
            });
            this.world.clear();
            this.configureWorld();
            this.AIs = new hashMap.HashMap();
            /************* VERY DODGY - Need to keep pointer ***************/
            this.raceCars = this.raceCars.clear();
            this.carScripts = new hashMap.HashMap();
            let newRaw = util.arrayCopy(this.rawMap);
            this.setMap(this.rawMap);
            this.rawMap = newRaw;
        };

        // Runs a race on this Simulation
        //TODO: Give timeout signal to script when race ends
        this.runRace = function (timeLength, scriptIDs) {
            this.reset();
            this.paused = true;
            for (let i = 0; i < scriptIDs.length; i++) {
                let startingPosition = [0, 0];
                let child = AIHost.createCar(io, scriptIDs[i], this.id, startingPosition, AIHost.ChildModes.Racing);
                this.AIs.set(child, scriptIDs[i]);
                this.carScripts.set(child.carId, scriptIDs[i]);
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
            this.reset();
            this.mode = SimMode.Training;
            let startingPosition = [0.5, 0.5];
            let child = AIHost.createCar(io, scriptID, this.id, startingPosition, AIHost.ChildModes.Training);
            this.AIs.set(child, scriptID);
        };

        this.clientPlayAI = function(scriptID, clientID) {
            console.log('New clinet vs ai');
            this.reset();
            this.mode = SimMode.ClientDrive;
            let startingPosition = [0.5, 1.5];
            let child = AIHost.createCar(io, scriptID, this.id, startingPosition, AIHost.ChildModes.Racing);
            this.AIs.set(child, scriptID);
            // this.addClient(clientID);
        };

        // Challenge Mode
        this.challenge1 = function(scriptID) {
            console.log('Challenge 1');
        };
        this.challenge2 = function(scriptID) {
            console.log('Challenge 2');
        };
        this.challenge3 = function(scriptID) {
            console.log('Challenge 3');
        };
        this.challenges = [this.challenge1, this.challenge2, this.challenge3];

        this.runChallenge = function(scriptID, userLevel) {
            this.reset();
            console.log('Running challenge');
            map = mapFS.readMap('./maps/challenges/' + userLevel + '.json');
            this.challenges[userLevel](scriptID);
            let startingPosition = [0.5, 0.5];
            let child = AIHost.createCar(io, scriptID, this.id, startingPosition, AIHost.ChildModes.RankedRacing);
            let mapCopy = util.arrayCopy([map.segments, map.gates, map.startGate]);
            this.changeMap(mapCopy);
            console.log(this.raceCars);
        };

        this.runTutorial = function(code, num) {
            this.reset();
            console.log('Running tutorial');
            map = mapFS.readMap('./maps/tutorial.json');
            let startingPosition = [0.5, 0.5];
            let child = AIHost.createCar(io, "5943b183d4713c5ae6c9f895", this.id, startingPosition, AIHost.ChildModes.Training,code);
            let mapCopy = util.arrayCopy([map.segments, map.gates, map.startGate]);
            this.changeMap(mapCopy);
        }
    }
}

module.exports.Simulations = Simulations;
module.exports.SimMode = SimMode;
