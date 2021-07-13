fs = require "fs"

class @Fonts
  constructor:(@folder="../static/fonts")->
    @fonts = []
    fs.readdir @folder,(err,files)=>
      if err?
        console.error err

      return if not files?
      for f in files
        if f.endsWith(".ttf") and f != "bit_cell.ttf"
          @fonts.push(f.split(".")[0])

      console.info JSON.stringify @fonts

  read:(font,callback)->
    fs.readFile "#{@folder}/#{font}.ttf",(err,data)=>
      callback(data)

module.exports = @Fonts
