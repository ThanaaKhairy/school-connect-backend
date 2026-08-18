const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Class name is required'],
      trim: true,
      minlength: [2, 'Class name must be at least 2 characters'],
      maxlength: [50, 'Class name must be at most 50 characters']
    },

    teachers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",

      }
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Class", classSchema);