const child_process = require('child_process');
const tempWrite = require('temp-write');
const Hashmap = require('hashmap');
const raceBack = require('../environment/raceBack');
const host = require('./host');
const EventEmitter = require('events');

function getScriptByScriptId(scriptId) {
    // TODO: Query the database for script
    return "import time\n\
import sys\n\
time.sleep(10)\n\
print \"set engineForce 1.0\"\n\
print \"get speed\"\n\
print \"get rays\"\n\
sys.stdout.flush()\n\
time.sleep(1)\n\
print \"set engineForce -0.5\"\n\
sys.stdout.flush()\n\
time.sleep(10)\n\
"
}

let children = new Hashmap.HashMap();

class Child extends EventEmitter {
    constructor(scriptId, carId, initPosition, simID) {
        super();
        this.scriptId = scriptId;
        this.simID = simID;
        this.carId = carId;
        // Get script
        this.script = getScriptByScriptId(scriptId);
        children.set(this.carId, this);
        const filePath = tempWrite.sync(this.script);
        const process = child_process.spawn("python", [filePath], {
            stdio: ['pipe', 'pipe', 'pipe']
        });
        this.writable = true;
        this.write = function (data) {
            if (this.writable) process.stdin.write(data + "\n");
        };
        let car = raceBack.getSim(simID).addRaceCar(this.carId, initPosition);
        process.on("exit", () => {
            console.log(`child ${this.carId} exited`);
            this.emit("exit");
        });
        process.stdout.on("data", (data) => {
            host.processUserOutput(this, data);
        });
        process.stdout.on("error", (err) => {
            console.error(err);
            this.emit("exit");
        });
        process.stderr.on("data", (data) => {
            console.log(`Child ${this.carId} printed error ${data}`);
        });
        process.stdin.on("close", () => {
            this.writable = false;
        });
        process.stdin.on("error", (err) => {
            this.writable = false;
            console.error(err);
            this.emit("exit");
        });
        this.car = car;
        this.kill = () => {
            process.kill("SIGKILL");
            this.emit("exit");
        }
    }
}

function removeChild(carId) {
    children.remove(carId);
}

function getChildByCarId(carId) {
    return children.get(carId);
}

module.exports.Child = Child;
module.exports.removeChild = removeChild;
module.exports.getChildByCarId = getChildByCarId;
