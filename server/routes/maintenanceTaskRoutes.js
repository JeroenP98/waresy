import { loginRequired } from '../controllers/userController.js';
import express from "express";
import {
    addNewMaintenanceTask, deleteMaintenanceTask,
    getMaintenanceTaskById,
    getMaintenanceTasks, updateMaintenanceTask
} from "../controllers/maintenanceTaskController.js";

const router = express.Router();

router.route('/maintenance-tasks')
    .get(loginRequired, getMaintenanceTasks)
    .post(loginRequired, addNewMaintenanceTask);
router.route('/maintenance-tasks/:taskId')
    .get(loginRequired, getMaintenanceTaskById)
    .patch(loginRequired, updateMaintenanceTask)
    .delete(loginRequired, deleteMaintenanceTask);

export default router;