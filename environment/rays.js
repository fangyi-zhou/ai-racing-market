/**
 * Created by ruiaohu on 29/05/2017.
 */
var p2 = require('p2');
var result = new p2.RaycastResult();
var hitPoint = p2.vec2.create();
var rayLength = 5;


function drawRay(car, world){
    //Update ray for Car
    //**** hardcoded number 5 *****//
    var angleBase = -Math.PI/2;
    for(let i = 0; i < 5;i++){
        var ray = car.rays[i];
        p2.vec2.copy(ray.from, car.vehicle.chassisBody.position);
        let end = findRayEnd(car.vehicle.chassisBody.position,car.vehicle.chassisBody.angle,angleBase+i*Math.PI/4);
        p2.vec2.copy(ray.to, end);
        ray.update();
        result.reset();

        //find collision, if any
        world.raycast(result, ray);
        result.getHitPoint(hitPoint, ray);
        car.rayEnds[i] = end;
        if(result.hasHit()){
            p2.vec2.copy(car.rayEnds[i], hitPoint);
        }
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