class @Tutorials
  constructor:(@app)->

  load:()->
    req = new XMLHttpRequest()
    req.onreadystatechange = (event) =>
      if req.readyState == XMLHttpRequest.DONE
        if req.status == 200
          @update(req.responseText)

    switch @app.translator.lang
      when "fr"
        req.open "GET",location.origin+"/tutorials/fr/toc.md"
      else
        req.open "GET",location.origin+"/tutorials/en/toc.md"

    req.send()

  update:(doc)->
    element = document.createElement("div")
    element.innerHTML = DOMPurify.sanitize marked doc

    @tutorials = []

    if element.hasChildNodes()
      for e in element.childNodes
        #console.info e
        switch e.tagName
          when "H2"
            list =
              title: e.innerText
              description: ""
              list: []

            @tutorials.push(list)

          when "P"
            if e.hasChildNodes()
              for e2 in e.childNodes
                switch e2.tagName
                  when "A"
                    if list?
                      list.list.push
                        title: e2.textContent
                        link: e2.href
                  when undefined
                    list.description = e2.textContent

    #console.info @tutorials

    @build()
    return

  build:()->
    document.getElementById("tutorials-content").innerHTML = ""
    for t in @tutorials
      @buildCourse(t)
    return

  buildCourse:(course)->
    div = document.createElement "div"
    div.classList.add "course"
    h2 = document.createElement "h2"
    h2.innerText = course.title
    div.appendChild h2

    p = document.createElement "p"
    div.appendChild p
    p.innerText = course.description

    ul = document.createElement "ul"
    div.appendChild ul

    for t in course.list
      div.appendChild @buildTutorial t

    document.getElementById("tutorials-content").appendChild div

  buildTutorial:(t)->
    li = document.createElement "li"
    li.innerHTML = "<i class='fa fa-play'></i> #{t.title}"

    li.addEventListener "click",()=>
      @startTutorial(t)

    progress = @app.getTutorialProgress(t.link)
    if progress>0
      li.style.background =  "linear-gradient(90deg,hsl(160,50%,70%) 0%,hsl(160,50%,70%) #{progress}%,rgba(0,0,0,.1) #{progress}%)"
      li.addEventListener "mouseover",()->
        li.style.background =  "hsl(200,50%,70%)"

      li.addEventListener "mouseout",()->
        li.style.background =  "linear-gradient(90deg,hsl(160,50%,70%) 0%,hsl(160,50%,70%) #{progress}%,rgba(0,0,0,.1) #{progress}%)"

    if progress == 100
      li.firstChild.classList.remove "fa-play"
      li.firstChild.classList.add "fa-check"

    a = document.createElement "a"
    a.href = t.link
    a.target = "_blank"
    a.title = @app.translator.get("View tutorial source code")

    code = document.createElement "i"
    code.classList.add "fas"
    code.classList.add "fa-file-code"
    a.appendChild code
    li.appendChild a

    a.addEventListener "click",(event)=>
      event.stopPropagation()

    li

  startTutorial:(t)->
    tuto = new Tutorial(t.link.replace("https://microstudio.dev",location.origin))
    tuto.load ()=>
      @app.tutorial.start(tuto)
