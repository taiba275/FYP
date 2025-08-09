import mongoose from 'mongoose';

const educationSchema = new mongoose.Schema(
  {
    level: { type: String, required: [true, 'Education level is required'] },
    field: { type: String, required: [true, 'Education field is required'] },
  },
  { _id: false }
);

const User =
  mongoose.models.User ||
  mongoose.model(
    'User',
    new mongoose.Schema(
      {
        username: {
          type: String,
          required: [true, 'Username is required'],
          trim: true,
        },
        email: {
          type: String,
          required: [true, 'Email is required'],
          unique: true,
          trim: true,
          lowercase: true,
          validate: {
            validator(v) {
              return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(v);
            },
            message: (props) => `${props.value} is not a valid email!`,
          },
        },
        password: {
          type: String,
          // password is only required for local (email/password) accounts
          required() {
            return (this.provider || 'local') === 'local';
          },
          minlength: [6, 'Password must be at least 6 characters long'],
        },

        fullname: { type: String },
        dob: { type: Date },
        gender: { type: String },
        phone: { type: String },
        photo: { type: String },

        provider: {
          type: String,
          enum: ['local', 'google', 'facebook', 'github'],
          default: 'local',
        },

        education: { type: [educationSchema] },
        status: { type: String },
        location: { type: String },
        address: { type: String },
        salary: { type: String },
        interest: { type: String },
        skills: { type: String },
        linkedin: { type: String },

        // OTP fields
        otp: { type: String },
        otpExpires: { type: Date },

        // NEW: throttle resend endpoints
        lastOtpSentAt: { type: Date },        // for signup/verification codes
        lastLoginOtpSentAt: { type: Date },   // for login codes

        // Password reset
        resetToken: { type: String },
        resetExpires: { type: Date },

        emailVerified: {
          type: Boolean,
          default: false,
        },

        favoriteJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
        jobsPosted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
      },
      { timestamps: true }
    )
  );

export default User;
