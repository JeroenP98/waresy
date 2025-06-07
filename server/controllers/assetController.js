import mongoose from 'mongoose'
import { AssetSchema } from "../models/assetModel.js";

const Asset = mongoose.model('Assets', AssetSchema);

export const addNewAsset = async (req, res) => {
    try {
        const newAsset = new Asset(req.body);
        const asset = await newAsset.save();
        res.status(201).json({
            success: true,
            message: 'Asset successfully created',
            data: asset
        });
    } catch (err) {
        console.error('Asset creation failed:', err);
        res.status(400).json({
            success: false,
            message: 'Failed to create asset: ' + (err.message || err),
        })
    }
}

export const getAssets = async (req, res) => {
    try {
        let assets = await Asset.find({});
        res.json({
            success: true,
            message: 'Asset(s) successfully found',
            data: assets
        });
    } catch (e) {
        res.status(400).json({
            success: false,
            message: 'Failed to retrieve assets: ' + (e.message || e),
        });
    }
}

export const getAssetById = async (req, res) => {
    try {
        const asset = await Asset.findById(req.params.assetId);
        if (!asset) {
            return res.status(404).json({
                success: false,
                message: 'Asset not found'
            });
        }
        res.json({
            success: true,
            message: 'Asset successfully retrieved',
            data: asset
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: 'Failed to retrieve asset: ' + (err.message || err)
        });
    }
}

export const updateAsset = async (req, res) => {
    try {
        const asset = await Asset.findByIdAndUpdate(req.params.assetId, req.body, { new: true });
        if (!asset) {
            return res.status(404).json({
                success: false,
                message: 'Asset not found'
            });
        }
        res.json({
            success: true,
            message: 'Asset successfully updated',
            data: asset
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: 'Failed to update asset: ' + (err.message || err)
        });
    }
}

export const deleteAsset = async (req, res) => {
    try {
        const asset = await Asset.findByIdAndDelete(req.params.assetId);
        if (!asset) {
            return res.status(404).json({
                success: false,
                message: 'Asset not found'
            });
        }
        res.json({
            success: true,
            message: 'Asset successfully deleted',
            data: asset
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: 'Failed to delete asset: ' + (err.message || err)
        });
    }
}