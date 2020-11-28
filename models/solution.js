const { Schema, model } = require("mongoose");

const solution = new Schema({
  date: String,
  dateVote: String,
  title: String,
  vote: String,
  pathToDocument: String,
  step: Number,
  author: {
    name: String,
    surname: String,
    id: String,
  },
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
