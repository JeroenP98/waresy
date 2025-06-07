import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserSchema } from "../models/userModel.js";
import { ApiResponse } from "../models/apiResponse.js";
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

    User.findOne({email: req.body.email})
        .then((user) => {
            // If user not found, return error
            if (!user.comparePassword(req.body.password, user.hashPassword)) {
                // If password does not match, return error
                return ApiResponse.error(res, "Invalid password", 401);
            } else {
                // If user found and password matches, generate JWT token
                return ApiResponse.success(res, "User successfully logged in", {
                    token: jwt.sign({ email: user.email, _id: user._id, role: user.role }, process.env.JWT_SECRET)
                }, 200);
            }
        })
        .catch((err) => {
            return ApiResponse.error(res, err.message || "Error occurred", 400);
        })

}

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

    // Only allow users to update themselves, or allow admins
    if (!req.user || (req.user.email !== targetEmail && req.user.role !== 'Admin')) {
        return ApiResponse.error(res, 'Access denied: You can only update your own profile', 403);
    }

    try {
        const updateData = { ...req.body };

        // If the password is being updated, hash it
        if (updateData.password) {
            updateData.hashPassword = bcrypt.hashSync(updateData.password, 10);
            delete updateData.password;
        }

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