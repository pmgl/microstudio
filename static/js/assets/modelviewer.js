this.ModelViewer = (function() {
  function ModelViewer(manager) {
    this.manager = manager;
    this.element = document.getElementById("model-asset-viewer");
  }

  ModelViewer.prototype.view = function(asset) {
    var err, light, s, scene, url;
    this.element.style.display = "block";
    if (!this.initialized) {
      this.initialized = true;
      s = document.createElement("script");
      s.src = location.origin + "/lib/babylonjs/babylon.js";
      document.head.appendChild(s);
      s.onload = (function(_this) {
        return function() {
          s = document.createElement("script");
          s.src = location.origin + "/lib/babylonjs/babylonjs.loaders.min.js";
          document.head.appendChild(s);
          return s.onload = function() {
            return _this.view(asset);
          };
        };
      })(this);
      return;
    }
    if (this.engine == null) {
      this.canvas = document.createElement("canvas");
      this.canvas.width = 1000;
      this.canvas.height = 800;
      this.engine = new BABYLON.Engine(this.canvas, true, {
        preserveDrawingBuffer: true
      });
      this.element.appendChild(this.canvas);
      window.addEventListener("resize", (function(_this) {
        return function() {
          return _this.resize();
        };
      })(this));
    }
    scene = new BABYLON.Scene(this.engine);
    scene.clearColor = new BABYLON.Color3(.1, .2, .3);
    this.camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 3, new BABYLON.Vector3(0, 0, 0), scene);
    this.camera.attachControl(this.canvas, true);
    this.camera.lowerRadiusLimit = 2;
    this.camera.upperRadiusLimit = 100;
    this.camera.wheelDeltaPercentage = .01;
    light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    url = asset.getURL();
    if (url.startsWith("data:")) {
      url = "data:;base64," + url.split(",")[1];
    }
    try {
      BABYLON.SceneLoader.LoadAssetContainer("", url, scene, ((function(_this) {
        return function(container) {
          console.info("model loaded");
          console.info(container);
          return container.addAllToScene();
        };
      })(this)), ((function(_this) {
        return function(progress) {
          return console.info(progress);
        };
      })(this)), ((function(_this) {
        return function(error) {
          return console.info(error);
        };
      })(this)), "." + asset.ext);
    } catch (error1) {
      err = error1;
    }
    this.engine.runRenderLoop((function(_this) {
      return function() {
        return scene.render();
      };
    })(this));
    this.resize();
    this.asset = asset;
    return setTimeout(((function(_this) {
      return function() {
        return _this.manager.checkThumbnail(asset, function() {
          return _this.updateThumbnail();
        });
      };
    })(this)), 2000);
  };

  ModelViewer.prototype.updateThumbnail = function() {
    var canvas, context, h, m, w;
    canvas = document.createElement("canvas");
    canvas.width = canvas.height = 64;
    context = canvas.getContext("2d");
    context.translate(32, 32);
    m = Math.min(this.canvas.width, this.canvas.height);
    w = this.canvas.width / m * 64;
    h = this.canvas.height / m * 64;
    return BABYLON.Tools.CreateScreenshot(this.engine, this.camera, {
      width: w,
      height: h
    }, (function(_this) {
      return function(data) {
        var image;
        image = new Image;
        image.src = data;
        return image.onload = function() {
          context.drawImage(image, -image.width / 2, -image.height / 2);
          if (_this.asset.element != null) {
            _this.asset.element.querySelector("img").src = canvas.toDataURL();
          }
          return _this.manager.updateAssetIcon(_this.asset, canvas);
        };
      };
    })(this));
  };

  ModelViewer.prototype.resize = function() {
    var h, w;
    if (this.canvas) {
      w = this.canvas.parentNode.getBoundingClientRect().width;
      h = this.canvas.parentNode.getBoundingClientRect().height;
      this.canvas.width = w;
      this.canvas.height = h;
    }
    if (this.engine != null) {
      return this.engine.resize();
    }
  };

  return ModelViewer;

})();
