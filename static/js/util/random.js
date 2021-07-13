var Random;

Random = (function() {
  function Random(seed) {
    this.seed = seed != null ? seed : Math.random();
    if (this.seed < 1) {
      this.seed *= 1 << 30;
    }
    this.a = 13971;
    this.b = 12345;
    this.size = 1 << 30;
    this.mask = this.size - 1;
    this.norm = 1 / this.size;
    this.nextSeed();
    this.nextSeed();
    this.nextSeed();
  }

  Random.prototype.next = function() {
    this.seed = (this.seed * this.a + this.b) & this.mask;
    return this.seed * this.norm;
  };

  Random.prototype.nextInt = function(num) {
    return Math.floor(this.next() * num);
  };

  Random.prototype.nextSeed = function() {
    return this.seed = (this.seed * this.a + this.b) & this.mask;
  };

  Random.prototype.setSeed = function(seed) {
    this.seed = seed;
    if (this.seed < 1) {
      this.seed *= 1 << 30;
    }
    this.nextSeed();
    this.nextSeed();
    return this.nextSeed();
  };

  return Random;

})();
