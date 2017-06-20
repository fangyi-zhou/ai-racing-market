const child_process = require('child_process');
const Hashmap = require('hashmap');
const tempWrite = require('temp-write');
const raceBack = require('../environment/raceBack');
const host = require('./host');
const EventEmitter = require('events');
const db = require('../db');
const Docker = require('dockerode');
const tempDir = require('tempdir');
const fs = require('fs-extra');

// const docker = new Docker({
//     host: process.env.DOCKER_HOST || "ec2-34-248-157-198.eu-west-1.compute.amazonaws.com",
//     port: process.env.DOCKER_PORT || 2375,
//     ca: process.env.CA || fs.readFileSync(__dirname +'/ca.pem'),
//     cert: process.env.CERT || fs.readFileSync(__dirname + '/cert.pem'),
//     key: process.env.KEY || fs.readFileSync(__dirname + '/key.pem')
// });

const docker = new Docker({
    host: process.env.DOCKER_HOST,
    port: process.env.DOCKER_PORT,
    ca: process.env.CA,
    cert: process.env.CERT,
    key: process.env.KEY
});


// const docker = new Docker({
//     host: "ec2-34-248-157-198.eu-west-1.compute.amazonaws.com",
//     port: 2375,
//     ca: fs.readFileSync(__dirname +'/ca.pem'),
//     cert: fs.readFileSync(__dirname + '/cert.pem'),
//     key: fs.readFileSync(__dirname + '/key.pem')
// });

let children = new Hashmap.HashMap();

const ChildModes = {
    Racing: 0,
    Training: 1
};

class Child extends EventEmitter {

    constructor(scriptId, carId, initPosition, simID, mode, rawCode) {
        super();
        this.simID = simID;
        this.carId = carId;
        this.initPosition = initPosition;
        this.car = raceBack.getSim(simID).addRaceCar(this.carId, initPosition);
        // TODO: Change this back to: this.mode = mode
        this.mode = ChildModes.Training//mode;
        children.set(this.carId, this);
        // Get script
        db.getScriptById(scriptId, (err, doc) => {
            if (!(this.mode === ChildModes.Training) && (err || doc) === null) {
                console.log("Cannot get script");
                this.write = (_) => {};
                this.kill = () => {};
            } else if (this.mode === ChildModes.Racing) {
                const dockerTag = `user-code-${Date.now()}`;
                this.script = doc.code;
                this.car.scriptOwner = doc.username;
                this.car.scriptName = doc.scriptName;
                const tempDirectory = tempDir.sync();
                fs.copySync(__dirname + '/Dockerfile', tempDirectory + "/Dockerfile");
                fs.writeFileSync(tempDirectory + "/code.py", this.script);
                docker.buildImage(buildImageOptions(tempDirectory), {
                        t: dockerTag
                    },
                    (err, stream) => {
                        if (err) {
                            console.log("%o 123", err);
                            return;
                        }
                        // ignore build output
                        stream.on('data', (data) => {
                        });
                        stream.on('end', () => {
                            execute(this, dockerTag);
                        });
                    }
                );
            } else if (this.mode === ChildModes.Training) {
                if (doc) {
                    this.car.scriptOwner = doc.username;
                    this.car.scriptName = doc.scriptName;
                }
                if (rawCode == "") {
                    this.script = doc.code;
                } else {
                    this.script = rawCode;
                }
                const filePath = tempWrite.sync(this.script);
                const process = child_process.spawn("python", [filePath], {
                    stdio: ['pipe', 'pipe', 'pipe']
                });
                this.writable = true;
                this.write = function (data) {
                    if (this.writable) process.stdin.write(data + "\n");
                };
                // this.car = raceBack.getSim(simID).addRaceCar(this.carId, initPosition);
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
                this.kill = () => {
                    process.kill("SIGKILL");
                    this.emit("exit");
                }
            }
        });
    }
}

function removeChild(carId) {
    children.remove(carId);
}

function getChildByCarId(carId) {
    return children.get(carId);
}

const containerOptions = (dockerTag) => {
    return {
        Image: dockerTag,
        Cmd: ['python', 'src/code.py'],
        AttachStdin: true,
        AttachStdout: true,
        AttachStderr: true,
        OpenStdin: true,
        StdinOnce: false,
    }
};

const attachOptions = {
    stream: true,
    stdin: true,
    stdout: true,
    stderr: true
};

const buildImageOptions = (tempDirectory) => {
    const path = require('path');
    return {
        context: tempDirectory,
        src: ['Dockerfile', 'code.py'],
    }
};

function execute(child, dockerTag) {
    docker.createContainer(containerOptions(dockerTag), function (err, container) {
        container.attach(attachOptions, function (err, stream) {
            child.kill = () => {
                container.kill(function (err, data) {
                    console.log("killed");
                    if (err) {
                        console.log("%o", err);
                    }
                });
                child.emit("exit");
            };
            stream.on('data', (data) => {
                handle(child, data);
            });
            child.write = (data) => {
                stream.write(data + "\n")
            };
            if (err) {
                console.log("%o", err);
                return;
            }
            container.start(function (err, data) {
                console.log("started");
                if (err) {
                    console.log("%o", err);
                    return;
                }
                container.wait(function (err, data) {
                    child.emit("exit");
                })
            });
        })
    })
}

function handle(child, buffer) {
    let idx = 0;
    while (idx < buffer.length) {
        // From https://docs.docker.com/engine/api/v1.29/#operation/ContainerAttach
        // header := [8]byte{STREAM_TYPE, 0, 0, 0, SIZE1, SIZE2, SIZE3, SIZE4}
        // SIZE1, SIZE2, SIZE3, SIZE4 are the four bytes of the uint32 size encoded as big endian.
        const header = buffer.slice(idx, idx + 8);
        idx += 8;
        const size = header.readUInt32BE(4);
        const payload = buffer.slice(idx, idx + size).toString();
        handlePayload(child, header[0], payload);
        idx += size;
    }
}

function handlePayload(child, stream_type, payload) {
    switch (stream_type) {
        case 1:
            // 1 -> stdout
            //console.log(`stdout ${payload}`);
            host.processUserOutput(child, payload);
            break;
        case 2:
            // 2 -> stderr
            //console.log(`stderr ${payload}`);
            break;
    }
}
module.exports.Child = Child;
module.exports.removeChild = removeChild;
module.exports.getChildByCarId = getChildByCarId;
module.exports.ChildModes = ChildModes;
