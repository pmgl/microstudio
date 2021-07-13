this.Undo = (function() {
  function Undo(listener) {
    this.listener = listener;
    this.states = [];
    this.next_state = 0;
    this.max = 30;
  }

  Undo.prototype.pushState = function(state) {
    if (this.next_state >= this.max) {
      this.states.splice(0, 1);
      this.next_state -= 1;
    }
    this.states[this.next_state++] = state;
    while (this.states.length > this.next_state) {
      this.states.splice(this.states.length - 1, 1);
    }
    return state;
  };

  Undo.prototype.empty = function() {
    return this.states.length === 0;
  };

  Undo.prototype.undo = function() {
    if (this.next_state - 2 >= 0 && this.next_state - 2 < this.states.length) {
      this.next_state -= 1;
      return this.states[this.next_state - 1];
    } else {
      return null;
    }
  };

  Undo.prototype.redo = function() {
    if (this.next_state >= 0 && this.next_state < this.states.length) {
      this.next_state += 1;
      return this.states[this.next_state - 1];
    } else {
      return null;
    }
  };

  return Undo;

})();
