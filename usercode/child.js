const child_process = require('child_process');
const tempWrite = require('temp-write');
const Hashmap = require('hashmap');

function getScriptByScriptId(scriptId) {
    // TODO: Query the database for script
    return "import time\n\
import sys\n\
print \"out:1\"\n\
print >> sys.stderr, \"err:1\"\n\
sys.stdout.flush()\n\
time.sleep(1)\n\
print \"out:2\"\n\
print >> sys.stderr, \"err:2\"\n\
sys.stdout.flush()\n\
i = raw_input()\n\
print \"echo\", i\n\
"
}

let children = new Hashmap.HashMap();
let CHILD_ID_COUNT = 0;

class Child {
    constructor(scriptId) {
        this.scriptId = scriptId;
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