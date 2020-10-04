const { Schema, model } = require("mongoose");

const solution = new Schema({
  date: String,
  title: String,
  vote: String,
  pathToDocument: String,
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  processId: {
    type: String,
    required: true,
  },
  stage: {
    amount: Number,
    status: String,
    step: Number,
  },
});

module.exports = model("Solution", solution);
