import request from 'supertest';
import mongoose from '../../../server/dbConnect.js';
import app from '../../../server/index.js';
import { SupplierSchema } from '../../../server/models/supplierModel.js';
import { AssetSchema } from '../../../server/models/assetModel.js';
import {UserSchema} from "../../../server/models/userModel.js";
import {AssetTypeSchema} from "../../../server/models/assetType.js";

describe('Supplier Controller', () => {

    const Asset = mongoose.model('Assets', AssetSchema);
    const User = mongoose.model('Users', UserSchema)
    const Supplier = mongoose.model('Supplier', SupplierSchema);
    const AssetType = mongoose.model('AssetTypes', AssetTypeSchema);


    let adminToken;

    beforeAll(async () => {
        // Create an admin user and get auth token
        const admin = {
            firstName: 'Test',
            lastName: 'Admin',
            email: 'admin@suppliertest.com',
            password: 'AdminPass123!',
            role: 'Admin'
        };

        await request(app).post('/api/auth/register').send(admin).expect(201);

        const loginRes = await request(app).post('/api/auth/login').send({
            email: admin.email,
            password: admin.password
        });

        adminToken = loginRes.body.data.token;
    });

    afterAll(async () => {
        // Clean up test data and close DB connection
        await Asset.deleteMany({});
        await User.deleteMany({});
        await Supplier.deleteMany({});


        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
    });

    describe('GET /api/suppliers', () => {
        let authToken;

        beforeAll(async () => {
            const user = {
                firstName: 'Supplier',
                lastName: 'Lister',
                email: 'listsuppliers@example.com',
                password: 'ListPass123!'
            };

            await request(app).post('/api/auth/register').send(user).expect(201);
            const loginRes = await request(app).post('/api/auth/login').send({
                email: user.email,
                password: user.password
            });

            authToken = loginRes.body.data.token;

            // Add one supplier to make sure list is not empty
            await request(app)
                .post('/api/suppliers')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'List Supplier',
                    contactEmail: 'list@supplier.com'
                })
                .expect(201);
        });

        it('should return all suppliers', async () => {
            const res = await request(app)
                .get('/api/suppliers')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBeGreaterThan(0);
        });

        it('should handle errors and return 400 if DB query fails', async () => {
            const originalFind = Supplier.find;
            Supplier.find = () => {
                throw new Error('Mock DB error');
            };

            const res = await request(app)
                .get('/api/suppliers')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(400);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/failed to retrieve suppliers/i);

            Supplier.find = originalFind; // restore original
        });
    });


    describe('POST /api/suppliers', () => {
        let authToken;

        beforeAll(async () => {
            const user = {
                firstName: 'Supplier',
                lastName: 'User',
                email: 'supplieruser@example.com',
                password: 'Supplier123!'
            };

            await request(app).post('/api/auth/register').send(user).expect(201);
            const loginRes = await request(app).post('/api/auth/login').send({
                email: user.email,
                password: user.password
            });

            authToken = loginRes.body.data.token;
        });

        it('should create a new supplier with valid data', async () => {
            const newSupplier = {
                name: 'Universal Parts Co.',
                contactEmail: 'contact@universalparts.com',
                phone: '+1-555-0001',
                website: 'https://universalparts.com'
            };

            const res = await request(app)
                .post('/api/suppliers')
                .set('Authorization', `Bearer ${authToken}`)
                .send(newSupplier)
                .expect(201);

            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('name', 'Universal Parts Co.');
            expect(res.body.data).toHaveProperty('contactEmail', 'contact@universalparts.com');
        });

        it('should return 400 if required fields are missing', async () => {
            const res = await request(app)
                .post('/api/suppliers')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ contactEmail: 'missing@fields.com' }) // missing name
                .expect(400);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/failed to create/i);
        });

        it('should return 400 for invalid email format', async () => {
            const res = await request(app)
                .post('/api/suppliers')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Invalid Email Supplier',
                    contactEmail: 'invalid-email',
                    phone: '+1-555-2222'
                })
                .expect(400);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/not a valid email address/i);
        });

        it('should return 401 if user is not authenticated', async () => {
            const res = await request(app)
                .post('/api/suppliers')
                .send({
                    name: 'No Token Supplier',
                    contactEmail: 'noauth@supplier.com'
                })
                .expect(401);

            expect(res.body).toHaveProperty('message', 'Unauthorized');
        });

    });

    describe('GET /api/suppliers/:supplierId', () => {
        let authToken;
        let supplierId;

        beforeAll(async () => {
            const user = {
                firstName: 'Get',
                lastName: 'Supplier',
                email: 'getsupplier@example.com',
                password: 'Get123!test'
            };

            await request(app).post('/api/auth/register').send(user).expect(201);
            const loginRes = await request(app).post('/api/auth/login').send({
                email: user.email,
                password: user.password
            });

            authToken = loginRes.body.data.token;

            const supplierRes = await request(app)
                .post('/api/suppliers')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Test Supplier Co.',
                    contactEmail: 'test@getcompany.com',
                    phone: '+1-555-1212',
                    website: 'https://getcompany.com'
                })
                .expect(201);

            supplierId = supplierRes.body.data._id;
        });

        it('should return the supplier by ID', async () => {
            const res = await request(app)
                .get(`/api/suppliers/${supplierId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('_id', supplierId);
            expect(res.body.data).toHaveProperty('name', 'Test Supplier Co.');
        });

        it('should return 404 if supplier is not found', async () => {
            const fakeId = new mongoose.Types.ObjectId();

            const res = await request(app)
                .get(`/api/suppliers/${fakeId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/not found/i);
        });

        it('should return 400 for invalid supplier ID format', async () => {
            const res = await request(app)
                .get('/api/suppliers/invalid-id-format')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(400);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/failed to retrieve supplier/i);
        });

        it('should return 401 if not authenticated', async () => {
            const res = await request(app)
                .get(`/api/suppliers/${supplierId}`)
                .expect(401);

            expect(res.body).toHaveProperty('message', 'Unauthorized');
        });
    });

    describe('PATCH /api/suppliers/:supplierId', () => {
        let authToken;
        let supplierId;
        let validAssetType;

        beforeAll(async () => {
            const user = {
                firstName: 'Patch',
                lastName: 'User',
                email: 'patchuser@supplier.com',
                password: 'PatchPass123!'
            };

            await request(app).post('/api/auth/register').send(user).expect(201);
            const loginRes = await request(app).post('/api/auth/login').send({
                email: user.email,
                password: user.password
            });

            authToken = loginRes.body.data.token;

            // Create a supplier to update
            const createRes = await request(app)
                .post('/api/suppliers')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Original Supplier',
                    contactEmail: 'original@supplier.com'
                })
                .expect(201);

            validAssetType = await AssetType.create({ name: 'Peripheral' });

            supplierId = createRes.body.data._id;
        });

        it('should update a supplier with valid data', async () => {
            const res = await request(app)
                .patch(`/api/suppliers/${supplierId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ name: 'Updated Supplier Name' })
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('name', 'Updated Supplier Name');
        });

        it('should update embedded supplier in assets when supplier is patched', async () => {
            // Create supplier
            const supplierRes = await request(app)
                .post('/api/suppliers')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Original Supplier',
                    contactEmail: 'original@supplier.com'
                })
                .expect(201);
            const supplierId = supplierRes.body.data._id;

            // Create asset with embedded supplier
            const assetRes = await request(app)
                .post('/api/assets')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: "Test Asset",
                        assetType: {
                            assetTypeID: validAssetType._id.toString(),
                            name: "Peripheral"
                        },
                    location: { locationID: "loc-001", name: "Main Office" },
                    serialNumber: "TEST-EMBED-001",
                    status: "Active",
                    supplier: {
                        supplierID: supplierId,
                        name: "Original Supplier",
                        contactEmail: "original@supplier.com"
                    }
                })
                .expect(201);

            // Patch supplier
            const updatedEmail = 'updated@supplier.com';
            await request(app)
                .patch(`/api/suppliers/${supplierId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ contactEmail: updatedEmail })
                .expect(200);

            // Fetch updated asset
            const updatedAssetRes = await request(app)
                .get(`/api/assets/${assetRes.body.data._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(updatedAssetRes.body.data.supplier.contactEmail).toBe(updatedEmail);
        });


        it('should return 400 for invalid email format', async () => {
            const res = await request(app)
                .patch(`/api/suppliers/${supplierId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ contactEmail: 'bad-email' })
                .expect(400);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/not a valid email address/i);
        });

        it('should return 404 if supplier not found', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .patch(`/api/suppliers/${nonExistentId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ name: 'Ghost Supplier' })
                .expect(404);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/not found/i);
        });

        it('should return 400 for invalid supplier ID format', async () => {
            const res = await request(app)
                .patch('/api/suppliers/invalid-id')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ name: 'Should Fail' })
                .expect(400);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/failed to update supplier/i);
        });

        it('should return 401 if user is not authenticated', async () => {
            const res = await request(app)
                .patch(`/api/suppliers/${supplierId}`)
                .send({ name: 'NoAuth Update' })
                .expect(401);

            expect(res.body).toHaveProperty('message', 'Unauthorized');
        });
    });

    describe('DELETE /api/suppliers/:supplierId', () => {
        let authToken;
        let supplierId;
        let validAssetType;

        beforeAll(async () => {
            const user = {
                firstName: 'Delete',
                lastName: 'User',
                email: 'delete@supplier.com',
                password: 'DeleteMe123!'
            };

            await request(app).post('/api/auth/register').send(user).expect(201);
            const loginRes = await request(app).post('/api/auth/login').send({
                email: user.email,
                password: user.password
            });

            authToken = loginRes.body.data.token;

            // Create supplier to delete
            const createRes = await request(app)
                .post('/api/suppliers')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Disposable Supplier',
                    contactEmail: 'disposable@supplier.com'
                })
                .expect(201);
            validAssetType = await AssetType.create({ name: 'Peripheral' });
            supplierId = createRes.body.data._id;
        });

        it('should delete a supplier by ID', async () => {
            const res = await request(app)
                .delete(`/api/suppliers/${supplierId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('_id', supplierId);
        });

        it('should return 404 if supplier not found', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();

            const res = await request(app)
                .delete(`/api/suppliers/${nonExistentId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/not found/i);
        });

        it('should return 400 for invalid ID format', async () => {
            const res = await request(app)
                .delete('/api/suppliers/invalid-id')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(400);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/failed to delete supplier/i);
        });

        it('should return 401 if user is not authenticated', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .delete(`/api/suppliers/${fakeId}`)
                .expect(401);

            expect(res.body).toHaveProperty('message', 'Unauthorized');
        });

        it('should unset supplier in assets after deletion', async () => {
            // Step 1: Create a supplier
            const supplierRes = await request(app)
                .post('/api/suppliers')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Embedded Supplier',
                    contactEmail: 'embedded@supplier.com'
                })
                .expect(201);

            const supplierId = supplierRes.body.data._id;

            // Step 2: Create an asset that embeds this supplier
            const assetPayload = {
                name: "Asset With Embedded Supplier",
                assetType: {
                    assetTypeID: validAssetType._id.toString(),
                    name: "Peripheral"
                },
                location: { locationID: "sup-loc-001", name: "Support Room" },
                serialNumber: "SUP-TEST-001",
                status: "Active",
                supplier: {
                    supplierID: supplierId,
                    name: "Embedded Supplier",
                    contactEmail: "embedded@supplier.com"
                }
            };

            const assetRes = await request(app)
                .post('/api/assets')
                .set('Authorization', `Bearer ${authToken}`)
                .send(assetPayload)
                .expect(201);

            const assetId = assetRes.body.data._id;

            // Step 3: Delete the supplier
            await request(app)
                .delete(`/api/suppliers/${supplierId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            // Step 4: Fetch the asset again
            const updatedAssetRes = await request(app)
                .get(`/api/assets/${assetId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            // Step 5: Confirm that the supplier is now null or empty
            expect(updatedAssetRes.body.data).toHaveProperty('supplier');
            const supplierField = updatedAssetRes.body.data.supplier;
            expect(supplierField).toEqual(null); // Or use {} if you set it to an empty object
        });

    });


});