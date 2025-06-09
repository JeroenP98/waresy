import { loginRequired } from '../controllers/userController.js';
import express from "express";
import {addNewAsset, deleteAsset, getAssetById, getAssets, updateAsset} from "../controllers/assetController.js";

const router = express.Router();

router.route('/assets')
    .get(loginRequired, getAssets)
    .post(loginRequired, addNewAsset);

router.route('/assets/:assetId')
    .get(loginRequired, getAssetById)
    .patch(loginRequired, updateAsset)
    .delete(loginRequired, deleteAsset);

export default router;