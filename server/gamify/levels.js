this.Levels = (function() {
  function _Class() {
    var i, j, sum;
    this.total_cost = [];
    sum = 0;
    for (i = j = 0; j <= 499; i = j += 1) {
      sum += this.costOfLevelUp(i);
      this.total_cost[i] = sum;
    }
  }

  _Class.prototype.costOfLevelUp = function(from_level) {
    var xp;
    return xp = (from_level + 5) * (from_level + 5) * 20;
  };

  return _Class;

})();

module.exports = new this.Levels();
