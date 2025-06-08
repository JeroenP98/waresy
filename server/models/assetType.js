import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export const AssetTypeSchema = new Schema({
    name: {
        type: String,
        required: 'Enter a name for the asset type'
    }
}, {
    timestamps: true
});