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
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

process.methods.addVote = function (payload) {
  console.log("stages", this.stages[payload.step]);
  const indexParticipant = this.stages[payload.step].participant.findIndex(
    (el) => el.email === payload.email
  );
  console.log(indexParticipant);
  this.stages[payload.step].participant[indexParticipant] = {
    email: payload.email,
    vote: payload.vote,
    comment: payload.comment,
  };
  // console.log(this.stages[payload.step].participant[indexParticipant]);
  console.log(this.stages);
  return this.save();
};

module.exports = model("Process", process);
