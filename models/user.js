const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    require: true,
  },
  name: String,
  surname: String,
  password: {
    type: String,
    required: true,
  },
  colleagues: [
    {
      user: {
        type: Object,
        email: String,
        name: String,
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
  console.log(process);
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
  // const clonedTasks = [...this.tasks.items];
  // if (
  //   !this.processes.items.find(
  //     (item) => item.processId.toString() === task.id.toString()
  //   )
  // ) {
  //   clonedTasks.push({
  //     decision: decision,
  //     processId: task._id,
  //   });
  //   this.processes = { items: clonedTasks };
  //   return this.save();
  // }
};

module.exports = model("User", userSchema);
