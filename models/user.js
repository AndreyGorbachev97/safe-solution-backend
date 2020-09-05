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
      title: String,
      vote: String,
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
  console.log("process");
  this.processes.items = [
    ...this.processes.items,
    {
      title: process.title,
      stages: process.stages,
      state: process.state,
      processId: process._id,
    },
  ];
  return this.save();
};

userSchema.methods.addToSolutions = function (solution) {
  console.log("solution", solution);
  this.solutions = [...this.solutions, solution];
  return this.save();
};

module.exports = model("User", userSchema);
