/**
 * Created by ruiaohu on 27/05/2017.
 */
var p2 = require('p2');
var graphicsFormat = require('./graphicsFormat');

// Hyperparameters
var numCars = 5;
var carMass = 1;
var carWidth = 0.5;
var carHeight = 1.3;
var raceCars = [];
var fixedTimeStep = 0.1;

// Create the world
var world = new p2.World({
    gravity : [0,0]
});

// Race Car
function RaceCar (id, world, position, width, height, mass) {
    this.id = id;
    this.vehicle = p2RaceCar (id, world, position, width, height, mass);
    this.box_graphic = new graphicsFormat.RaceCarGraphic (position, 0, width, height);

    this.updateGraphics = function () {
        // Update backend's abstract graphics for message
        this.box_graphic.position = this.vehicle.chassisBody.position;
        this.box_graphic.angle = this.vehicle.chassisBody.angle;
    }
};

function packageGraphics () {
    var graphics_dict = [];
    for (i = 0; i < raceCars.length; i++) {
        var raceCar = raceCars[i];
        graphics_dict.push ({
            position: raceCar.box_graphic.position,
            angle: raceCar.box_graphic.angle
        })
    }
    return graphics_dict;
}

// Create the p2 RaceCar
function p2RaceCar(id, world, position, width, height, mass) {
    // Create a dynamic body for the chassis
    chassisBody = new p2.Body({
        mass: mass,
        position: position
    });
    var boxShape = new p2.Box({ width: width, height: height });
    chassisBody.addShape(boxShape);
    world.addBody(chassisBody);

    // Create the vehicle
    vehicle = new p2.TopDownVehicle(chassisBody);

    // Add one front wheel and one back wheel
    frontWheel = vehicle.addWheel({
        localPosition: [0, 0.5] // front
    });
    frontWheel.setSideFriction(4);

    // Back wheel
    backWheel = vehicle.addWheel({
        localPosition: [0, -0.5] // back
    });
    backWheel.setSideFriction(3); // Less side friction on back wheel makes it easier to drift

    backWheel.engineForce = 0.5;
    frontWheel.steerValue = 0.5;

    vehicle.addToWorld(world);
    return vehicle;
};

// Create p2 cars
for (i = 0; i < numCars; i++) {
    position = [i/2, i/2]
    raceCars.push (new RaceCar (i, world, position, carWidth, carHeight, carMass))
};

// Send details of p2 race car to its graphical counterpart
function updateGraphics (raceCars) {
    for (i = 0; i < raceCars.length; i++) {
        raceCars[i].updateGraphics ();
    }
};
// Loop the program
function animate() {
    world.step(fixedTimeStep);

    // Update graphics
    updateGraphics (raceCars);
}

module.exports.animate = animate;
module.exports.packageGraphics = packageGraphics;
module.exports.numCars = numCars;
module.exports.carWidth = carWidth;
module.exports.carHeight = carHeight;
