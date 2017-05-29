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
console.log(renderer)
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
    for(i = 0;i < info.length ;i++){
        //console.log(info[i]);
        carList[i].graphic.position.x = info[i].position[0];
        carList[i].graphic.position.y = info[i].position[1];
        carList[i].graphic.rotation = info[i].angle;
    }
    requestAnimationFrame(function(){
        renderer.render(stage);
    });
};

function initCars(info){
    carList = [];
    this.numCars = info.numCars;
    this.carWidth = info.carWidth;
    this.carHeight = info.carHeight;

    for(i = 0; i < info.numCars; i++){
        carList.push (new RaceCarGraphic (info.carWidth, info.carHeight, container))
    }
    console.log(numCars);
}

// Abstract information required for car drawing
function RaceCarGraphic (width, height, container) {
    this.width = width;
    this.height = height;
    this.graphic = new PIXI.Graphics ();

    this.graphic.beginFill(0xFF0000);
    this.graphic.lineStyle ( 0.01 , 0x000000,  1);
    this.graphic.drawRect(-width/2, -height/2, width, height);
    container.addChild(this.graphic);
}
