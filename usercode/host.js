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

const processes = [];
for (let i = 0; i < 5; i++) {
    let process = new Child.Child(1);
    process.child_out.on("data", (data) => {
        processUserOutput(process.childId, data);
    });
    processes.push(process);
    console.log(`Create child ${i}`);
}

processes.forEach((child, _) => {
    writeToUserInput(child.childId, `I am child ${child.childId}`);
});