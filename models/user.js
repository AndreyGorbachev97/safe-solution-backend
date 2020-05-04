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
  colleagues: [{
    user: {
      type: Object,
      email: String,
      name: String,
    }
  }],
  processes: {
    items: [
      {
        decision: {
          type: String,
          required: true,
        },
        processId: {
          type: Schema.Types.ObjectId,
          red: "Process",
          required: true,
        },
      },
    ],
  },
});

userSchema.methods.addToTask = function (decision, task) {
  const clonedTasks = [...this.tasks.items];
  if (
    !this.processes.items.find(
      (item) => item.processId.toString() === task.id.toString()
    )
  ) {
    clonedTasks.push({
      decision: decision,
      processId: task._id,
    });
    this.processes = { items: clonedTasks };
    return this.save();
  }
};

module.exports = model("User", userSchema);
