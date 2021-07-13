this.AssetViewer = (function() {
  function AssetViewer(manager) {
    this.manager = manager;
  }

  AssetViewer.prototype.init = function() {
    var createFace;
    if (this.initialized || (window.THREE == null)) {
      return;
    }
    this.initialized = true;
    this.renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    this.renderer.setSize(1000, 1000);
    document.getElementById("asset-viewer").appendChild(this.renderer.domElement);
    this.scene = new THREE.Scene;
    this.camera = new THREE.PerspectiveCamera(45, 1, 1, 1000);
    this.camera.position.z = 10;
    this.light = new THREE.DirectionalLight(0xFFFFFF, 1);
    this.light.position.set(.5, 1, 1);
    this.scene.add(this.light);
    this.ambient = new THREE.AmbientLight(0x808080);
    this.scene.add(this.ambient);
    createFace = function(c1, c2) {
      var c, canvas;
      canvas = document.createElement("canvas");
      canvas.width = canvas.height = 256;
      c = canvas.getContext("2d");
      if (c2 != null) {
        c.fillStyle = c1;
        c.fillRect(0, 0, canvas.width, canvas.height / 2);
        c.fillStyle = c2;
        c.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2);
      } else {
        c.fillStyle = c1;
        c.fillRect(0, 0, canvas.width, canvas.height);
      }
      return canvas;
    };
    this.scene.environment = new THREE.CubeTexture([createFace("#ACE", "#A86"), createFace("#ACE", "#A86"), createFace("#BDF"), createFace("#A86"), createFace("#ACE", "#A86"), createFace("#ACE", "#A86")]);
    this.scene.environment.needsUpdate = true;
    this.scene.background = new THREE.Color(0x202020);
    requestAnimationFrame((function(_this) {
      return function() {
        return _this.update();
      };
    })(this));
    window.addEventListener("resize", (function(_this) {
      return function() {
        return _this.resize();
      };
    })(this));
    this.resize();
    this.renderer.domElement.addEventListener("mousedown", (function(_this) {
      return function(event) {
        return _this.mouseDown(event);
      };
    })(this));
    document.addEventListener("mousemove", (function(_this) {
      return function(event) {
        return _this.mouseMove(event);
      };
    })(this));
    document.addEventListener("mouseup", (function(_this) {
      return function(event) {
        return _this.mouseUp(event);
      };
    })(this));
    this.renderer.domElement.addEventListener("mousewheel", ((function(_this) {
      return function(e) {
        return _this.mouseWheel(e);
      };
    })(this)), false);
    return this.renderer.domElement.addEventListener("DOMMouseScroll", ((function(_this) {
      return function(e) {
        return _this.mouseWheel(e);
      };
    })(this)), false);
  };

  AssetViewer.prototype.view = function(url) {
    var loader;
    this.init();
    if ((window.THREE != null) && (THREE.GLTFLoader != null)) {
      loader = new THREE.GLTFLoader;
      return loader.load(url, (function(_this) {
        return function(glb) {
          var action, b, max;
          _this.clear();
          if ((glb.animations != null) && (glb.animations[0] != null)) {
            _this.mixer = new THREE.AnimationMixer(glb.scene);
            action = _this.mixer.clipAction(glb.animations[0]);
            action.play();
          }
          _this.model = glb.scene;
          _this.scene.add(_this.model);
          b = new THREE.Box3().setFromObject(_this.model);
          max = Math.max(Math.abs(b.max.x), Math.abs(b.max.y), Math.abs(b.max.z), Math.abs(b.min.x), Math.abs(b.min.y), Math.abs(b.min.z));
          return _this.model.scale.set(3 / max, 3 / max, 3 / max);
        };
      })(this));
    }
  };

  AssetViewer.prototype.clear = function() {
    if (this.model != null) {
      this.scene.remove(this.model);
      return this.model.traverse(function(o) {
        if (o.geometry != null) {
          return o.geometry.dispose();
        }
      });
    }
  };

  AssetViewer.prototype.update = function() {
    var c1, c2, h, r, w;
    requestAnimationFrame((function(_this) {
      return function() {
        return _this.update();
      };
    })(this));
    if (this.mixer != null) {
      this.mixer.update(1 / 60);
    }
    this.renderer.render(this.scene, this.camera);
    if (this.thumb == null) {
      this.buffer = document.createElement("canvas");
      this.buffer.width = 256;
      this.buffer.height = 256;
      this.thumb = document.createElement("canvas");
      this.thumb.width = 128;
      this.thumb.height = 128;
    }
    c1 = this.buffer.getContext("2d");
    r = Math.max(256 / this.renderer.domElement.width, 256 / this.renderer.domElement.height);
    w = r * this.renderer.domElement.width;
    h = r * this.renderer.domElement.height;
    c1.drawImage(this.renderer.domElement, 128 - w / 2, 128 - h / 2, w, h);
    c2 = this.thumb.getContext("2d");
    return c2.drawImage(this.buffer, 0, 0, 128, 128);
  };

  AssetViewer.prototype.getThumbnail = function() {
    return this.thumb.toDataURL().split(",")[1];
  };

  AssetViewer.prototype.resize = function() {
    var b;
    b = document.getElementById("asset-viewer").getBoundingClientRect();
    if (b.width <= 0 || b.height <= 0 || (this.renderer == null)) {
      return;
    }
    this.renderer.setSize(b.width, b.height);
    this.camera.aspect = b.width / b.height;
    return this.camera.updateProjectionMatrix();
  };

  AssetViewer.prototype.mouseDown = function(event) {
    this.last_x = event.clientX;
    this.last_y = event.clientY;
    return this.mousedown = true;
  };

  AssetViewer.prototype.mouseMove = function(event) {
    var x, y;
    if (this.mousedown && (this.model != null)) {
      x = event.clientX;
      y = event.clientY;
      this.model.rotation.y += (x - this.last_x) * .01;
      this.model.rotation.x += (y - this.last_y) * .01;
      this.last_x = x;
      return this.last_y = y;
    }
  };

  AssetViewer.prototype.mouseUp = function(event) {
    return this.mousedown = false;
  };

  AssetViewer.prototype.mouseWheel = function(e) {
    e.preventDefault();
    if (this.next_wheel_action == null) {
      this.next_wheel_action = Date.now();
    }
    if (Date.now() < this.next_wheel_action) {
      return;
    }
    this.next_wheel_action = Date.now() + 50;
    if (this.model == null) {
      return;
    }
    if (e.wheelDelta < 0 || e.detail > 0) {
      this.model.scale.x /= 1.1;
      this.model.scale.y /= 1.1;
      return this.model.scale.z /= 1.1;
    } else {
      this.model.scale.x *= 1.1;
      this.model.scale.y *= 1.1;
      return this.model.scale.z *= 1.1;
    }
  };

  return AssetViewer;

})();
