const child_process = require('child_process');
const tempWrite = require('temp-write');
const Hashmap = require('hashmap');
const raceBack = require('../environment/raceBack');
const host = require('./host');
const index = require('../index');

function getScriptByScriptId(scriptId) {
    // TODO: Query the database for script
    return "import time\n\
import sys\n\
time.sleep(10)\n\
print \"set engineForce 1.0\"\n\
sys.stdout.flush()\n\
time.sleep(1)\n\
print \"set engineForce -0.5\"\n\
sys.stdout.flush()\n\
time.sleep(10)\n\
"
}

let children = new Hashmap.HashMap();

class Child {
    constructor(scriptId, carId, initPosition) {
        this.scriptId = scriptId;
        this.carId = carId;
        // Get script
        this.script = getScriptByScriptId(scriptId);
        children.set(this.carId, this);
        const filePath = tempWrite.sync(this.script);
        console.log(filePath);
        const process = child_process.spawn("python", [filePath], {
            stdio: ['pipe', 'pipe', 'pipe']
        });
        this.child_in = process.stdin;
        this.child_out = process.stdout;
        let car = raceBack.addRaceCar(this.carId, initPosition);
        process.on("exit", () => {
            console.log(`child ${this.carId} exited`);
            children.remove(this.carId);
            raceBack.removeUser(this.carId);
            index.aiDisconnect(this.carId);
        });
        process.stdout.on("data", (data) => {
            host.processUserOutput(this.carId, data);
        });
        this.car = car;
    }
}

function getChildByCarId(carId) {
    return children.get(carId);
}

module.exports.Child = Child;
module.exports.getChildByCarId = getChildByCarId;