var M3D,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

M3D = {};

M3D.BABYLON = BABYLON;

M3D.Vector3 = BABYLON.Vector3;

M3D.convertColor = function(color) {
  var err, s;
  if (typeof color === "string") {
    try {
      s = color.split("(")[1].split(")")[0];
      s = s.split(",");
      if (s.length === 3) {
        return new BABYLON.Color3(s[0] / 255, s[1] / 255, s[2] / 255);
      }
    } catch (error) {
      err = error;
    }
  }
  return new BABYLON.Color3(1, 1, 1);
};

M3D.Scene = (function(superClass) {
  extend(_Class, superClass);

  function _Class() {
    _Class.__super__.constructor.call(this);
  }

  _Class.prototype.add = function(object) {
    if (object.mesh != null) {
      return this.addMesh(object.mesh);
    } else if (object.light != null) {
      return this.addLight(object.light);
    }
  };

  _Class.prototype.setFog = function(color, density) {
    if (color == null) {
      color = "rgb(255,255,255)";
    }
    if (density == null) {
      density = .01;
    }
    this.fogMode = BABYLON.Scene.FOGMODE_EXP;
    this.fogColor = M3D.convertColor(color);
    return this.fogDensity = density;
  };

  _Class.prototype.setBackground = function(color) {
    return this.clearColor = M3D.convertColor(color);
  };

  return _Class;

})(BABYLON.Scene);

M3D.Camera = (function(superClass) {
  extend(_Class, superClass);

  function _Class() {
    _Class.__super__.constructor.call(this, "camera", new BABYLON.Vector3(0, 0, 20));
  }

  return _Class;

})(BABYLON.FreeCamera);

M3D.Mesh = (function() {
  function _Class(mesh) {
    this.mesh = mesh != null ? mesh : new BABYLON.Mesh("mesh");
    this.position = this.mesh.position;
    this.rotation = this.mesh.rotation;
    this.scale = this.mesh.scaling;
    this.mesh.receiveShadows = true;
  }

  _Class.prototype.setScale = function(x, y, z) {};

  _Class.prototype.setColor = function(r, mode) {
    var c, match;
    if (mode == null) {
      mode = "diffuse";
    }
    if (typeof r === "string") {
      match = /rgb\((\d{1,3}),(\d{1,3}),(\d{1,3})\)/.exec(r.replace(/ /g, ""));
      if ((match != null) && match.length >= 4) {
        c = [match[1] | 0, match[2] | 0, match[3] | 0];
        if (this.mesh.material == null) {
          this.mesh.material = new BABYLON.StandardMaterial;
        }
        if (mode === "specular") {
          return this.mesh.material.specularColor.set(c[0] / 255, c[1] / 255, c[2] / 255);
        } else {
          return this.mesh.material.diffuseColor.set(c[0] / 255, c[1] / 255, c[2] / 255);
        }
      }
    }
  };

  _Class.prototype.setTexture = function(name, channel, mode) {
    var canvas, cb, columns, h, i, j, pi, rows, tex, uvs, w, x, y;
    if (channel == null) {
      channel = "diffuse";
    }
    if (mode == null) {
      mode = "default";
    }
    if (M3D.runtime.sprites[name] != null) {
      if (this.mesh.material == null) {
        this.mesh.material = new BABYLON.StandardMaterial;
      }
      canvas = M3D.runtime.sprites[name].frames[0].canvas;
      tex = new BABYLON.DynamicTexture("", {
        width: canvas.width,
        height: canvas.height
      });
      tex.getContext().drawImage(canvas, 0, 0, canvas.width, canvas.height);
      tex.updateSamplingMode(BABYLON.Texture.NEAREST_NEAREST);
      tex.update();
      this.mesh.material.diffuseTexture = tex;
    }
    if (M3D.spriteUpdated == null) {
      M3D.sprite_callbacks = {};
      M3D.spriteUpdated = function(sprite) {
        var c, cb, j, len, results;
        cb = M3D.sprite_callbacks[sprite];
        if (cb != null) {
          results = [];
          for (j = 0, len = cb.length; j < len; j++) {
            c = cb[j];
            results.push(c());
          }
          return results;
        }
      };
      M3D.runtime.updateSprite2 = M3D.runtime.updateSprite;
      M3D.runtime.updateSprite = function(name, version, data, properties) {
        this.updateSprite2(name, version, data, properties);
        return M3D.spriteUpdated(name);
      };
    }
    cb = M3D.sprite_callbacks[name];
    if (cb == null) {
      cb = [];
      M3D.sprite_callbacks[name] = cb;
    }
    if (!this["callback_added_" + name]) {
      this["callback_added_" + name] = true;
      cb.push((function(_this) {
        return function() {
          return _this.setTexture(name, channel, mode);
        };
      })(this));
    }
    if (this instanceof M3D.Box && mode === "6faces") {
      uvs = this.mesh.getVerticesData(BABYLON.VertexBuffer.UVKind);
      columns = 3;
      rows = 2;
      w = 1 / 3;
      h = 1 / 2;
      for (i = j = 0; j <= 5; i = j += 1) {
        pi = i === 1 ? 4 : i === 4 ? 1 : i;
        x = (pi % 3) * w;
        y = Math.floor(pi / 3) * h;
        if (i % 2 === 0) {
          uvs[i * 8 + 2] = x + w;
          uvs[i * 8 + 3] = y + h;
          uvs[i * 8 + 4] = x;
          uvs[i * 8 + 5] = y + h;
          uvs[i * 8 + 6] = x;
          uvs[i * 8 + 7] = y;
          uvs[i * 8 + 0] = x + w;
          uvs[i * 8 + 1] = y;
        } else {
          uvs[i * 8 + 4] = x + w;
          uvs[i * 8 + 5] = y + h;
          uvs[i * 8 + 6] = x;
          uvs[i * 8 + 7] = y + h;
          uvs[i * 8 + 0] = x;
          uvs[i * 8 + 1] = y;
          uvs[i * 8 + 2] = x + w;
          uvs[i * 8 + 3] = y;
        }
      }
      return this.mesh.updateVerticesData(BABYLON.VertexBuffer.UVKind, uvs);
    }
  };

  return _Class;

})();

M3D.Plane = (function(superClass) {
  extend(_Class, superClass);

  function _Class(scale, options) {
    this.mesh = BABYLON.MeshBuilder.CreatePlane("plane", {
      width: 1,
      height: 1
    });
    _Class.__super__.constructor.call(this, this.mesh);
  }

  return _Class;

})(M3D.Mesh);

M3D.Sphere = (function(superClass) {
  extend(_Class, superClass);

  function _Class() {
    this.mesh = BABYLON.MeshBuilder.CreateSphere("sphere", {
      diameter: 1
    });
    _Class.__super__.constructor.call(this, this.mesh);
  }

  return _Class;

})(M3D.Mesh);

M3D.Box = (function(superClass) {
  extend(_Class, superClass);

  function _Class(scale, options) {
    this.mesh = BABYLON.MeshBuilder.CreateBox("box", {
      size: 1,
      updatable: true
    });
    _Class.__super__.constructor.call(this, this.mesh);
  }

  return _Class;

})(M3D.Mesh);

M3D.Light = (function() {
  function _Class() {}

  _Class.prototype.setIntensity = function(intensity) {
    return this.light.intensity = intensity;
  };

  _Class.prototype.setColor = function(r, g, b) {
    var c, match;
    if ((g == null) || (b == null) && typeof r === "string") {
      match = /rgb\((\d{1,3}),(\d{1,3}),(\d{1,3})\)/.exec(r.replace(/ /g, ""));
      if ((match != null) && match.length >= 4) {
        c = [match[1] | 0, match[2] | 0, match[3] | 0];
        this.light.diffuse.set(c[0] / 255, c[1] / 255, c[2] / 255);
        return this.light.specular.set(c[0] / 255, c[1] / 255, c[2] / 255);
      }
    }
  };

  return _Class;

})();

M3D.PointLight = (function(superClass) {
  extend(_Class, superClass);

  function _Class(position) {
    this.position = position != null ? position : new M3D.Vector3(0, 0, 0);
    this.light = new BABYLON.PointLight("PointLight", this.position);
  }

  return _Class;

})(M3D.Light);

M3D.DirectionalLight = (function(superClass) {
  extend(_Class, superClass);

  function _Class(direction) {
    this.direction = direction != null ? direction : new M3D.Vector3(0, 1, 0);
    this.light = new BABYLON.DirectionalLight("DirectionalLight", this.direction);
  }

  return _Class;

})(M3D.Light);

M3D.HemisphericLight = (function(superClass) {
  extend(_Class, superClass);

  function _Class(direction) {
    this.direction = direction != null ? direction : new M3D.Vector3(0, 1, 0);
    this.light = new BABYLON.HemisphericLight("HemisphericLight", this.direction);
  }

  return _Class;

})(M3D.Light);

M3D.ShadowCaster = (function() {
  function _Class(light) {
    this.light = light;
    this.shadowGenerator = new BABYLON.ShadowGenerator(1024, this.light.light);
  }

  _Class.prototype.add = function(object) {
    if (object.mesh != null) {
      this.shadowGenerator.getShadowMap().renderList.push(object.mesh);
      return this.shadowGenerator.usePoissonSampling = true;
    }
  };

  return _Class;

})();
