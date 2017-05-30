const child_process = require('child_process');
const Child = require("./child");
const raceBack = require("../environment/raceBack");

function processUserOutput(childId, data) {
    const child = Child.getChildByChildId(childId);
    if (child === null || child === undefined) {
        console.error(`Attempting to read input from child ${childId}`);
        return;
    }
    data = String(data);
    console.log(`Child ${childId} Output: ${data}`);
    let splatInput = data.split(" ");
    let control = {};
    switch (splatInput[0]) {
        case "set":
            switch (splatInput[1]) {
                case "engineForce":
                    const newEngineForce = parseFloat(splatInput[2]);
                    control["engineForce"] = newEngineForce;
                    console.log(`Set engineForce of ${childId} to ${newEngineForce}`);
                    break;
                case "steerValue":
                    const newSteerValue = parseFloat(splatInput[2]);
                    control["steerValue"] = newSteerValue;
                    console.log(`Set engineForce of ${childId} to ${newSteerValue}`);
                    break;
            }
            raceBack.applyMove(control, child.carId);
            break;
        default:
            console.error(`Cannot decode ${data} from Child ${childId}`);
    }
}

function writeToUserInput(childId, message) {
    const child = Child.getChildByChildId(childId);
    if (child === null || child === undefined) {
        console.error(`Attempting to write to null child ${childId}`);
        return;
    }
    child.child_in.write(message + "\n");
}

function addAiCar(numAi) {
    for (let i = 0; i < numAi; i++) {
        raceBack.addClient(`Child_${i}`);
        let process = new Child.Child(1, `Child_${i}`);
        process.child_out.on("data", (data) => {
            processUserOutput(process.childId, data);
        });
        console.log(`Create child ${i}`);
    }
}

module.exports.addAiCar = addAiCar;