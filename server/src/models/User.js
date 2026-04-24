const mongoose = require('mongoose');

const farmerProfileSchema = new mongoose.Schema({
  cropType: {
    type: String,
    enum: ['rice', 'wheat', 'cotton', 'sugarcane', 'maize', 'groundnut', 'soybean', 'tomato', 'onion', 'other'],
    default: 'rice',
  },
  landArea: {
    value: { type: Number, default: 0 },
    unit: { type: String, enum: ['acres', 'hectares', 'bigha'], default: 'acres' },
  },
  soilType: {
    type: String,
    enum: ['clay', 'sandy', 'loamy', 'silty', 'black', 'red', 'alluvial'],
    default: 'loamy',
  },
  district: { type: String, default: '' },
  pincode: { type: String, default: '' },
  state: { type: String, default: '' },
  irrigationType: {
    type: String,
    enum: ['rainfed', 'canal', 'drip', 'sprinkler', 'borewell'],
    default: 'rainfed',
  },
  farmingExperience: { type: Number, default: 0 },
  preferredLanguage: {
    type: String,
    enum: ['english', 'tamil', 'hindi', 'telugu', 'kannada', 'marathi'],
    default: 'english',
  },
});

const userSchema = new mongoose.Schema(
  {
    // Firebase UID — primary link between Firebase Auth and MongoDB
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
   
    email: {
      type: String,
      sparse: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: ['farmer', 'admin'],
      default: 'farmer',
    },
    farmerProfile: { type: farmerProfileSchema, default: () => ({}) },
    isProfileComplete: { type: Boolean, default: false },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

// Mark profile complete if key fields are filled
userSchema.methods.checkProfileComplete = function () {
  const p = this.farmerProfile;
  return !!(p && p.cropType && p.landArea?.value > 0 && p.soilType && p.district && p.pincode);
};

module.exports = mongoose.model('User', userSchema);
