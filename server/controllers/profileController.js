const User = require('../models/User');
const Report = require('../models/Report');

/**
 * @desc    Get user profile & statistics
 * @route   GET /api/profile
 * @access  Private
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Aggregate stats from reports
    const reportCount = await Report.countDocuments({ user: user._id });
    const aggregate = await Report.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: null,
          avgOverall: { $avg: '$overallScore' },
          avgAccuracy: { $avg: '$accuracy' },
          avgFluency: { $avg: '$fluency' },
          avgClarity: { $avg: '$clarity' },
        },
      },
    ]);

    const stats = {
      totalReports: reportCount,
      averageScore: aggregate.length > 0 ? Math.round(aggregate[0].avgOverall) : 0,
      averageAccuracy: aggregate.length > 0 ? Math.round(aggregate[0].avgAccuracy) : 0,
      averageFluency: aggregate.length > 0 ? Math.round(aggregate[0].avgFluency) : 0,
      averageClarity: aggregate.length > 0 ? Math.round(aggregate[0].avgClarity) : 0,
    };

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      stats,
    });
  } catch (error) {
    console.error('Get profile error:', error.message);
    res.status(500).json({ message: 'Server error retrieving profile' });
  }
};

/**
 * @desc    Update user profile details
 * @route   PUT /api/profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, email } = req.body;

    // Check if email already in use by someone else
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email is already in use by another account' });
      }
      user.email = email;
    }

    if (name) {
      user.name = name;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
    });
  } catch (error) {
    console.error('Update profile error:', error.message);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/profile/password
 * @access  Private
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Find user by ID and explicitly select password field
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid current password' });
    }

    // Set and save new password (which triggers pre-save hash hook)
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error.message);
    res.status(500).json({ message: 'Server error updating password' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
};
