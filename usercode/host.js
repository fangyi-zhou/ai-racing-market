const child_process = require('child_process');
const Child = require("./child");
const raceBack = require("../environment/raceBack");

function processGetCommand(carId, car, splatInput) {
    if (car === undefined || car === null) {
        console.error(`Cannot find car with carId ${child.carId}`);
    }
    switch (splatInput[1]) {
        case "speed":
            writeToUserInput(carId, car.getSpeed());
            break;
        case "rays":
            const rayDists = car.rayDists;
            rayDists.forEach((value, idx) => {
                writeToUserInput(carId, `${idx} ${value}`);
            });
            break;
        default:
            console.error(`Cannot get ${splatInput[1]} for Child ${carId}`)
    }
}

function processSetCommand(child, splatInput) {
    let control = {};
    const carId = child.carId;
    if (splatInput.length < 3) return;
    switch (splatInput[1]) {
        case "engineForce":
            const newEngineForce = parseFloat(splatInput[2]);
            control["engineForce"] = newEngineForce;
            console.log(`Set engineForce of ${carId} to ${newEngineForce}`);
            break;
        case "steerValue":
            const newSteerValue = parseFloat(splatInput[2]);
            control["steerValue"] = newSteerValue;
            console.log(`Set steerValue of ${carId} to ${newSteerValue}`);
            break;
        default:
            console.error(`Cannot set ${splatInput[1]} for Child ${carId}`)
    }
    raceBack.applyMove(control, child.carId);
}

function processSingleCommand(child, data) {
    const carId = child.carId;
    console.log(`Child ${carId} Output: ${data}`);
    let splatInput = data.split(/\s+/);
    if (splatInput.length < 2) return;
    switch (splatInput[0]) {
        case "set":
            processSetCommand(child, splatInput);
            break;
        case "get":
            const car = child.car;
            processGetCommand(carId, car, splatInput);
            break;
        default:
            console.error(`Cannot decode ${data} from Child ${carId}`);
    }
}

function processUserOutput(carId, data) {
    const child = Child.getChildByCarId(carId);
    if (child === null || child === undefined) {
        console.error(`Attempting to read input from child ${carId}`);
        return;
    }
    const lines = String(data).split(/\r?\n/);
    lines.forEach((line) => {
        processSingleCommand(child, line);
    })
}

function writeToUserInput(carId, message) {
    const child = Child.getChildByCarId(carId);
    if (child === null || child === undefined) {
        console.error(`Attempting to write to null child ${carId}`);
        return;
    }
    child.child_in.write(message + "\n");
}

function addAiCar(numAi) {
    for (let i = 0; i < numAi; i++) {
        new Child.Child(1, `Child_${i}`, [1, 1]);
        console.log(`Create child ${i}`);
    }
}

module.exports.addAiCar = addAiCar;
module.exports.processUserOutput = processUserOutput;
