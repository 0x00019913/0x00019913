/*
  Physics - contains references to all physics entities and updates the world,
  including controls and positions.

  CURRENTLY A STUB; ONLY UPDATES CONTROLS AS IT NORMALLY WOULD.
  ADD ACTUAL PHYSICS INTERACTINOS LATER.
*/

Physics = function() {
  this.entities = [];
}

Physics.prototype.addEntity = function(entity) {
  this.entities.push(entity);
}

Physics.prototype.iterate = function(dt) {
  for (var i=0; i<this.entities.length; i++) {
    var entity = this.entities[i];
    if (entity.type=="player") {
      entity.controls.update();
    }
  }
}

Physics.prototype.moveForward = function() {
  console.log("forward");
}
Physics.prototype.moveBack = function() {
  console.log("back");
}
Physics.prototype.moveLeft = function() {
  console.log("left");
}
Physics.prototype.moveRight = function() {
  console.log("right");
}


/*
  Entities - individual objects involved in physical calculations.
*/

Entity = function(type, params) {
  this.type = type;
  if (this.type=="player") {
    this.mass = 10;
    this.g = new THREE.Vector3(0, -0.98, 0); // m/s^2
    this.terminalVelocity = 60; // m/s

    this.position = new THREE.Vector3(); // m
    this.v = new THREE.Vector3();
    this.a = this.g.clone().divideScalar(this.mass);

    if ("camera" in params && "container" in params) {
      this.controls = new Controls(
        params.camera,
        params.container,
        params.controlParams
      );
    }
    else {
      this.type = null;
      return;
    }
  }

  this.position = new THREE.Vector3();
  this.v = new THREE.Vector3();
  this.a = new THREE.Vector3();
}
