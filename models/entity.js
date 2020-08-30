const { Schema, model } = require("mongoose");

const entitySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  members: {
    type: Array,
    required: true,
  },
});

entitySchema.methods.addToMember = function (user) {
  console.log("user", user.email);
  this.members = [...this.members, user.email];
  return this.save();
};

module.exports = model("Entity", entitySchema);
