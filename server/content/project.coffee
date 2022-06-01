Comments = require __dirname+"/comments.js"

fs = require "fs"


class ProjectLink
  constructor:(@project,data)->
    @user = @project.content.users[data.user]
    @accepted = data.accepted
    if @user?
      @user.addProjectLink @

  accept:()->
    if not @accepted
      @accepted = true
      @project.saveUsers()

  remove:()->
    @project.removeUser @
    @user.removeLink @project.id

class @Project
  constructor:(@content,@record)->
    data = @record.get()
    @deleted = data.deleted
    if @deleted
      if data.slug?
        @record.set
          deleted: true

    if not @deleted
      @id = data.id
      @title = data.title
      @slug = data.slug
      @code = data.code or @createCode()
      @tags = data.tags or []
      @description = data.description or ""
      @likes = 0
      @public = data.public
      @unlisted = data.unlisted
      @date_created = data.date_created
      @last_modified = data.last_modified
      @first_published = data.first_published or 0
      @orientation = data.orientation or "any"
      @aspect = data.aspect or "free"
      @graphics = data.graphics or "M1"
      @language = data.language or "microscript_v1_i"
      @platforms = data.platforms or ["computer","phone","tablet"]
      @controls = data.controls or ["touch","mouse"]
      @libs = data.libs or []
      @tabs = data.tabs
      @plugins = data.plugins
      @libraries = data.libraries
      @type = data.type or "app"
      @users = []
      @comments = new Comments @,data.comments
      if not @deleted
        @owner = @content.users[data.owner]
        if @owner?
          @owner.addProject @

        if data.users?
          for u in data.users
            link = new ProjectLink @,u
            if link.user?
              @users.push link

      if data.files? and not @deleted
        @files = data.files
      else
        @files = {}

      @update_project_size = true

  createCode:()->
    letters = "ABCDEFGHJKMNPRSTUVWXYZ23456789"
    code = ""
    for i in [0..7] by 1
      code += ""+letters.charAt(Math.floor(Math.random()*letters.length))
    @set("code",code)
    code

  touch:()->
    @last_modified = Date.now()
    data = @record.get()
    data.last_modified = @last_modified
    @record.set data

  set:(prop,value,update_local=true)->
    data = @record.get()
    data[prop] = value
    @record.set(data)
    @[prop] = value if update_local

  setTitle:(title)->
    if title? and title.trim().length>0 and title.length<50
      @set "title",title
      true
    else
      false

  setSlug:(slug)->
    if slug? and /^([a-z0-9_][a-z0-9_-]{0,29})$/.test(slug)
      return false if @owner.findProjectBySlug(slug)?
      @set "slug",slug
      true
    else
      false

  setCode:(code)->
    if code? and /^([a-zA-Z0-9_][a-zA-Z0-9_-]{0,29})$/.test(code)
      @set "code",code
      true
    else
      false

  setType:(type)->
    @set "type",type

  setOrientation:(orientation)->
    @set "orientation",orientation

  setAspect:(aspect)->
    @set "aspect",aspect

  setGraphics:(graphics)->
    @set "graphics",graphics

  saveUsers:()->
    data = []
    for link in @users
      data.push
        user: link.user.id
        accepted: link.accepted

    @set "users",data,false

  inviteUser:(user)->
    return if user == @owner
    for link in @users
      return if user == link.user
    link = new ProjectLink @,
      user: user.id
      accepted: false
    if link.user?
      @users.push link
      @saveUsers()

  removeUser:(link)->
    index = @users.indexOf link
    if index>=0
      @users.splice index,1
      @saveUsers()

  listUsers:()->
    list = []
    for link in @users
      list.push
        id: link.user.id
        nick: link.user.nick
        accepted: link.accepted
    list

  delete:()->
    @deleted = true
    @record.set
      deleted: true
    @content.projectDeleted @
    for i in [@users.length-1..0] by -1
      link = @users[i]
      link.remove()
    delete @manager

    folder = "#{@owner.id}/#{@id}"
    @content.files.deleteFolder folder

    return

  getFileInfo:(file)->
    @files[file] || {}

  setFileInfo:(file,key,value)->
    info = @getFileInfo(file)
    info[key] = value
    @files[file] = info
    @set "files",@files
    @update_project_size = true

  deleteFileInfo:(file)->
    delete @files[file]
    @set "files",@files
    @update_project_size = true

  getSize:()->
    if @update_project_size
      @updateProjectSize()

    @byte_size

  updateProjectSize:()->
    @byte_size = 0
    @update_project_size = false
    for key,file of @files
      if file.size?
        @byte_size += file.size
    return

  filenameChanged:(previous,next)->
    if @files[previous]?
      @files[next] = @files[previous]
      delete @files[previous]
      @set "files",@files

  fileDeleted:(file)->
    if @files[file]
      delete @files[file]
      @set "files",@files



  updateFileSizes:(callback)->
    source = "../files/"+@content.files.sanitize "#{@owner.id}/#{@id}/ms"
    sprites = "../files/"+@content.files.sanitize "#{@owner.id}/#{@id}/sprites"
    maps = "../files/"+@content.files.sanitize "#{@owner.id}/#{@id}/maps"

    list = []

    process = ()=>
      if list.length>0
        f = list.splice(0,1)[0]
        file = "../files/"+@content.files.sanitize "#{@owner.id}/#{@id}/#{f}"
        fs.lstat file,(err,stat)=>
          if stat? and stat.size?
            @setFileInfo f,"size",stat.size
          setTimeout (()=>process()),0
      else
        callback() if callback?

    fs.readdir source,(err,files)=>
      if files
        for f in files
          list.push "ms/#{f}"
      fs.readdir sprites,(err,files)=>
        if files
          for f in files
            list.push "sprites/#{f}"
        fs.readdir maps,(err,files)=>
          if files
            for f in files
              list.push "maps/#{f}"
          process()


module.exports = @Project
