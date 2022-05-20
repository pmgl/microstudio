@RegexLib =
  email: /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,25}|[0-9]{1,3})(\]?)$/
  nick: /^[a-zA-Z0-9_]{5,30}$/
  filename: /^[a-z0-9_]{1,30}$/
  slug: /^[a-zA-Z0-9_]{1,30}$/
  csscolor:/^(#[0-9A-Fa-f]{3,6})|(hsl\(\d+,\d+%,\d+%\))|(rgb\(\d+,\d+,\d+\))$/

  slugify: (text)->
    text.normalize('NFD').replace(/[^a-zA-Z0-9_]/g, "").toLowerCase()

  fixFilename:(text)->
    text.normalize('NFD').replace(/[^a-zA-Z0-9_]/g, "").toLowerCase()

  fixFilePath:(text)->
    while text.startsWith "/"
      text = text.substring(1)

    while text.endsWith "/"
      text = text.substring(0,text.length-1)

    t = text.split("/")
    for s,i in t
      t[i] = RegexLib.fixFilename s
    t.join("/")

  fixNick:(text)->
    text.normalize('NFD').replace(/[^a-zA-Z0-9_]/g, "")


if module?
  module.exports = @RegexLib
