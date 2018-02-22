Stage = function() {
  // webgl viewport
  this.container = null;
  this.camera = null;
  this.scene = null;
  this.renderer = null;
  this.stopped = false;

  this.initViewport();
}

Stage.prototype.initViewport = function() {
  var width, height;
  var _this = this;
  this.container = document.getElementById('header');

  if (!Detector.webgl) {
    _this.container.innerHTML = "Welp! Your browser doesn't support WebGL. This element will remain blank.";
    return;
  }

  init();
  animate();

  function init() {
    height = _this.container.offsetHeight;
    width = _this.container.offsetWidth;

    _this.camera = new THREE.PerspectiveCamera(45, width/height, .1, 100000);

    _this.scene = new THREE.Scene();
    _this.scene.background = new THREE.Color(0x333333);

    _this.physics = new Physics();

    var sceneLoader = new SceneLoader(_this.scene, _this.container, _this.camera, _this.physics);
    sceneLoader.load([0]);

    /* RENDER */
    _this.renderer = new THREE.WebGLRenderer({ antialias: true });
    _this.renderer.shadowMap.enabled = true;
    _this.renderer.shadowMap.type = THREE.PCFShadowMap;
    _this.renderer.toneMapping = THREE.ReinhardToneMapping;
    _this.renderer.setPixelRatio(window.devicePixelRatio);
    _this.renderer.setSize(width, height);
    _this.container.appendChild(_this.renderer.domElement);

    addEventListeners();
  }

  function addEventListeners() {
    window.addEventListener('resize', onWindowResize, false);
    _this.container.addEventListener('contextmenu', function(e){e.preventDefault()});
  }

  function onWindowResize() {
    height = _this.container.offsetHeight;
    width = _this.container.offsetWidth;
    _this.camera.aspect = width/height;
    _this.camera.updateProjectionMatrix();

    _this.renderer.setSize(width, height);
  }

  var time = null;
  function animate(stamp) {
    if (_this.stopped) return;
    requestAnimationFrame(animate);
    if (time===null) {
      time = stamp;
    }
    else {
      render(stamp-time);
      time = stamp;
    }
  }
  function render(dt) {
    if (!_this.camera || !_this.scene) return;
    _this.physics.iterate(dt);
    _this.renderer.render(_this.scene, _this.camera);
  }
}

Stage.prototype.stop = function() {
  if (this.stopped) return;
  this.stopped = true;
  this.container.removeChild(this.renderer.domElement);
  this.renderer = null;
  this.camera = null;
  this.scene = null;
}
