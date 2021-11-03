fs = require "fs"

class @Translator
  constructor:(@content)->
    @languages = {}
    @list = {}
    @load()

  load:()->
    languages = @content.db.list("translations")
    for record in languages
      @loadLanguage record

  loadLanguage:(record)->
    language = new Translator.Language @,record
    @languages[language.code] = language

  get:(language,text)->
    @reference text
    t = @languages[language]
    if t?
      t.get(text)
    else
      text

  reference:(text)->
    @list[text] = true if not @list[text]

  createLanguage:(lang)->
    if not @languages[lang]
      d =
        code: lang
        translations: {}

      record = @content.db.create "translations",d
      @loadLanguage record

  getTranslator:(language)->
    language = language or "en"
    { get:(text)=> @get(language,text) }

class @Translator.Language
  constructor:(@translator,@record)->
    data = @record.get()
    @code = data.code
    @translations = data.translations
    @buffer = null
    @default = {}

    console.info "reading "+"../static/lang/#{@code}.json"
    fs.readFile "../static/lang/#{@code}.json",(err,data)=>
      if not err
        try
          @default = JSON.parse(data)
        catch err
          console.error err

  get:(text)->
    t = @translations[text]
    if t?
      t.best
    else if @default[text]
      @default[text]
    else
      text

  export:()->
    if not @buffer?
      @buffer = {}
      for key,value of @translations
        @buffer[key] = value.best

      for key,value of @default
        if not @buffer[key]?
          @buffer[key] = value

      @buffer = JSON.stringify @buffer

    @buffer

  updateBest:(trans)->
    best = 0
    for id,u of trans.list
      best = Math.max(best,u.votes)
    for id,u of trans.list
      if u.votes == best
        trans.best = u.trans
        return
    return

  set:(userid,source,trans)->
    @updated = true
    t = @translations[source]
    if not t?
      t =
        best: trans
        list: {}
      t.list[userid] =
        trans: trans
        votes: 1

      @translations[source] = t
      @record.setField("translations",@translations)
      @buffer = null
      return
    else
      if t.list[userid]?
        u = t.list[userid]
        if trans != u.trans
          u.trans = trans
          @updateBest(t)
          @buffer = null
          @record.setField("translations",@translations)
      else
        t.list[userid] =
          trans: trans
          votes: 1
        @updateBest(t)
        @buffer = null
        @record.setField("translations",@translations)

module.exports = @Translator
