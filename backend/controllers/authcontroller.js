const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const generateToken = require("../utils/generateToken");

// Register API
const register = async (req, res) => {
  try {
    const { name, email, password, role, city, website, description, skills, bio } = req.body;

    if (role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin registration is not allowed",
      });
    }

    // Duplicate email validation
    const existinguser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existinguser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedpassword = await bcrypt.hash(password, 10);

    // Creating user
    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password: hashedpassword,
      role,
      city,
      website,
      description,
      skills,
      bio,
      status: role === "organization" ? "pending" : "approved",
    });

    const token = generateToken(user._id, user.role);

    // For not showing hashed password
    user.password = undefined;

    // User creation response
    res.status(201).json({
      success: true,
      message: "User created successfully",
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Login API
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email?.toLowerCase()?.trim() });

    // Verification of email and password
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const ismatch = await bcrypt.compare(password, user.password);
    if (!ismatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.role === "organization" && user.status === "rejected") {
      return res.status(403).json({
        success: false,
        message: "Your organization account has been rejected by the admin",
      });
    }

    const token = generateToken(user._id, user.role);

    user.password = undefined;

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { role } = req.user;
    const { profileImage, bio, skills, city, website, description } = req.body;

    let updateFields = {};

    if (role === "volunteer") {
      updateFields.profileImage = profileImage;
      updateFields.bio = bio;
      updateFields.city = city;
      if (skills !== undefined) {
        if (typeof skills === "string") {
          updateFields.skills = skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        } else if (Array.isArray(skills)) {
          updateFields.skills = skills.map((s) => s.trim()).filter(Boolean);
        }
      }
    } else if (role === "organization") {
      updateFields.profileImage = profileImage;
      updateFields.website = website;
      updateFields.description = description;
      updateFields.city = city;
    } else {
      updateFields.profileImage = profileImage;
      updateFields.city = city;
    }

    // Clean undefined fields
    Object.keys(updateFields).forEach((key) => {
      if (updateFields[key] === undefined) {
        delete updateFields[key];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { register, login, updateProfile };