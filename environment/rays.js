/**
 * Created by ruiaohu on 29/05/2017.
 */
const p2 = require('p2');
const result = new p2.RaycastResult();
const hitPoint = p2.vec2.create();
const rayLength = 5;


function constructRays(car, numRays, world){
    //Update ray for Car
    let angleBase = -Math.PI / 2;
    for(let i = 0; i < numRays; i++){
        let ray = car.rays[i];
        const carPosition = car.getPosition();
        const carAngle = car.getAngle();
        p2.vec2.copy(ray.from, carPosition);
        const end = findRayEnd(carPosition, carAngle, angleBase + i * Math.PI / (numRays - 1));
        p2.vec2.copy(ray.to, end);
        ray.update();
        result.reset();

        //find collision, if any
        world.raycast(result, ray);
        result.getHitPoint(hitPoint, ray);
        car.rayEnds[i] = end;
        if (result.hasHit()) {
            p2.vec2.copy(car.rayEnds[i], hitPoint);
        }
    }

}

function findRayEnd(start, ori, angle){
    let localAngle = -(ori - angle);
    let end = [];
    end.push(start[0]+Math.sin(localAngle)*rayLength);
    end.push(start[1]+Math.cos(localAngle)*rayLength);
    return end;
}

module.exports.constructRays = constructRays;