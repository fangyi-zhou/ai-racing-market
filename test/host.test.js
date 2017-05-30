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
            host = proxyquire('../usercode/host', {
                './child' : childStub,
                '../environment/raceBack': raceBackStub
            });
        });
        it("Should get the speed of the car", function() {
            host.processUserOutput(0, "get speed");
            assert.equal(output, "0.5\n", "speed");
        })
    })
});
