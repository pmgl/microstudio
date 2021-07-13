class @TranslationApp
  constructor:(@app)->
    @update()
    @edits = {}
    @last_edit = 0
    setInterval (()=>@check()),100

  update:()->
    for key,value of @app.user.flags
      if key.startsWith("translator_") and value
        @lang = key.split("_")[1]

    @app.client.sendRequest {
      name: "get_translation_list"
    },(msg)=>
      @list = msg.list
      @refresh()

    @app.client.sendRequest {
      name: "get_language"
      language: @lang
    },(msg)=>
      @language = JSON.parse msg.language
      @refresh()

  refresh:()->
    if @list? and @language?
      document.getElementById("translation-app-contents").innerHTML = ""
      for text of @list
        @add(text,@language[text])

    return

  add:(text,translation)->
    div = document.createElement "div"
    i1 = document.createElement "input"
    i1.value = text
    i1.readOnly = true
    div.appendChild i1
    i2 = document.createElement "input"
    i2.value = translation or ""
    div.appendChild i2
    i2.addEventListener "input",()=>
      trans = i2.value
      @edits[text] = trans
      @last_edit = Date.now()

    document.getElementById("translation-app-contents").appendChild div

  check:()->
    if @last_edit>0 and Date.now()>@last_edit+2000
      @last_edit = 0
      for key,value of @edits
        delete @edits[key]
        @app.client.sendRequest
          name: "set_translation"
          language: @lang
          source: key
          translation: value
    return
