class @ProjectFolder
  constructor:(@parent,@name)->
    @subfolders = []
    @files = []
    @open = false

  push:(item,path=item.name)->
    folders = path.split("-")
    if folders.length>1
      f = folders.splice(0,1)[0]
      fold = @getSubFolder(f)
      if not fold then fold = @createSubFolder f
      fold.push(item,folders.join("-"))
    else
      @files.push item
      item.parent = @

    item

  # add:(file,path)->
  #   if not path?
  #     path = file.name.split["-"]
  #
  #   if file instanceof ProjectFolder
  #     @subfolders.push file
  #   else
  #     @files.push file

  getSubFolder:(name)->
    for f in @subfolders
      if name == f.name
        return f
    null

  isAncestorOf:(f)->
    return true if @subfolders.indexOf(f)>=0
    if f.parent?
      return @isAncestorOf(f.parent)
    else
      return false

  getAllFiles:()->
    list = []
    list = list.concat @files
    for f in @subfolders
      list = list.concat f.getAllFiles()
    list

  createSubFolder:(name)->
    f = new ProjectFolder @,name
    @subfolders.push f
    f

  containsFiles:()->
    if @files.length>0
      return true
    else
      for f in @subfolders
        return true if f.containsFiles()
    false

  delete:()->
    if @parent?
      @parent.removeFolder @
    if @element? and @element.parentNode?
      @element.parentNode.removeChild @element

  addFolder:(f)->
    if f.parent?
      f.parent.removeFolder(f)
    @subfolders.push f
    f.parent = @

  removeFolder:(f)->
    index = @subfolders.indexOf f
    if index>=0
      @subfolders.splice index,1

  createEmptyFolder:()->
    count = 1
    name = "folder"
    while @getSubFolder(name)?
      count += 1
      name = "folder#{count}"
    f = new ProjectFolder @,name
    @subfolders.push f
    f

  getFullDashPath:()->
    if @parent? and @parent.parent?
      @parent.getFullDashPath()+"-"+@name
    else
      @name

  removeNoMatch:(list)->
    for f in @subfolders
      f.removeNoMatch(list)
    for i in [@files.length-1..0] by -1
      f = @files[i]
      if list.indexOf(f.filename)<0
        @files.splice(i,1)
    return

  removeEmptyFolders:()->
    for i in [@subfolders.length-1..0] by -1
      f = @subfolders[i]
      f.removeEmptyFolders()
      if f.subfolders.length == 0 and f.files.length == 0 and not f.protected
        @subfolders.splice(i,1)
    return

  sort:()->
    for f in @subfolders
      f.sort()
    @subfolders.sort (a,b)->if a.name<b.name then -1 else 1
    @files.sort (a,b)->if a.shortname<b.shortname then -1 else 1

  setElement:(@element)->
    @setOpen @open

  setOpen:(@open)->
    if @element?
      if @open
        @element.classList.add "open"
      else
        @element.classList.remove "open"

  find:()->

  remove:()->
