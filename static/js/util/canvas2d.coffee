CanvasRenderingContext2D.prototype.roundRect = (x, y, w, h, r)->
    r = w / 2 if (w < 2 * r)
    r = h / 2 if (h < 2 * r)
    @beginPath()
    @moveTo(x+r, y)
    @arcTo(x+w, y,   x+w, y+h, r)
    @arcTo(x+w, y+h, x,   y+h, r)
    @arcTo(x,   y+h, x,   y,   r)
    @arcTo(x,   y,   x+w, y,   r)
    @closePath()

CanvasRenderingContext2D.prototype.fillRoundRect = (x, y, w, h, r)->
    @roundRect x,y,w,h,r
    @fill()

CanvasRenderingContext2D.prototype.strokeRoundRect = (x, y, w, h, r)->
    @roundRect x,y,w,h,r
    @stroke()
