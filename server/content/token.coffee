class @Token
  constructor:(@content,@record)->
    data = @record.get()
    @id = data.id
    @value = data.value
    @date_created = data.date_created
    @user = @content.users[data.user]

module.exports = @Token
