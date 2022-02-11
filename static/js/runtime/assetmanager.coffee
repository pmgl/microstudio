class @AssetManager
  constructor:(@runtime)->

  loadFont:(font)->
    return if typeof font != "string"

    file = font.replace(/\//g,"-")
    split = file.split("-")
    name = split[split.length-1]
    try
      font = new FontFace(name, "url(assets/#{file}.ttf)")
      font.load().then ()=>
        document.fonts.add(font)
    catch err
      console.error err
