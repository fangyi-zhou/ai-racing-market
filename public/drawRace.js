/**
 * Created by ruiaohu on 27/05/2017.
 */

var graphics = new PIXI.Graphics();
var zoom = 40;
var carList = [];

// Create the PIXI renderer
// var renderer = PIXI.autoDetectRenderer(600, 400),
var renderer = PIXI.autoDetectRenderer(1000, 800, null, false, true);
var stage = new PIXI.Stage(0xFFFFAA);
var container = new PIXI.DisplayObjectContainer();
stage.addChild(container);
document.body.appendChild(renderer.view);

// Add transform to the container
container.position.x =  renderer.width/2; // center at origin
container.position.y =  renderer.height/2;
container.scale.x =  zoom;  // zoom in
container.scale.y = -zoom; // Note: we flip the y axis to make "up" the physics "up"
renderer.render(stage);

function updateAllGraphics(info){
    console.log(info);
    for(var cars in info){
        console.log(cars);
    }
    requestAnimationFrame(function(){
        renderer.render(stage);
    });
};

function initCars(info){
    //this.numCar = info.numCar;
    for(i = 0; i < info.numCars; i++){
        carList.push (new RaceCarGraphic (info.carWidth, info.carHeight, container))
    }
    console.log(carList);
}

// Abstract information required for car drawing
function RaceCarGraphic (width, height, container) {
    this.position = [0,0];
    this.width = width;
    this.height = height;
    this.graphic = new PIXI.Graphics ();

    this.graphic.beginFill(0xFF0000);
    this.graphic.lineStyle ( 0.01 , 0x000000,  1);
    this.graphic.drawRect(-width/2, -height/2, width, height);
    container.addChild(this.graphic);
}