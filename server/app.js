var Server, fs;

fs = require("fs");

Server = require(__dirname + "/server.js");

this.App = (function() {
  function App() {
    this.config = {
      realm: "local"
    };
    fs.readFile("../config.json", (function(_this) {
      return function(err, data) {
        if (!err) {
          _this.config = JSON.parse(data);
          console.info("config.json loaded");
        } else {
          console.info("No config.json file found, running local with default settings");
        }
        return _this.server = new Server(_this.config);
      };
    })(this));
  }

  return App;

})();

module.exports = new this.App();
