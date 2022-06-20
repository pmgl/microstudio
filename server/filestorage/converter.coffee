class @Converter
  constructor:(@hashedstorage)->
    @filestorage = @hashedstorage.filestorage
    @folders = ["music","sounds","sprites","ms"]

  start:(@content)->
    list = []
    for key,project of @content.projects
      for f in @folders
        list.push
          project: project
          folder: f

    funk = ()=>
      if list.length>0
        job = list.splice(0,1)[0]
        p = job.project
        folder = job.folder
        if not p.deleted
          @filestorage.list "#{p.owner.id}/#{p.id}/#{folder}",(list)=>
            if list?
              f = ()=>
                if list.length > 0
                  file = list.splice(0,1)[0]
                  file = "#{p.owner.id}/#{p.id}/#{folder}/#{file}"
                  console.info "converting file: #{file}"
                  @filestorage.read file,"binary",(content)=>
                    if content?
                      @hashedstorage.write file,content,()=>
                        @filestorage.delete file,()=>
                          f()
                    else
                      f()
                else
                  funk()

              f()
            else
              funk()
        else
          funk()

    funk()

module.exports = @Converter
