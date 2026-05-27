const mongoose = require('mongoose');
const { Schema } = mongoose;

const projectSchema = new Schema(
  {
    // Owner reference — every auth check compares this to req.user._id
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A project must belong to a user'],
    },
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
