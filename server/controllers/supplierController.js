import mongoose from 'mongoose';
import { SupplierSchema } from '../models/supplierModel.js';
import { AssetSchema } from '../models/assetModel.js';
import { ApiResponse } from '../util/apiResponse.js';

const Supplier = mongoose.model('Supplier', SupplierSchema);
const Asset = mongoose.model('Assets', AssetSchema);

// CREATE
export const createSupplier = async (req, res) => {
    try {
        const newSupplier = new Supplier(req.body);
        const supplier = await newSupplier.save();
        return ApiResponse.success(res, 'Supplier successfully created', supplier, 201);
    } catch (err) {
        return ApiResponse.error(res, 'Failed to create supplier: ' + (err.message || err), 400);
    }
};

// READ ALL
export const getSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.find({});
        return ApiResponse.success(res, 'Suppliers retrieved successfully', suppliers);
    } catch (err) {
        return ApiResponse.error(res, 'Failed to retrieve suppliers: ' + (err.message || err));
    }
};

// READ ONE
export const getSupplierById = async (req, res) => {
    try {
        const supplier = await Supplier.findById(req.params.supplierId);
        if (!supplier) {
            return ApiResponse.error(res, 'Supplier not found', 404);
        }
        return ApiResponse.success(res, 'Supplier retrieved successfully', supplier);
    } catch (err) {
        return ApiResponse.error(res, 'Failed to retrieve supplier: ' + (err.message || err));
    }
};

// UPDATE
export const updateSupplier = async (req, res) => {
    try {
        const updatedSupplier = await Supplier.findByIdAndUpdate(
            req.params.supplierId,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedSupplier) {
            return ApiResponse.error(res, 'Supplier not found', 404);
        }

        // Update all assets that embed this supplier (match by ID)
        await Asset.updateMany(
            { 'supplier.supplierID': updatedSupplier._id },
            {
                $set: {
                    'supplier.name': updatedSupplier.name,
                    'supplier.contactEmail': updatedSupplier.contactEmail,
                    'supplier.phone': updatedSupplier.phone,
                    'supplier.website': updatedSupplier.website
                }
            }
        );

        return ApiResponse.success(res, 'Supplier successfully updated', updatedSupplier);
    } catch (err) {
        return ApiResponse.error(res, 'Failed to update supplier: ' + (err.message || err));
    }
};

// DELETE
export const deleteSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findByIdAndDelete(req.params.supplierId);
        if (!supplier) {
            return ApiResponse.error(res, 'Supplier not found', 404);
        }

        // Clean supplier from assets
        await Asset.updateMany(
            { 'supplier.supplierID': req.params.supplierId },
            { $set: { supplier: null } }
        );

        return ApiResponse.success(res, 'Supplier successfully deleted', supplier);
    } catch (err) {
        return ApiResponse.error(res, 'Failed to delete supplier: ' + (err.message || err));
    }
};
