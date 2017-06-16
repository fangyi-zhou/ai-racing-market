const child_process = require('child_process');
const Hashmap = require('hashmap');
const raceBack = require('../environment/raceBack');
const host = require('./host');
const EventEmitter = require('events');
const db = require('../db');
const Docker = require('dockerode');
const tempDir = require('tempdir');
const fs = require('fs-extra');
const docker = new Docker({
    host: process.env.DOCKER_HOST || "ec2-34-248-157-198.eu-west-1.compute.amazonaws.com",
    port: process.env.DOCKER_PORT || 2375,
    ca: process.env.CA || fs.readFileSync(__dirname +'/ca.pem'),
    cert: process.env.CERT || fs.readFileSync(__dirname + '/cert.pem'),
    key: process.env.KEY || fs.readFileSync(__dirname + '/key.pem')
});

let children = new Hashmap.HashMap();

class Child extends EventEmitter {
    constructor(scriptId, carId, initPosition, simID) {
        super();
        this.simID = simID;
        this.carId = carId;
        this.initPosition = initPosition;
        this.car = raceBack.getSim(simID).addRaceCar(this.carId, initPosition);
        children.set(this.carId, this);
        // Get script
        db.getScriptById(scriptId, (err, doc) => {
            if (err || doc === null) {
                console.log("Cannot get script");
                this.write = (_) => {};
                this.kill = () => {};
            } else {
                const dockerTag = `user-code-${Date.now()}`;
                this.script = doc.code;
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
