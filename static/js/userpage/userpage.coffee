class UserPage
  constructor:()->
    @sections = ["projects","progress"]
    @initSections()
    @setSection @sections[0]


  initSections:()->
    for s in @sections
      do (s)=>
        document.getElementById("section-#{s}").addEventListener "click",()=>
          @setSection(s)

  setSection:(section)->
    @current = section
    for s in @sections
      if s == section
        document.getElementById("section-#{s}").classList.add "selected"
        document.getElementById(s).style.display = "block"
      else
        document.getElementById("section-#{s}").classList.remove "selected"
        document.getElementById(s).style.display = "none"


window.addEventListener "load",()=>
  new UserPage()
