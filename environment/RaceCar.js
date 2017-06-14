const p2 = require('p2');
const graphicsFormat = require('./GraphicsFormat');
//fix numRays
const numRays = 10;
// Hyperparameters
const carMass = 1;
const carWidth = 0.5;
const carHeight = 1;

function randomColour() {
  return Math.random() * 0xffffff;
}

// Race Car
class RaceCar {
    constructor(collision_id, clientID, world, position, angle) {
        const carComponents = p2RaceCar(collision_id, clientID, world, position, angle, carWidth, carHeight, carMass);
        this.collisionID = collision_id;
        this.vehicle = carComponents[0];
        this.frontWheel = carComponents[1];
        this.backWheel = carComponents[2];
        this.clientID = clientID;
        this.frontWheel.steerValue = 0;
        this.backWheel.engineForce = 0;
        this.carWidth = carWidth;
        this.carHeight = carHeight;
        this.carMass = carMass;
        this.colour = randomColour();

        this.lastGate = 0; //current gate
        this.totalReward = 0; //total reward

        this.rays = [];
        for (let i = 0; i < numRays; i++) {
            this.rays.push(new p2.Ray({
                mode: p2.Ray.CLOSEST,
                collisionMask: Math.pow(2, collision_id) ^ -1
            }));
        }

        this.rayEnds = [];
        this.rayDists = [];

        this.box_graphic = new graphicsFormat.RaceCarGraphic(position, 0, carWidth, carHeight);

        this.updateGraphics = function () {
            // Update backend's abstract graphics for message
            this.box_graphic.position = this.vehicle.chassisBody.position;
            this.box_graphic.angle = this.vehicle.chassisBody.angle;
        };

        this.getSpeed = () => {
            return this.backWheel.getSpeed();
        };

        this.getPosition = () => {
            return this.vehicle.chassisBody.position;
        };

        this.getAngle = () => {
            return this.vehicle.chassisBody.angle;
        };
    }
}

// Create the p2 RaceCar
function p2RaceCar(collision_id,clientID, world, position, angle, width, height, mass) {
    // Create a dynamic body for the chassis
    let chassisBody = new p2.Body({
        mass: mass,
        position: position,
        id: clientID
    });
    let boxShape = new p2.Box({
        width: width,
        height: height,
        collisionGroup: Math.pow(2, collision_id),
        collisionMask: -1
    });
    chassisBody.addShape(boxShape);
    chassisBody.angle = angle;
    world.addBody(chassisBody);

    // Create the vehicle
    let vehicle = new p2.TopDownVehicle(chassisBody);

    // Add one front wheel and one back wheel
    let frontWheel = vehicle.addWheel({
        localPosition: [0, 0.5] // front
    });
    frontWheel.setSideFriction(4);

    // Back wheel
    let backWheel = vehicle.addWheel({
        localPosition: [0, -0.5] // back
    });
    backWheel.setSideFriction(3); // Less side friction on back wheel makes it easier to drift

    backWheel.engineForce = 0;
    frontWheel.steerValue = 0;

    vehicle.addToWorld(world);
    return [vehicle, frontWheel, backWheel];
}

module.exports.RaceCar = RaceCar;
module.exports.numRays = numRays;
module.exports.carWidth = carWidth;
module.exports.carHeight = carHeight;
