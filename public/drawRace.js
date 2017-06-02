/**
 * Created by ruiaohu on 27/05/2017.
 */

var graphics = new PIXI.Graphics();
var zoom = 40;
var cars = {};
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
        let segment = new Segment(map[i]);
        segment.drawSegment(container, wall_colour);
    }
}

function updateAllGraphics(info) {
    for (var id in info) {
        if (!info.hasOwnProperty(id)) continue;
        var car = info[id];
        if (cars[id] === undefined) {
            cars[id] = new RaceCarGraphic(carWidth, carHeight, numRays, container, car.colour);
        }
        cars[id].carGraphic.position.x = car.position[0];
        cars[id].carGraphic.position.y = car.position[1];
        cars[id].carGraphic.rotation = car.angle;

        if (clientCarID === car.clientID) {
          container.position.x = -cars[id].carGraphic.position.x * zoom + renderer.width/2; // center at origin
          container.position.y = cars[id].carGraphic.position.y * zoom + renderer.height/2;
        }

        for (let j = 0; j < car.rayEnds.length; j++) {
          var rayEnd = car.rayEnds[j];
          cars[id].rayGraphics[j].currentPath.shape.points = [car.position[0], car.position[1], rayEnd[0], rayEnd[1]];
        }
    }
    requestAnimationFrame(function () {
        renderer.render(stage);
    });
}


function initWorld(info) {
    numCars = info.numCars;
    carWidth = info.carWidth;
    carHeight = info.carHeight;
    numRays = info.numRays;
    this.map = info.map;
    clientCarID = info.id;
    updateAllGraphics(info.cars);
    drawMap(map);
}

// Abstract information required for car drawing
function RaceCarGraphic(width, height, numRays, container, colour) {
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

function removeUser(id) {
    let car = cars[id];
    if (car === undefined) return;
    for (let ray_id in car.rayGraphics) {
        container.removeChild(car.rayGraphics[ray_id]);
    }
    container.removeChild(car.carGraphic);
    cars[id] = undefined;
}

function addUser(id) {
    if (cars[id] === undefined)
      cars[id] = new RaceCarGraphic(carWidth, carHeight, numRays, container, car.colour);
}
