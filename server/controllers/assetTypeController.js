import mongoose from 'mongoose';
import { AssetTypeSchema } from '../models/assetType.js';
import {ApiResponse as apiResponse} from "../util/apiResponse.js";
import {AssetSchema} from "../models/assetModel.js";

const AssetType = mongoose.model('AssetType', AssetTypeSchema);
const Asset = mongoose.model('Assets', AssetSchema);

export const createAssetType = async (req, res) => {
    try {
        const newAssetType = new AssetType(req.body);
        const assetType = await newAssetType.save();
        return apiResponse.success(res, 'Asset type successfully created', assetType, 201);
    } catch (err) {
        return apiResponse.error(res, 'Failed to create asset type: ' + (err.message || err), 400);
    }
}

export const getAssetTypes = async (req, res) => {
    try {
        const assetTypes = await AssetType.find({});
        return apiResponse.success(res, 'Asset types retrieved successfully', assetTypes);
    } catch (err) {
        return apiResponse.error(res, 'Failed to retrieve asset types: ' + (err.message || err), 400);
    }
}

export const getAssetTypeById = async (req, res) => {
    try {
        const assetType = await AssetType.findById(req.params.assetTypeId);
        if (!assetType) {
            return res.status(404).json({
                success: false,
                message: 'Asset type not found'
            });
        }
        return apiResponse.success(res, 'Asset type retrieved successfully', assetType);
    } catch (err) {
        return apiResponse.error(res, 'Failed to retrieve asset type: ' + (err.message || err), 400);
    }
}

export const updateAssetType = async (req, res) => {
    try {
        const updatedAssetType = await AssetType.findByIdAndUpdate(
            req.params.assetTypeId,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedAssetType) {
            return res.status(404).json({
                success: false,
                message: 'Asset type not found'
            });
        }

        // Update all assets that embed this asset type (match by ID)
        await Asset.updateMany(
            { 'assetType.assetTypeID': updatedAssetType._id },
            {
                $set: {
                    'assetType.name': updatedAssetType.name
                }
            }
        );

        return res.status(200).json({
            success: true,
            message: 'Asset type successfully updated',
            data: updatedAssetType
        });

    } catch (e) {
        return apiResponse.error(res, 'Failed to update asset type: ' + (e.message || e), 400);
    }
}

export const deleteAssetType = async (req, res) => {
    try {
        const assetTypeId = req.params.assetTypeId;

        // Check if any asset is using this type
        const assetsUsingType = await Asset.findOne({ 'assetType.assetTypeID': assetTypeId });
        if (assetsUsingType) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete asset type: still in use by one or more assets'
            });
        }

        // Attempt to delete asset type
        const assetType = await AssetType.findByIdAndDelete(assetTypeId);
        if (!assetType) {
            return res.status(404).json({
                success: false,
                message: 'Asset type not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Asset type successfully deleted'
        });
    } catch (err) {
        return apiResponse.error(res, 'Failed to delete asset type: ' + (err.message || err), 400);
    }
}
