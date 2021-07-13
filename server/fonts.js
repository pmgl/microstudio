var fs;

fs = require("fs");

this.Fonts = (function() {
  function Fonts(folder) {
    this.folder = folder != null ? folder : "../static/fonts";
    this.fonts = [];
    fs.readdir(this.folder, (function(_this) {
      return function(err, files) {
        var f, i, len;
        if (err != null) {
          console.error(err);
        }
        if (files == null) {
          return;
        }
        for (i = 0, len = files.length; i < len; i++) {
          f = files[i];
          if (f.endsWith(".ttf") && f !== "bit_cell.ttf") {
            _this.fonts.push(f.split(".")[0]);
          }
        }
        return console.info(JSON.stringify(_this.fonts));
      };
    })(this));
  }

  Fonts.prototype.read = function(font, callback) {
    return fs.readFile(this.folder + "/" + font + ".ttf", (function(_this) {
      return function(err, data) {
        return callback(data);
      };
    })(this));
  };

  return Fonts;

})();

module.exports = this.Fonts;
