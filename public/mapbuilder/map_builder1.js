// Parameters
var car_width = 0.5;
var car_height = 1;
var zoom = 40;
var wall_colour = 0x00FF00;

// Overall map
map = []

// Create the PIXI renderer
// var renderer = PIXI.autoDetectRenderer(600, 400),
var renderer = PIXI.autoDetectRenderer(1000, 800, null, true, true),
stage = new PIXI.Stage(0xFFFFAA);
renderer.backgroundColor = 0xFFFFFF;
container = new PIXI.DisplayObjectContainer(),
stage.addChild(container);
renderer.render(stage);
document.body.appendChild(renderer.view);

// Add transform to the container
container.position.x =  renderer.width/2; // center at origin
container.position.y =  renderer.height/2;
container.scale.x =  zoom;  // zoom in
container.scale.y = -zoom; // Note: we flip the y axis to make "up" the physics "up"

// Reference Square
var colour = 0xFFFF00
referenceSquare = new PIXI.Graphics();
referenceSquare.beginFill(colour, 0.3);
referenceSquare.lineStyle(0.01, colour, 1);
referenceSquare.drawRect(-5, -5, 10, 10);
container.addChild(referenceSquare);

// Draw grid
var lineColour = 0xBFBFBF;
var w = 100, h = 100;
var cell_size = car_width;
drawGrid(container, w, h, cell_size);

// User input
position = [renderer.width/2, renderer.height/2]
panSpeed = 5;
zoomSpeed = 0.01;

function completePolygon() {
  completeCurrentLine(currentLine, first_point);

  // Reset segment drawing
  first_point = null;

  // Add polygon to list
  let segment = new Segment(currentPath);
  segment.drawSegment(container, wall_colour);
  polygons.push(segment);

  // Reset path
  map.push(currentPath);
  currentPath = []
}

var moving = [false, false, false, false] // Up down left right
var dZoom = 1
document.addEventListener('keydown', function onKeyPress(evt){
  switch (evt.keyCode) {
  case 187: dZoom = (1 + zoomSpeed); // Zoom in
            break;
  case 189: dZoom = (1 - zoomSpeed); // Zoom out
            break;
  case 87:  moving[0] = true; // Up
            break;
  case 83:  moving[1] = true; // Down
            break;
  case 65:  moving[2] = true; // Left
            break;
  case 68:  moving[3] = true; // Right
            break;
  case 13:  if (first_point != null) { // Enter (finish line)
              completePolygon();
            }
            break;
  }
});

document.addEventListener('keyup', function onKeyPress(evt){
switch (evt.keyCode) {
  case 187:
  case 189: dZoom = 1;
            break;
  case 87:  moving[0] = false;
            break;
  case 83:  moving[1] = false;
            break;
  case 65:  moving[2] = false;
            break;
  case 68:  moving[3] = false;
            break;
  }
}, true);

function snap(x, m) {
  // console.log(x, m)
  return Math.round(x / m) * m;
}

function snap_point(point, m) {
  point.x -= container.position.x
  point.y -= container.position.y
  return [snap(point.x, m)/zoom, snap(point.y, m)/zoom]
}

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

function completeCurrentLine(currentLine, point) {
  currentLine.currentPath.shape.points[2] = point[0];
  currentLine.currentPath.shape.points[3] = point[1];
}

// Mouse pointer
mouseHover = new PIXI.Graphics();
mouseHover.beginFill(colour, 0.3);
mouseHover.lineStyle(0.1, 0xFF0000, 1);
ab = [0.5, 0.5]
mouseHover.scale.x = ab[0] /// zoom
mouseHover.scale.y = ab[0] /// zoom
mouseHover.drawCircle(0, 0, ab[0], ab[1]);
container.addChild(mouseHover);

function updateMouseHover(mousePos) {
  gridPoint = snap_point(mousePos, cell_size*zoom)
  mouseHover.position.x = (gridPoint[0]);
  mouseHover.position.y = (gridPoint[1]);
  if (first_point != null) {
  completeCurrentLine(currentLine, gridPoint);
  }
}
renderer.context.canvas.addEventListener('mousemove', function(evt) {
  var mousePos = getMousePos(renderer.context.canvas, evt);
  updateMouseHover(mousePos)
}, false);

// Map drawing
first_point = null;
var polygons = []
var currentPath = []
var currentLine = new PIXI.Graphics();
renderer.context.canvas.addEventListener('mousedown', function(evt) {
  var mousePos = getMousePos(renderer.context.canvas, evt);
  gridPoint = snap_point(mousePos, cell_size*zoom)

  if (first_point == null) {
    first_point = gridPoint;
  } else {
    currentLine.lineTo(gridPoint[0], gridPoint[1]);
  }
  currentPath.push(gridPoint)

  currentLine = new PIXI.Graphics();
  container.addChild(currentLine);
  currentLine.lineStyle(0.01, 0xFF0000, 1);
  currentLine.moveTo(gridPoint[0], gridPoint[1])
}, false);

function updateContainer() {
  container.position.x += (moving[2] - moving[3]) * panSpeed
  container.position.y += (moving[0] - moving[1]) * panSpeed
  zoom *= dZoom;
  container.scale.x =  zoom;
  container.scale.y =  zoom;
}

// Loop the program
function animate() {
  updateContainer();

  // console.log(world.time)
  renderer.render(stage);
  requestAnimationFrame(animate);
}

// Start animation loop
requestAnimationFrame(animate);

// Sends map segment paths to server to be saved
var mapName = 'mapSave'
function sendMapToServer() {
  saveMap(map);
}
