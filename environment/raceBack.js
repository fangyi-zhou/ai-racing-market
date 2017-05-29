/**
 * Created by ruiaohu on 27/05/2017.
 */
var p2 = require('p2');
var hashMap = require('hashmap');
var graphicsFormat = require('./graphicsFormat');
var rays = require('./rays');

// Hyperparameters
var numCars = 5;
var carMass = 1;
var carWidth = 0.5;
var carHeight = 1;
var fixedTimeStep = 0.06;
var raceCars = new hashMap();
var maxSteer = Math.PI / 5;
// Create the world
var world = new p2.World({
    gravity : [0,0]
});

// For now, set default friction between ALL objects
// In future may wish to have it vary between objects
world.defaultContactMaterial.friction = 0.001

// Race Car
function RaceCar (world, position, width, height, mass) {
    var carComponets= p2RaceCar (world, position, width, height, mass);
    this.vehicle = carComponets[0];
    this.frontWheel = carComponets[1];
    this.backWheel = carComponets[2];
    this.rayClosest = new p2.Ray({
        mode: p2.Ray.CLOSEST
    });
    this.rayEnd;
    this.box_graphic = new graphicsFormat.RaceCarGraphic (position, 0, width, height);

    this.updateGraphics = function () {
        // Update backend's abstract graphics for message
        this.box_graphic.position = this.vehicle.chassisBody.position;
        this.box_graphic.angle = this.vehicle.chassisBody.angle;
    }
};

function packageGraphics () {
    var graphics_dict = [];
    raceCars.forEach(function (raceCar, key) {
        graphics_dict.push ({
            position: raceCar.box_graphic.position,
            angle: raceCar.box_graphic.angle,
            rayEnd: raceCar.rayEnd
        })
    })
    return graphics_dict;
}

// Create the p2 RaceCar
function p2RaceCar(world, position, width, height, mass) {
    // Create a dynamic body for the chassis
    chassisBody = new p2.Body({
        mass: mass,
        position: position
    });
    var boxShape = new p2.Box({ width: width, height: height });
    chassisBody.addShape(boxShape);
    world.addBody(chassisBody);

    // Create the vehicle
    var vehicle = new p2.TopDownVehicle(chassisBody);

    // Add one front wheel and one back wheel
    var frontWheel = vehicle.addWheel({
        localPosition: [0, 0.5] // front
    });
    frontWheel.setSideFriction(4);

    // Back wheel
    var backWheel = vehicle.addWheel({
        localPosition: [0, -0.5] // back
    });
    backWheel.setSideFriction(2.5); // Less side friction on back wheel makes it easier to drift

    backWheel.engineForce = 0.5;
    frontWheel.steerValue = 0.5;

    vehicle.addToWorld(world);
    return [vehicle,frontWheel,backWheel];
};

// Create p2 cars
for (i = 0; i < numCars; i++) {
    position = [i/2, i/2];
    raceCars.set (i, new RaceCar (world, position, carWidth, carHeight, carMass));
};

function addClient(id){
    var client = new RaceCar(world, [5,5], carWidth, carHeight, carMass);
    client.backWheel.engineForce = 0;
    client.frontWheel.steerValue = 0;
    raceCars.set(id, client);
}

// Send details of p2 race car to its graphical counterpart
function updateGraphics () {
    raceCars.forEach(function (value, key) {
        //update information of each racer.
        value.updateGraphics();
        rays.drawRay(value,world);
    });
};

function updateMovement(keys, id){
    var clientCar = raceCars.get(id);
    if (clientCar != null){
        // Steer value zero means straight forward. Positive is left and negative right.
        clientCar.frontWheel.steerValue = maxSteer * (keys[37] - keys[39]);
        // Engine force forward
        clientCar.backWheel.engineForce = keys[38];
        clientCar.backWheel.setBrakeForce(0);
        if(keys[40]){
            if(clientCar.backWheel.getSpeed() > 0.1){
                // Moving forward - add some brake force to slow down
                clientCar.backWheel.setBrakeForce(5);
            } else {
                // Moving backwards - reverse the engine force
                clientCar.backWheel.setBrakeForce(0);
                clientCar.backWheel.engineForce = -0.5;
            }
        }
    }
}

function removeUser(id){
    raceCars.remove(id);
}

function carCount(){
    var num = raceCars.count();
    return num;
}

// Loop the program
setInterval(function(){
    world.step(fixedTimeStep);

    // Update graphics
    updateGraphics ();
}, 1000/30);

module.exports.packageGraphics = packageGraphics;
module.exports.allCarNumber = carCount;
module.exports.carWidth = carWidth;
module.exports.carHeight = carHeight;
module.exports.addClient = addClient;
module.exports.updateMovement = updateMovement;
module.exports.removeUser= removeUser;
