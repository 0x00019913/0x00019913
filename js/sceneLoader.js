/*
  HELPER CLASS - could have been embedded in stage.js, but separated for neatness.
  Usage: load(idx) to load the preset with index idx. A preset is just a function
  that adds stuff to the scene.
*/

SceneLoader = function(scene, container, camera, physics) {
  this.scene = scene;
  this.container = container;
  this.camera = camera;
  this.physics = physics;

  var _this = this;

  this.presets = [
    // sky scene
    function() {
      var sphereGeo = new THREE.SphereGeometry(20000, 32,15);
      var sphereMat = new THREE.ShaderMaterial({
        uniforms: {
          sunPos: { value: new THREE.Vector3(0,6680,-18851) },
          turbidity: { value: 10 },
          mieCoefficient: { value: 1 },
          g: { value: .8 },
          luminance: { value: 1.1 }
        },
        vertexShader: sun_vert,
        fragmentShader: sun_frag,
        side: THREE.BackSide
      });
      var sphere = new THREE.Mesh(sphereGeo, sphereMat);
      _this.scene.add(sphere);

      var player = new Entity("player", {
        camera: _this.camera,
        container: _this.container,
        controlParams: {
          type: "FreeCam",
          r: 10,
          rmax: 10,
          rmin:10,
          phi: Math.PI/2,
          theta: 3*Math.PI/5
        }
      });
      _this.physics.addEntity(player);
    },

    // stairwell
    function() {
      var envGenerator = new EnvGenerator(_this.scene);
      envGenerator.load('/assets/models/stairwell.json');

      _this.scene.fog = new THREE.FogExp2(0x0, 0.0001);
      _this.scene.background = new THREE.Color(0x0);

      var player = new Entity("player", {
        camera: _this.camera,
        container: _this.container,
        controlParams: {
          type: "PlayerCam",
          phi: Math.PI/8,
          theta: 5*Math.PI/7
        }
      });
      _this.physics.addEntity(player);
    }
  ];
}

SceneLoader.prototype.load = function(idx) {
  this.presets[idx]();
}

/* SHADERS */
var sun_vert = " \
uniform vec3 sunPos; \
uniform float turbidity; \
uniform float mieCoefficient; \
\
varying vec3 vWorldPos; \
varying vec3 vSunDir; \
varying float vSunfade; \
varying vec3 vBetaM; \
varying float vSunE; \
\
const vec3 up = vec3(0.0, 1.0, 0.0); \
\
const float e = 2.71828182845904523536028747135266249775724709369995957; \
const float pi = 3.141592653589793238462643383279502884197169; \
\
const float v = 4.0; \
const vec3 K = vec3(0.686, 0.678, 0.666); \
\
const vec3 lambda = vec3(60E-9, 550E-9, 850E-9); \
\
void main() { \
  vec4 worldPos = modelMatrix * vec4(position, 1.0); \
  vWorldPos = worldPos.xyz; \
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); \
  \
  vSunDir = normalize(sunPos); \
  \
  float sunTheta = acos(dot(vSunDir, up)); \
  vSunE = 1000.0 * max(0.0, 1.0 - pow(e, -(sunTheta/49.5))); \
  vSunfade = clamp(exp(sunPos.y / length(sunPos)), -1.0, 1.0); \
  \
  float c = (0.2 * turbidity) * 10E-18; \
  vBetaM = (0.434 * c * pi * pow((2.0 * pi) / lambda, vec3(v-2.0)) * K) * mieCoefficient; \
}";
var sun_frag = " \
\
varying vec3 vWorldPos; \
varying vec3 vSunDir; \
varying float vSunfade; \
varying vec3 vBetaM; \
varying float vSunE; \
\
uniform float luminance; \
uniform float g; \
\
const float pi = 3.141592653589793238462643383279502884197169; \
\
const float mieZenithLength = 1.25e3; \
const vec3 up = vec3(0.0, 1.0, 0.0); \
\
const float A = 0.15; \
const float B = 0.50; \
const float C = 0.10; \
const float D = 0.20; \
const float E = 0.02; \
const float F = 0.30; \
\
void main() { \
  float thetaZ = acos(max(0.0, dot(up, normalize(vWorldPos)))); \
  float sM = mieZenithLength / (cos(thetaZ) + 0.15 * pow(1.63860237 - thetaZ, -1.253)); \
  \
  vec3 Fex = exp(-vBetaM * sM); \
  \
  float cosTheta = dot(normalize(vWorldPos), vSunDir); \
  \
  float mPhase = (1.0 / (4.0*pi)) * (1.0-pow(g, 2.0)) / pow(1.0 - 2.0*g*cosTheta + pow(g, 2.0), 1.5); \
  vec3 betaMTheta = vBetaM * mPhase; \
  \
  vec3 Lin = pow(vSunE * mPhase * (1.0 - Fex),vec3(1.5)); \
  \
  vec3 x = (log2(2.0/pow(luminance,4.0))) * Lin * 0.04; \
  vec3 color = ((x*(A*x+C*B)+D*E)/(x*(A*x+B)+D*F))-E/F; \
  \
  vec3 retColor = pow(color, vec3(1.0/(1.2+(1.2*vSunfade)))); \
  gl_FragColor.rgb = retColor + 0.1; \
  gl_FragColor.a = 1.0; \
}";
