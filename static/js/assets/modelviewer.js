this.ModelViewer = (function() {
  function ModelViewer(manager) {
    this.manager = manager;
    this.element = document.getElementById("model-asset-viewer");
  }

  ModelViewer.prototype.updateSnippet = function() {
    return this.manager.code_snippet.set([
      {
        name: "Load Model",
        value: "loader = asset_manager.loadModel(\"" + (this.asset.name.replace(/-/g, "/")) + "\", callback)"
      }
    ]);
  };

  ModelViewer.prototype.view = function(asset) {
    var err, light, light2, s, scene, url;
    this.asset = asset;
    this.element.style.display = "block";
    this.updateSnippet();
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
    light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.groundColor = new BABYLON.Color3(0, 0, 0);
    light.diffuse = new BABYLON.Color3(.4, .5, .6);
    light.intensity = .5;
    light2 = new BABYLON.DirectionalLight("light2", new BABYLON.Vector3(1, -1, 1), scene);
    light2.specular = light2.diffuse = new BABYLON.Color3(1, .9, .7);
    light2.intensity = .5;
    this.createEnvironment(scene);
    url = asset.getURL();
    if (url.startsWith("data:")) {
      url = "data:;base64," + url.split(",")[1];
    }
    try {
      BABYLON.SceneLoader.LoadAssetContainer("", url, scene, ((function(_this) {
        return function(container) {
          var boundingInfo, bs, center, i, j, len, len1, m, max, mesh, min, radius, ref, ref1, size;
          console.info("model loaded");
          console.info(container);
          container.addAllToScene();
          ref = container.meshes;
          for (i = 0, len = ref.length; i < len; i++) {
            m = ref[i];
            bs = m.getBoundingInfo().boundingBox;
            if (typeof min === "undefined" || min === null) {
              min = new BABYLON.Vector3();
              min.copyFrom(bs.minimum);
            }
            if (typeof max === "undefined" || max === null) {
              max = new BABYLON.Vector3();
              max.copyFrom(bs.maximum);
            }
            min = BABYLON.Vector3.Minimize(min, bs.minimum);
            max = BABYLON.Vector3.Maximize(max, bs.maximum);
          }
          size = max.subtract(min);
          boundingInfo = new BABYLON.BoundingInfo(min, max);
          center = boundingInfo.boundingBox.centerWorld;
          console.log("Width: ", size.x);
          console.log("Height: ", size.y);
          console.log("Depth: ", size.z);
          console.log("Position: ", center);
          radius = max.subtract(min).length();
          console.info("RADIUS = " + radius);
          _this.camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2.5, radius, new BABYLON.Vector3(0, 0, 0), scene);
          _this.camera.attachControl(_this.canvas, true);
          _this.camera.lowerRadiusLimit = radius / 10;
          _this.camera.upperRadiusLimit = radius * 10;
          _this.camera.maxZ = radius * 100;
          _this.camera.minZ = radius / 100;
          _this.camera.wheelDeltaPercentage = .01;
          window.camera = _this.camera;
          _this.camera.setTarget(center);
          window.container = container;
          if (asset.ext === "obj") {
            ref1 = container.meshes;
            for (j = 0, len1 = ref1.length; j < len1; j++) {
              mesh = ref1[j];
              mesh.material = new BABYLON.StandardMaterial("pbrmat", scene);
              mesh.material.diffuseColor = new BABYLON.Color3(1, 1, 1);
              mesh.material.specularColor = new BABYLON.Color3(0, 0, 0);
              mesh.material.emissiveColor = new BABYLON.Color3(0, 0, 0);
              mesh.material.ambientColor = new BABYLON.Color3(.1, .1, .1);
            }
          }
          return _this.engine.runRenderLoop(function() {
            return scene.render();
          });
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
    canvas.width = 128;
    canvas.height = 96;
    context = canvas.getContext("2d");
    context.save();
    context.translate(64, 48);
    m = Math.min(this.canvas.width / 128 * 96, this.canvas.height);
    w = this.canvas.width / m * 128;
    h = this.canvas.height / m * 96;
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
          context.restore();
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

  ModelViewer.prototype.createEnvironment = function(scene) {
    var createFace, files, texture;
    createFace = function(c1, c2) {
      var c, canvas, grd;
      canvas = document.createElement("canvas");
      canvas.width = canvas.height = 256;
      c = canvas.getContext("2d");
      if (c2 != null) {
        c.fillStyle = grd = c.createLinearGradient(0, 0, 0, canvas.height);
        grd.addColorStop(0, c1);
        grd.addColorStop(.48, c1);
        grd.addColorStop(.52, c2);
        grd.addColorStop(1, c2);
        c.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        c.fillStyle = c1;
        c.fillRect(0, 0, canvas.width, canvas.height);
      }
      return canvas.toDataURL();
    };
    files = [createFace("#ACE", "#864"), createFace("#BDF"), createFace("#ACE", "#864"), createFace("#ACE", "#864"), createFace("#201818"), createFace("#ACE", "#864")];
    texture = BABYLON.CubeTexture.CreateFromImages(files, scene);
    return scene.environmentTexture = texture;
  };

  return ModelViewer;

})();
