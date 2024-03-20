var diff;

diff = function(before, after) {
  var ai, best_ai, best_bi, best_length, bi, i, j, k, l, len1, len2, len3, length, line, list, map, result, score;
  if (typeof before === "string") {
    before = before.split("\n");
  }
  if (typeof after === "string") {
    after = after.split("\n");
  }
  result = [];
  map = {};
  for (i = j = 0, len1 = before.length; j < len1; i = ++j) {
    line = before[i];
    list = map[line];
    if (list == null) {
      list = map[line] = [];
    }
    list.push(i);
  }
  length = function(bi, ai) {
    var len;
    len = 0;
    while (bi < before.length && ai < after.length && before[bi++] === after[ai++]) {
      len += 1;
    }
    return len;
  };
  best_bi = best_ai = best_length = 0;
  for (ai = k = 0, len2 = after.length; k < len2; ai = ++k) {
    line = after[ai];
    list = map[line];
    if (list != null) {
      for (l = 0, len3 = list.length; l < len3; l++) {
        bi = list[l];
        score = length(bi, ai);
        if (score > best_length) {
          best_bi = bi;
          best_ai = ai;
          best_length = score;
        }
      }
    }
  }
  if (best_length === 0) {
    if (before.length > 0) {
      result.push({
        type: "-",
        data: before
      });
    }
    if (after.length > 0) {
      result.push({
        type: "+",
        data: after
      });
    }
    return result;
  } else {
    return [].concat(diff(before.slice(0, best_bi), after.slice(0, best_ai)), [
      {
        type: "=",
        data: after.slice(best_ai, best_ai + best_length)
      }
    ], diff(before.slice(best_bi + best_length, before.length), after.slice(best_ai + best_length, after.length)));
  }
};
