import request from 'supertest';
import app from '../../../server/index.js';
import mongoose from '../../../server/dbConnect.js'

describe('Asset Controller', () => {
    afterAll(async () => {
        if (mongoose.connection.readyState !== 0) {
            mongoose.disconnect();
        }
    });

    describe('POST /assets', () => {
        it('it should save a new asset', async () => {
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

            expect(response.body).toMatchObject({
                Name: "Logitech Mouse M330",
                SerialNumber: "LOGI-M330-2024-03"
            });
        })
    })
})