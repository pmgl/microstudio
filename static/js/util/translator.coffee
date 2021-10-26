class @Translator
  constructor:(@app)->
    @lang = document.children[0].lang
    @language = window.translation
    @incomplete = {}
    if document.cookie? and document.cookie.indexOf("language=")>=0
      index = document.cookie.indexOf("language=")+"language=".length
      @lang = document.cookie.substring(index,index+2)
    #else if navigator.languages? and navigator.languages[0]?
    #  @lang = navigator.languages[0].split("-")[0]

    setInterval (()=>@check()),5000

  load:(callback)->
    return if @language?
    @app.client.sendRequest {
      name: "get_language"
      language: @lang
    },(msg)=>
      try
        @language = JSON.parse msg.language
      catch err
      callback() if callback?

  get:(text)->
    if @language?
      value = @language[text]
      if not value?
        @incomplete[text] = true
        text
      else
        value
    else
      text

  check:()->
    if @app.user? and @app.user.flags? and @app.user.flags.admin
      if not @list_fetched
        @list_fetched = true
        @app.client.sendRequest {
          name: "get_translation_list"
        },(msg)=>
          @list = msg.list

      if @list?
        for text of @incomplete
          if not @list[text]?
            @app.client.sendRequest
              name: "add_translation"
              source: text
            @list[text] = true
    return

  translatorLanguage:()->
    translator = false
    for key,value of @app.user.flags
      if key.startsWith("translator_") and value
        return key.split("-")[1]
    return null
