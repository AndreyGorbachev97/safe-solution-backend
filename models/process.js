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
  pathToDocument: {
    type: String,
    require: true,
  },
  pathToSheet: {
    type: String,
    require: true,
  },
  stages: [
    {
      percentageVotes: {
        type: Number,
        required: true,
      },
      status: {
        type: String,
        required: true,
      },
      participant: {
        type: Array,
        required: true,
      }
    },
  ],
  state: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  currentStep: {
    type: Number,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

process.methods.addVote = function (payload) {
  const indexParticipant = this.stages[payload.step].participant.findIndex(
    (el) => el.email === payload.email
  );
  this.stages[payload.step].participant[indexParticipant] = {
    email: payload.email,
    vote: payload.vote,
    comment: payload.comment,
  };
  return this.save();
};

module.exports = model("Process", process);
