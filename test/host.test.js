const proxyquire = require('proxyquire');
const assert = require('assert');
const stream = require('stream');
describe("Host", function() {
    describe("processUserOutput", function() {
        let host;
        let output;
        let write = function (data) {
            output.push(data);
        };
        let mockCar = {
            getSpeed: () => { return 0.5 }
        };
        let mockChild = {
            car: mockCar,
            write: write
        };
        before(function () {
            let childStub = {};
            let raceBackStub = {};
            childStub.getChildByCarId = (_) => {
                return mockChild;
            };
            raceBackStub.applyMove = (control, _, __) => {
                output.push(control);
            };
            host = proxyquire('../usercode/host', {
                './child' : childStub,
                '../environment/raceBack': raceBackStub
            });
        });
        beforeEach(function () {
            output = []
        });
        it("Should get the speed of the car", function() {
            host.processUserOutput(mockChild, "get speed");
            assert.equal(output[0], "0.5\n", "speed");
        });
        it("Should steer the car", function() {
            host.processUserOutput(mockChild, "set steerValue 0.1");
            assert.equal(output[0].steerValue, 0.1, "steerValue");
        });
        it("Should set engine force of the car", function() {
            host.processUserOutput(mockChild, "set engineForce 0.1");
            assert.equal(output[0].engineForce, 0.1, "engineForce");
        });
        it("Should be able to process a series of commands separated by \\n", function() {
            host.processUserOutput(mockChild, "get speed\nget speed\n");
            assert.equal(output[0], "0.5\n", "speed 1");
            assert.equal(output[1], "0.5\n", "speed 2");
        })
    })
});
