import request from 'supertest';
import app from '../../../server/index.js';
import mongoose from '../../../server/dbConnect.js'
import {AssetSchema} from '../../../server/models/assetModel.js';

describe('Asset Controller', () => {
    const Asset = mongoose.model('Assets', AssetSchema);
    afterAll(async () => {
        try {
            await Asset.deleteMany({});
            if (mongoose.connection.readyState !== 0) {
                await mongoose.disconnect();
            }
        } catch (err) {
            console.error('Error during afterAll cleanup:', err);
        }
    });

    describe('POST /assets', () => {

        it('should save a new asset', async () => {
            const newAsset = {
                Name: "Logitech Mouse M330",
                AssetType: {
                    AssetTypeID: "mouse-001",
                    Name: "Peripheral"
                },
                Location: {
                    LocationID: "desk-007",
                    Name: "IT Room"
                },
                SerialNumber: "LOGI-M330-2024-03",
                Status: "Active",
                Supplier: {
                    SupplierID: "logi-001",
                    Name: "Logitech",
                    ContactEmail: "support@logitech.com",
                    Phone: "+1-800-555-1234",
                    Website: "https://www.logitech.com"
                }
            };

            const response = await request(app)
                .post('/assets')
                .send(newAsset)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toMatch(/created/i);
            expect(response.body.data).toHaveProperty('SerialNumber', "LOGI-M330-2024-03");
        });

        it('should return 400 if required field is missing (e.g., Name)', async () => {
            const assetWithoutName = {
                AssetType: { AssetTypeID: "001", Name: "Peripheral" },
                Location: { LocationID: "loc-001", Name: "Office" },
                SerialNumber: "SERIAL-001",
                Status: "Active",
                Supplier: {
                    SupplierID: "supp-001",
                    Name: "Test Supplier",
                    ContactEmail: "email@example.com"
                }
            };

            const response = await request(app)
                .post('/assets')
                .send(assetWithoutName)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toMatch(/failed to create/i);
        });

        it('should return 400 for invalid status value', async () => {
            const invalidStatusAsset = {
                Name: "Asset with bad status",
                AssetType: { AssetTypeID: "002", Name: "Invalid" },
                Location: { LocationID: "loc-002", Name: "HQ" },
                SerialNumber: "INVALID-STATUS-001",
                Status: "Broken",
                Supplier: {
                    SupplierID: "supp-002",
                    Name: "Supplier X",
                    ContactEmail: "x@supplier.com"
                }
            };

            const response = await request(app)
                .post('/assets')
                .send(invalidStatusAsset)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toMatch(/failed to create/i);
        });

        it('should return 400 for duplicate SerialNumber', async () => {
            const duplicateAsset = {
                Name: "Duplicate Serial",
                AssetType: { AssetTypeID: "003", Name: "Peripheral" },
                Location: { LocationID: "loc-003", Name: "Warehouse" },
                SerialNumber: "DUPLICATE-123",
                Status: "Active",
                Supplier: {
                    SupplierID: "supp-003",
                    Name: "Supplier Z",
                    ContactEmail: "z@supplier.com"
                }
            };

            await request(app).post('/assets').send(duplicateAsset).expect(201);
            const response = await request(app).post('/assets').send(duplicateAsset).expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toMatch(/duplicate/i);
        });

        it('should return 400 for invalid email in supplier', async () => {
            const invalidEmailAsset = {
                Name: "Bad Email Asset",
                AssetType: { AssetTypeID: "004", Name: "Peripheral" },
                Location: { LocationID: "loc-004", Name: "Support" },
                SerialNumber: "BAD-EMAIL-001",
                Status: "Active",
                Supplier: {
                    SupplierID: "supp-004",
                    Name: "Supplier Q",
                    ContactEmail: "not-an-email"
                }
            };

            const response = await request(app)
                .post('/assets')
                .send(invalidEmailAsset)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toMatch(/not a valid email address/i);
        });

    });

    describe('GET /assets', () => {
        it('should return all assets', async () => {
            // Insert a test asset
            const assetData = {
                Name: "Test Asset GET",
                AssetType: { AssetTypeID: "get-001", Name: "Peripheral" },
                Location: { LocationID: "get-loc-001", Name: "Test Location" },
                SerialNumber: "GET-TEST-001",
                Status: "Active",
                Supplier: {
                    SupplierID: "get-supp-001",
                    Name: "Get Supplier",
                    ContactEmail: "get@supplier.com"
                }
            };
            await request(app).post('/assets').send(assetData).expect(201);

            const response = await request(app)
                .get('/assets')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            // At least one asset should be present
            expect(response.body.data.length).toBeGreaterThan(0);
            // The asset we just added should be in the response
            const found = response.body.data.find(a => a.SerialNumber === "GET-TEST-001");
            expect(found).toBeDefined();
            expect(found.Name).toBe("Test Asset GET");
        });

        it('should return an empty array if no assets exist', async () => {
            // Remove all assets
            await Asset.deleteMany({});
            const response = await request(app)
                .get('/assets')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBe(0);
        });

        it('should handle database errors gracefully', async () => {
            // Temporarily mock Asset.find to throw
            const originalFind = Asset.find;
            Asset.find = () => { throw new Error('DB error'); };

            const response = await request(app)
                .get('/assets')
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toMatch(/failed to retrieve assets/i);

            // Restore original method
            Asset.find = originalFind;
        });
    });

    describe('GET /assets/:assetId', () => {
        let assetId;

        beforeEach(async () => {
            const asset = new Asset({
                Name: "Asset To Fetch",
                AssetType: { AssetTypeID: "get-id-001", Name: "Peripheral" },
                Location: { LocationID: "get-loc-001", Name: "Location A" },
                SerialNumber: "GET-ID-001",
                Status: "Active",
                Supplier: {
                    SupplierID: "get-supp-001",
                    Name: "Supplier A",
                    ContactEmail: "getid@supplier.com"
                }
            });
            const saved = await asset.save();
            assetId = saved._id;
        });

        afterEach(async () => {
            await Asset.deleteMany({});
        });

        it('should return a single asset by ID', async () => {
            const response = await request(app)
                .get(`/assets/${assetId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toMatch(/retrieved/i);
            expect(response.body.data).toHaveProperty('_id', assetId.toString());
        });

        it('should return 404 if asset is not found', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const response = await request(app)
                .get(`/assets/${nonExistentId}`)
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toMatch(/not found/i);
        });

        it('should handle database errors gracefully', async () => {
            const original = Asset.findById;
            Asset.findById = () => { throw new Error('GET BY ID DB error'); };

            const response = await request(app)
                .get(`/assets/${assetId}`)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toMatch(/failed to retrieve asset/i);

            Asset.findById = original;
        });
    });

    describe('PUT /assets/:assetId', () => {
        let assetId;

        beforeEach(async () => {
            // Create an asset to update
            const asset = new Asset({
                Name: "Asset To Update",
                AssetType: { AssetTypeID: "put-001", Name: "Peripheral" },
                Location: { LocationID: "put-loc-001", Name: "Update Location" },
                SerialNumber: "PUT-TEST-001",
                Status: "Active",
                Supplier: {
                    SupplierID: "put-supp-001",
                    Name: "Put Supplier",
                    ContactEmail: "put@supplier.com"
                }
            });
            const saved = await asset.save();
            assetId = saved._id;
        });

        afterEach(async () => {
            await Asset.deleteMany({});
        });

        it('should update an existing asset', async () => {
            const update = { Name: "Updated Asset Name" };
            const response = await request(app)
                .put(`/assets/${assetId}`)
                .send(update)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.Name).toBe("Updated Asset Name");
        });

        it('should return 404 if asset not found', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const response = await request(app)
                .put(`/assets/${nonExistentId}`)
                .send({ Name: "Doesn't Matter" })
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toMatch(/not found/i);
        });

        it('should handle errors gracefully', async () => {
            // Temporarily mock findByIdAndUpdate to throw
            const original = Asset.findByIdAndUpdate;
            Asset.findByIdAndUpdate = () => { throw new Error('PUT DB error'); };

            const response = await request(app)
                .put(`/assets/${assetId}`)
                .send({ Name: "Error Asset" })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toMatch(/failed to update asset/i);

            Asset.findByIdAndUpdate = original;
        });
    });

    describe('DELETE /assets/:assetId', () => {
        let assetId;

        beforeEach(async () => {
            // Create an asset to delete
            const asset = new Asset({
                Name: "Asset To Delete",
                AssetType: { AssetTypeID: "del-001", Name: "Peripheral" },
                Location: { LocationID: "del-loc-001", Name: "Delete Location" },
                SerialNumber: "DEL-TEST-001",
                Status: "Active",
                Supplier: {
                    SupplierID: "del-supp-001",
                    Name: "Del Supplier",
                    ContactEmail: "del@supplier.com"
                }
            });
            const saved = await asset.save();
            assetId = saved._id;
        });

        afterEach(async () => {
            await Asset.deleteMany({});
        });

        it('should delete an existing asset', async () => {
            const response = await request(app)
                .delete(`/assets/${assetId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data._id).toBe(assetId.toString());
        });

        it('should return 404 if asset not found', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const response = await request(app)
                .delete(`/assets/${nonExistentId}`)
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toMatch(/not found/i);
        });

        it('should handle errors gracefully', async () => {
            // Temporarily mock findByIdAndDelete to throw
            const original = Asset.findByIdAndDelete;
            Asset.findByIdAndDelete = () => { throw new Error('DELETE DB error'); };

            const response = await request(app)
                .delete(`/assets/${assetId}`)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toMatch(/failed to delete asset/i);

            Asset.findByIdAndDelete = original;
        });
    });
});
