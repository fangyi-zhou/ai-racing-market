// Parameters
var car_width = 0.5;
var car_height = 1;
var zoom = 40;
var wall_colour = 0x00FF00;

// Overall map
map = new Map();

// Create the PIXI renderer
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

// Gate drawing
addGateLine(container);

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
  map.addSegment(segment);

  // Reset path
  currentPath = []
}

var moving = [false, false, false, false] // Up down left right
var dZoom = 1
document.addEventListener('keydown', function onKeyPress(evt){
  // console.log(evt.keyCode)
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
    case 13:  if (currentMode == Mode.MapDraw) {
      if (first_point != null) { // Enter (finish line)
        completePolygon();
      }
    }
      break;
  }
});

// 187: Zoom in, 189: Zoom out, 87: Up, 83: Down, 65: Left, 68: Right
document.addEventListener('keyup', function onKeyPress(evt){
  switch(evt.keyCode) {
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
  return Math.round(x / m) * m;
}

function snap_point(point, m) {
  return scalePoint([snap(point.x, m), snap(point.y, m)], 1/zoom)
}

function scalePoint(point, scale) {
  return mul(point, scale);
}

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left - container.position.x,
    y: evt.clientY - rect.top - container.position.y
  };
}

function completeCurrentLine(currentLine, point) {
  setEndLine(currentLine, point)
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

function updateMapHover(gridPoint) {
  mouseHover.position.x = (gridPoint[0]);
  mouseHover.position.y = (gridPoint[1]);
  if (first_point != null) {
    completeCurrentLine(currentLine, gridPoint);
  }
}

renderer.context.canvas.addEventListener('mousemove', function(evt) {
  var mousePos = getMousePos(renderer.context.canvas, evt);
  gridPoint = snap_point(mousePos, cell_size*zoom);
  actualPoint = scalePoint(vectorfy(mousePos), 1/zoom);

  switch (currentMode) {
    case Mode.MapDraw:  updateMapHover(gridPoint);
      break;
    case Mode.StartLineDraw:
    case Mode.GateDraw: updateGateHover(actualPoint, map.getAllPolygonsPIXI());
      break;
  }
}, false);

// Map drawing
first_point = null;
var currentPath = []
var currentLine = new PIXI.Graphics();

function drawNewVertex(mousePos) {
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
  currentLine.moveTo(gridPoint[0], gridPoint[1]);
}

renderer.context.canvas.addEventListener('mousedown', function(evt) {
  var mousePos = getMousePos(renderer.context.canvas, evt);
  var actualPoint = scalePoint(vectorfy(mousePos), 1/zoom);
  if (map.contains(actualPoint)) {
    return;
  }
  switch (currentMode) {
    case Mode.MapDraw:        drawNewVertex(mousePos);
                              break;
    case Mode.GateDraw:       // Add new gate (currentGate) to map
                              var newGate = new Gate(gateStart, gateEnd);
                              newGate.drawGate(container, gateColour);
                              map.addGate(new Gate(gateStart, gateEnd));
                              break;
    case Mode.StartLineDraw:  // Add start line (currentGate) to map
                              var newGate = new Gate(gateStart, gateEnd);
                              newGate.drawGate(container, startGateColour);
                              map.setStartGate(new Gate(gateStart, gateEnd));
                              break;
  }

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
  if (gateMode()) {
    updateGateRotation(map.getAllPolygonsPIXI());
  }

  renderer.render(stage);
  requestAnimationFrame(animate);
}

// Start animation loop
requestAnimationFrame(animate);

// Sends map segment paths to server to be saved
var mapName = 'mapSave';
function sendMapToServer() {
  if (map.complete()) {
    saveMap(map.createJSON());
  } else {
    alert("Your race track needs a start gate.");
  }
}

// Modes of operation
Mode = {
  MapDraw : 0,
  GateDraw : 1,
  StartLineDraw : 2
}

function gateMode() {
  return currentMode == Mode.GateDraw || currentMode == Mode.StartLineDraw;
}

function changeMode(mode) {
  currentMode = mode;
  currentGate.visible = gateMode();
  mouseHover.visible = currentMode == Mode.MapDraw;
}
changeMode(Mode.MapDraw); // Default mode
