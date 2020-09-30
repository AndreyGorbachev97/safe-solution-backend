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
  processes: {
    items: [
      {
        date: {
          type: String,
          required: true,
        },
        currentStep: {
          type: Number,
          required: true,
        },
        title: {
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
        pathToDocument: {
          type: String,
          required: true,
        },
        processId: {
          type: Schema.Types.ObjectId,
          ref: "Process",
          required: true,
        },
      },
    ],
  },
});

userSchema.methods.addToProcess = function (process) {
  this.processes.items = [
    ...this.processes.items,
    {
      title: process.title,
      stages: process.stages,
      state: process.state,
      processId: process._id,
      result: process.result,
      date: process.date,
      pathToDocument: process.pathToDocument,
      currentStep: process.currentStep,
    },
  ];
  console.log("date", process.date);
  return this.save();
};

userSchema.methods.addToSolutions = function (solution) {
  console.log("solution", solution);
  this.solutions = [...this.solutions, solution];
  return this.save();
};

module.exports = model("User", userSchema);
