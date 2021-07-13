this.Tag = (function() {
  function Tag(tag) {
    this.tag = tag;
    this.targets = {};
    this.uses = 0;
  }

  Tag.prototype.add = function(target) {
    if (this.targets[target.id] == null) {
      this.targets[target.id] = target;
      return this.uses++;
    }
  };

  Tag.prototype.remove = function(target) {
    if (this.targets[target.id] != null) {
      delete this.targets[target.id];
      return this.uses--;
    }
  };

  Tag.prototype.test = function(target) {
    return this.targets[target] != null;
  };

  return Tag;

})();

module.exports = this.Tag;
