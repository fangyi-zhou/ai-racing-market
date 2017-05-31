const proxyquire = require('proxyquire');
const assert = require('assert');
const stream = require('stream');
describe("Host", function() {
    describe("processUserOutput", function() {
        let host;
        let output;
        let pipe = {
            write: function (data) {
                output = data;
            }
        };
        before(function () {
            let childStub = {};
            let raceBackStub = {};
            let mockCar = {
                getSpeed: () => { return 0.5 }
            };
            let mockChild = {
                car: mockCar,
                child_in: pipe
            };
            childStub.getChildByCarId = (_) => {
                return mockChild;
            };
            raceBackStub.applyMove = (control, _) => {
                output = control;
            };
            host = proxyquire('../usercode/host', {
                './child' : childStub,
                '../environment/raceBack': raceBackStub
            });
        });
        it("Should get the speed of the car", function() {
            host.processUserOutput(0, "get speed");
            assert.equal(output, "0.5\n", "speed");
        });
        it("Should steer the car", function() {
            host.processUserOutput(0, "set steerValue 0.1");
            assert.equal(output.steerValue, 0.1, "steerValue");
        });
        it("Should set engine force of the car", function() {
            host.processUserOutput(0, "set engineForce 0.1");
            assert.equal(output.engineForce, 0.1, "engineForce");
        });
    })
});