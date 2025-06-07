import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const Schema = mongoose.Schema;

// UserSchema defines the structure of the user document in MongoDB
export const UserSchema = new Schema({
    firstName: {
        type: String,
        required: 'Enter a first name',
    },
    lastName: {
        type: String,
        required: 'Enter a last name',
    },
    hashPassword: {
        type: String,
        required: 'Enter a password'
    },
    email: {
        type: String,
        required: 'Enter an email address',
        unique: true,
        validate: {
            validator: function(v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: props => `${props.value} is not a valid email address`
        }
    },
    // Role can be 'Admin' or 'User', default is 'User'
    role: {
        type: String,
        enum: ['Admin', 'User'],
        default: 'User'
    },

}, {
    // Timestamps will automatically add createdAt and updatedAt fields
    timestamps: true
});

// Method for comparing password submitted by user with the hashed password stored in the database
UserSchema.methods.comparePassword = async function(password, HashPassword) {
    return bcrypt.compareSync(password, HashPassword);
}