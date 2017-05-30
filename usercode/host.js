const child_process = require('child_process');
const Child = require("./child");
const raceBack = require("../environment/raceBack");

function processUserOutput(carId, data) {
    const child = Child.getChildByCarId(carId);
    if (child === null || child === undefined) {
        console.error(`Attempting to read input from child ${carId}`);
        return;
    }
    data = String(data);
    console.log(`Child ${carId} Output: ${data}`);
    let splatInput = data.split(" ");
    let control = {};
    if (splatInput.length === 0) return;
    switch (splatInput[0]) {
        case "set":
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
                    console.log(`Set engineForce of ${carId} to ${newSteerValue}`);
                    break;
                default:
                    console.error(`Cannot set ${splatInput[1]} for Child ${carId}`)
            }
            raceBack.applyMove(control, child.carId);
            break;
        case "get":
            if (splatInput.length < 2) return;
            const car = child.car;
            if (car === undefined && car === null) {
                console.error(`Cannot find car with carId ${child.carId}`);
            }
            switch (splatInput[1]) {
                case "speed":
                    writeToUserInput(carId, car.getSpeed());
                    break;
                default:
                    console.error(`Cannot get ${splatInput[1]} for Child ${carId}`)
            }
            break;
        default:
            console.error(`Cannot decode ${data} from Child ${carId}`);
    }
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
        new Child.Child(1, `Child_${i}`);
        console.log(`Create child ${i}`);
    }
}

module.exports.addAiCar = addAiCar;
module.exports.processUserOutput = processUserOutput;
