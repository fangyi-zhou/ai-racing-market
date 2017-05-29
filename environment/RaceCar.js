// Abstract information required for car drawing
function RaceCarGraphic (position, width, height, container) {
  this.position = position
  this.width = width
  this.height = height
  this.graphic = new PIXI.Graphics ();

  this.graphic.beginFill(0xFF0000);
  this.graphic.lineStyle ( 0.01 , 0x000000,  1)
  this.graphic.drawRect(-width/2, -height/2, width, height);
  container.addChild(this.graphic);
}

// Race Car
function RaceCar (id, world, position, width, height, mass, container) {
  this.id = id;
  this.vehicle = p2RaceCar (id, world, position, width, height, mass);
  this.box_graphic = new RaceCarGraphic (position, width, height, container);

  this.updateGraphics = function () {
    this.box_graphic.position = this.vehicle.chassisBody.position

    // Here send the position to the front end
    this.box_graphic.graphic.position.x = this.box_graphic.position[0];
    this.box_graphic.graphic.position.y = this.box_graphic.position[1];
    this.box_graphic.graphic.rotation = this.vehicle.chassisBody.angle;
  }
}

// Create the p2 RaceCar
function p2RaceCar(id, world, position, width, height, mass) {
  // Create a dynamic body for the chassis
  chassisBody = new p2.Body({
      mass: mass,
      position: position
  });
  var boxShape = new p2.Box({ width: width, height: height });
  chassisBody.addShape(boxShape);
  world.addBody(chassisBody);

  // Create the vehicle
  vehicle = new p2.TopDownVehicle(chassisBody);

  // Add one front wheel and one back wheel
  frontWheel = vehicle.addWheel({
      localPosition: [0, 0.5] // front
  });
  frontWheel.setSideFriction(4);

  // Back wheel
  backWheel = vehicle.addWheel({
      localPosition: [0, -0.5] // back
  });
  backWheel.setSideFriction(3); // Less side friction on back wheel makes it easier to drift

  backWheel.engineForce = 0.5;
  frontWheel.steerValue = 0.5;

  vehicle.addToWorld(world);
  return vehicle;
}
