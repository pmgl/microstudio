class @ForumSession
  constructor:(@session)->
    @session.register "create_forum_category",(msg)=>@createForumCategory(msg)
    @session.register "edit_forum_category",(msg)=>@editForumCategory(msg)
    @session.register "create_forum_post",(msg)=>@createForumPost(msg)
    @session.register "edit_forum_post",(msg)=>@editForumPost(msg)
    @session.register "create_forum_reply",(msg)=>@createForumReply(msg)
    @session.register "edit_forum_reply",(msg)=>@editForumReply(msg)
    @session.register "get_raw_post",(msg)=>@getRawPost(msg)
    @session.register "get_raw_reply",(msg)=>@getRawReply(msg)
    @session.register "get_my_likes",(msg)=>@getMyLikes(msg)
    @session.register "set_post_like",(msg)=>@setPostLike(msg)
    @session.register "set_reply_like",(msg)=>@setReplyLike(msg)
    @session.register "search_forum",(msg)=>@searchForum(msg)
    @session.register "set_category_watch",(msg)=>@setCategoryWatch(msg)
    @session.register "get_category_watch",(msg)=>@getCategoryWatch(msg)
    @session.register "set_post_watch",(msg)=>@setPostWatch(msg)
    @session.register "get_post_watch",(msg)=>@getPostWatch(msg)

    @forum = @session.server.content.forum
    @server = @session.server

    @MAX_TEXT_LENGTH = 20000
    @MAX_TITLE_LENGTH = 400

  createForumCategory:(data)->
    return if not @session.user?
    return if not @session.user.flags.admin

    return if not data.language
    return if not data.title
    return if not data.slug
    return if not data.description

    cat = @forum.createCategory(data.language,data.title,data.slug,data.description,data.hue,data.permissions)

    @session.send
      name: "create_forum_category"
      request_id: data.request_id
      id: cat.id

  editForumCategory:(data)->
    return if not @session.user?
    return if not @session.user.flags.admin

    return if not data.category?

    category = @forum.category_by_slug[data.category]
    if category?
      if data.deleted?
        category.set "deleted",data.deleted

      if data.hidden?
        category.set "hidden",data.hidden

      if data.description?
        category.set "description",data.description

      if data.title?
        category.set "name",data.title

      if data.hue?
        category.set "hue",data.hue

      if data.permissions?
        category.set "permissions",data.permissions

      @session.send
        name: "edit_forum_category"
        request_id: data.request_id

  createForumPost:(data)->
    return if not @session.user?

    return if not data.category?
    return if not data.title?
    return if not data.text?

    return if data.title.trim().length == 0
    return if data.text.trim().length == 0

    if @session.user? and @session.user.flags.validated and not @session.user.flags.banned and not @session.user.flags.censored
      return if not @server.rate_limiter.accept("create_forum_post",@session.user.id)
      category = @forum.category_by_slug[data.category]
      if category
        if category.permissions.post != "user"
          return if not @session.user.flags.admin

        post = @forum.createPost(category.id,@session.user.id,data.title,data.text)
        @session.send
          name: "create_forum_post"
          request_id: data.request_id
          id: post.id


  editForumPost:(data)->
    return if not @session.user?
    return if not @session.user.flags.validated
    return if not data.post?

    post = @forum.posts[data.post]
    if post?
      return if @session.user != post.author and not @session.user.flags.admin
      if data.text?
        post.edit(data.text)

      if data.title?
        post.setTitle(data.title)

      if data.progress? and @session.user.flags.admin
        post.set "progress",data.progress
        post.updateActivity()

      if data.status? and @session.user.flags.admin
        post.set "status",data.status
        post.updateActivity()

      if data.permissions? and @session.user.flags.admin
        post.set "permissions",data.permissions

      if data.reverse? and @session.user.flags.admin
        post.set "reverse",data.reverse

      if data.deleted?
        post.set "deleted",data.deleted

      if data.category? and @session.user.flags.admin
        cat1 = post.category
        cat2 = @forum.category_by_slug[data.category]
        if cat2?
          post.setCategoryId(cat2.id)
          post.category = cat2
          cat1.removePost(post)
          cat2.addPost(post)

      @session.send
        name: "edit_forum_post"
        request_id: data.request_id
        id: post.id

  createForumReply:(data)->
    return if not @session.user?
    return if not data.post?
    return if not data.text?

    return if data.text.trim().length == 0

    if @session.user? and @session.user.flags.validated and not @session.user.flags.banned and not @session.user.flags.censored
      return if not @server.rate_limiter.accept("create_forum_reply",@session.user.id)

      post = @forum.posts[data.post]
      if post?
        category = post.category
        if category.permissions.reply != "user"
          return if not @session.user.flags.admin

        if post.permissions.reply != "user"
          return if not @session.user.flags.admin

        reply = @forum.createReply(post,@session.user.id,data.text)
        @session.send
          name: "create_forum_reply"
          request_id: data.request_id
          id: reply.id
          index: reply.post.replies.length-1


  editForumReply:(data)->
    return if not @session.user?
    return if not @session.user.flags.validated
    return if not data.reply?

    reply = @forum.replies[data.reply]
    if reply?
      return if reply.author != @session.user and not @session.user.flags.admin

      if data.text?
        reply.edit data.text

      if data.deleted?
        reply.set "deleted",data.deleted

      @session.send
        name: "edit_forum_reply"
        request_id: data.request_id


  getRawPost:(data)->
    return if not @session.user?
    return if not data.post?

    post = @forum.posts[data.post]
    if post?
      return if @session.user != post.author and not @session.user.flags.admin

      @session.send
        name: "get_raw_post"
        request_id: data.request_id
        text: post.text
        progress: post.progress
        status: post.status

  getRawReply:(data)->
    return if not @session.user?
    return if not data.reply?

    reply = @forum.replies[data.reply]
    if reply?
      return if reply.author != @session.user and not @session.user.flags.admin

      @session.send
        name: "get_raw_reply"
        request_id: data.request_id
        text: reply.text

  getMyLikes:(data)->
    return if not @session.user?

    if data.post?
      post = @forum.posts[data.post]
      if post?
        res =
          post: post.isLiked(@session.user.id)
          replies: []

        for r in post.replies
          if r.isLiked(@session.user.id)
            res.replies.push r.id

        @session.send
          name: "get_my_likes"
          request_id: data.request_id
          data: res
    else if data.category?
      category = @forum.category_by_slug[data.category]
      if category?
        res = []
        for post in category.posts
          if post.isLiked(@session.user.id)
            res.push post.id

        @session.send
          name: "get_my_likes"
          request_id: data.request_id
          data: res
    else if data.language?
      list = @forum.listCategories(data.language)
      res = []
      for cat in list
        for post in cat.posts
          if post.isLiked(@session.user.id)
            res.push post.id

      @session.send
        name: "get_my_likes"
        request_id: data.request_id
        data: res

  setPostLike:(data)->
    return if not @session.user?

    if data.post?
      post = @forum.posts[data.post]
      if post?
        if data.like
          post.addLike @session.user.id
        else
          post.removeLike @session.user.id

        @session.send
          name: "set_post_like"
          request_id: data.request_id
          likes: post.likes.length

  setReplyLike:(data)->
    return if not @session.user?

    if data.reply?
      reply = @forum.replies[data.reply]
      if reply?
        if data.like
          reply.addLike @session.user.id
        else
          reply.removeLike @session.user.id

        @session.send
          name: "set_reply_like"
          request_id: data.request_id
          likes: reply.likes.length

  setCategoryWatch:(data)->
    return if not @session.user?
    return if not data.category?

    category = @forum.category_by_slug[data.category]
    if category
      if data.watch
        category.addWatch @session.user.id
      else
        category.removeWatch @session.user.id

      @session.send
        name: "set_category_watch"
        request_id: data.request_id
        watch: data.watch

  setPostWatch:(data)->
    return if not @session.user?
    return if not data.post?

    post = @forum.posts[data.post]
    if post?
      if data.watch
        post.addWatch @session.user.id
      else
        post.removeWatch @session.user.id

      @session.send
        name: "set_post_watch"
        request_id: data.request_id
        watch: data.watch

  getCategoryWatch:(data)->
    return if not @session.user?
    return if not data.category?

    category = @forum.category_by_slug[data.category]
    if category
      @session.send
        name: "get_category_watch"
        request_id: data.request_id
        watch: category.isWatching(@session.user.id)

  getPostWatch:(data)->
    return if not @session.user?
    return if not data.post?

    post = @forum.posts[data.post]
    if post?
      @session.send
        name: "get_post_watch"
        request_id: data.request_id
        watch: post.isWatching(@session.user.id)

  searchForum:(data)->
    return if not data.language?
    return if not data.string?

    return if not @server.rate_limiter.accept("search_forum",@session.socket.remoteAddress)

    index = @forum.indexers[data.language]
    if index?
      res = index.search(data.string)
      list = []
      for r in res
        post = if r.target.post? then r.target.post else r.target
        list.push
          title: post.title
          score: r.score
          id: post.id
          slug: post.slug

      @session.send
        name: "search_forum"
        request_id: data.request_id
        results: list

module.exports = @ForumSession
