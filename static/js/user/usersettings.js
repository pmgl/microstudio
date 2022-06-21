this.UserSettings = (function() {
  function UserSettings(app) {
    this.app = app;
    document.getElementById("resend-validation-email").addEventListener("click", (function(_this) {
      return function() {
        return _this.resendValidationEMail();
      };
    })(this));
    document.getElementById("subscribe-newsletter").addEventListener("change", (function(_this) {
      return function() {
        return _this.newsletterChange();
      };
    })(this));
    document.getElementById("experimental-features").addEventListener("change", (function(_this) {
      return function() {
        return _this.experimentalChange();
      };
    })(this));
    document.getElementById("usersetting-email").addEventListener("input", (function(_this) {
      return function() {
        return _this.emailChange();
      };
    })(this));
    document.getElementById("open-translation-app").addEventListener("click", (function(_this) {
      return function() {
        return _this.openTranslationApp();
      };
    })(this));
    document.getElementById("translation-app-back-button").addEventListener("click", (function(_this) {
      return function() {
        return _this.closeTranslationApp();
      };
    })(this));
    this.nick_validator = new InputValidator(document.getElementById("usersetting-nick"), document.getElementById("usersetting-nick-button"), document.getElementById("usersetting-nick-error"), (function(_this) {
      return function(value) {
        var nick;
        nick = value[0];
        return _this.app.client.sendRequest({
          name: "change_nick",
          nick: nick
        }, function(msg) {
          if (msg.name === "error" && (msg.value != null)) {
            _this.nick_validator.reset();
            return _this.nick_validator.showError(_this.app.translator.get(msg.value));
          } else {
            _this.nick_validator.set(nick);
            _this.app.user.nick = nick;
            document.getElementById("user-nick").innerText = nick;
            return _this.nickUpdated();
          }
        });
      };
    })(this));
    this.nick_validator.regex = RegexLib.nick;
    this.email_validator = new InputValidator(document.getElementById("usersetting-email"), document.getElementById("usersetting-email-button"), document.getElementById("usersetting-email-error"), (function(_this) {
      return function(value) {
        var email;
        email = value[0];
        return _this.app.client.sendRequest({
          name: "change_email",
          email: email
        }, function(msg) {
          if (msg.name === "error" && (msg.value != null)) {
            _this.email_validator.reset();
            return _this.email_validator.showError(_this.app.translator.get(msg.value));
          } else {
            _this.email_validator.set(email);
            return _this.app.user.email = email;
          }
        });
      };
    })(this));
    this.email_validator.regex = RegexLib.email;
    this.sections = ["settings", "profile", "progress"];
    this.initSections();
    document.getElementById("usersettings-profile").addEventListener("dragover", (function(_this) {
      return function(event) {
        event.preventDefault();
        return document.querySelector("#usersettings-profile-image .fa-user-circle").classList.add("dragover");
      };
    })(this));
    document.getElementById("usersettings-profile").addEventListener("dragleave", (function(_this) {
      return function(event) {
        event.preventDefault();
        return document.querySelector("#usersettings-profile-image .fa-user-circle").classList.remove("dragover");
      };
    })(this));
    document.getElementById("usersettings-profile").addEventListener("drop", (function(_this) {
      return function(event) {
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
            return _this.profileImageDropped(file);
          }
        } catch (error) {
          err = error;
          return console.error(err);
        }
      };
    })(this));
    document.querySelector("#usersettings-profile-image").addEventListener("click", (function(_this) {
      return function() {
        var input;
        input = document.createElement("input");
        input.type = "file";
        input.addEventListener("change", function(event) {
          var f, files;
          files = event.target.files;
          if (files.length >= 1) {
            f = files[0];
            return _this.profileImageDropped(f);
          }
        });
        return input.click();
      };
    })(this));
    document.querySelector("#usersettings-profile .fa-times-circle").addEventListener("click", (function(_this) {
      return function() {
        return _this.removeProfileImage();
      };
    })(this));
    document.getElementById("usersettings-profile-description").addEventListener("input", (function(_this) {
      return function() {
        return _this.profileDescriptionChanged();
      };
    })(this));
    if (window.ms_standalone) {
      document.getElementById("usersettings-menu-profile").style.display = "none";
    }
  }

  UserSettings.prototype.initSections = function() {
    var j, len, ref, results, s;
    ref = this.sections;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      s = ref[j];
      results.push((function(_this) {
        return function(s) {
          return document.getElementById("usersettings-menu-" + s).addEventListener("click", function() {
            switch (s) {
              case "settings":
                return _this.app.openUserSettings();
              case "profile":
                return _this.app.openUserProfile();
              case "progress":
                return _this.app.openUserProgress();
            }
          });
        };
      })(this)(s));
    }
    return results;
  };

  UserSettings.prototype.setSection = function(section) {
    var j, len, ref, s;
    this.current = section;
    ref = this.sections;
    for (j = 0, len = ref.length; j < len; j++) {
      s = ref[j];
      if (s === section) {
        document.getElementById("usersettings-menu-" + s).classList.add("selected");
        document.getElementById("usersettings-" + s).style.display = "block";
      } else {
        document.getElementById("usersettings-menu-" + s).classList.remove("selected");
        document.getElementById("usersettings-" + s).style.display = "none";
      }
    }
    if (this.current === "progress") {
      this.app.user_progress.update();
      this.app.user_progress.updateStatsPage();
    }
  };

  UserSettings.prototype.update = function() {
    var account_type, div, icon, key, ref, span, translator, value;
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
      icon.src = location.origin + ("/microstudio/patreon/badges/sprites/" + this.app.user.flags.tier + ".png");
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
    return document.getElementById("usersettings-profile-description").value = this.app.user.info.description;
  };

  UserSettings.prototype.updateStorage = function() {
    var percent, str;
    percent = Math.floor(this.app.user.info.size / this.app.user.info.max_storage * 100);
    str = this.app.translator.get("[STORAGE] used of [MAX_STORAGE] ([PERCENT] %)");
    str = str.replace("[STORAGE]", this.app.appui.displayByteSize(this.app.user.info.size));
    str = str.replace("[MAX_STORAGE]", this.app.appui.displayByteSize(this.app.user.info.max_storage));
    str = str.replace("[PERCENT]", percent);
    return document.getElementById("usersettings-storage").innerText = str;
  };

  UserSettings.prototype.nickUpdated = function() {
    document.getElementById("user-public-page").href = location.origin.replace(".dev", ".io") + ("/" + this.app.user.nick + "/");
    return document.getElementById("user-public-page").innerHTML = location.host.replace(".dev", ".io") + ("/" + this.app.user.nick + " <i class='fa fa-external-link-alt'></i>");
  };

  UserSettings.prototype.resendValidationEMail = function() {
    return this.app.client.sendRequest({
      name: "send_validation_mail"
    }, function(msg) {
      document.getElementById("resend-validation-email").style.display = "none";
      return document.getElementById("validation-email-resent").style.display = "block";
    });
  };

  UserSettings.prototype.changePassword = function() {};

  UserSettings.prototype.newsletterChange = function() {
    var checked;
    checked = document.getElementById("subscribe-newsletter").checked;
    this.app.user.flags.newsletter = checked;
    return this.app.client.sendRequest({
      name: "change_newsletter",
      newsletter: checked
    });
  };

  UserSettings.prototype.experimentalChange = function() {
    var checked;
    checked = document.getElementById("experimental-features").checked;
    this.app.user.flags.experimental = checked;
    return this.app.client.sendRequest({
      name: "change_experimental",
      experimental: checked
    });
  };

  UserSettings.prototype.nickChange = function() {};

  UserSettings.prototype.emailChange = function() {};

  UserSettings.prototype.openTranslationApp = function() {
    document.getElementById("usersettings").style.display = "none";
    document.getElementById("translation-app").style.display = "block";
    if (this.translation_app != null) {
      return this.translation_app.update();
    } else {
      return this.translation_app = new TranslationApp(this.app);
    }
  };

  UserSettings.prototype.closeTranslationApp = function() {
    document.getElementById("usersettings").style.display = "block";
    return document.getElementById("translation-app").style.display = "none";
  };

  UserSettings.prototype.profileImageDropped = function(file) {
    var img, reader;
    reader = new FileReader();
    img = new Image;
    reader.addEventListener("load", (function(_this) {
      return function() {
        return img.src = reader.result;
      };
    })(this));
    reader.readAsDataURL(file);
    return img.onload = (function(_this) {
      return function() {
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
          return _this.app.client.sendRequest({
            name: "set_user_profile",
            image: canvas.toDataURL().split(",")[1]
          }, function() {
            _this.app.user.flags.profile_image = true;
            return _this.updateProfileImage();
          });
        }
      };
    })(this);
  };

  UserSettings.prototype.removeProfileImage = function() {
    return this.app.client.sendRequest({
      name: "set_user_profile",
      image: 0
    }, (function(_this) {
      return function(msg) {
        _this.app.user.flags.profile_image = false;
        document.querySelector("#usersettings-profile-image img").style.display = "none";
        document.querySelector("#usersettings-profile-image img").src = "";
        return _this.updateProfileImage();
      };
    })(this));
  };

  UserSettings.prototype.profileDescriptionChanged = function() {
    if (this.description_timeout != null) {
      clearTimeout(this.description_timeout);
    }
    return this.description_timeout = setTimeout(((function(_this) {
      return function() {
        return _this.saveProfileDescription();
      };
    })(this)), 2000);
  };

  UserSettings.prototype.saveProfileDescription = function() {
    return this.app.client.sendRequest({
      name: "set_user_profile",
      description: document.getElementById("usersettings-profile-description").value
    }, (function(_this) {
      return function(msg) {};
    })(this));
  };

  UserSettings.prototype.updateProfileImage = function() {
    if (this.app.user.flags.profile_image) {
      document.querySelector("#login-info img").style.display = "inline-block";
      document.querySelector("#login-info img").src = "/" + this.app.user.nick + ".png?v=" + (Date.now());
      document.querySelector("#login-info i").style.display = "none";
      document.querySelector("#usersettings-profile-image img").src = "/" + this.app.user.nick + ".png?v=" + (Date.now());
      document.querySelector("#usersettings-profile-image img").style.display = "block";
      return document.querySelector("#usersettings-profile-image .fa-times-circle").style.display = "block";
    } else {
      document.querySelector("#login-info img").style.display = "none";
      document.querySelector("#login-info i").style.display = "inline-block";
      return document.querySelector("#usersettings-profile-image .fa-times-circle").style.display = "none";
    }
  };

  return UserSettings;

})();
