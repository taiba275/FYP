import mongoose from 'mongoose';

const educationSchema = new mongoose.Schema({
  level: {
    type: String,
    required: [true, 'Education level is required']
  },
  field: {
    type: String,
    required: [true, 'Education field is required']
  }
}, { _id: false });

const User = mongoose.models.User || mongoose.model('User',
  new mongoose.Schema({
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: props => `${props.value} is not a valid email!`
      }
    },
    password: {
     type: String,
     required: function () {
       return this.provider === "local";
     },
     minlength: [6, 'Password must be at least 6 characters long']
    },
    fullname: {
      type: String,
      required: [false, 'Full name is required']  // Make fullname optional at signup
    },
    dob: {
      type: Date,
      required: [false, 'Date of birth is required']  // Make dob optional at signup
    },
    gender: {
      type: String,
      required: [false, 'Gender is required']  // Make gender optional at signup
    },
    phone: {
      type: String,
      required: [false, 'Phone number is required']  // Make phone optional at signup
    },
    photo: {
      type: String,
      required: false
    },
    provider: {
      type: String,
      enum: ["local", "google", "facebook"],
      default: "local"
    },
    education: {
      type: [educationSchema],
      required: [false, 'At least one education entry is required']  // Make education optional at signup
    },
    status: {
      type: String,
      required: [false, 'Current status is required']  // Make status optional at signup
    },
    location: {
      type: String,
      required: [false, 'City is required']  // Make location optional at signup
    },
    address: {
      type: String,
      required: [false, 'Address is required']  // Make address optional at signup
    },
    salary: {
      type: String,
      required: [false, 'Salary range is required']  // Make salary optional at signup
    },
    interest: {
      type: String,
      required: [false, 'Interest field is required']  // Make interest optional at signup
    },
    skills: {
      type: String,
      required: [false, 'Skills are required']  // Make skills optional at signup
    },
    linkedin: {
      type: String // optional
    },
    // photo: {
    //   type: String // optional (profile image filename or URL)
    // },
    otp: {
      type: String
    },
    otpExpires: {
      type: Date
    },
    resetToken: {
      type: String,
    },
    resetExpires: {
      type: Date,
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    favoriteJobs: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job'
    }]
  }, { timestamps: true })
);

export default User;
