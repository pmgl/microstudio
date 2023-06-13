this.ConfirmDialog = {
  confirm: function(message, ok, cancel, callback, dismiss) {
    if (ConfirmDialog.window == null) {
      ConfirmDialog.window = new ConfirmDialogWindow;
    }
    return ConfirmDialog.window.show(message, ok, cancel, callback, dismiss);
  }
};

this.ConfirmDialogWindow = class ConfirmDialogWindow {
  constructor() {
    this.overlay = document.getElementById("confirm-message-overlay");
    this.text = document.getElementById("confirm-message-text");
    this.ok = document.getElementById("confirm-message-ok");
    this.cancel = document.getElementById("confirm-message-cancel");
    this.ok.addEventListener("click", () => {
      return this.okPressed();
    });
    this.cancel.addEventListener("click", () => {
      return this.cancelPressed();
    });
  }

  show(message, ok, cancel, callback1, dismiss1) {
    this.callback = callback1;
    this.dismiss = dismiss1;
    if (document.fullscreenElement != null) {
      document.fullscreenElement.appendChild(this.overlay);
    } else {
      document.body.appendChild(this.overlay);
    }
    this.text.innerHTML = message;
    this.ok.innerText = ok;
    this.cancel.innerText = cancel;
    return this.overlay.style.display = "block";
  }

  okPressed() {
    this.overlay.style.display = "none";
    if (this.callback != null) {
      this.callback();
      return this.callback = null;
    }
  }

  cancelPressed() {
    this.overlay.style.display = "none";
    if (this.dismiss != null) {
      this.dismiss();
      return this.dismiss = null;
    }
  }

};
