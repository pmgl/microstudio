var M3DCubeTexture, M3DModelLoad, M3DTexture,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

this.M3D = (function() {
  function M3D(runtime) {
    this.runtime = runtime;
  }

  M3D.prototype.createScene = function() {
    return new M3DScene(this);
  };

  M3D.prototype.createCamera = function() {
    return new M3DCamera(this);
  };

  M3D.prototype.createBox = function() {
    return new M3DBox(this);
  };

  M3D.prototype.createSphere = function() {
    return new M3DSphere(this);
  };

  M3D.prototype.createPlane = function(width, height) {
    return new M3DPlane(this, width, height);
  };

  M3D.prototype.createTexture = function(image) {
    return new M3DTexture(this, image);
  };

  M3D.prototype.createCubeTexture = function(px, nx, py, ny, pz, nz) {
    return new M3DCubeTexture(this, px, nx, py, ny, pz, nz);
  };

  M3D.prototype.loadImage = function() {};

  M3D.prototype.loadModel = function(asset) {
    return new M3DModelLoad(this, asset);
  };

  M3D.prototype.createDirectionalLight = function() {
    return new M3DDirectionalLight;
  };

  return M3D;

})();

this.M3DCamera = (function() {
  function M3DCamera() {
    this.camera = new THREE.PerspectiveCamera(45, 1, 1, 1000);
    this.position = this.camera.position;
  }

  M3DCamera.prototype.lookAt = function(x, y, z) {
    return this.camera.lookAt(x, y, z);
  };

  return M3DCamera;

})();

this.M3DScene = (function() {
  function M3DScene() {
    this.scene = new THREE.Scene();
  }

  M3DScene.prototype.setFog = function(color, density) {
    if (this.scene.fog == null) {
      return this.scene.fog = new THREE.FogExp2(M3DConvertColor(color), density);
    } else {
      if (color != null) {
        this.scene.fog.color = M3DConvertColor(color);
      }
      if (density != null) {
        return this.scene.fog.density = density;
      }
    }
  };

  M3DScene.prototype.setAmbientLight = function(color) {
    color = M3DConvertColor(color);
    if (this.ambient_light == null) {
      this.ambient_light = new THREE.AmbientLight(color);
      return this.scene.add(this.ambient_light);
    } else {
      return this.ambient_light.color = color;
    }
  };

  M3DScene.prototype.add = function(object) {
    if ((object != null) && (object.object != null)) {
      this.scene.add(object.object);
    }
  };

  M3DScene.prototype.setBackground = function(rgb) {
    this.scene.background = M3DConvertColor(rgb);
  };

  M3DScene.prototype.setEnvironment = function(cube_texture) {
    return this.scene.environment = cube_texture.texture;
  };

  return M3DScene;

})();

this.M3DDirectionalLight = (function() {
  function M3DDirectionalLight(color, intensity) {
    if (color == null) {
      color = 0xFFFFFF;
    }
    if (intensity == null) {
      intensity = 1;
    }
    this.object = new THREE.DirectionalLight(color, intensity);
    this.position = this.object.position;
  }

  M3DDirectionalLight.prototype.setShadowFrame = function(left, right, bottom, top) {
    this.object.castShadow = true;
    this.object.shadow.camera.left = left;
    this.object.shadow.camera.right = right;
    this.object.shadow.camera.bottom = bottom;
    return this.object.shadow.camera.top = top;
  };

  return M3DDirectionalLight;

})();

this.M3DObject = (function() {
  function M3DObject(m3d1) {
    this.m3d = m3d1;
  }

  M3DObject.prototype.setObject = function(object1) {
    this.object = object1;
    this.rotation = this.object.rotation;
    this.position = this.object.position;
    return this.scale = this.object.scale;
  };

  M3DObject.prototype.setColor = function(rgb) {
    this.material.color = M3DConvertColor(rgb);
  };

  M3DObject.prototype.setRotationOrder = function(order) {
    if (this.object != null) {
      return this.object.rotation.order = order;
    }
  };

  M3DObject.prototype.setCastShadow = function(cast) {
    return this.object.castShadow = cast !== 0;
  };

  M3DObject.prototype.setReceiveShadow = function(receive) {
    return this.object.receiveShadow = receive !== 0;
  };

  M3DObject.prototype.clone = function() {
    var o;
    o = new M3DObject(this.m3d);
    o.setObject(SkeletonUtils.clone(this.object));
    o.animations = this.animations;
    return o;
  };

  M3DObject.prototype.setMap = function(texture) {
    this.texture = texture;
    this.object.material.map = this.texture.texture;
    return this.object.material.needsUpdate = true;
  };

  M3DObject.prototype.startAnimation = function(num) {
    var action;
    if (this.animations == null) {
      return;
    }
    if (this.mixer == null) {
      this.mixer = new THREE.AnimationMixer(this.object);
    }
    if (this.animations[num] == null) {
      return;
    }
    action = this.mixer.clipAction(this.animations[num]);
    return action.play();
  };

  M3DObject.prototype.updateAnimation = function(t) {
    if (this.mixer != null) {
      return this.mixer.update(t);
    }
  };

  return M3DObject;

})();

this.M3DBox = (function(superClass) {
  extend(M3DBox, superClass);

  function M3DBox(m3d) {
    M3DBox.__super__.constructor.call(this, m3d);
    this.geometry = new THREE.BoxGeometry(1, 1, 1);
    this.material = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF
    });
    this.setObject(new THREE.Mesh(this.geometry, this.material));
  }

  return M3DBox;

})(this.M3DObject);

this.M3DSphere = (function(superClass) {
  extend(M3DSphere, superClass);

  function M3DSphere(m3d) {
    M3DSphere.__super__.constructor.call(this, m3d);
    this.geometry = new THREE.SphereGeometry(.5, 12, 12);
    this.material = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF
    });
    this.setObject(new THREE.Mesh(this.geometry, this.material));
  }

  return M3DSphere;

})(this.M3DObject);

this.M3DPlane = (function(superClass) {
  extend(M3DPlane, superClass);

  function M3DPlane(m3d, width, height) {
    if (width == null) {
      width = 1;
    }
    if (height == null) {
      height = 1;
    }
    M3DPlane.__super__.constructor.call(this, m3d);
    this.geometry = new THREE.PlaneGeometry(width, height);
    this.material = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF
    });
    this.setObject(new THREE.Mesh(this.geometry, this.material));
  }

  return M3DPlane;

})(this.M3DObject);

M3DModelLoad = (function(superClass) {
  extend(M3DModelLoad, superClass);

  function M3DModelLoad(m3d, asset) {
    var loader, url;
    M3DModelLoad.__super__.constructor.call(this, m3d);
    this.ready = false;
    url = m3d.runtime.getAssetURL(asset);
    loader = new THREE.GLTFLoader;
    loader.load(url, (function(_this) {
      return function(glb) {
        _this.animations = glb.animations;
        _this.object = glb.scene;
        _this.rotation = _this.object.rotation;
        _this.position = _this.object.position;
        _this.scale = _this.object.scale;
        return _this.ready = true;
      };
    })(this));
  }

  return M3DModelLoad;

})(this.M3DObject);

M3DTexture = (function() {
  function M3DTexture(m3d1, image) {
    this.m3d = m3d1;
    image = M3DResolveImage(this.m3d, image);
    this.texture = new THREE.Texture(image);
    this.texture.needsUpdate = true;
  }

  return M3DTexture;

})();

M3DCubeTexture = (function() {
  function M3DCubeTexture(m3d1, px, nx, py, ny, pz, nz) {
    this.m3d = m3d1;
    px = M3DResolveImage(this.m3d, px);
    nx = M3DResolveImage(this.m3d, nx);
    py = M3DResolveImage(this.m3d, py);
    ny = M3DResolveImage(this.m3d, ny);
    pz = M3DResolveImage(this.m3d, pz);
    nz = M3DResolveImage(this.m3d, nz);
    this.texture = new THREE.CubeTexture([px, nx, py, ny, pz, nz]);
    this.texture.needsUpdate = true;
  }

  return M3DCubeTexture;

})();

this.M3DConvertColor = function(rgb) {
  var err, s;
  try {
    s = rgb.split("(")[1].split(")")[0];
    s = s.split(",");
    if (s.length === 3) {
      return new THREE.Color(s[0] / 255, s[1] / 255, s[2] / 255);
    }
  } catch (error) {
    err = error;
    return new THREE.Color(0, 0, 0);
  }
};

this.M3DResolveImage = function(m3d, img) {
  if (m3d.runtime.sprites[img] != null) {
    return m3d.runtime.sprites[img].frames[0].canvas;
  }
};
