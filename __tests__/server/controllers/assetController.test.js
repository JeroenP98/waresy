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
});