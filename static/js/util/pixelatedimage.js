this.PixelatedImage = (function() {
  function PixelatedImage() {}

  PixelatedImage.create = function(source, size) {
    var img, sourceimg;
    img = new Image;
    img.crossOrigin = "Anonymous";
    sourceimg = new Image;
    sourceimg.crossOrigin = "Anonymous";
    sourceimg.src = source;
    sourceimg.onload = function() {
      var canvas, context, h, ratio, w;
      if (sourceimg.width <= 0 || sourceimg.height <= 0) {
        return;
      }
      canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      context = canvas.getContext("2d");
      context.imageSmoothingEnabled = false;
      ratio = Math.min(size / sourceimg.width, size / sourceimg.height);
      w = sourceimg.width * ratio;
      h = sourceimg.height * ratio;
      context.drawImage(sourceimg, size / 2 - w / 2, size / 2 - h / 2, w, h);
      return img.src = canvas.toDataURL();
    };
    return img;
  };

  PixelatedImage.setURL = function(img, source, size) {
    var sourceimg;
    img.crossOrigin = "Anonymous";
    sourceimg = new Image;
    sourceimg.crossOrigin = "Anonymous";
    sourceimg.src = source;
    return sourceimg.onload = function() {
      var canvas, context, h, ratio, w;
      if (sourceimg.width <= 0 || sourceimg.height <= 0) {
        return;
      }
      if (img instanceof HTMLCanvasElement) {
        canvas = img;
      } else {
        canvas = document.createElement("canvas");
      }
      canvas.width = size;
      canvas.height = size;
      context = canvas.getContext("2d");
      context.clearRect(0, 0, size, size);
      context.imageSmoothingEnabled = false;
      ratio = Math.min(size / sourceimg.width, size / sourceimg.height);
      w = sourceimg.width * ratio;
      h = sourceimg.height * ratio;
      context.drawImage(sourceimg, size / 2 - w / 2, size / 2 - h / 2, w, h);
      if (!(img instanceof HTMLCanvasElement)) {
        return img.src = canvas.toDataURL();
      }
    };
  };

  return PixelatedImage;

})();
