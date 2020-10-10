const { Schema, model } = require("mongoose");

const solution = new Schema({
  date: String,
  title: String,
  vote: String,
  pathToDocument: String,
  step: Number,
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  processId: {
    type: String,
    required: true,
  },
});

module.exports = model("Solution", solution);
