var Random;

Random = (function() {
  function Random(_seed, hash) {
    this._seed = _seed != null ? _seed : Math.random();
    if (hash == null) {
      hash = true;
    }
    if (this._seed === 0) {
      this._seed = Math.random();
    }
    if (this._seed < 1) {
      this._seed *= 1 << 30;
    }
    this.a = 13971;
    this.b = 12345;
    this.size = 1 << 30;
    this.mask = this.size - 1;
    this.norm = 1 / this.size;
    if (hash) {
      this.nextSeed();
      this.nextSeed();
      this.nextSeed();
    }
  }

  Random.prototype.next = function() {
    this._seed = (this._seed * this.a + this.b) & this.mask;
    return this._seed * this.norm;
  };

  Random.prototype.nextInt = function(num) {
    return Math.floor(this.next() * num);
  };

  Random.prototype.nextSeed = function() {
    return this._seed = (this._seed * this.a + this.b) & this.mask;
  };

  Random.prototype.seed = function(_seed) {
    this._seed = _seed != null ? _seed : Math.random();
    if (this._seed < 1) {
      this._seed *= 1 << 30;
    }
    this.nextSeed();
    this.nextSeed();
    return this.nextSeed();
  };

  Random.prototype.clone = function(seed) {
    if (seed != null) {
      return new Random(seed);
    } else {
      seed = this._seed;
      return new Random(seed, false);
    }
  };

  return Random;

})();
