/**
 * Created by ruiaohu on 27/05/2017.
 */

var graphics = new PIXI.Graphics();
var zoom = 40;
var carList = [];
var numCars;

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
        carList[i].carGraphic.position.x = info[i].position[0];
        carList[i].carGraphic.position.y = info[i].position[1];
        carList[i].carGraphic.rotation = info[i].angle;
        carList[i].rayGraphic.currentPath.shape.points = [info[i].position[0], info[i].position[1], info[i].rayEnd[0], info[i].rayEnd[1]];
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
    this.carGraphic = new PIXI.Graphics ();

    this.carGraphic.beginFill(0xfffff, 0.3);
    this.carGraphic.lineStyle ( 0.01 , 0xffffff,  1);
    this.carGraphic.drawRect(-width/2, -height/2, width, height);

    this.rayGraphic = new PIXI.Graphics();
    this.rayGraphic.lineStyle(0.05, 0xfffff, 1);
    this.rayGraphic.moveTo(0,0);
    this.rayGraphic.lineTo(0,0);

    container.addChild(this.carGraphic);
    container.addChild(this.rayGraphic);
}
