const { Schema, model } = require("mongoose");

const process = new Schema({
  title: {
    type: String,
    required: true,
  },
  result: { 
    type: String,
    required: true,
  },
  stages: {
    type: Array,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = model("Process", process);
