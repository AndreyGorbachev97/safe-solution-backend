class Users {
  constructor() {
    this.users = [];
  }

  add(user) {
    this.users.push(user);
  }

  get(id) {
    return this.users.find(user => user.socketId === id);
  }

  remove(id) {
    const user = this.get(id);
    if (user) {
      this.users = this.users.filter(user => user.socketId !== id);
    }

    return user;
  }

  getFull() {
    return this.users;
  }

  getFindId(id) { 
    return this.users.find((user) => user.id.toString() === id);
  }

  getFind(ids) {
    return ids.map((id) => this.users.find((user) => user.id.toString() === id));
  }

  getByRoom(room) {
    return this.users.filter(user => user.room === room);
  }
}

module.exports = function () {
  return new Users();
}