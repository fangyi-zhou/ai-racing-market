function Segment(path) {
  this.path = path;
  this.pixiPath = flatten_map(this.path);
  this.segment_graphic = new PIXI.Graphics();
  this.PIXIpolygon = new PIXI.Polygon(this.pixiPath)

  this.contains = function(point) {
    return this.PIXIpolygon.contains(point[0], point[1]);
  }

  // Draw this segment of the map onto the container
  this.drawSegment = function(container, wall_colour) {
    this.segment_graphic.beginFill(wall_colour, 0.15);
    this.segment_graphic.lineStyle(0.01, wall_colour, 1);
    this.segment_graphic.drawPolygon(this.pixiPath);
    container.addChild(this.segment_graphic);
  }
}

function Gate(start, end) {
  this.startPoint = start;
  this.endPoint = end;

  this.gateGraphic = new PIXI.Graphics();

  this.drawGate = function(container, gateColour) {
    this.gateGraphic.lineStyle(0.07, gateColour, 0.8);
    this.gateGraphic.moveTo(this.startPoint[0], this.startPoint[1]);
    this.gateGraphic.lineTo(this.endPoint[0], this.endPoint[1]);
    container.addChild(this.gateGraphic);
  }
}

function Map(segments=[], gates=[], startGate=null) {
  this.segments = segments;
  this.gates = gates;
  this.startGate = startGate;

  this.addSegment = function(segment) {
    this.segments.push(segment);
  }

  this.addGate = function(gate) {
    this.gates.push(gate);
  }

  this.setStartGate = function(startGate) {
    this.startGate = startGate;
  }

  // Return all polygons in PIXI format
  this.getAllPolygonsPIXI = function() {
    return this.getAllPolygons().map(flatten_map);
  }

  this.getAllPolygons = function() {
    polygons = []
    for (var i = 0; i < this.segments.length; i++) {
      polygons.push(this.segments[i].path);
    }
    return polygons;
  }

  this.contains = function(point) {
    for (var i in this.segments) {
      if (this.segments[i].contains(point)) {
        return true;
      }
    }
    return false;
  }

  this.getSegments = function() {
    return this.segments;
  }

  this.getGates = function() {
    gates = [];
    for (var i in this.gates) {
      gates.push([this.gates[i].startPoint, this.gates[i].endPoint])
    }
    return gates;
  }

  this.getStartGate = function() {
    return [this.startGate.startPoint, this.startGate.endPoint];
  }

  this.createJSON = function() {
    return {
      segments: this.getAllPolygons(),
      gates: this.getGates(),
      startGate: this.getStartGate()
    }
  }
}
