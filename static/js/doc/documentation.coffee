class @Documentation
  constructor:(@app)->
    @doc = ""
    @help = {}
    @suggest = {}
    @title_elements = []
    setTimeout (()=>@load()),1000

  load:()->
    req = new XMLHttpRequest()
    req.onreadystatechange = (event) =>
      if req.readyState == XMLHttpRequest.DONE
        if req.status == 200
          @doc = req.responseText
          @update()

    switch @app.translator.lang
      when "fr"
        req.open "GET","/doc/fr/doc.md"
      when "de"
        req.open "GET","/doc/de/doc.md"
      when "pl"
        req.open "GET","/doc/pl/doc.md"
      when "it"
        req.open "GET","/doc/it/doc.md"
      when "pt"
        req.open "GET","/doc/pt/doc.md"
      else
        req.open "GET","/doc/en/doc.md"

    req.send()

  update:()->
    element = document.getElementById("documentation")
    marked.setOptions
      headerPrefix: "documentation_"
    element.innerHTML = DOMPurify.sanitize marked @doc

    #lexer = new marked.Lexer({})
    #console.info lexer.lex @doc
    @buildToc()
    @buildLiveHelp()

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

  buildLiveHelp:()->
    lines = @doc.split("\n")
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
      if r.ref == r.radix and r.index<=position and r.index+r.ref.length>=position
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
