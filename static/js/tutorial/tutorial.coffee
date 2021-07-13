class @Tutorial
  constructor:(@link,@back_to_tutorials=true)->
    @title = ""

  load:(callback,error)->
    req = new XMLHttpRequest()
    req.onreadystatechange = (event) =>
      if req.readyState == XMLHttpRequest.DONE
        if req.status == 200
          @update(req.responseText,callback)
        else if req.status >= 400
          if error? then error(req.status)

    req.open "GET",@link
    req.send()

  update:(doc,callback)->
    element = document.createElement("div")
    element.innerHTML = DOMPurify.sanitize marked doc

    @steps = []

    if element.hasChildNodes()
      alist = element.getElementsByTagName "a"
      if alist and alist.length>0
        for a in alist
          a.target = "_blank"

      for e in element.childNodes
        switch e.tagName
          when "H1"
            @title = e.innerText

          when "H2"
            step =
              title: e.innerText
              content: []

            @steps.push(step)

          else
            if step?
              if e.tagName == "P" and e.textContent.startsWith ":"
                line = e.textContent
                line = line.substring(1,line.length)
                s = line.split(" ")
                switch s[0]
                  when "highlight"
                    s.splice(0,1)
                    step.highlight = s.join(" ").trim()
                  when "navigate"
                    s.splice(0,1)
                    step.navigate = s.join(" ").trim()
                  when "position"
                    s.splice(0,1)
                    step.position = s.join(" ").trim()
                  when "overlay"
                    step.overlay = true
                  when "auto"
                    s.splice(0,1)
                    step.auto = s.join(" ").trim() or true
              else
                if e.tagName == "PRE"
                  text = e.firstChild.textContent
                  button = document.createElement "div"
                  button.classList.add "copy-button"
                  button.innerText = app.translator.get "Copy"

                  e.appendChild button

                  do (text,button)=>
                    button.addEventListener "click",()=>
                      console.info text
                      navigator.clipboard.writeText text
                      button.innerText = app.translator.get "Copied!"
                      button.classList.add "copied"
                      # navigator.permissions.query({name: "clipboard-write"}).then (result)=>
                      #   if result.state == "granted"
                      #     navigator.clipboard.writeText(text).then ()=>
                      #       button.innerText = app.translator.get "Copied!"
                      #       button.classList.add "copied"
                      #       console.info "copied"

                step.content.push e

            else if e.tagName == "P" and e.textContent.startsWith ":"
              line = e.textContent
              line = line.substring(1,line.length)
              s = line.split(" ")
              if s.splice(0,1)[0] == "project"
                @project_title = s.join(" ")

    console.info @steps
    callback() if callback?
