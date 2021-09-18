class @About
  constructor:(@app)->
    @current = "about"
    @loaded = {}
    @sections = ["about","changelog","terms","privacy"]
    @init()

  init:()->
    for s in @sections
      do (s)=>
        document.getElementById("about-menu-#{s}").addEventListener "click",()=>
          @setSection(s)

  setSection:(section)->
    @current = section
    for s in @sections
      if s == section
        document.getElementById("about-menu-#{s}").classList.add "selected"
      else
        document.getElementById("about-menu-#{s}").classList.remove "selected"

    @load section,(text)=>
      @update(text)

  load:(section,callback)->
    if @loaded[section]?
      callback(@loaded[section]) if callback?
      return
    req = new XMLHttpRequest()
    req.onreadystatechange = (event) =>
      if req.readyState == XMLHttpRequest.DONE
        if req.status == 200
          @loaded[section] = req.responseText
          callback(@loaded[section]) if callback?

    if @app.translator.lang in ["fr","it"] and section != "changelog"
      req.open "GET",location.origin+"/doc/#{@app.translator.lang}/#{section}.md"
    else
      req.open "GET",location.origin+"/doc/en/#{section}.md"

    req.send()

  update:(doc)->
    element = document.getElementById("about-content")
    element.innerHTML = DOMPurify.sanitize marked doc
