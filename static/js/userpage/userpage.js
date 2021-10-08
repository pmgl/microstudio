var UserPage;

UserPage = (function() {
  function UserPage() {
    this.sections = ["projects", "progress"];
    this.initSections();
    this.setSection(this.sections[0]);
  }

  UserPage.prototype.initSections = function() {
    var i, len, ref, results, s;
    ref = this.sections;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      s = ref[i];
      results.push((function(_this) {
        return function(s) {
          return document.getElementById("section-" + s).addEventListener("click", function() {
            return _this.setSection(s);
          });
        };
      })(this)(s));
    }
    return results;
  };

  UserPage.prototype.setSection = function(section) {
    var i, len, ref, results, s;
    this.current = section;
    ref = this.sections;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      s = ref[i];
      if (s === section) {
        document.getElementById("section-" + s).classList.add("selected");
        results.push(document.getElementById(s).style.display = "block");
      } else {
        document.getElementById("section-" + s).classList.remove("selected");
        results.push(document.getElementById(s).style.display = "none");
      }
    }
    return results;
  };

  return UserPage;

})();

window.addEventListener("load", (function(_this) {
  return function() {
    return new UserPage();
  };
})(this));
