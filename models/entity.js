const { Schema, model } = require("mongoose");

const entitySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  members: [
    {
      name: {
        type: String,
        required: true,
      },
      surname: {
        type: String,
        required: true,
      },
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
  this.members = [...this.members, { 
    name: user.name,
    surname: user.surname,
    email: user.email,
    userId: user._id,
  }];
  return this.save();
};

module.exports = model("Entity", entitySchema);
