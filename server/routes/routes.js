import {addNewAsset, getAssets, getAssetById, updateAsset, deleteAsset} from '../controllers/assetController.js';
import {
    loginRequired,
    loginUser,
    registerUser,
    isAdmin,
    getUserByEmail,
    getAllUsers, updateUser, deleteUser
} from '../controllers/userController.js';
import {
    createSupplier,
    deleteSupplier,
    getSupplierById,
    getSuppliers,
    updateSupplier
} from "../controllers/supplierController.js";

// define the routes for the application
export default function routes(app) {
    // User authentication routes
    app.route('/auth/register')
        .post(registerUser);
    app.route('/auth/login')
        .post(loginUser);

    // User profile route
    app.route('/auth/user')
        .get(loginRequired, getUserByEmail);
    app.route('/auth/user/:email')
        .patch(loginRequired, updateUser)
        .delete(loginRequired, isAdmin, deleteUser); // Admin-only route to delete user
    // Admin-only route to get all users
    app.route('/auth/users')
        .get(loginRequired, isAdmin, getAllUsers);

    // Asset routes
    app.route('/assets')
        .get(loginRequired,  getAssets)
        .post(loginRequired,addNewAsset);

    // Asset by ID routes
    app.route('/assets/:assetId')
        .get(loginRequired, getAssetById)
        .patch(loginRequired, updateAsset)
        .delete(loginRequired, deleteAsset);

    // Supplier routes
    app.route('/suppliers')
        .get(loginRequired, getSuppliers)
        .post(loginRequired, createSupplier);

    app.route('/suppliers/:supplierId')
        .get(loginRequired, getSupplierById)
        .patch(loginRequired, updateSupplier)
        .delete(loginRequired, deleteSupplier);

}

