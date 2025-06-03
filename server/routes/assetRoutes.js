import { addNewAsset, getAssets, getAssetById, updateAsset, deleteAsset } from '../controllers/assetController.js';

const routes = (app) => {
    app.route('/assets')
        .get(getAssets)
        .post(addNewAsset);

    app.route('/assets/:assetId')
        .get(getAssetById)
        .put(updateAsset)
        .delete(deleteAsset);
}

export default routes;