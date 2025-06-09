import mongoose from 'mongoose';
import { MaintenanceTaskSchema} from "../models/maintenanceTaskModel.js";
import { ApiResponse } from "../util/apiResponse.js";
import {UserSchema} from "../models/userModel.js";
import {AssetSchema} from "../models/assetModel.js";
import {SupplierSchema} from "../models/supplierModel.js";

const MaintenanceTask = mongoose.model('MaintenanceTasks', MaintenanceTaskSchema);
const User = mongoose.model('Users', UserSchema);
const Asset = mongoose.model('Assets', AssetSchema);
const Supplier = mongoose.model('Suppliers', SupplierSchema);

export const getMaintenanceTasks = async (req, res) => {
    try {
        const tasks = await MaintenanceTask.find({});
        return ApiResponse.success(res, 'Maintenance tasks successfully retrieved', tasks);
    } catch (err) {
        console.error('Failed to retrieve maintenance tasks:', err);
        return ApiResponse.error(res, 'Failed to retrieve maintenance tasks: ' + (err.message || err), 400);
    }
}

export const getMaintenanceTaskById = async (req, res) => {
    try {
        const task = await MaintenanceTask.findById(req.params.taskId);
        if (!task) {
            return ApiResponse.error(res, 'Maintenance task not found', 404);
        }
        return ApiResponse.success(res, 'Maintenance task successfully retrieved', task);
    } catch (err) {
        console.error('Failed to retrieve maintenance task:', err);
        return ApiResponse.error(res, 'Failed to retrieve maintenance task: ' + (err.message || err), 400);
    }
}

export const addNewMaintenanceTask = async (req, res) => {
    try {

        delete req.body.taskName;
        delete req.body.statusHistory;

        const newTask = new MaintenanceTask(req.body);

        // Remove system-controlled fields if present in the request


        // Validate if user exists
        const assignedTo = req.body.assignedTo;
        const user = await User.findById(assignedTo.userID);
        if (!user) {
            return ApiResponse.error(res, 'Assigned user not found', 400);
        }

        // Validate if contractor exists
        const contractor = req.body.contractor;
        const supplier = await Supplier.findById(contractor?.supplierID);
        if (!supplier) {
            return ApiResponse.error(res, 'Contractor (supplier) not found', 400);
        }

        // Validate if assets exist
        const assets = req.body.assets;
        const assetDocs = await Asset.find({ _id: { $in: assets.map(a => a.assetID) } });
        if (assetDocs.length !== assets.length) {
            return ApiResponse.error(res, 'One or more assets not found', 400);
        }


        const task = await newTask.save();
        return ApiResponse.success(res, 'Maintenance task successfully created', task, 201);
    } catch (err) {
        console.error('Maintenance task creation failed:', err);
        return ApiResponse.error(res, 'Failed to create maintenance task: ' + (err.message || err), 400);
    }
}

export const updateMaintenanceTask = async (req, res) => {
    try {
        // Remove protected fields
        delete req.body.taskName;
        delete req.body.statusHistory;

        const existingTask = await MaintenanceTask.findById(req.params.taskId);
        if (!existingTask) {
            return ApiResponse.error(res, 'Maintenance task not found', 404);
        }

        const { assignedTo, contractor, assets, status } = req.body;

        // Validate assigned user (if present and changed)
        if (assignedTo && assignedTo.userID !== existingTask.assignedTo.userID) {
            const user = await User.findById(assignedTo.userID);
            if (!user) {
                return ApiResponse.error(res, 'Assigned user not found', 400);
            }
        }

        // Validate contractor (if present and changed)
        if (contractor && contractor.supplierID !== existingTask.contractor.supplierID) {
            const supplier = await Supplier.findById(contractor.supplierID);
            if (!supplier) {
                return ApiResponse.error(res, 'Contractor (supplier) not found', 400);
            }
        }

        // Validate assets (if present and changed)
        if (assets) {
            const assetIds = assets.map(a => a.assetID);
            const validAssets = await Asset.find({ _id: { $in: assetIds } });
            if (validAssets.length !== assets.length) {
                return ApiResponse.error(res, 'One or more assets not found', 400);
            }
        }

        // Check for status change and append to history
        if (status && status !== existingTask.status) {
            existingTask.statusHistory.push({
                status,
                updatedAt: new Date(),
                updatedBy: req.user ? {
                    userID: req.user._id.toString(),
                    fullName: req.user.fullName,
                    email: req.user.email
                } : { userID: 'system', fullName: 'System', email: ''}
            });
        }

        // Apply updates
        Object.assign(existingTask, req.body);
        const updatedTask = await existingTask.save();

        return ApiResponse.success(res, 'Maintenance task successfully updated', updatedTask);

    } catch (err) {
        console.error('Maintenance task update failed:', err);
        return ApiResponse.error(res, 'Failed to update maintenance task: ' + (err.message || err), 400);
    }
};

export const deleteMaintenanceTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const task = await MaintenanceTask.findByIdAndDelete(taskId);
        if (!task) {
            return ApiResponse.error(res, 'Maintenance task not found', 404);
        }
        return ApiResponse.success(res, 'Maintenance task successfully deleted', task, 200);
    } catch (err) {
        console.error('Failed to delete maintenance task:', err);
        return ApiResponse.error(res, 'Failed to delete maintenance task: ' + (err.message || err), 400);
    }
}


