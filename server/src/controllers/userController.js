const User = require('../models/User');

const syncUser = async (req, res) => {
  try {
    const { uid, email } = req.firebaseUser;
    const { name } = req.body;

    console.log("SYNC UID:", uid);

    let user = await User.findOne({
      firebaseUid: uid,
    });

    if (!user) {

      user = new User({
        firebaseUid: uid,
        name: name || "Farmer",
        email: email || "",
        lastLogin: new Date(),
      });

      await user.save();

      console.log("User created");

    } else {

      user.lastLogin = new Date();

      if (!user.email && email) {
        user.email = email;
      }

      await user.save();

      console.log("User updated");
    }

    res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {

    console.error("syncUser error:", error);

    res.status(500).json({
      success: false,
      message: "Server error during sync",
    });
  }
};

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
}
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


