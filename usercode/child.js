const child_process = require('child_process');
const tempWrite = require('temp-write');
const Hashmap = require('hashmap');

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
let CHILD_ID_COUNT = 0;

class Child {
    constructor(scriptId, carId) {
        this.scriptId = scriptId;
        this.carId = carId;
        // Get script
        this.script = getScriptByScriptId(scriptId);
        this.childId = CHILD_ID_COUNT++;
        children.set(this.childId, this);
        const filePath = tempWrite.sync(this.script);
        console.log(filePath);
        const process = child_process.spawn("python", [filePath], {
            stdio: ['pipe', 'pipe', 'pipe']
        });
        this.child_in = process.stdin;
        this.child_out = process.stdout;
        process.on("exit", () => {
            console.log(`child ${this.childId} exited`);
            children.remove(this.childId);
        });
    }
}

function getChildByChildId(childId) {
    return children.get(childId);
}

module.exports.Child = Child;
module.exports.getChildByChildId = getChildByChildId;