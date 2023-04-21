this.UserSettings = class UserSettings {
  constructor(app) {
    var checkDeleteButton;
    this.app = app;
    document.getElementById("resend-validation-email").addEventListener("click", () => {
      return this.resendValidationEMail();
    });
    //document.getElementById("change-password").addEventListener "click",()=>@changePassword()
    document.getElementById("subscribe-newsletter").addEventListener("change", () => {
      return this.newsletterChange();
    });
    document.getElementById("experimental-features").addEventListener("change", () => {
      return this.experimentalChange();
    });
    document.getElementById("usersetting-email").addEventListener("input", () => {
      return this.emailChange();
    });
    document.getElementById("open-translation-app").addEventListener("click", () => {
      return this.openTranslationApp();
    });
    document.getElementById("translation-app-back-button").addEventListener("click", () => {
      return this.closeTranslationApp();
    });
    if (window.ms_standalone) {
      this.hideChangePassword();
    } else {
      document.getElementById("usersetting-change-password").addEventListener("click", () => {
        return this.changePasswordClick();
      });
      document.getElementById("usersetting-password-new2").addEventListener("keyup", (event) => {
        if (event.keyCode === 13) {
          return this.changePasswordClick();
        }
      });
      document.getElementById("show-account-deletion").addEventListener("click", () => {
        var e;
        e = document.getElementById("delete-account-form");
        if (e.style.display !== "block") {
          e.style.display = "block";
          return document.getElementById("delete-account").scrollIntoView();
        } else {
          return e.style.display = "none";
        }
      });
      document.getElementById("delete-account-button").addEventListener("click", () => {
        return this.deleteAccount();
      });
      checkDeleteButton = () => {
        if (document.getElementById("delete-account-confirm").value === "DELETE MY ACCOUNT" && document.getElementById("delete-account-password").value.length > 0) {
          return document.getElementById("delete-account-button").classList.add("enabled");
        } else {
          return document.getElementById("delete-account-button").classList.remove("enabled");
        }
      };
      document.getElementById("delete-account-confirm").addEventListener("keyup", checkDeleteButton);
      document.getElementById("delete-account-password").addEventListener("keyup", checkDeleteButton);
    }
    this.nick_validator = new InputValidator(document.getElementById("usersetting-nick"), document.getElementById("usersetting-nick-button"), document.getElementById("usersetting-nick-error"), (value) => {
      var nick;
      nick = value[0];
      return this.app.client.sendRequest({
        name: "change_nick",
        nick: nick
      }, (msg) => {
        if (msg.name === "error" && (msg.value != null)) {
          this.nick_validator.reset();
          return this.nick_validator.showError(this.app.translator.get(msg.value));
        } else {
          this.nick_validator.set(nick);
          this.app.user.nick = nick;
          document.getElementById("user-nick").innerText = nick;
          return this.nickUpdated();
        }
      });
    });
    this.nick_validator.regex = RegexLib.nick;
    this.email_validator = new InputValidator(document.getElementById("usersetting-email"), document.getElementById("usersetting-email-button"), document.getElementById("usersetting-email-error"), (value) => {
      var email;
      email = value[0];
      return this.app.client.sendRequest({
        name: "change_email",
        email: email
      }, (msg) => {
        if (msg.name === "error" && (msg.value != null)) {
          this.email_validator.reset();
          return this.email_validator.showError(this.app.translator.get(msg.value));
        } else {
          this.email_validator.set(email);
          return this.app.user.email = email;
        }
      });
    });
    this.email_validator.regex = RegexLib.email;
    this.sections = ["settings", "profile", "progress"];
    this.initSections();
    document.getElementById("usersettings-profile").addEventListener("dragover", (event) => {
      event.preventDefault();
      return document.querySelector("#usersettings-profile-image .fa-user-circle").classList.add("dragover");
    });
    //console.info event
    document.getElementById("usersettings-profile").addEventListener("dragleave", (event) => {
      event.preventDefault();
      return document.querySelector("#usersettings-profile-image .fa-user-circle").classList.remove("dragover");
    });
    //console.info event
    document.getElementById("usersettings-profile").addEventListener("drop", (event) => {
      var err, file, i, j, len, list, ref;
      event.preventDefault();
      document.querySelector("#usersettings-profile-image .fa-user-circle").classList.remove("dragover");
      try {
        list = [];
        ref = event.dataTransfer.items;
        for (j = 0, len = ref.length; j < len; j++) {
          i = ref[j];
          list.push(i.getAsFile());
        }
        if (list.length > 0) {
          file = list[0];
          return this.profileImageDropped(file);
        }
      } catch (error) {
        err = error;
        return console.error(err);
      }
    });
    document.querySelector("#usersettings-profile-image").addEventListener("click", () => {
      var input;
      input = document.createElement("input");
      input.type = "file";
      input.addEventListener("change", (event) => {
        var f, files;
        files = event.target.files;
        if (files.length >= 1) {
          f = files[0];
          return this.profileImageDropped(f);
        }
      });
      return input.click();
    });
    document.querySelector("#usersettings-profile .fa-times-circle").addEventListener("click", () => {
      return this.removeProfileImage();
    });
    document.getElementById("usersettings-profile-description").addEventListener("input", () => {
      return this.profileDescriptionChanged();
    });
    if (window.ms_standalone) {
      document.getElementById("usersettings-menu-profile").style.display = "none";
    }
  }

  initSections() {
    var j, len, ref, results, s;
    ref = this.sections;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      s = ref[j];
      results.push(((s) => {
        return document.getElementById(`usersettings-menu-${s}`).addEventListener("click", () => {
          switch (s) {
            case "settings":
              return this.app.openUserSettings();
            case "profile":
              return this.app.openUserProfile();
            case "progress":
              return this.app.openUserProgress();
          }
        });
      })(s));
    }
    return results;
  }

  isSectionAllowed(section) {
    if (this.app.user.flags.guest) {
      return section === "progress";
    } else if (window.ms_standalone) {
      return section === "progress";
    } else {
      return true;
    }
  }

  setSection(section) {
    var j, len, ref, s;
    if (!this.isSectionAllowed(section)) {
      section = "progress";
    }
    this.current = section;
    ref = this.sections;
    for (j = 0, len = ref.length; j < len; j++) {
      s = ref[j];
      if (s === section) {
        document.getElementById(`usersettings-menu-${s}`).classList.add("selected");
        document.getElementById(`usersettings-${s}`).style.display = "block";
      } else {
        document.getElementById(`usersettings-menu-${s}`).classList.remove("selected");
        document.getElementById(`usersettings-${s}`).style.display = "none";
      }
    }
    if (this.current === "progress") {
      this.app.user_progress.update();
      this.app.user_progress.updateStatsPage();
    }
    this.resetChangePassword();
  }

  update() {
    var account_type, div, icon, key, ref, span, translator, value;
    if (this.app.user.flags.guest) {
      this.hideChangePassword();
      document.getElementById("usersettings-menu-settings").style.display = "none";
      document.getElementById("usersettings-menu-profile").style.display = "none";
    }
    document.getElementById("subscribe-newsletter").checked = this.app.user.flags["newsletter"] === true;
    document.getElementById("experimental-features").checked = this.app.user.flags["experimental"] === true;
    document.getElementById("experimental-features-setting").style.display = this.app.user.flags.validated ? "block" : "none";
    if (this.app.user.flags["validated"] === true) {
      document.getElementById("email-not-validated").style.display = "none";
    } else {
      document.getElementById("email-not-validated").style.display = "block";
    }
    this.nick_validator.set(this.app.user.nick);
    this.email_validator.set(this.app.user.email);
    translator = false;
    ref = this.app.user.flags;
    for (key in ref) {
      value = ref[key];
      if (key.startsWith("translator_") && value) {
        translator = true;
      }
    }
    document.getElementById("open-translation-app").style.display = translator ? "inline-block" : "none";
    this.nickUpdated();
    account_type = "Standard";
    if (this.app.user.flags.guest) {
      account_type = this.app.translator.get("Guest");
    } else {
      account_type = this.app.getTierName(this.app.user.flags.tier);
    }
    if (this.app.user.flags.tier) {
      icon = new Image;
      icon.src = location.origin + `/microstudio/patreon/badges/sprites/${this.app.user.flags.tier}.png`;
      icon.classList.add("pixelated");
      icon.style = "width: 32px; height: 32px; vertical-align: middle ; margin-right: 5px";
      div = document.getElementById("usersettings-account-type");
      div.innerHTML = "";
      div.appendChild(icon);
      span = document.createElement("span");
      span.innerText = account_type;
      div.appendChild(span);
    } else {
      document.getElementById("usersettings-account-type").innerText = account_type;
    }
    this.updateStorage();
    this.updateProfileImage();
    document.getElementById("usersettings-profile-description").value = this.app.user.info.description;
    this.resetChangePassword();
    if (!window.ms_standalone) {
      if (!this.app.user.flags.guest) {
        return document.getElementById("delete-account").style.display = "block";
      }
    }
  }

  updateStorage() {
    var percent, str;
    percent = Math.floor(this.app.user.info.size / this.app.user.info.max_storage * 100);
    str = this.app.translator.get("[STORAGE] used of [MAX_STORAGE] ([PERCENT] %)");
    str = str.replace("[STORAGE]", this.app.appui.displayByteSize(this.app.user.info.size));
    str = str.replace("[MAX_STORAGE]", this.app.appui.displayByteSize(this.app.user.info.max_storage));
    str = str.replace("[PERCENT]", percent);
    return document.getElementById("usersettings-storage").innerText = str;
  }

  nickUpdated() {
    document.getElementById("user-public-page").href = location.origin.replace(".dev", ".io") + `/${this.app.user.nick}/`;
    return document.getElementById("user-public-page").innerHTML = location.host.replace(".dev", ".io") + `/${this.app.user.nick} <i class='fa fa-external-link-alt'></i>`;
  }

  resendValidationEMail() {
    return this.app.client.sendRequest({
      name: "send_validation_mail"
    }, function(msg) {
      document.getElementById("resend-validation-email").style.display = "none";
      return document.getElementById("validation-email-resent").style.display = "block";
    });
  }

  changePassword() {}

  newsletterChange() {
    var checked;
    checked = document.getElementById("subscribe-newsletter").checked;
    this.app.user.flags.newsletter = checked;
    return this.app.client.sendRequest({
      name: "change_newsletter",
      newsletter: checked
    });
  }

  experimentalChange() {
    var checked;
    checked = document.getElementById("experimental-features").checked;
    this.app.user.flags.experimental = checked;
    return this.app.client.sendRequest({
      name: "change_experimental",
      experimental: checked
    });
  }

  nickChange() {}

  emailChange() {}

  openTranslationApp() {
    document.getElementById("usersettings").style.display = "none";
    document.getElementById("translation-app").style.display = "block";
    if (this.translation_app != null) {
      return this.translation_app.update();
    } else {
      return this.translation_app = new TranslationApp(this.app);
    }
  }

  closeTranslationApp() {
    document.getElementById("usersettings").style.display = "block";
    return document.getElementById("translation-app").style.display = "none";
  }

  profileImageDropped(file) {
    var img, reader;
    reader = new FileReader();
    img = new Image;
    reader.addEventListener("load", () => {
      return img.src = reader.result;
    });
    reader.readAsDataURL(file);
    //url = "data:application/javascript;base64,"+btoa(Audio.processor)
    return img.onload = () => {
      var canvas, context, h, r, w;
      if (img.complete && img.width > 0 && img.height > 0) {
        canvas = document.createElement("canvas");
        canvas.width = 128;
        canvas.height = 128;
        context = canvas.getContext("2d");
        if (img.width < 128 && img.height < 128) {
          context.imageSmoothingEnabled = false;
        }
        w = img.width;
        h = img.height;
        r = Math.max(128 / w, 128 / h);
        w *= r;
        h *= r;
        context.drawImage(img, 64 - w / 2, 64 - h / 2, w, h);
        document.querySelector("#usersettings-profile-image img").src = canvas.toDataURL();
        document.querySelector("#usersettings-profile-image img").style.display = "block";
        return this.app.client.sendRequest({
          name: "set_user_profile",
          image: canvas.toDataURL().split(",")[1]
        }, () => {
          this.app.user.flags.profile_image = true;
          return this.updateProfileImage();
        });
      }
    };
  }

  removeProfileImage() {
    return this.app.client.sendRequest({
      name: "set_user_profile",
      image: 0
    }, (msg) => {
      this.app.user.flags.profile_image = false;
      document.querySelector("#usersettings-profile-image img").style.display = "none";
      document.querySelector("#usersettings-profile-image img").src = "";
      return this.updateProfileImage();
    });
  }

  profileDescriptionChanged() {
    if (this.description_timeout != null) {
      clearTimeout(this.description_timeout);
    }
    return this.description_timeout = setTimeout((() => {
      return this.saveProfileDescription();
    }), 2000);
  }

  saveProfileDescription() {
    return this.app.client.sendRequest({
      name: "set_user_profile",
      description: document.getElementById("usersettings-profile-description").value
    }, (msg) => {});
  }

  updateProfileImage() {
    if (this.app.user.flags.profile_image) {
      document.querySelector("#login-info img").style.display = "inline-block";
      document.querySelector("#login-info img").src = `/${this.app.user.nick}.png?v=${Date.now()}`;
      document.querySelector("#login-info i").style.display = "none";
      document.querySelector("#usersettings-profile-image img").src = `/${this.app.user.nick}.png?v=${Date.now()}`;
      document.querySelector("#usersettings-profile-image img").style.display = "block";
      return document.querySelector("#usersettings-profile-image .fa-times-circle").style.display = "block";
    } else {
      document.querySelector("#login-info img").style.display = "none";
      document.querySelector("#login-info i").style.display = "inline-block";
      return document.querySelector("#usersettings-profile-image .fa-times-circle").style.display = "none";
    }
  }

  resetChangePassword() {
    return this.setChangePasswordOpen(false);
  }

  setChangePasswordOpen(open) {
    var view;
    view = document.getElementById("usersetting-change-password-view");
    if (open) {
      view.style.height = "260px";
    } else {
      view.style.height = "0px";
    }
    document.getElementById("usersetting-password-current").value = "";
    document.getElementById("usersetting-password-new1").value = "";
    document.getElementById("usersetting-password-new2").value = "";
    return document.getElementById("usersetting-password-error").innerText = "";
  }

  changePasswordClick() {
    var current, open, pw1, pw2, view;
    view = document.getElementById("usersetting-change-password-view");
    open = view.getBoundingClientRect().height > 0;
    if (open) {
      current = document.getElementById("usersetting-password-current");
      pw1 = document.getElementById("usersetting-password-new1");
      pw2 = document.getElementById("usersetting-password-new2");
      if (current.value.length > 0 && pw1.value.length > 0 && pw2.value.length > 0) {
        if (pw1.value === pw2.value) {
          return this.app.client.sendRequest({
            name: "change_password",
            current: current.value,
            new: pw1.value
          }, (msg) => {
            console.info(msg);
            if (msg.name === "error") {
              return document.getElementById("usersetting-password-error").innerText = this.app.translator.get("Wrong Password");
            } else {
              this.resetChangePassword();
              return this.app.appui.showNotification(this.app.translator.get("You have changed your password!"));
            }
          });
        } else {
          return document.getElementById("usersetting-password-error").innerText = this.app.translator.get("Passwords do not match");
        }
      } else {
        return this.resetChangePassword();
      }
    } else {
      return this.setChangePasswordOpen(true);
    }
  }

  hideChangePassword() {
    return document.getElementById("usersetting-change-password").style.display = "none";
  }

  deleteAccount() {
    var password, text;
    if (!document.getElementById("delete-account-button").classList.contains("enabled")) {
      return;
    }
    text = document.getElementById("delete-account-confirm").value;
    password = document.getElementById("delete-account-password").value;
    if (text === "DELETE MY ACCOUNT") {
      console.info(text);
      return this.app.client.sendRequest({
        name: "delete_account",
        confirm: text,
        password: password
      }, (msg) => {
        console.info(msg);
        if (msg.name === "error") {
          return document.getElementById("delete-account-error").innerText = this.app.translator.get(msg.error);
        } else {
          document.getElementById("delete-account-error").innerText = this.app.translator.get("Account Deleted Successfully. You will be redirected.");
          return setTimeout((() => {
            return window.location.href = "/";
          }), 4000);
        }
      });
    }
  }

};
