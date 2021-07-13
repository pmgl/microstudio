this.RegexLib = {
  email: /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,25}|[0-9]{1,3})(\]?)$/,
  nick: /^[a-zA-Z0-9_]{5,30}$/,
  filename: /^[a-z0-9_]{1,30}$/,
  slug: /^[a-zA-Z0-9_]{1,30}$/,
  csscolor: /^(#[0-9A-Fa-f]{3,6})|(hsl\(\d+,\d+%,\d+%\))|(rgb\(\d+,\d+,\d+\))$/,
  slugify: function(text) {
    return text.normalize('NFD').replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();
  },
  fixFilename: function(text) {
    return text.normalize('NFD').replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();
  },
  fixNick: function(text) {
    return text.normalize('NFD').replace(/[^a-zA-Z0-9_]/g, "");
  }
};

if (typeof module !== "undefined" && module !== null) {
  module.exports = this.RegexLib;
}
