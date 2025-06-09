import { loginRequired } from '../controllers/userController.js';
import express from "express";
import {
    createSupplier,
    deleteSupplier,
    getSupplierById,
    getSuppliers,
    updateSupplier
} from "../controllers/supplierController.js";

const router = express.Router();

router.route('/suppliers')
    .get(loginRequired, getSuppliers)
    .post(loginRequired, createSupplier);

router.route('/suppliers/:supplierId')
    .get(loginRequired, getSupplierById)
    .patch(loginRequired, updateSupplier)
    .delete(loginRequired, deleteSupplier);

export default router;