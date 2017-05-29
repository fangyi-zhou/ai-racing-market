/**
 * Created by ruiaohu on 29/05/2017.
 */
var p2 = require('p2');
var result = new p2.RaycastResult();
var hitPoint = p2.vec2.create();
var rayLength = 5;


function drawRay(car, world){
    //Update ray for Car
    p2.vec2.copy(car.ray.from, car.vehicle.chassisBody.position);
    let end = findRayEnd(car.vehicle.chassisBody.position,car.vehicle.chassisBody.angle,0 );
    p2.vec2.copy(car.ray.to, end);
    car.ray.update();
    result.reset();

    //find collision, if any
    world.raycast(result, car.ray);
    result.getHitPoint(hitPoint, car.ray);
    car.rayEnd = end;
    if(result.hasHit()){
        p2.vec2.copy(car.rayEnd, hitPoint);
    }
}

function findRayEnd(start, ori, angle){
    let localAngle = -(ori - angle);
    var end = [];
    end.push(start[0]+Math.sin(localAngle)*rayLength);
    end.push(start[1]+Math.cos(localAngle)*rayLength);
    return end;
}

module.exports.drawRay = drawRay;