import request from 'supertest';
import app from '../../../server/index.js';
import mongoose from '../../../server/dbConnect.js'
import {AssetSchema} from '../../../server/models/assetModel.js';
import {UserSchema} from "../../../server/models/userModel.js";
import {AssetTypeSchema} from "../../../server/models/assetType.js";


// Create a test user and get JWT token before running tests
let authToken;


describe('Asset Controller', () => {
    beforeAll(async () => {
        const testUser = {
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
            password: "Test@1234",
            role: "Admin"
        };

        // Register the user
        await request(app).post('/api/auth/register').send(testUser).expect(201);

        // Log in to get JWT token
        const loginResponse = await request(app).post('/api/auth/login').send({
            email: testUser.email,
            password: testUser.password
        }).expect(200);

        authToken = loginResponse.body.data.token;
    });

    const Asset = mongoose.model('Assets', AssetSchema);
    const User = mongoose.model('Users', UserSchema)
    const AssetType = mongoose.model('AssetTypes', AssetTypeSchema);

    afterAll(async () => {
        try {
            await Asset.deleteMany({});
            await User.deleteMany({});
            if (mongoose.connection.readyState !== 0) {
                await mongoose.disconnect();
            }
        } catch (err) {
            console.error('Error during afterAll cleanup:', err);
        }
    });

    describe('POST /api/assets', () => {
        let validAssetType;

        beforeEach(async () => {
            // Insert valid asset type
            validAssetType = await AssetType.create({ name: 'Peripheral' });
        });

        afterEach(async () => {
            await Asset.deleteMany({});
            await AssetType.deleteMany({});
        });

        it('should save a new asset', async () => {
            const newAsset = {
                name: "Logitech Mouse M330",
                assetType: {
                    assetTypeID: validAssetType._id.toString(),
                    name: "Peripheral"
                },
                location: {
                    locationID: "desk-007",
                    name: "IT Room"
                },
                serialNumber: "LOGI-M330-2024-03",
                status: "Active",
                supplier: {
                    supplierID: "logi-001",
                    name: "Logitech",
                    contactEmail: "support@logitech.com",
                    phone: "+1-800-555-1234",
                    website: "https://www.logitech.com"
                }
            };

            const response = await request(app)
                .post('/api/assets')
                .set('Authorization', `Bearer ${authToken}`)
                .send(newAsset)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toMatch(/created/i);
            expect(response.body.data).toHaveProperty('serialNumber', "LOGI-M330-2024-03");
        });

        it('should return 400 if required field is missing (e.g., Name)', async () => {
            const assetWithoutName = {
                assetType: {
                    assetTypeID: validAssetType._id.toString(),
                    name: "Peripheral"
                },
                location: { locationID: "loc-001", name: "Office" },
                serialNumber: "SERIAL-001",
                status: "Active",
                supplier: {
                    supplierID: "supp-001",
                    name: "Test Supplier",
                    contactEmail: "email@example.com"
                }
            };

            const response = await request(app)
                .post('/api/assets')
                .set('Authorization', `Bearer ${authToken}`)
                .send(assetWithoutName)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toMatch(/failed to create/i);
        });

        it('should return 400 for invalid status value', async () => {
            const invalidStatusAsset = {
                name: "Asset with bad status",
                assetType: {
                    assetTypeID: validAssetType._id.toString(),
                    name: "Peripheral"
                },
                location: { locationID: "loc-002", name: "HQ" },
                serialNumber: "INVALID-STATUS-001",
                status: "Broken",
                supplier: {
                    supplierID: "supp-002",
                    name: "Supplier X",
                    contactEmail: "x@supplier.com"
                }
            };

            const response = await request(app)
                .post('/api/assets')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidStatusAsset)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toMatch(/failed to create/i);
        });

        it('should return 400 for duplicate SerialNumber', async () => {
            const duplicateAsset = {
                name: "Asset with duplicate serial",
                assetType: {
                    assetTypeID: validAssetType._id.toString(),
                    name: "Peripheral"
                },
                location: { locationID: "loc-003", name: "Warehouse" },
                serialNumber: "DUPLICATE-123",
                status: "Active",
                supplier: {
                    supplierID: "supp-003",
                    name: "Supplier Z",
                    contactEmail: "z@supplier.com"
                }
            };

            await request(app)
                .post('/api/assets')
                .set('Authorization', `Bearer ${authToken}`)
                .send(duplicateAsset)
                .expect(201);

            const response = await request(app)
                .post('/api/assets')
                .set('Authorization', `Bearer ${authToken}`)
                .send(duplicateAsset)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toMatch(/already exists/i);
        });

        it('should return 400 for invalid email in supplier', async () => {
            const invalidEmailAsset = {
                name: "Bad email Asset",
                assetType: {
                    assetTypeID: validAssetType._id.toString(),
                    name: "Peripheral"
                },
                location: { locationID: "loc-004", name: "Support" },
                serialNumber: "BAD-EMAIL-001",
                status: "Active",
                supplier: {
                    supplierID: "supp-004",
                    name: "Supplier Q",
                    contactEmail: "not-an-email"
                }
            };

            const response = await request(app)
                .post('/api/assets')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidEmailAsset)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toMatch(/not a valid email address/i);
        });
    });


    describe('GET /api/assets', () => {
        let validAssetType;

        beforeEach(async () => {
            validAssetType = await AssetType.create({ name: 'Peripheral' });
        });

        afterEach(async () => {
            await Asset.deleteMany({});
            await AssetType.deleteMany({});
        });

        it('should return all assets', async () => {
            const assetData = {
                name: "Test Asset GET",
                assetType: {
                    assetTypeID: validAssetType._id.toString(),
                    name: validAssetType.name
                },
                location: { locationID: "get-loc-001", name: "Test Location" },
                serialNumber: "GET-TEST-001",
                status: "Active",
                supplier: {
                    supplierID: "get-supp-001",
                    name: "Get Supplier",
                    contactEmail: "get@supplier.com"
                }
            };

            await request(app)
                .post('/api/assets')
                .set('Authorization', `Bearer ${authToken}`)
                .send(assetData)
                .expect(201);

            const response = await request(app)
                .get('/api/assets')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(0);

            const found = response.body.data.find(a => a.serialNumber === "GET-TEST-001");
            expect(found).toBeDefined();
            expect(found.name).toBe("Test Asset GET");
        });

        it('should return an empty array if no assets exist', async () => {
            await Asset.deleteMany({});
            const response = await request(app)
                .get('/api/assets')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBe(0);
        });

        it('should handle database errors gracefully', async () => {
            const originalFind = Asset.find;
            Asset.find = () => {
                throw new Error('DB error');
            };

            const response = await request(app)
                .get('/api/assets')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toMatch(/failed to retrieve assets/i);

            Asset.find = originalFind;
        });
    });

    describe('GET /api/assets/:assetId', () => {
        let assetId;
        let validAssetType;

        beforeEach(async () => {
            // Create a valid AssetType
            validAssetType = await AssetType.create({ name: 'Peripheral' });

            // Create an asset using that type
            const asset = new Asset({
                name: "Asset To Fetch",
                assetType: {
                    assetTypeID: validAssetType._id.toString(),
                    name: validAssetType.name
                },
                location: { locationID: "get-loc-001", name: "Location A" },
                serialNumber: "GET-ID-001",
                status: "Active",
                supplier: {
                    supplierID: "get-supp-001",
                    name: "Supplier A",
                    contactEmail: "getid@supplier.com"
                }
            });

            const saved = await asset.save();
            assetId = saved._id;
        });

        afterEach(async () => {
            await Asset.deleteMany({});
            await AssetType.deleteMany({});
        });

        it('should return a single asset by ID', async () => {
            const response = await request(app)
                .get(`/api/assets/${assetId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toMatch(/retrieved/i);
            expect(response.body.data).toHaveProperty('_id', assetId.toString());
        });

        it('should return 404 if asset is not found', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const response = await request(app)
                .get(`/api/assets/${nonExistentId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toMatch(/not found/i);
        });

        it('should handle database errors gracefully', async () => {
            const original = Asset.findById;
            Asset.findById = () => {
                throw new Error('GET BY ID DB error');
            };

            const response = await request(app)
                .get(`/api/assets/${assetId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toMatch(/failed to retrieve asset/i);

            // Restore original method
            Asset.findById = original;
        });
    });

    describe('PATCH /api/assets/:assetId', () => {
        let assetId;
        let validAssetType;

        beforeEach(async () => {
            // Create valid AssetType
            validAssetType = await AssetType.create({ name: "Peripheral" });

            // Create an asset using that type
            const asset = new Asset({
                name: "Asset To Update",
                assetType: {
                    assetTypeID: validAssetType._id.toString(),
                    name: validAssetType.name
                },
                location: {
                    locationID: "put-loc-001",
                    name: "Update Location"
                },
                serialNumber: "PUT-TEST-001",
                status: "Active",
                supplier: {
                    supplierID: "put-supp-001",
                    name: "Put Supplier",
                    contactEmail: "put@supplier.com"
                }
            });
            const saved = await asset.save();
            assetId = saved._id;
        });

        afterEach(async () => {
            await Asset.deleteMany({});
            await AssetType.deleteMany({});
        });

        it('should update an existing asset', async () => {
            const update = { name: "Updated Asset Name" };
            const response = await request(app)
                .patch(`/api/assets/${assetId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(update)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe("Updated Asset Name");
        });

        it('should return 404 if asset not found', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const response = await request(app)
                .patch(`/api/assets/${nonExistentId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ name: "Doesn't Matter" })
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toMatch(/not found/i);
        });

        it('should handle errors gracefully', async () => {
            // Temporarily mock findByIdAndUpdate to throw
            const original = Asset.findByIdAndUpdate;
            Asset.findByIdAndUpdate = () => {
                throw new Error('PATCH DB error');
            };

            const response = await request(app)
                .patch(`/api/assets/${assetId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ name: "Error Asset" })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toMatch(/failed to update asset/i);

            // Restore original
            Asset.findByIdAndUpdate = original;
        });
    });

    describe('DELETE /api/assets/:assetId', () => {
        let assetId;
        let validAssetType;

        beforeEach(async () => {
            // Create a valid asset type
            validAssetType = await AssetType.create({ name: "Peripheral" });

            // Create an asset to delete using that type
            const asset = new Asset({
                name: "Asset To Delete",
                assetType: {
                    assetTypeID: validAssetType._id.toString(),
                    name: validAssetType.name
                },
                location: {
                    locationID: "del-loc-001",
                    name: "Delete Location"
                },
                serialNumber: "DEL-TEST-001",
                status: "Active",
                supplier: {
                    supplierID: "del-supp-001",
                    name: "Del Supplier",
                    contactEmail: "del@supplier.com"
                }
            });

            const saved = await asset.save();
            assetId = saved._id;
        });

        afterEach(async () => {
            await Asset.deleteMany({});
            await AssetType.deleteMany({});
        });

        it('should delete an existing asset', async () => {
            const response = await request(app)
                .delete(`/api/assets/${assetId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data._id).toBe(assetId.toString());
        });

        it('should return 404 if asset not found', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const response = await request(app)
                .delete(`/api/assets/${nonExistentId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toMatch(/not found/i);
        });

        it('should handle errors gracefully', async () => {
            const original = Asset.findByIdAndDelete;
            Asset.findByIdAndDelete = () => {
                throw new Error('DELETE DB error');
            };

            const response = await request(app)
                .delete(`/api/assets/${assetId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toMatch(/failed to delete asset/i);

            // Restore the original method
            Asset.findByIdAndDelete = original;
        });
    });

});