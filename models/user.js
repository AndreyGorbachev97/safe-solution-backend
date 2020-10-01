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
  solutions: [
    {
      date: String,
      title: String,
      vote: String,
      pathToDocument: String,
      processId: {
        type: String,
        required: true,
      },
      stage: {
        amount: Number,
        status: String,
        step: Number,
      },
    },
  ],
  processes: [
    {
      type: Schema.Types.ObjectId,
      ref: "Process",
      required: true,
    },
  ],
});

userSchema.methods.addToProcess = function (process) {
  this.processes = [...this.processes, process._id];
  console.log("date", process.date);
  return this.save();
};

userSchema.methods.addToSolutions = function (solution) {
  console.log("solution", solution);
  this.solutions = [...this.solutions, solution];
  return this.save();
};

module.exports = model("User", userSchema);
