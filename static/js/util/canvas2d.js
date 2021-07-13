CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
  if (w < 2 * r) {
    r = w / 2;
  }
  if (h < 2 * r) {
    r = h / 2;
  }
  this.beginPath();
  this.moveTo(x + r, y);
  this.arcTo(x + w, y, x + w, y + h, r);
  this.arcTo(x + w, y + h, x, y + h, r);
  this.arcTo(x, y + h, x, y, r);
  this.arcTo(x, y, x + w, y, r);
  return this.closePath();
};

CanvasRenderingContext2D.prototype.fillRoundRect = function(x, y, w, h, r) {
  this.roundRect(x, y, w, h, r);
  return this.fill();
};

CanvasRenderingContext2D.prototype.strokeRoundRect = function(x, y, w, h, r) {
  this.roundRect(x, y, w, h, r);
  return this.stroke();
};
