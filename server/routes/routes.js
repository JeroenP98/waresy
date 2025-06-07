import {addNewAsset, getAssets, getAssetById, updateAsset, deleteAsset} from '../controllers/assetController.js';
import {
    loginRequired,
    loginUser,
    registerUser,
    isAdmin,
    getUserByEmail,
    getAllUsers, updateUser, deleteUser
} from '../controllers/userController.js';

// define the routes for the application
export default function routes(app) {
    // Asset routes
    app.route('/assets')
        .get(loginRequired,  getAssets)
        .post(loginRequired,addNewAsset);

    // Asset by ID routes
    app.route('/assets/:assetId')
        .get(loginRequired, getAssetById)
        .put(loginRequired, updateAsset)
        .delete(loginRequired, deleteAsset);

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


}

