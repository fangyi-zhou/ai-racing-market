const p2 = require('p2');
const graphicsFormat = require('./GraphicsFormat');
//fix numRays
const numRays = 10;

// Race Car
class RaceCar {
    constructor(id, clientID, world, position, width, height, mass) {
        const carComponents = p2RaceCar(id, world, position, width, height, mass);
        this.id = id;
        this.vehicle = carComponents[0];
        this.frontWheel = carComponents[1];
        this.backWheel = carComponents[2];
        this.clientID = clientID;

        this.rays = [];
        for (let i = 0; i < numRays; i++) {
            this.rays.push(new p2.Ray({
                mode: p2.Ray.CLOSEST,
                collisionMask: Math.pow(2, id) ^ -1
            }));
        }

        this.rayEnds = [null, null, null, null, null];

        this.box_graphic = new graphicsFormat.RaceCarGraphic(position, 0, width, height);

        this.updateGraphics = function () {
            // Update backend's abstract graphics for message
            this.box_graphic.position = this.vehicle.chassisBody.position;
            this.box_graphic.angle = this.vehicle.chassisBody.angle;
        };

        this.getSpeed = () => {
            return this.backWheel.getSpeed();
        }
    }
}

// Create the p2 RaceCar
function p2RaceCar(id, world, position, width, height, mass) {
    // Create a dynamic body for the chassis
    let chassisBody = new p2.Body({
        mass: mass,
        position: position,
    });
    let boxShape = new p2.Box({
        width: width,
        height: height,
        collisionGroup: Math.pow(2, id),
        collisionMask: -1
    });
    chassisBody.addShape(boxShape);
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
    backWheel.setSideFriction(2.5); // Less side friction on back wheel makes it easier to drift

    backWheel.engineForce = 0;
    frontWheel.steerValue = 0;

    vehicle.addToWorld(world);
    return [vehicle, frontWheel, backWheel];
}

module.exports.RaceCar = RaceCar;
module.exports.numRays = numRays;
