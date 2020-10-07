const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  name: String,
  surname: String,
  password: {
    type: String,
    required: true,
  },
  entity: String,
  colleagues: [
    {
      user: {
        type: Object,
        email: String,
        name: String,
      },
    },
  ],
});

module.exports = model("User", userSchema);
