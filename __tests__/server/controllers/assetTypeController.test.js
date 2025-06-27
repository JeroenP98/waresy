import request from 'supertest';
import mongoose from '../../../server/dbConnect.js';
import app from '../../../server/index.js';

import { AssetTypeSchema } from '../../../server/models/assetType.js';
import { AssetSchema } from '../../../server/models/assetModel.js';
import { UserSchema } from '../../../server/models/userModel.js';

describe('AssetType Controller', () => {
    const AssetType = mongoose.model('AssetType', AssetTypeSchema);
    const Asset = mongoose.model('Assets', AssetSchema);
    const User = mongoose.model('Users', UserSchema);

    let authToken;

    beforeAll(async () => {
        const testUser = {
            firstName: 'Test',
            lastName: 'User',
            email: 'assettype@test.com',
            password: 'Secure123!',
            role: 'Admin'
        };

        await request(app).post('/api/auth/register').send(testUser).expect(201);
        const loginRes = await request(app).post('/api/auth/login').send({
            email: testUser.email,
            password: testUser.password
        });
        authToken = loginRes.body.data.token;
    });

    afterAll(async () => {
        await AssetType.deleteMany({});
        await Asset.deleteMany({});
        await User.deleteMany({});
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
    });

    describe('GET /api/asset-types', () => {
        it('should return all asset types', async () => {
            // Seed an asset type
            await request(app)
                .post('/api/asset-types')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ name: 'Display' })
                .expect(201);

            const res = await request(app)
                .get('/api/asset-types')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBeGreaterThan(0);
        });

        it('should handle database errors gracefully', async () => {
            const originalFind = AssetType.find;
            AssetType.find = () => {
                throw new Error('Database failure');
            };

            const res = await request(app)
                .get('/api/asset-types')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(400);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/failed to retrieve/i);

            // Restore method
            AssetType.find = originalFind;
        });
    });

    describe('GET /api/asset-types/:assetTypeId', () => {
        let assetTypeId;

        beforeEach(async () => {
            const res = await request(app)
                .post('/api/asset-types')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ name: 'Peripheral' });

            assetTypeId = res.body.data._id;
        });

        it('should return the specified asset type', async () => {
            const res = await request(app)
                .get(`/api/asset-types/${assetTypeId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.data._id).toBe(assetTypeId);
            expect(res.body.data.name).toBe('Peripheral');
        });

        it('should return 404 if asset type not found', async () => {
            const fakeId = new mongoose.Types.ObjectId();

            const res = await request(app)
                .get(`/api/asset-types/${fakeId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/not found/i);
        });

        it('should handle database errors gracefully', async () => {
            const original = AssetType.findById;
            AssetType.findById = () => {
                throw new Error('Unexpected DB error');
            };

            const res = await request(app)
                .get(`/api/asset-types/${assetTypeId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(400);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/failed to retrieve/i);

            AssetType.findById = original;
        });
    });

    describe('POST /api/asset-types', () => {
        it('should create a new asset type', async () => {
            const newType = { name: 'Printer' };

            const res = await request(app)
                .post('/api/asset-types')
                .set('Authorization', `Bearer ${authToken}`)
                .send(newType)
                .expect(201);

            expect(res.body.success).toBe(true);
            expect(res.body.message).toMatch(/successfully created/i);
            expect(res.body.data).toHaveProperty('_id');
            expect(res.body.data.name).toBe('Printer');
        });

        it('should return 400 for missing required fields', async () => {
            const res = await request(app)
                .post('/api/asset-types')
                .set('Authorization', `Bearer ${authToken}`)
                .send({}) // No name provided
                .expect(400);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/failed to create/i);
        });

        it('should handle database errors gracefully', async () => {
            const originalSave = AssetType.prototype.save;
            AssetType.prototype.save = () => {
                throw new Error('Simulated DB error');
            };

            const res = await request(app)
                .post('/api/asset-types')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ name: 'Temporary Error Type' })
                .expect(400);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/failed to create/i);

            AssetType.prototype.save = originalSave;
        });
    });

    describe('GET /api/asset-types/:assetTypeId', () => {
        let assetTypeId;

        beforeEach(async () => {
            const res = await request(app)
                .post('/api/asset-types')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ name: 'Monitor' });

            assetTypeId = res.body.data._id;
        });

        it('should return the specified asset type', async () => {
            const res = await request(app)
                .get(`/api/asset-types/${assetTypeId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('_id', assetTypeId);
            expect(res.body.data.name).toBe('Monitor');
        });

        it('should return 404 if the asset type is not found', async () => {
            const fakeId = new mongoose.Types.ObjectId();

            const res = await request(app)
                .get(`/api/asset-types/${fakeId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/not found/i);
        });

        it('should handle database errors gracefully', async () => {
            const original = AssetType.findById;
            AssetType.findById = () => {
                throw new Error('Simulated database error');
            };

            const res = await request(app)
                .get(`/api/asset-types/${assetTypeId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(400);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/failed to retrieve/i);

            AssetType.findById = original;
        });
    });

    describe('PATCH /api/asset-types/:assetTypeId', () => {
        let assetTypeId;

        beforeEach(async () => {
            const res = await request(app)
                .post('/api/asset-types')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ name: 'Tablet' });

            assetTypeId = res.body.data._id;
        });

        it('should update the asset type name', async () => {
            const res = await request(app)
                .patch(`/api/asset-types/${assetTypeId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ name: 'Tablet Updated' })
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe('Tablet Updated');
        });

        it('should update embedded assetType in related assets', async () => {
            // Create an asset using the asset type
            await request(app)
                .post('/api/assets')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'iPad Pro',
                    assetType: {
                        assetTypeID: assetTypeId,
                        name: 'Tablet'
                    },
                    location: {
                        locationID: 'loc-555',
                        name: 'HQ Office'
                    },
                    serialNumber: 'IPAD-555',
                    status: 'Active',
                    supplier: {
                        supplierID: 'supp-ipad',
                        name: 'Apple',
                        contactEmail: 'support@apple.com'
                    }
                })
                .expect(201);

            // Update the asset type name
            await request(app)
                .patch(`/api/asset-types/${assetTypeId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ name: 'Tablet Gen2' })
                .expect(200);

            // Fetch the asset and check embedded update
            const assetRes = await request(app)
                .get('/api/assets')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            const updatedAsset = assetRes.body.data.find(asset => asset.assetType.assetTypeID === assetTypeId);
            expect(updatedAsset.assetType.name).toBe('Tablet Gen2');
        });

        it('should return 404 if asset type is not found', async () => {
            const fakeId = new mongoose.Types.ObjectId();

            const res = await request(app)
                .patch(`/api/asset-types/${fakeId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ name: 'DoesNotExist' })
                .expect(404);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/not found/i);
        });

        it('should handle validation errors', async () => {
            const res = await request(app)
                .patch(`/api/asset-types/${assetTypeId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ name: '' }) // Invalid name
                .expect(400);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/failed to update/i);
        });

        it('should handle database errors gracefully', async () => {
            const original = AssetType.findByIdAndUpdate;
            AssetType.findByIdAndUpdate = () => {
                throw new Error('Simulated DB error');
            };

            const res = await request(app)
                .patch(`/api/asset-types/${assetTypeId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ name: 'WillFail' })
                .expect(400);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/failed to update/i);

            AssetType.findByIdAndUpdate = original;
        });
    });

    describe('DELETE /api/asset-types/:assetTypeId', () => {
        let assetTypeId;

        beforeEach(async () => {
            const res = await request(app)
                .post('/api/asset-types')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ name: 'TemporaryType' });

            assetTypeId = res.body.data._id;
        });

        it('should delete an unused asset type', async () => {
            const res = await request(app)
                .delete(`/api/asset-types/${assetTypeId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.message).toMatch(/successfully deleted/i);
        });

        it('should return 404 if asset type not found', async () => {
            const fakeId = new mongoose.Types.ObjectId();

            const res = await request(app)
                .delete(`/api/asset-types/${fakeId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/not found/i);
        });

        it('should handle database errors gracefully', async () => {
            const originalDelete = AssetType.findByIdAndDelete;
            AssetType.findByIdAndDelete = () => {
                throw new Error('Simulated DB error');
            };

            const res = await request(app)
                .delete(`/api/asset-types/${assetTypeId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(400);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/failed to delete/i);

            AssetType.findByIdAndDelete = originalDelete;
        });
    });



});
