const child_process = require('child_process');
const Child = require("./child");

function processUserOutput(childId, data) {
    console.log(`Child ${childId} Output: ${data}`);
}

function writeToUserInput(childId, message) {
    const child = Child.getChildByChildId(childId);
    if (child === null || child === undefined)
        console.log(`Null child ${childId}`);
    else {
        child.child_in.write(message + "\n");
    }

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