this.Console = (function() {
  function Console() {
    var game, i, len;
    for (i = 0, len = gamelist.length; i < len; i++) {
      game = gamelist[i];
      this.createGameBox(game);
    }
  }

  Console.prototype.createGameBox = function(game) {
    var element, img, list, title;
    list = document.getElementById("list");
    element = document.createElement("div");
    element.classList.add("box");
    img = document.createElement("img");
    img.src = location.origin + "/" + game.author + "/" + game.slug + "/icon.png";
    element.appendChild(img);
    title = document.createElement("div");
    title.classList.add("title");
    title.innerText = game.title;
    element.appendChild(title);
    return list.appendChild(element);
  };

  return Console;

})();

window.addEventListener("load", function() {
  var box;
  return box = new Console();
});
