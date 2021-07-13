this.Token = (function() {
  function Token(content, record) {
    var data;
    this.content = content;
    this.record = record;
    data = this.record.get();
    this.id = data.id;
    this.value = data.value;
    this.date_created = data.date_created;
    this.user = this.content.users[data.user];
  }

  return Token;

})();

module.exports = this.Token;
