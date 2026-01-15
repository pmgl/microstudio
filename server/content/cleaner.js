this.Cleaner = class Cleaner {
  constructor(content) {
    this.content = content;
    this.start();
  }

  start() {
    this.stop();
    this.users = Object.keys(this.content.users);
    this.index = 0;
    this.guest_limit = Date.now() - 60 * 24 * 3600 * 1000;
    this.user_limit = Date.now() - 545 * 24 * 3600 * 1000;
    this.deleted = 0;
    this.deleted_projects = 0;
    this.deleted_users = 0;
    this.interval = setInterval((() => {
      return this.processOne();
    }), 1000);
    return console.info("USER LIMIT: " + this.user_limit);
  }

  stop() {
    if (this.interval != null) {
      return clearInterval(this.interval);
    }
  }

  deleteGuest(user) {
    if ((user != null) && user.flags.guest) {
      console.info(`Deleting guest user ${user.id} - ${user.nick} last active: ` + new Date(user.last_active).toString());
      return user.delete();
    }
  }

  deleteUser(user) {
    if ((user != null) && !user.flags.validated && user.last_active < this.user_limit) {
      console.info(`Deleting inactive, unvalidated user ${user.id} - ${user.nick} last active: ` + new Date(user.last_active).toString());
      return user.delete();
    }
  }

  processOne() {
    var err, has_public, key, project, user, userid;
    while (this.index < this.users.length) {
      userid = this.users[this.index++];
      if (userid != null) {
        user = this.content.users[userid];
        if ((user != null) && user.flags.guest) {
          if (user.last_active < this.guest_limit) {
            try {
              this.deleted += 1;
              this.deleted_projects += Object.keys(user.projects).length;
              this.deleteGuest(user);
            } catch (error) {
              err = error;
              console.error(err);
            }
            break;
          }
        } else if (user != null) {
          if (user.last_active < this.user_limit && !user.flags.validated) {
            
            //console.info "user abandoned: " + user.nick
            has_public = false;
            for (key in user.projects) {
              project = user.projects[key];
              if (project.public) {
                has_public = true;
              }
            }
            if (!has_public) {
              try {
                this.deleted_users += 1;
                this.deleted_projects += Object.keys(user.projects).length;
                this.deleteUser(user);
                console.info("inactive, unvalidated user deleted: " + user.nick);
              } catch (error) {
                err = error;
                console.error(err);
              }
              break;
            }
          }
        }
      }
    }
    if (this.index >= this.users.length) {
      this.stop();
      console.info("Deleted guests: " + this.deleted);
      console.info("Deleted projects: " + this.deleted_projects);
      return console.info("Deleted inactive, unvalidated users: " + this.deleted_users);
    }
  }

};

module.exports = this.Cleaner;
