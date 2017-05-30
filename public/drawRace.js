/**
 * Created by ruiaohu on 27/05/2017.
 */

var graphics = new PIXI.Graphics();
var zoom = 40;
var carList = [];
var numCars;
var carWidth;
var carHeight;

// Create the PIXI renderer
// var renderer = PIXI.autoDetectRenderer(600, 400),
var renderer = PIXI.autoDetectRenderer(1000, 800, null, true);
var stage = new PIXI.Stage(0xFFFFAA);
var container = new PIXI.DisplayObjectContainer();
stage.addChild(container);
document.body.appendChild(renderer.view);

// Add transform to the container
container.position.x = renderer.width / 2; // center at origin
container.position.y = renderer.height / 2;
container.scale.x = zoom;  // zoom in
container.scale.y = -zoom; // Note: we flip the y axis to make "up" the physics "up"
renderer.render(stage);

function updateAllGraphics(info) {
    for (let i = 0; i < info.length; i++) {
        //console.log(info);
        if(carList[i]!=null){
            carList[i].carGraphic.position.x = info[i].position[0];
            carList[i].carGraphic.position.y = info[i].position[1];
            carList[i].carGraphic.rotation = info[i].angle;
            for (let j = 0;j<5;j++) {
                var rayEnd = info[i].rayEnds[j];
                carList[i].rayGraphics[j].currentPath.shape.points = [info[i].position[0], info[i].position[1], rayEnd[0], rayEnd[1]];
            }
        }
    }
    requestAnimationFrame(function () {
        renderer.render(stage);
    });
}
function initCars(info) {
    carList = [];
    numCars = info.numCars;
    carWidth = info.carWidth;
    carHeight = info.carHeight;
    console.log(numCars);
    for (let i = 0; i < info.numCars; i++) {
        carList.push(new RaceCarGraphic(info.carWidth, info.carHeight, container));
    }
}

// Abstract information required for car drawing
function RaceCarGraphic(width, height, container) {

    this.width = width;
    this.height = height;
    this.carGraphic = new PIXI.Graphics();

    this.carGraphic.beginFill(0xfffff, 0.3);
    this.carGraphic.lineStyle(0.01, 0xffffff, 1);
    this.carGraphic.drawRect(-width / 2, -height / 2, width, height);

    this.rayGraphics = [];
    for (let i = 0; i < 5; i++) {
        let rayGraphic = new PIXI.Graphics();
        rayGraphic.lineStyle(0.01, 0xfffff, 1);
        rayGraphic.moveTo(0, 0);
        rayGraphic.lineTo(0, 0);
        container.addChild(rayGraphic);
        this.rayGraphics.push(rayGraphic);
    }
    container.addChild(this.carGraphic);
}

function removeUser(){
    let car = carList.pop();
    for(let ray_id in car.rayGraphics){
        container.removeChild(car.rayGraphics[ray_id]);
    }
    container.removeChild(car.carGraphic);
}

function addUser(){
    carList.push(new RaceCarGraphic(carWidth, carHeight, container))
}