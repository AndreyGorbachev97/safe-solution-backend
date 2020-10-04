const { Schema, model } = require("mongoose");

const entitySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  members: [
    {
      email: {
        type: String,
        required: true,
      },
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    },
  ],
});

entitySchema.methods.addToMember = function (user) {
  console.log("user", user.email);
  this.members = [...this.members, { email: user.email, userId: user._id }];
  return this.save();
};

module.exports = model("Entity", entitySchema);
