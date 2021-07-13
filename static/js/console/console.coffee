class @Console
  constructor:()->
    for game in gamelist
      @createGameBox game


  createGameBox:(game)->
    list = document.getElementById("list")
    element = document.createElement "div"
    element.classList.add "box"

    img = document.createElement "img"
    img.src = location.origin+"/"+game.author+"/"+game.slug+"/icon.png"
    element.appendChild img

    title = document.createElement "div"
    title.classList.add "title"
    title.innerText = game.title
    element.appendChild title
    list.appendChild element

window.addEventListener "load",()->
  box = new Console()
