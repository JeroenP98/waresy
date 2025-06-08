import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserSchema } from "../models/userModel.js";
import { ApiResponse } from "../util/apiResponse.js";
import dotenv from "dotenv";

dotenv.config();
const User = mongoose.model("User", UserSchema);

// Middleware to check if the user is logged in
export const loginRequired = (req, res, next) => {
    if (req.user) {
        next();
    } else {
        return ApiResponse.error(res, "Unauthorized", 401);
    }
}

// Function to register a new user
export const registerUser = async (req, res) => {
    try {
        const newUser = new User(req.body);
        newUser.hashPassword = bcrypt.hashSync(req.body.password, 10);
        const user = await newUser.save();
        return ApiResponse.success(res, "User successfully registered", {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
        }, 201);
    } catch (e) {
        return ApiResponse.error(res, "Error registering user: " + e.message, 400);
    }
}

// Function to log in a user
export const loginUser = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        // Handle user not found
        if (!user) {
            return ApiResponse.error(res, "User not found", 404);
        }

        // Handle password mismatch
        const isMatch = await user.comparePassword(req.body.password, user.hashPassword);
        if (!isMatch) {
            return ApiResponse.error(res, "Invalid password", 401);
        }

        // All good, return token
        const token = jwt.sign(
            { email: user.email, _id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        return ApiResponse.success(res, "User successfully logged in", { token }, 200);

    } catch (err) {
        return ApiResponse.error(res, err.message || "Login failed", 400);
    }
};

// Middleware to check if the user is an admin
export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        return next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admins only.'
        });
    }
}

// Function to get the current user's profile
export const getUserByEmail = async (req, res) => {
    try {
        const requestedEmail = req.query.email;

        if (!requestedEmail) {
            return ApiResponse.error(res, 'Email is required in query parameters', 400);
        }

        // Ensure user is only accessing their own data
        if (!req.user || req.user.email !== requestedEmail) {
            return ApiResponse.error(res, 'Access denied: You can only access your own profile', 403);
        }

        const user = await User.findOne({ email: requestedEmail }).select('-hashPassword');

        if (!user) {
            return ApiResponse.error(res, 'User not found', 404);
        }

        return ApiResponse.success(res, 'User profile retrieved', user);
    } catch (err) {
        return ApiResponse.error(res, 'Failed to retrieve user: ' + (err.message || err));
    }
};

// Function to get all users (Admin only)
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-hashPassword');
        return ApiResponse.success(res, 'Users retrieved successfully', users);
    } catch (err) {
        return ApiResponse.error(res, 'Failed to retrieve users: ' + (err.message || err));
    }
};

export const updateUser = async (req, res) => {
    const targetEmail = req.params.email;

    // Only allow users to update themselves, or admins
    const isSelf = req.user && req.user.email === targetEmail;
    const isAdmin = req.user && req.user.role === 'Admin';

    if (!isSelf && !isAdmin) {
        return ApiResponse.error(res, 'Access denied: You can only update your own profile', 403);
    }

    const updateData = { ...req.body };

    // If a non-admin tries to change their role — block it
    if (!isAdmin && updateData.role && updateData.role !== 'User') {
        return ApiResponse.error(res, 'You are not allowed to change your role', 403);
    }

    // If password is provided, hash it
    if (updateData.password) {
        updateData.hashPassword = bcrypt.hashSync(updateData.password, 10);
        delete updateData.password;
    }

    try {
        const updatedUser = await User.findOneAndUpdate(
            { email: targetEmail },
            updateData,
            { new: true, runValidators: true, context: 'query' }
        ).select('-hashPassword');

        if (!updatedUser) {
            return ApiResponse.error(res, 'User not found', 404);
        }

        return ApiResponse.success(res, 'User successfully updated', updatedUser);
    } catch (err) {
        return ApiResponse.error(res, 'Failed to update user: ' + (err.message || err));
    }
};

export const deleteUser = async (req, res) => {
    try {
        const user = await User.findOneAndDelete({ email: req.params.email });

        if (!user) {
            return ApiResponse.error(res, 'User not found', 404);
        }

        return ApiResponse.success(res, 'User successfully deleted', {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
        });
    } catch (err) {
        return ApiResponse.error(res, 'Failed to delete user: ' + (err.message || err));
    }
};
