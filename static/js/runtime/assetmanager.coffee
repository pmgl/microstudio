class @AssetManager
  constructor:(@runtime)->
    @interface =
      loadFont: (font) => @loadFont font
      loadModel: (path,scene,callback) => @loadModel path,scene,callback
      loadJSON: (path,callback) => @loadJSON path,callback
      loadText: (path,callback) => @loadText path,callback
      loadCSV: (path,callback) => @loadCSV path,callback

  getInterface:()->
    @interface

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

  loadModel:(path,scene,callback)->
    return if not BABYLON?
    loader =
      ready: 0

    if @runtime.assets[path]?
      path = @runtime.assets[path].file
    else
      path = path.replace /\//g,"-"
      path += ".glb"

    BABYLON.SceneLoader.LoadAssetContainer "","assets/#{path}",scene,(container)=>
      loader.container = container
      loader.ready = 1
      callback(container)

  loadJSON:(path,callback)->
    path = path.replace /\//g,"-"
    path = "assets/#{path}.json"
    loader =
      ready: 0

    fetch(path).then (result)=>
      result.json().then (data)=>
        loader.data = data
        loader.ready = 1
        callback data

    loader

  loadText:(path,callback,ext="txt")->
    path = path.replace /\//g,"-"
    path = "assets/#{path}.#{ext}"
    loader =
      ready: 0

    fetch(path).then (result)=>
      result.text().then (text)=>
        loader.text = text
        loader.ready = 1
        callback text

    loader

  loadCSV:(path,callback)->
    @loadText path,callback,"csv"
