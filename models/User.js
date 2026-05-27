const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { Schema } = mongoose;

// Supports local (email + password) and GitHub OAuth auth.
// A user can have both if they link accounts — email is the common key.
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
    },
    // Required for both local and GitHub users; enforced unique at DB level
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Local auth only — store the bcrypt hash, never plaintext
    password: {
      type: String,
    },
    // GitHub OAuth ID — sparse so uniqueness only applies to docs that have it
    githubId: {
      type: String,
      unique: true,
      sparse: true,
    },
    displayName: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Only hash if password was set or changed (GitHub users have no password)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
