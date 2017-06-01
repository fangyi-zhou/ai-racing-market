/**
 * Created by ruiaohu on 27/05/2017.
 */

var graphics = new PIXI.Graphics();
var zoom = 40;
var carList = [];
var numCars;
var carWidth;
var carHeight;
var numRays;
var wall_colour = 0xCDFF00;
var clientCarID = null;

// Create the PIXI renderer
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

function drawMap(map) {
    for (let i in map) {
        let segment = map[i];
        let pixi_map = flatten_map(segment);

        let segment_graphic = new PIXI.Graphics();
        segment_graphic.beginFill(wall_colour, 0.15);
        segment_graphic.lineStyle(0.01, wall_colour, 1);
        segment_graphic.drawPolygon(pixi_map);
        container.addChild(segment_graphic);
    }
}

function updateAllGraphics(info) {
    for (let i = 0; i < info.length; i++) {

        if (carList[i] != null) {
            carList[i].carGraphic.position.x = info[i].position[0];
            carList[i].carGraphic.position.y = info[i].position[1];
            carList[i].carGraphic.rotation = info[i].angle;

            if (clientCarID == info[i].clientID) {
              container.position.x = -carList[i].carGraphic.position.x * zoom + renderer.width/2; // center at origin
              container.position.y = carList[i].carGraphic.position.y * zoom + renderer.height/2;
            }

            for (let j = 0; j < numRays; j++) {
                var rayEnd = info[i].rayEnds[j];
                carList[i].rayGraphics[j].currentPath.shape.points = [info[i].position[0], info[i].position[1], rayEnd[0], rayEnd[1]];
            }
        }
    }
    requestAnimationFrame(function () {
        renderer.render(stage);
    });
}

function randomColour() {
  return Math.random() * 0xffffff;
}

function initWorld(info) {
    carList = [];
    numCars = info.numCars;
    carWidth = info.carWidth;
    carHeight = info.carHeight;
    numRays = info.numRays;
    for (let i = 0; i < info.numCars; i++) {
        carList.push(new RaceCarGraphic(carWidth, carHeight, numRays, container, randomColour()));
    }
    this.map = info.map;
    clientCarID = info.id;
    drawMap(map);
}

// Abstract information required for car drawing
function RaceCarGraphic(width, height, numRays, container, colour) {
    console.log(container);
    this.width = width;
    this.height = height;
    this.carGraphic = new PIXI.Graphics();

    this.carGraphic.beginFill(colour, 0.3);
    this.carGraphic.lineStyle(0.01, colour, 1);
    this.carGraphic.drawRect(-width / 2, -height / 2, width, height);

    this.rayGraphics = [];
    for (let i = 0; i < numRays; i++) {
        let rayGraphic = new PIXI.Graphics();
        rayGraphic.lineStyle(0.01, 0xfffff, 1);
        rayGraphic.moveTo(0, 0);
        rayGraphic.lineTo(0, 0);
        container.addChild(rayGraphic);
        this.rayGraphics.push(rayGraphic);
    }
    container.addChild(this.carGraphic);
}

function removeUser() {
    let car = carList.pop();
    for (let ray_id in car.rayGraphics) {
        container.removeChild(car.rayGraphics[ray_id]);
    }
    container.removeChild(car.carGraphic);
}

function addUser(id) {
    carList.push(new RaceCarGraphic(carWidth, carHeight, numRays, container, randomColour()))
}
