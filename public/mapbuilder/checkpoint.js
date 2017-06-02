var currentRotation = 0;
var initialDirection = [1, 0]
var currentDirection = initialDirection;
var centre = [0, 0]
var length = 100;
var rotationSpeed = 0.01, currentRotationSpeed = 0;

var currentGate = new PIXI.Graphics();
var gateColour = 0x0000FF;


function add(vec1, vec2) {
  return [vec1[0] + vec2[0], vec1[1] + vec2[1]]
}

function mul(vec, m) {
  return [vec[0] * m, vec[1] * m];
}

function norm(vec) {
  magnitude = Math.sqrt((vec[0])**2 + (vec[1])**2);
  return mul(vec, 1 / magnitude);
}

function updateRotation(a) {
  p = initialDirection;
  currentDirection = [Math.cos(a) * p[0] + Math.sin(a) * p[1],
                      Math.cos(a) * p[1] - Math.sin(a) * p[0]]
}

function endPoint(centre, currentDirection, length) {
  return add(centre, mul(currentDirection, length));
}

function updateGateHover(mousePoint) {
  centre = mousePoint;
  var newEndPoint = endPoint(centre, currentDirection, length/2);
  var newStartPoint = endPoint(centre, currentDirection, -length/2)

  setStartLine(currentGate, newStartPoint);
  setEndLine(currentGate, newEndPoint);
}

currentGate.lineStyle(0.1, gateColour, 1);
currentGate.moveTo(centre[0], centre[1]);
var initialEndPoint = endPoint(centre, currentDirection, length);
currentGate.lineTo(initialEndPoint[0], initialEndPoint[1])

function addGateLine(container) {
  container.addChild(currentGate);
}

// Start gate rotation
document.addEventListener('keydown', function onKeyPress(evt){
  switch (evt.keyCode) {
    case 188: currentRotationSpeed = rotationSpeed
              break;
    case 190: currentRotationSpeed = -rotationSpeed
              break;
  }
});

// Stop gate rotation
document.addEventListener('keyup', function onKeyPress(evt){
  switch (evt.keyCode) {
    case 188:
    case 190: currentRotationSpeed = 0;
              break;
  }
});

// Update rotation each draw step
function updateGateRotation() {
  currentRotation += currentRotationSpeed;
  updateRotation(currentRotation);
  updateGateHover(centre);
}
