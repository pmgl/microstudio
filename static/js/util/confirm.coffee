@ConfirmDialog =
  confirm:(message,ok,cancel,callback,dismiss)->
    if not ConfirmDialog.window?
      ConfirmDialog.window = new ConfirmDialogWindow

    ConfirmDialog.window.show(message,ok,cancel,callback,dismiss)

class @ConfirmDialogWindow
  constructor:()->
    @overlay = document.getElementById "confirm-message-overlay"
    @text = document.getElementById "confirm-message-text"
    @ok = document.getElementById "confirm-message-ok"
    @cancel = document.getElementById "confirm-message-cancel"

    @ok.addEventListener "click",()=>@okPressed()
    @cancel.addEventListener "click",()=>@cancelPressed()

  show:(message,ok,cancel,@callback,@dismiss)->
    @text.innerHTML = message
    @ok.innerText = ok
    @cancel.innerText = cancel
    @overlay.style.display = "block"

  okPressed:()->
    @overlay.style.display = "none"
    if @callback?
      @callback()
      @callback = null

  cancelPressed:()->
    @overlay.style.display = "none"
    if @dismiss?
      @dismiss()
      @dismiss = null
