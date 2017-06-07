;(function(root) {
    // Parameters
    const car_width = 0.5;
    const car_height = 1;
    var zoom = 40;
    const wall_colour = 0x00FF00;

    // Smoother user control
    const moving = [false, false, false, false]; // Up down left right
    var dZoom = 1;

    // Modes of operation
    const Mode = {
        MapDraw : 0,
        GateDraw : 1,
        StartLineDraw : 2
    };
    var canvas;
    var renderer;
    var stage;
    var container;
    var lineColour;
    var w, h;
    var cell_size;
    var map;
    var colour;
    var position;
    var panSpeed;
    var zoomSpeed;
    var mouseHover;
    var first_point;
    var currentPath;
    var currentLine;
    var currentMode = Mode.MapDraw;

    function initDraw() {
        // Overall map
        map = new _Map();

        // Create the PIXI renderer
        canvas = document.getElementById('PIXIcanvas');
        renderer = new PIXI.autoDetectRenderer(canvas.width, canvas.height, {view: canvas}, true, true);
        stage = new PIXI.Stage(0xFFFFAA);
        // Make the canvas focussable
        renderer.view.tabIndex = 0;
        renderer.backgroundColor = 0xFFFFFF;
        container = new PIXI.DisplayObjectContainer();
        stage.addChild(container);
        renderer.render(stage);
        renderer.view.focus();

        // Add transform to the container
        container.position.x = renderer.width / 2; // center at origin
        container.position.y = renderer.height / 2;
        container.scale.x = zoom;  // zoom in
        container.scale.y = -zoom; // Note: we flip the y axis to make "up" the physics "up"

        // Reference Square
        colour = 0xFFFF00;
        let referenceSquare = new PIXI.Graphics();
        referenceSquare.beginFill(colour, 0.3);
        referenceSquare.lineStyle(0.01, colour, 1);
        referenceSquare.drawRect(-5, -5, 10, 10);
        container.addChild(referenceSquare);

        // Gate drawing
        addGateLine(container);

        // Draw grid
        lineColour = 0xBFBFBF;
        w = 100, h = 100;
        cell_size = car_width;
        drawGrid(container, w, h, cell_size, lineColour);

        // User control variables
        position = [renderer.width/2, renderer.height/2]
        panSpeed = 5;
        zoomSpeed = 0.01;

        // Mouse pointer
        mouseHover = new PIXI.Graphics();
        mouseHover.beginFill(colour, 0.3);
        mouseHover.lineStyle(0.1, 0xFF0000, 1);
        const ab = [0.5, 0.5];
        mouseHover.scale.x = ab[0];
        mouseHover.scale.y = ab[0];
        mouseHover.drawCircle(0, 0, ab[0], ab[1]);
        container.addChild(mouseHover);

        // _Map drawing
        first_point = null;
        currentPath = [];
        currentLine = new PIXI.Graphics();

        // Start animation loop
        requestAnimationFrame(animate);

        changeMode(Mode.MapDraw); // Default mode

        /*
         User Control
         */
        renderer.view.addEventListener('keydown', function onKeyPress(evt){
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
        renderer.view.addEventListener('keyup', function onKeyPress(evt){
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

        renderer.view.addEventListener('mousemove', function(evt) {
            let mousePos = getMousePos(renderer.view, evt);
            let gridPoint = snap_point(mousePos, cell_size*zoom);
            let actualPoint = scalePoint(vectorfy(mousePos), 1/zoom);

            switch (currentMode) {
                case Mode.MapDraw:  updateMapHover(gridPoint);
                    break;
                case Mode.StartLineDraw:
                case Mode.GateDraw: updateGateHover(actualPoint, map.getAllPolygonsPIXI());
                    break;
            }
        }, false);

        renderer.view.addEventListener('mousedown', function(evt) {
            let mousePos = getMousePos(renderer.view, evt);
            let actualPoint = scalePoint(vectorfy(mousePos), 1/zoom);
            if (map.contains(actualPoint)) {
                return;
            }
            switch (currentMode) {
                case Mode.MapDraw:        drawNewVertex(mousePos);
                    break;
                case Mode.GateDraw:       // Add new gate (currentGate) to map
                    var newGate = new Gate(gateStart, gateEnd, gateColour);
                    newGate.drawGate(container, gateThickness);
                    map.addGate(newGate);
                    break;
                case Mode.StartLineDraw:  // Add start line (currentGate) to map
                    var newGate = new Gate(gateStart, gateEnd, startGateColour);
                    newGate.drawGate(container, gateThickness);
                    map.setStartGate(newGate);
                    break;
            }

        }, false);
    }

    function gateMode() {
        return currentMode == Mode.GateDraw || currentMode == Mode.StartLineDraw;
    }

    function changeMode(mode) {
        let currentMode = mode;
        currentGate.visible = gateMode();
        mouseHover.visible = (currentMode == Mode.MapDraw);
    }

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

    // Snapping mouse position to drawing grid
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
      let rect = canvas.getBoundingClientRect();
      return {
        x: evt.clientX - rect.left - container.position.x,
        y: -(evt.clientY - rect.top - container.position.y)
      };
    }

    function completeCurrentLine(currentLine, point) {
      setEndLine(currentLine, point)
    }

    function updateMapHover(gridPoint) {
      mouseHover.position.x = (gridPoint[0]);
      mouseHover.position.y = (gridPoint[1]);
      if (first_point != null) {
        completeCurrentLine(currentLine, gridPoint);
      }
    }

    function drawNewVertex(mousePos) {
      let gridPoint = snap_point(mousePos, cell_size*zoom)

      if (first_point == null) {
        first_point = gridPoint;
      } else {
        currentLine.lineTo(gridPoint[0], gridPoint[1]);
      }
      currentPath.push(gridPoint);

      currentLine = new PIXI.Graphics();
      container.addChild(currentLine);
      currentLine.lineStyle(0.01, 0xFF0000, 1);
      currentLine.moveTo(gridPoint[0], gridPoint[1]);
    }



    // User control updates
    function updateContainer() {
      container.position.x += (moving[2] - moving[3]) * panSpeed
      container.position.y += (moving[0] - moving[1]) * panSpeed
      zoom *= dZoom;
      container.scale.x =  zoom;
      container.scale.y =  -zoom;
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

    // Sends map segment paths to server to be saved
    var mapName = 'mapSave';
    function sendMapToServer() {
      if (map.complete()) {
          console.log(map.createJSON());
        saveMap(map.createJSON());
      } else {
        alert("Your race track needs a start gate.");
      }
    }



    var mapBuilder = {
        'initDraw':initDraw
    };

    root.mapBuilder = mapBuilder;

}(this));
