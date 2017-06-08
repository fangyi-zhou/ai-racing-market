const child_process = require('child_process');
const Child = require("./child");
const raceBack = require("../environment/raceBack");

function processGetCommand(child, splatInput) {
    const car = child.car;
    if (car === undefined || car === null) {
        console.error(`Cannot find car with carId ${child.carId}`);
    }
    switch (splatInput[1]) {
        case "speed":
            child.write(car.getSpeed());
            break;
        case "rays":
            const rayDists = car.rayDists;
            rayDists.forEach((value, idx) => {
                child.write(`${idx} ${value}`);
            });
            break;
        default:
            console.error(`Cannot get ${splatInput[1]} for Child ${child.carId}`)
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
            break;
        case "steerValue":
            const newSteerValue = parseFloat(splatInput[2]);
            control["steerValue"] = newSteerValue;
            break;
        default:
            console.error(`Cannot set ${splatInput[1]} for Child ${carId}`)
    }
    raceBack.getSim(child.simID).applyMove(control, child.carId);
}

function processSingleCommand(child, data) {
    const carId = child.carId;
    let splatInput = data.split(/\s+/);
    if (splatInput.length < 2) return;
    switch (splatInput[0]) {
        case "set":
            processSetCommand(child, splatInput);
            break;
        case "get":
            processGetCommand(child, splatInput);
            break;
        default:
            console.error(`Cannot decode ${data} from Child ${carId}`);
    }
}

function processUserOutput(child, data) {
    const lines = String(data).split(/\r?\n/);
    lines.forEach((line) => {
        processSingleCommand(child, line);
    })
}

function childExit(child, io) {
    return function () {
        raceBack.getSim(child.simID).removeUser(child.carId);
        io.local.emit("dc", {
            id: child.carId
        });
        Child.removeChild(child.carId);
    }
}

function addAiCar(numAi, io, simID) {
    for (let i = 0; i < numAi; i++) {
        const carId = `Child_${Date.now()}`;
        const child = new Child.Child(1, carId, [1, 1], simID);
        child.on("exit", childExit(child, io));
        console.log(`Spawn child ${carId}`);
    }
}

module.exports.addAiCar = addAiCar;
module.exports.processUserOutput = processUserOutput;
