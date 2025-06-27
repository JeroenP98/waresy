import request from 'supertest';
import mongoose from '../../../server/dbConnect.js';
import app from '../../../server/index.js';
import { UserSchema } from '../../../server/models/userModel.js';
import { AssetSchema } from '../../../server/models/assetModel.js';
import { SupplierSchema } from '../../../server/models/supplierModel.js';
import { AssetTypeSchema } from '../../../server/models/assetType.js';
import { MaintenanceTaskSchema } from '../../../server/models/maintenanceTaskModel.js';

let adminToken;
let testSupplier, testUser, testAsset, testAssetType;
describe('Maintenance Task Controller', () => {
    const User = mongoose.model('Users', UserSchema);
    const Asset = mongoose.model('Assets', AssetSchema);
    const Supplier = mongoose.model('Supplier', SupplierSchema);
    const AssetType = mongoose.model('AssetType', AssetTypeSchema);
    const MaintenanceTask = mongoose.model('MaintenanceTask', MaintenanceTaskSchema);

    beforeAll(async () => {
        await User.deleteMany({});
        await Asset.deleteMany({});
        await Supplier.deleteMany({});
        await AssetType.deleteMany({});
        await MaintenanceTask.deleteMany({});

        // Create and authenticate admin user
        const admin = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'admin@tasktest.com',
            password: '12345',
            role: 'Admin'
        };

        await request(app).post('/api/auth/register').send(admin).expect(201);
        const loginRes = await request(app).post('/api/auth/login').send({
            email: admin.email,
            password: admin.password
        });

        adminToken = loginRes.body.data.token;
        testUser = await User.findOne({ email: admin.email });

        // Create asset type
        testAssetType = await AssetType.create({ name: 'Forklift' });

        // Create supplier
        testSupplier = await Supplier.create({
            name: 'Maintenance Co.',
            contactEmail: 'maintenance@supplier.com',
            phone: '+1-800-555-9999',
            website: 'https://maintenanceco.com'
        });

        // Create asset
        testAsset = await Asset.create({
            name: 'Forklift X',
            assetType: {
                assetTypeID: testAssetType._id.toString(),
                name: testAssetType.name
            },
            location: {
                locationID: 'loc-001',
                name: 'Dock Area'
            },
            serialNumber: 'FL-X-001',
            status: 'Active',
            supplier: {
                supplierID: testSupplier._id.toString(),
                name: testSupplier.name,
                contactEmail: testSupplier.contactEmail,
                phone: testSupplier.phone,
                website: testSupplier.website
            }
        });
    });

    afterAll(async () => {
        await MaintenanceTask.deleteMany({});
        await Asset.deleteMany({});
        await Supplier.deleteMany({});
        await AssetType.deleteMany({});
        await User.deleteMany({});

        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
    });

    describe('POST /api/maintenance-tasks', () => {
        it('should create a new maintenance task', async () => {
            const baseTask = {
                description: 'Quarterly forklift inspection',
                plannedDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
                contractor: {
                    supplierID: testSupplier._id.toString(),
                    name: testSupplier.name,
                    contactEmail: testSupplier.contactEmail
                },
                assignedTo: {
                    userID: testUser._id.toString(),
                    firstName: testUser.firstName,
                    lastName: testUser.lastName,
                    email: testUser.email
                },
                assets: [{
                    assetID: testAsset._id.toString(),
                    assetName: testAsset.name,
                    assetType: {
                        assetTypeID: testAsset.assetType.assetTypeID,
                        name: testAsset.assetType.name
                    }
                }]
            };
            const res = await request(app)
                .post('/api/maintenance-tasks')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(baseTask)
                .expect(201);

            expect(res.body.success).toBe(true);
            expect(res.body.data.taskName).toMatch(/^T-\d{3}$/);
            expect(res.body.data.statusHistory).toHaveLength(1);
            expect(res.body.data.assignedTo.email).toBe(testUser.email);
            expect(res.body.data.assets[0].assetName).toBe(testAsset.name);
        });

        it('should reject if required field is missing (e.g., plannedDate)', async () => {
            const baseTask = {
                description: 'Quarterly forklift inspection',
                plannedDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                contractor: {
                    supplierID: testSupplier._id.toString(),
                    name: testSupplier.name,
                    contactEmail: testSupplier.contactEmail
                },
                assignedTo: {
                    userID: testUser._id.toString(),
                    firstName: testUser.firstName,
                    lastName: testUser.lastName,
                    email: testUser.email
                },
                assets: [{
                    assetID: testAsset._id.toString(),
                    assetName: testAsset.name,
                    assetType: {
                        assetTypeID: testAsset.assetType.assetTypeID,
                        name: testAsset.assetType.name
                    }
                }]
            };
            const task = { ...baseTask };
            delete task.plannedDate;

            const res = await request(app)
                .post('/api/maintenance-tasks')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(task)
                .expect(400);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/planned date/i);
        });

        it('should reject if referenced asset does not exist', async () => {
            const nonExistentAssetId = new mongoose.Types.ObjectId().toString();
            const baseTask = {
                description: 'Quarterly forklift inspection',
                plannedDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                contractor: {
                    supplierID: testSupplier._id.toString(),
                    name: testSupplier.name,
                    contactEmail: testSupplier.contactEmail
                },
                assignedTo: {
                    userID: testUser._id.toString(),
                    firstName: testUser.firstName,
                    lastName: testUser.lastName,
                    email: testUser.email
                },
                assets: [{
                    assetID: testAsset._id.toString(),
                    assetName: testAsset.name,
                    assetType: {
                        assetTypeID: testAsset.assetType.assetTypeID,
                        name: testAsset.assetType.name
                    }
                }]
            };
            const task = {
                ...baseTask,
                assets: [{
                    assetID: nonExistentAssetId,
                    assetName: 'Ghost Asset',
                    assetType: {
                        assetTypeID: testAsset.assetType.assetTypeID,
                        name: testAsset.assetType.name
                    }
                }]
            };

            const res = await request(app)
                .post('/api/maintenance-tasks')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(task)
                .expect(400);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/One or more assets not found/i);
        });

        it('should reject if performedDate is before plannedDate', async () => {
            const baseTask = {
                description: 'Quarterly forklift inspection',
                plannedDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                contractor: {
                    supplierID: testSupplier._id.toString(),
                    name: testSupplier.name,
                    contactEmail: testSupplier.contactEmail
                },
                assignedTo: {
                    userID: testUser._id.toString(),
                    firstName: testUser.firstName,
                    lastName: testUser.lastName,
                    email: testUser.email
                },
                assets: [{
                    assetID: testAsset._id.toString(),
                    assetName: testAsset.name,
                    assetType: {
                        assetTypeID: testAsset.assetType.assetTypeID,
                        name: testAsset.assetType.name
                    }
                }]
            };
            const task = {
                ...baseTask,
                performedDate: new Date(Date.now() - 24 * 60 * 60 * 1000) // yesterday
            };

            const res = await request(app)
                .post('/api/maintenance-tasks')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(task)
                .expect(400);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/performed date.*must be after planned date/i);
        });

        it('should reject if assigned user does not exist', async () => {
            const baseTask = {
                description: 'Quarterly forklift inspection',
                plannedDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                contractor: {
                    supplierID: testSupplier._id.toString(),
                    name: testSupplier.name,
                    contactEmail: testSupplier.contactEmail
                },
                assignedTo: {
                    userID: testUser._id.toString(),
                    firstName: testUser.firstName,
                    lastName: testUser.lastName,
                    email: testUser.email
                },
                assets: [{
                    assetID: testAsset._id.toString(),
                    assetName: testAsset.name,
                    assetType: {
                        assetTypeID: testAsset.assetType.assetTypeID,
                        name: testAsset.assetType.name
                    }
                }]
            };
            const task = {
                ...baseTask,
                assignedTo: {
                    userID: new mongoose.Types.ObjectId().toString(),
                    firstName: 'Ghost',
                    lastName: 'User',
                    email: 'ghost@invalid.com'
                }
            };

            const res = await request(app)
                .post('/api/maintenance-tasks')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(task)
                .expect(400);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/Assigned user not found/i);
        });

        it('should reject if contractor email is invalid', async () => {
            const baseTask = {
                description: 'Quarterly forklift inspection',
                plannedDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                contractor: {
                    supplierID: testSupplier._id.toString(),
                    name: testSupplier.name,
                    contactEmail: testSupplier.contactEmail
                },
                assignedTo: {
                    userID: testUser._id.toString(),
                    firstName: testUser.firstName,
                    lastName: testUser.lastName,
                    email: testUser.email
                },
                assets: [{
                    assetID: testAsset._id.toString(),
                    assetName: testAsset.name,
                    assetType: {
                        assetTypeID: testAsset.assetType.assetTypeID,
                        name: testAsset.assetType.name
                    }
                }]
            };
            const task = {
                ...baseTask,
                contractor: {
                    supplierID: testSupplier._id.toString(),
                    name: testSupplier.name,
                    contactEmail: 'not-an-email'
                }
            };

            const res = await request(app)
                .post('/api/maintenance-tasks')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(task)
                .expect(400);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/not a valid email/i);
        });

        it('should ignore taskName and statusHistory if provided by the client', async () => {
            const baseTask = {
                description: 'Quarterly forklift inspection',
                plannedDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                contractor: {
                    supplierID: testSupplier._id.toString(),
                    name: testSupplier.name,
                    contactEmail: testSupplier.contactEmail
                },
                assignedTo: {
                    userID: testUser._id.toString(),
                    firstName: testUser.firstName,
                    lastName: testUser.lastName,
                    email: testUser.email
                },
                assets: [{
                    assetID: testAsset._id.toString(),
                    assetName: testAsset.name,
                    assetType: {
                        assetTypeID: testAsset.assetType.assetTypeID,
                        name: testAsset.assetType.name
                    }
                }]
            };
            const task = {
                ...baseTask,
                taskName: 'T-999',
                statusHistory: [{
                    status: 'Completed',
                    updatedAt: new Date(),
                    updatedBy: {
                        userID: testUser._id.toString(),
                        firstName: 'Malicious',
                        lastName: 'Hacker'
                    }
                }]
            };

            const res = await request(app)
                .post('/api/maintenance-tasks')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(task)
                .expect(201);

            expect(res.body.success).toBe(true);
            expect(res.body.data.taskName).not.toBe('T-999');
            expect(res.body.data.statusHistory).toHaveLength(1);
            expect(res.body.data.statusHistory[0].status).toBe('Pending');
        });
    });

    describe('GET /api/maintenance-tasks/:taskId', () => {
        let createdTaskId;

        beforeEach(async () => {
            const taskData = {
                description: 'Scheduled inspection',
                plannedDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                contractor: {
                    supplierID: testSupplier._id.toString(),
                    name: testSupplier.name,
                    contactEmail: testSupplier.contactEmail
                },
                assignedTo: {
                    userID: testUser._id.toString(),
                    firstName: testUser.firstName,
                    lastName: testUser.lastName,
                    email: testUser.email
                },
                assets: [{
                    assetID: testAsset._id.toString(),
                    assetName: testAsset.name,
                    assetType: {
                        assetTypeID: testAsset.assetType.assetTypeID,
                        name: testAsset.assetType.name
                    }
                }]
            };

            const res = await request(app)
                .post('/api/maintenance-tasks')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(taskData)
                .expect(201);

            createdTaskId = res.body.data._id;
        });

        afterEach(async () => {
            await MaintenanceTask.deleteMany({});
        });

        it('should return a maintenance task by ID', async () => {
            const res = await request(app)
                .get(`/api/maintenance-tasks/${createdTaskId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('_id', createdTaskId);
            expect(res.body.data).toHaveProperty('description', 'Scheduled inspection');
        });

        it('should return 404 if the task does not exist', async () => {
            const nonExistentId = new mongoose.Types.ObjectId().toString();

            const res = await request(app)
                .get(`/api/maintenance-tasks/${nonExistentId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(404);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/not found/i);
        });

    });

    describe('GET /api/maintenance-tasks', () => {
        beforeEach(async () => {
            const taskData = {
                description: 'General maintenance',
                plannedDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                contractor: {
                    supplierID: testSupplier._id.toString(),
                    name: testSupplier.name,
                    contactEmail: testSupplier.contactEmail
                },
                assignedTo: {
                    userID: testUser._id.toString(),
                    firstName: testUser.firstName,
                    lastName: testUser.lastName,
                    email: testUser.email
                },
                assets: [{
                    assetID: testAsset._id.toString(),
                    assetName: testAsset.name,
                    assetType: {
                        assetTypeID: testAsset.assetType.assetTypeID,
                        name: testAsset.assetType.name
                    }
                }]
            };

            await request(app)
                .post('/api/maintenance-tasks')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(taskData)
                .expect(201);
        });

        afterEach(async () => {
            await MaintenanceTask.deleteMany({});
        });

        it('should return all maintenance tasks', async () => {
            const res = await request(app)
                .get('/api/maintenance-tasks')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBeGreaterThan(0);
        });

        it('should return an empty array if no tasks exist', async () => {
            await MaintenanceTask.deleteMany({});

            const res = await request(app)
                .get('/api/maintenance-tasks')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data).toHaveLength(0);
        });

    });

    describe('PATCH /api/maintenance-tasks/:taskId', () => {
        let task;

        beforeEach(async () => {
            const taskRes = await request(app)
                .post('/api/maintenance-tasks')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    description: 'Patch Test Task',
                    plannedDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                    contractor: {
                        supplierID: testSupplier._id.toString(),
                        name: testSupplier.name,
                        contactEmail: testSupplier.contactEmail
                    },
                    assignedTo: {
                        userID: testUser._id.toString(),
                        firstName: testUser.firstName,
                        lastName: testUser.lastName,
                        email: testUser.email
                    },
                    assets: [{
                        assetID: testAsset._id.toString(),
                        assetName: testAsset.name,
                        assetType: {
                            assetTypeID: testAsset.assetType.assetTypeID,
                            name: testAsset.assetType.name
                        }
                    }]
                });

            task = taskRes.body.data;
        });

        afterEach(async () => {
            await MaintenanceTask.deleteMany({});
        });

        it('should update a maintenance task description', async () => {
            console.log(`current task ID: ${task._id}`);
            const res = await request(app)
                .patch(`/api/maintenance-tasks/${task._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ description: 'Updated Description' })
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.data.description).toBe('Updated Description');
        });

        it('should add status change to statusHistory when status changes', async () => {
            const res = await request(app)
                .patch(`/api/maintenance-tasks/${task._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'In Progress' })
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.data.status).toBe('In Progress');
            expect(res.body.data.statusHistory.length).toBeGreaterThan(1);
            expect(res.body.data.statusHistory.at(-1).status).toBe('In Progress');
        });

        it('should reject update with nonexistent asset ID', async () => {
            const res = await request(app)
                .patch(`/api/maintenance-tasks/${task._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    assets: [{
                        assetID: new mongoose.Types.ObjectId().toString(),
                        assetName: 'Fake Asset',
                        assetType: {
                            assetTypeID: testAssetType._id.toString(),
                            name: testAssetType.name
                        }
                    }]
                })
                .expect(400);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/one or more assets not found/i);
        });

        it('should reject update with nonexistent assigned user', async () => {
            const res = await request(app)
                .patch(`/api/maintenance-tasks/${task._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    assignedTo: {
                        userID: new mongoose.Types.ObjectId().toString(),
                        firstName: 'Ghost',
                        lastName: 'User',
                        email: 'ghost@example.com'
                    }
                })
                .expect(400);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/assigned user not found/i);
        });

        it('should reject update with nonexistent supplier', async () => {
            const res = await request(app)
                .patch(`/api/maintenance-tasks/${task._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    contractor: {
                        supplierID: new mongoose.Types.ObjectId().toString(),
                        name: 'Ghost Supplier',
                        contactEmail: 'ghost@supplier.com'
                    }
                })
                .expect(400);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/contractor \(supplier\) not found/i);
        });

        it('should reject performedDate before plannedDate', async () => {
            const res = await request(app)
                .patch(`/api/maintenance-tasks/${task._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    performedDate: new Date(Date.now() - 48 * 60 * 60 * 1000) // before plannedDate
                })
                .expect(400);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/performed date.*must be after planned date/i);
        });

        it('should return 404 if task not found', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .patch(`/api/maintenance-tasks/${nonExistentId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ description: 'Not Found' })
                .expect(404);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/not found/i);
        });
    });

    describe('DELETE /api/maintenance-tasks/:taskId', () => {
        let task;

        beforeEach(async () => {
            const taskRes = await request(app)
                .post('/api/maintenance-tasks')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    description: 'Delete Test Task',
                    plannedDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                    contractor: {
                        supplierID: testSupplier._id.toString(),
                        name: testSupplier.name,
                        contactEmail: testSupplier.contactEmail
                    },
                    assignedTo: {
                        userID: testUser._id.toString(),
                        firstName: testUser.firstName,
                        lastName: testUser.lastName,
                        email: testUser.email
                    },
                    assets: [{
                        assetID: testAsset._id.toString(),
                        assetName: testAsset.name,
                        assetType: {
                            assetTypeID: testAsset.assetType.assetTypeID,
                            name: testAsset.assetType.name
                        }
                    }]
                });

            task = taskRes.body.data;
        });

        afterEach(async () => {
            await MaintenanceTask.deleteMany({});
        });

        it('should delete a maintenance task by ID', async () => {
            const res = await request(app)
                .delete(`/api/maintenance-tasks/${task._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.message).toMatch(/successfully deleted/i);

            // Verify task is actually deleted
            const getRes = await request(app)
                .get(`/api/maintenance-tasks/${task._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(404);

            expect(getRes.body.success).toBe(false);
            expect(getRes.body.message).toMatch(/not found/i);
        });

        it('should return 404 if task not found for deletion', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .delete(`/api/maintenance-tasks/${nonExistentId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(404);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/not found/i);
        });
    });
});