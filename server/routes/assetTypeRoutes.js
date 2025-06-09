import { loginRequired } from '../controllers/userController.js';
import express from "express";
import {
    createAssetType,
    deleteAssetType,
    getAssetTypeById,
    getAssetTypes,
    updateAssetType
} from "../controllers/assetTypeController.js";

const router = express.Router();

router.route('/asset-types')
    .get(loginRequired, getAssetTypes)
    .post(loginRequired, createAssetType);

router.route('/asset-types/:assetTypeId')
    .get(loginRequired, getAssetTypeById)
    .patch(loginRequired, updateAssetType)
    .delete(loginRequired, deleteAssetType);

export default router;