/**
 * Created by ruiaohu on 27/05/2017.
 */

var graphics = new PIXI.Graphics();
var zoom = 40;

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
