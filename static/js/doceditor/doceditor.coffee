class @DocEditor
  constructor:(@app)->
    @editor = ace.edit "doc-editor"
    @editor.$blockScrolling = Infinity
    @editor.setTheme("ace/theme/tomorrow_night_bright")
    @editor.getSession().setMode("ace/mode/markdown")
    @editor.setFontSize("14px")
    @editor.session.setOptions
      tabSize: 2
      useSoftTabs: true

    @save_delay = 3000
    @save_time = 0
    setInterval (()=>@checkSave()),@save_delay/2

    @editor.getSession().on "change",()=>
      @editorContentsChanged()

    document.getElementById("doceditor-start-tutorial").addEventListener "click",()=>
      p = @app.project
      if p.public
        url = location.origin+"/tutorial/#{p.owner.nick}/#{p.slug}/"
      else
        url = location.origin+"/tutorial/#{p.owner.nick}/#{p.slug}/#{p.code}/"

      window.open url,"_blank"

  editorContentsChanged:()->
    src = @editor.getValue()
    e = document.getElementById("doc-render")
    e.innerHTML = DOMPurify.sanitize marked src
    list = e.getElementsByTagName "a"
    for el in list
      el.target = "_blank"

    return if @ignore_changes
    @app.project.addPendingChange @
    @save_time = Date.now()
    @checkTutorial()

  checkSave:(immediate,callback)->
    if @save_time>0 and (immediate or Date.now()>@save_time+@save_delay)
      @saveDoc(callback)
      @save_time = 0

  forceSave:(callback)->
    @checkSave true,callback

  saveDoc:(callback)->
    saved = false
    @app.client.sendRequest {
      name: "write_project_file"
      project: @app.project.id
      file: "doc/doc.md"
      content: @editor.getValue()
    },(msg)=>
      saved = true
      @app.project.removePendingChange(@) if @save_time == 0
      callback() if callback?

    setTimeout (()=>
      if not saved
       @save_time = Date.now()
       console.info("retrying doc save...")
      ),10000

  setDoc:(doc)->
    @ignore_changes = true
    @editor.setValue(doc,-1)
    @ignore_changes = false
    @checkTutorial()

  checkTutorial:()->
    if @app.project? and @app.project.type == "tutorial"
      document.getElementById("doceditor-start-tutorial").style.display = "block"
    else
      document.getElementById("doceditor-start-tutorial").style.display = "none"
