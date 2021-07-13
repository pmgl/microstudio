class @InputValidator
  constructor:(@fields,@button,@error,@callback)->
    @fields = [@fields] if not Array.isArray @fields

    @initial = []
    for f in @fields
      @initial.push f.value
      f.addEventListener "input",()=> @change()
      f.addEventListener "keydown",(event)=>
        if event.key == "Enter"
          @validate()
        else if event.key == "Escape" and @auto_reset
          @reset()

    @button.addEventListener "click",()=>
      @validate()

    @button.style.width = 0
    @error.style.width = 0 if @error?

    @error_timeout = null
    @change_timeout = null
    @accept_initial = false
    @auto_reset = true

  set:(values)->
    values = [values] if not Array.isArray values
    @initial = []
    for f,i in @fields
      @initial.push f.value = values[i]
    return

  reset:()->
    for f,i in @fields
      f.value = @initial[i]
      f.blur()
    @button.style.width = "0px"

  update:()->
    for f,i in @fields
      @initial[i] = f.value
    @button.style.width = "0px"

  check:()->
    return true if not @regex?
    for f in @fields
      return false if not @regex.test(f.value)
    true

  change:()->
    @error.style.width = 0 if @error?
    change = @accept_initial
    for f,i in @fields
      if f.value != @initial[i]
        change = true

    if change and @check()
      @button.style.removeProperty("width")
      clearTimeout @change_timeout if @change_timeout?
      if @auto_reset
        @change_timeout = setTimeout (()=>
          @reset()
          @change_timeout = null
        ),10000
    else
      @button.style.width = "0px"

  cancelChange:()->
    @button.style.width = 0

  showError:(text)->
    return if not @error?
    @error.innerText = text
    @error.style.width = "auto"

    if @error_timeout
      clearTimeout @error_timeout
    @error_timeout = setTimeout (()=>
      @error.style.width = "0"
      @error_timeout = null
      ),5000

  validate:()->
    clearTimeout @change_timeout if @change_timeout?
    @callback(f.value for f in @fields)
    @button.style.width = "0px"
