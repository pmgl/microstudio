class @Documentation
  constructor:(@app)->
    @doc = ""
    @help = {}
    @suggest = {}
    @title_elements = []

    setTimeout (()=>@load "api",(src)=>
      @buildLiveHelp src,"api"
      setTimeout (()=>@setSection "quickstart",()=>
        @buildLiveHelp @doc,"quickstart"
      ),1000
    ),1000

    @sections = {}

    list = document.getElementsByClassName "help-section-category"
    for e in list
      do (e)=>
        title = e.getElementsByClassName("help-section-title")[0]
        title.addEventListener "click",()=>
          if e.classList.contains "collapsed"
            e.classList.remove "collapsed"
          else
            e.classList.add "collapsed"
          @updateViewPos()

    list = document.getElementsByClassName "help-section-button"
    for e in list
      do (e)=>
        e.addEventListener "click",()=>
          id = e.id.split("-")[1]
          @setSection id

    window.addEventListener "resize",()=>@updateViewPos()

  setSection:(id,callback)->
    @load id,(@doc)=>
      @update()
      callback() if callback?

    list = document.getElementsByClassName "help-section-button"
    for e in list
      do (e)=>
        if e.id == "documentation-#{id}"
          e.classList.add "selected"
          e.parentNode.parentNode.classList.remove "collapsed"
        else
          e.classList.remove "selected"

    return

  load:(id="quickstart",callback=(->),lang=@app.translator.lang)->
    if @sections[id]?
      return callback @sections[id]

    if not lang in ["fr","de","pl","it","pt","ru"]
      lang = "en"

    req = new XMLHttpRequest()
    req.onreadystatechange = (event) =>
      if req.readyState == XMLHttpRequest.DONE
        if req.status == 200
          @sections[id] = req.responseText
          callback(@sections[id])
        else if lang != "en"
          @load(id,callback,"en")

    req.open "GET","/doc/#{lang}/#{id}.md"
    req.send()

  updateViewPos:()->
    sections = document.getElementById("help-sections")
    doc = document.getElementById("help-document")
    doc.style.top = "#{sections.offsetHeight}px"

  update:()->
    return if not @doc?
    element = document.getElementById("documentation")
    marked.setOptions
      headerPrefix: "documentation_"
    element.innerHTML = DOMPurify.sanitize marked @doc

    list = element.getElementsByTagName "a"
    for e in list
      e.target = "_blank"

    #lexer = new marked.Lexer({})
    #console.info lexer.lex @doc
    @buildToc()
    @updateViewPos()

  buildToc:()->
    element = document.getElementById("documentation")
    toc = document.getElementById("help-list")
    toc.innerHTML = ""
    for e in element.childNodes
      do (e)=>
        switch e.tagName
          when "H1"
            h = document.createElement "h1"
            h.innerText = e.innerText
            h.addEventListener "click",()=>
              e.scrollIntoView true,
                behavior: "smooth"
            toc.appendChild h

          when "H2"
            h = document.createElement "h2"
            h.innerText = e.innerText
            h.addEventListener "click",()=>
              e.scrollIntoView true,
                behavior: "smooth"
            toc.appendChild h

          when "H3"
            h = document.createElement "h3"
            h.innerText = e.innerText
            h.addEventListener "click",()=>
              e.scrollIntoView true,
                behavior: "smooth"
            toc.appendChild h

    return

  buildLiveHelp:(src,section)->
    lines = src.split("\n")
    index = 0
    current_section = ""
    slugger = new marked.Slugger
    while index<lines.length
      line = lines[index]
      tline = lines[Math.min(lines.length-1,index+1)]

      if tline.startsWith("# ")
        current_section = "documentation_"+slugger.slug(tline.substring(2,tline.length).replace(/\&lt;|\&gt;/g,""))
      else if tline.startsWith("## ")
        current_section = "documentation_"+slugger.slug(tline.substring(3,tline.length).replace(/\&lt;|\&gt;/g,""))
      else if tline.startsWith("### ")
        current_section = "documentation_"+slugger.slug(tline.substring(4,tline.length).replace(/\&lt;|\&gt;/g,""))
      else if tline.startsWith("#### ")
        current_section = "documentation_"+slugger.slug(tline.substring(5,tline.length).replace(/\&lt;|\&gt;/g,""))
      else if tline.startsWith("##### ")
        current_section = "documentation_"+slugger.slug(tline.substring(6,tline.length).replace(/\&lt;|\&gt;/g,""))

      if line.indexOf("help_start")>0
        ref = line.substring(line.indexOf("help_start")+11,line.indexOf("--->"))
        ref = ref.trim()
        index += 1
        content = ""
        while index<lines.length
          line = lines[index]
          if line.indexOf("help_end")>0
            @help[ref]=
              pointer: current_section
              value: content
              section: section
            break
          else
            content += line+"\n"
          index += 1

      if line.indexOf("suggest_start")>0
        ref = line.substring(line.indexOf("suggest_start")+"suggest_start".length+1,line.indexOf("--->"))
        ref = ref.trim()
        index += 1
        content = ""
        while index<lines.length
          line = lines[index]
          if line.indexOf("suggest_end")>0
            @suggest[ref] =
              pointer: current_section
              value: content
              section: section
            break
          else
            content += line+"\n"
          index += 1

      index++
    return

  findSuggestMatch:(line,position=0)->
    res = []
    best = 0
    for key,value of @suggest
      for len in [key.length..3] by -1
        index = line.indexOf(key.substring(0,len))
        if index >= 0
          best = Math.max(best,len)
          res.push
            ref: key
            radix: key.substring(0,len)
            value: value.value
            pointer: value.pointer
            index: index
            within: index<=position and position<=index+len
          break

    within = false
    for r in res
      if r.ref == r.radix and r.radix.length == best and r.index+r.radix.length<line.length
        return [r]
      within = within or r.within

    if within
      for i in [res.length-1..0] by -1
        r = res[i]
        if not r.within
          res.splice(i,1)

    best = 0
    for r in res
      best = Math.max(best,r.radix.length)

    for i in [res.length-1..0] by -1
      r = res[i]
      if r.radix.length<best
        res.splice(i,1)
    res

  findHelpMatch:(line)->
    res = []
    for key,value of @help
      if line.indexOf(key) >= 0
        res.push value
    res
