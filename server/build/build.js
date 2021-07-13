this.Build = (function() {
  function Build(project, target) {
    this.project = project;
    this.target = target;
    this.status = "request";
    this.status_text = "Queued";
    this.progress = 0;
    this.version_check = this.project.last_modified;
  }

  Build.prototype["export"] = function() {
    var result;
    return result = {
      target: this.target,
      progress: this.progress,
      status: this.status,
      status_text: this.status_text,
      error: this.error
    };
  };

  return Build;

})();

module.exports = this.Build;
