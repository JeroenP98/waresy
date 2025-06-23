import mongoose from 'mongoose'
import { AssetSchema } from "../models/assetModel.js";
import { ApiResponse } from "../util/apiResponse.js";
import {AssetTypeSchema} from "../models/assetType.js";

const Asset = mongoose.model('Assets', AssetSchema);
const AssetType = mongoose.model('AssetType', AssetTypeSchema);

export const addNewAsset = async (req, res) => {
    try {
        const { assetType } = req.body;

        const existingType = await AssetType.findById(assetType.assetTypeID);
        if (!existingType) {
            return ApiResponse.error(res, 'Asset type not found', 404);
        }

        const newAsset = new Asset(req.body);
        const asset = await newAsset.save();
        return ApiResponse.success(res, 'Asset successfully created', asset, 201);
    } catch (err) {
        return err.message.includes('E11000') ?
            ApiResponse.error(res, 'Asset with this serial number already exists', 400) :
            ApiResponse.error(res, 'Failed to create asset: ' + (err.message || err), 400);

    }
}

export const getAssets = async (req, res) => {
    try {
        let assets = await Asset.find({});
        return ApiResponse.success(res, 'Asset(s) successfully found', assets);
    } catch (e) {
        return ApiResponse.error(res, 'Failed to retrieve assets: ' + (e.message || e), 400);
    }
}

export const getAssetById = async (req, res) => {
    try {
        const asset = await Asset.findById(req.params.assetId);
        if (!asset) {
            return ApiResponse.error(res, 'Asset not found', 404);
        }
        return ApiResponse.success(res, 'Asset successfully retrieved', asset);
    } catch (err) {
        return ApiResponse.error(res, 'Failed to retrieve asset: ' + (err.message || err), 400);
    }
}

export const updateAsset = async (req, res) => {
    try {
        const asset = await Asset.findByIdAndUpdate(req.params.assetId, req.body, { new: true });
        if (!asset) {
            return ApiResponse.error(res, 'Asset not found', 404);
        }
        return ApiResponse.success(res, 'Asset successfully updated', asset);
    } catch (err) {
        return ApiResponse.error(res, 'Failed to update asset: ' + (err.message || err), 400);
    }
}

export const deleteAsset = async (req, res) => {
    try {
        const asset = await Asset.findByIdAndDelete(req.params.assetId);
        if (!asset) {
            return ApiResponse.error(res, 'Asset not found', 404);
        }
        return ApiResponse.success(res, 'Asset successfully deleted', asset);
    } catch (err) {
        return ApiResponse.error(res, 'Failed to delete asset: ' + (err.message || err), 400);
    }
}
