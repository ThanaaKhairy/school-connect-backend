const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Assignment title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [200, "Title must be at most 200 characters"],
    },

    description: {
      type: String,
      required: [true, "Assignment description is required"],
      trim: true,
      maxlength: [2000, "Description must be at most 2000 characters"],
    },

    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      maxlength: [100, "Subject must be at most 100 characters"],
    },

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Teacher is required"],
    },

    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: [true, "Class is required"],
    },

    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },

    totalMarks: {
      type: Number,
      required: [true, "Total marks is required"],
      min: [1, "Total marks must be at least 1"],
      max: [1000, "Total marks must be at most 1000"],
    },

    status: {
      type: String,
      enum: {
        values: ["active", "closed", "draft"],
        message: "Status must be active, closed, or draft",
      },
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

assignmentSchema.index({ teacher: 1, class: 1 });
assignmentSchema.index({ dueDate: 1 });
assignmentSchema.index({ status: 1 });

module.exports = mongoose.model("Assignment", assignmentSchema);
