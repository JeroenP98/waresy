import express from 'express';
import {
    registerUser,
    loginUser,
    getUserByEmail,
    getAllUsers,
    updateUser,
    deleteUser,
    loginRequired,
    isAdmin
} from '../controllers/userController.js';

const router = express.Router();

router.post('/auth/register', registerUser);
router.post('/auth/login', loginUser);

router.get('/auth/user', loginRequired, getUserByEmail);
router.patch('/auth/user/:email', loginRequired, updateUser);
router.delete('/auth/user/:email', loginRequired, isAdmin, deleteUser);

router.get('/auth/users', loginRequired, isAdmin, getAllUsers);

export default router;
