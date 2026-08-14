const User = require('../models/user');

// GET pending organizations (status = 'pending' and role = 'organization')
const getpendingorganization = async (req, res) => {
  try {
    const pendingOrgs = await User.find({ role: 'organization', status: 'pending' }).select('-password');
    res.status(200).json({
      success: true,
      pendingOrgs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Approve an organization (set status to 'approved')
const approveorganization = async (req, res) => {
  try {
    const { id } = req.params;
    const org = await User.findByIdAndUpdate(id, { status: 'approved' }, { new: true }).select('-password');
    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }
    res.status(200).json({ success: true, message: 'Organization approved', org });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reject an organization (set status to 'rejected')
const rejectorganization = async (req, res) => {
  try {
    const { id } = req.params;
    const org = await User.findByIdAndUpdate(id, { status: 'rejected' }, { new: true }).select('-password');
    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }
    res.status(200).json({ success: true, message: 'Organization rejected', org });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET dashboard stats for admin
const getadminstats = async (req, res) => {
  try {
    const pendingCount = await User.countDocuments({ role: 'organization', status: 'pending' });
    const totalOrgs = await User.countDocuments({ role: 'organization' });
    const approvedOrgs = await User.countDocuments({ role: 'organization', status: 'approved' });
    const rejectedOrgs = await User.countDocuments({ role: 'organization', status: 'rejected' });
    const totalVolunteers = await User.countDocuments({ role: 'volunteer' });

    res.status(200).json({
      success: true,
      stats: {
        pendingCount,
        totalOrgs,
        approvedOrgs,
        rejectedOrgs,
        totalVolunteers,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET all organizations (for admin to see full list)
const getallorganizations = async (req, res) => {
  try {
    const organizations = await User.find({ role: 'organization' }).select('-password').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      organizations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET all volunteers (for admin tracking)
const getallvolunteers = async (req, res) => {
  try {
    const volunteers = await User.find({ role: 'volunteer' }).select('-password').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: volunteers.length,
      volunteers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getpendingorganization,
  approveorganization,
  rejectorganization,
  getadminstats,
  getallorganizations,
  getallvolunteers,
};