import mongoose from 'mongoose'
import { AssetSchema } from "../models/assetModel.js";

const Asset = mongoose.model('Assets', AssetSchema);

export const addNewAsset = async (req, res) => {
    try {
        const newAsset = new Asset(req.body);
        const asset = await newAsset.save();
        res.json(asset);
    } catch (err) {
        res.status(400).send(err.message || err);
    }
}

export const getAssets = async (req, res) => {
    let assets = await Asset.find({});
    res.json(assets);
}

export const getAssetById = async (req, res) => {
    try {
        const asset = await Asset.findById(req.params.assetId);
        if (!asset) {
            return res.status(404).send('Asset not found');
        }
        res.json(asset);
    } catch (err) {
        res.status(400).send(err.message || err);
    }
}

export const updateAsset = async (req, res) => {
    try {
       const asset = await Asset.findByIdAndUpdate(req.params.assetId, req.body, {new: true});
        if (!asset) {
            return res.status(404).send('Asset not found');
        }
        res.json(asset);
    } catch (err) {
        res.status(400).send(err.message || err);
    }
}

export const deleteAsset = async (req, res) => {
    try {
        const asset = await Asset.findByIdAndDelete(req.params.assetId);
        if (!asset) {
            return res.status(404).send('Asset not found');
        }
        res.json({ message: 'Asset successfully deleted' });
    } catch (err) {
        res.status(400).send(err.message || err);
    }
}