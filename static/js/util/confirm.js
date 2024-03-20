this.ConfirmDialog = {
  confirm: function(message, ok, cancel, callback, dismiss) {
    if (ConfirmDialog.window == null) {
      ConfirmDialog.window = new ConfirmDialogWindow;
    }
    return ConfirmDialog.window.show(message, ok, cancel, callback, dismiss);
  }
};

this.ConfirmDialogWindow = (function() {
  function ConfirmDialogWindow() {
    this.overlay = document.getElementById("confirm-message-overlay");
    this.text = document.getElementById("confirm-message-text");
    this.ok = document.getElementById("confirm-message-ok");
    this.cancel = document.getElementById("confirm-message-cancel");
    this.ok.addEventListener("click", (function(_this) {
      return function() {
        return _this.okPressed();
      };
    })(this));
    this.cancel.addEventListener("click", (function(_this) {
      return function() {
        return _this.cancelPressed();
      };
    })(this));
  }

  ConfirmDialogWindow.prototype.show = function(message, ok, cancel, callback1, dismiss1) {
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
  };

  ConfirmDialogWindow.prototype.okPressed = function() {
    this.overlay.style.display = "none";
    if (this.callback != null) {
      this.callback();
      return this.callback = null;
    }
  };

  ConfirmDialogWindow.prototype.cancelPressed = function() {
    this.overlay.style.display = "none";
    if (this.dismiss != null) {
      this.dismiss();
      return this.dismiss = null;
    }
  };

  return ConfirmDialogWindow;

})();
