
const TWOPI = 2*Math.PI
const SIN_TABLE = new Float64Array(10001)
const WHITE_NOISE = new Float64Array(100000)
const COLORED_NOISE = new Float64Array(100000)
;
var DBSCALE;

(function() {
  var i, j, results;
  results = [];
  for (i = j = 0; j <= 10000; i = j += 1) {
    results.push(SIN_TABLE[i] = Math.sin(i / 10000 * Math.PI * 2));
  }
  return results;
})();


const BLIP_SIZE = 512
const BLIP = new Float64Array(BLIP_SIZE+1)
;

(function() {
  var i, j, k, l, norm, p, ref, ref1, results, x;
  for (p = j = 1; j <= 31; p = j += 2) {
    for (i = k = 0, ref = BLIP_SIZE; k <= ref; i = k += 1) {
      x = (i / BLIP_SIZE - .5) * .5;
      BLIP[i] += Math.sin(x * 2 * Math.PI * p) / p;
    }
  }
  norm = BLIP[BLIP_SIZE];
  results = [];
  for (i = l = 0, ref1 = BLIP_SIZE; l <= ref1; i = l += 1) {
    results.push(BLIP[i] /= norm);
  }
  return results;
})();

(function() {
  var b0, b1, b2, b3, b4, b5, b6, i, j, n, pink, results, white;
  n = 0;
  b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0;
  results = [];
  for (i = j = 0; j <= 99999; i = j += 1) {
    white = Math.random() * 2 - 1;
    n = .99 * n + .01 * white;
    pink = n * 6;
    WHITE_NOISE[i] = white;
    results.push(COLORED_NOISE[i] = pink);
  }
  return results;
})();

DBSCALE = function(value, range) {
  return (Math.exp(value * range) / Math.exp(range) - 1 / Math.exp(range)) / (1 - 1 / Math.exp(range));
};
