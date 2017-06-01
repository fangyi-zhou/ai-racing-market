function Segment(path) {
  this.path = path;
  this.pixiPath = flatten_map(this.path);
  this.segment_graphic = new PIXI.Graphics();
  this.PIXIpolygon = new PIXI.Polygon(this.pixiPath)

  this.contains = function(point) {
    return this.PIXIpolygon.contains(point);
  }

  // Draw this segment of the map onto the container
  this.drawSegment = function(container, wall_colour) {
    this.segment_graphic.beginFill(wall_colour, 0.15);
    this.segment_graphic.lineStyle(0.01, wall_colour, 1);
    this.segment_graphic.drawPolygon(this.pixiPath);
    container.addChild(this.segment_graphic);
  }
}
