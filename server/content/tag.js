this.Tag = (function() {
  function Tag(tag) {
    this.tag = tag;
    this.targets = {};
    this.uses = 0;
    this.users = {};
    this.num_users = 0;
  }

  Tag.prototype.add = function(target) {
    if (this.targets[target.id] == null) {
      this.targets[target.id] = target;
      this.uses++;
      if ((target.owner != null) && (target.owner.id != null) && !this.users[target.owner.id]) {
        this.users[target.owner.id] = true;
        return this.num_users += 1;
      }
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
