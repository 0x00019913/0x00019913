EnvGenerator = function(scene) {
  this.scene = scene;
}

EnvGenerator.prototype.generate = function(response) {
  if (response===null) {
    console.log("failed to load environment config");
    return;
  }

  var env = JSON.parse(response);

  var materials = {};
  var texLoader = new THREE.TextureLoader();
  for (var m in env.materials) {
    var mat = env.materials[m];

    var material;
    // add more materials later; now just standard material and the default,
    // which is also standard
    if (mat.type=="standard") material = new THREE.MeshStandardMaterial();
    else material = new THREE.MeshStandardMaterial();

    if (mat.type=="standard") {
      if ("color" in mat) material.color = new THREE.Color(mat.color);
      if ("roughness" in mat) material.roughness = mat.roughness;
      if ("metalness" in mat) material.metalness = mat.metalness;
      if ("bumpMap" in mat) material.bumpMap = texLoader.load(mat.bumpMap);
      if ("bumpScale" in mat) material.bumpScale = mat.bumpScale;
      if ("map" in mat) material.map = texLoader.load(mat.map);
    }

    materials[m] = material;
  }

  var objects = {};

  this.addObject(env.config.object, objects, 0, env);

  this.placeGeometry(objects, materials);
}

// add an object (without repetition) to the objects array, along with an array
// of offsets at which it will be placed
EnvGenerator.prototype.addObject = function(objName, objects, offset, env) {
  if (objName==="") return;
  var obj = env.objects[objName];
  if (!obj) return;
  var type = obj.type;
  if (!type) return;

  if (type=="mesh" || type=="pointlight") {
    if (!(objName in objects)) {
      objects[objName] = {
        offsets: [],
        object: obj
      };
    }
    objects[objName].offsets.push(offset);
  }
  else if (type=="array") {
    if (!("initOffset" in obj)) obj.initOffset = 0;
    offset += obj.initOffset;
    // one object to arrange in an array
    if (obj.object.length==1) {
      for (var i=0; i<obj.count; i++) {
        this.addObject(obj.object[0], objects, offset, env);
        offset += obj.offset;
      }
    }

    // a set of objects, with probabilities, to arrange in an array
    else if (obj.object.length>1) {
      var cumulative = [];
      var totalProb = 0;
      for (var i=0; i<obj.object.length; i++) {
        totalProb += obj.object[i][1];
        cumulative.push(totalProb);
      }
      // normalize the probabilities just in case
      cumulative = cumulative.map(function(x) { return x/=totalProb; });

      // add the objects, picking a random one at each iteration
      for (var i=0; i<obj.count; i++) {
        var rand = Math.random(), idx = 0;
        // if the random [0,1) value is less than a given point in the normalized
        // cumulative distribution, we have the right index
        for (var j=0; j<obj.object.length; j++) {
          if (rand<=cumulative[j]) { idx = j; break; }
        }
        this.addObject(obj.object[idx][0], objects, offset, env);
        offset += obj.offset;
      }
    }
  }
  else if (type=="composite") {
    for (var i=0; i<obj.children.length; i++) {
      this.addObject(obj.children[i], objects, offset, env);
    }
  }
}

EnvGenerator.prototype.placeGeometry = function(objects, materials) {
  var loader = new THREE.OBJLoader();
  var _this = this;

  for (var oName in objects) {
    var data = objects[oName];
    if (data.object.type=="mesh") {
      loader.load(data.object.source, addObjects.bind(null, data));
    }
    else if (data.object.type=="pointlight") {
      var offsets = data.offsets;
      var obj = data.object;
      var pointLight = new THREE.PointLight(obj.color, obj.intensity, obj.distance, obj.decay);
      pointLight.position.fromArray(obj.position);
      for (var i=0; i<offsets.length; i++) {
        var light = pointLight.clone();
        light.position.y += offsets[i];
        this.scene.add(light);
      }
    }
  }

  function addObjects(data, r) {
    var material = materials[data.object.material];
    var offsets = data.offsets;

    r.traverse(function(child) {
      if (child instanceof THREE.Mesh) child.material = material;
    });

    for (var i=0; i<offsets.length; i++) {
      var mesh = r.clone();
      mesh.position.y += offsets[i];
      _this.scene.add(mesh);
    }
  }
}

EnvGenerator.prototype.load = function(filename) {
  var _this = this;
  var xhr = new XMLHttpRequest();
  xhr.open('GET', filename, true);
  xhr.onload = function() {
    var status = xhr.status;
    _this.generate(status==200 ? xhr.response : null);
  }
  xhr.send();
}
