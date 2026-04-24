const User = require('../models/User');

/**
 * POST /api/users/sync
 * Called after Firebase Phone OTP is verified on the client.
 * Creates a MongoDB record if first login, or returns existing user.
 * Body: { name, phone }
 * Headers: Authorization: Bearer <firebase_id_token>
 */
const syncUser = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const { uid, phone_number } = req.firebaseUser;

    // Use phone from Firebase token (authoritative) or body
    const resolvedPhone = phone_number?.replace('+91', '') || phone;

    if (!resolvedPhone) {
      return res.status(400).json({ success: false, message: 'Phone number missing' });
    }

    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      // First time login — create user
      user = await User.create({
        firebaseUid: uid,
        name: name || 'Farmer',
        phone: resolvedPhone,
        lastLogin: new Date(),
      });
    } else {
      // Update last login
      user.lastLogin = new Date();
      if (name && user.name === 'Farmer') user.name = name;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: user.isProfileComplete ? 'Welcome back!' : 'Please complete your profile',
      user: {
        id: user._id,
        firebaseUid: user.firebaseUid,
        name: user.name,
        phone: user.phone,
        isProfileComplete: user.isProfileComplete,
        farmerProfile: user.farmerProfile,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('syncUser error:', error);
    res.status(500).json({ success: false, message: 'Server error during sync' });
  }
};

/**
 * GET /api/users/me
 * Returns current user profile
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.firebaseUser.uid });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found. Please sync first.' });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * PUT /api/users/profile
 * Update farmer profile fields
 * Body: { cropType, landArea, soilType, district, pincode, state, irrigationType, farmingExperience, preferredLanguage }
 */
const updateProfile = async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.firebaseUser.uid });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const {
      name,
      cropType,
      landArea,
      soilType,
      district,
      pincode,
      state,
      irrigationType,
      farmingExperience,
      preferredLanguage,
    } = req.body;

    if (name) user.name = name;

    // Update farmer profile fields
    user.farmerProfile = {
      ...user.farmerProfile.toObject(),
      ...(cropType && { cropType }),
      ...(landArea && { landArea }),
      ...(soilType && { soilType }),
      ...(district !== undefined && { district }),
      ...(pincode !== undefined && { pincode }),
      ...(state !== undefined && { state }),
      ...(irrigationType && { irrigationType }),
      ...(farmingExperience !== undefined && { farmingExperience }),
      ...(preferredLanguage && { preferredLanguage }),
    };

    user.isProfileComplete = user.checkProfileComplete();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        isProfileComplete: user.isProfileComplete,
        farmerProfile: user.farmerProfile,
      },
    });
  } catch (error) {
    console.error('updateProfile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { syncUser, getMe, updateProfile };
