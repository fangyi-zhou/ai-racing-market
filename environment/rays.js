/**
 * Created by ruiaohu on 29/05/2017.
 */
var p2 = require('p2');
var result = new p2.RaycastResult();
var hitPoint = p2.vec2.create();
var rayLength = 5;


function drawRay(car, world){
    //Update ray for Car
    p2.vec2.copy(car.rayClosest.from, car.vehicle.chassisBody.position);
    let end = findRayEnd(car.vehicle.chassisBody.position,car.vehicle.chassisBody.angle,0 );
    p2.vec2.copy(car.rayClosest.to, end);
    car.rayClosest.update();
    //drawRay(start, end);
    result.reset();
    world.raycast(result, car.rayClosest);

    //find collision, if any.
    result.getHitPoint(hitPoint, car.rayClosest);
    car.rayEnd = end;
}

function findRayEnd(start, ori, angle){
    let localAngle = -(ori - angle);
    var end = [];
    end.push(start[0]+Math.sin(localAngle)*rayLength);
    end.push(start[1]+Math.cos(localAngle)*rayLength);
    return end;
}

module.exports.drawRay = drawRay;