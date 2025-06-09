import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { UserSchema } from '../models/userModel.js';
import { AssetSchema } from '../models/assetModel.js';
import { SupplierSchema } from '../models/supplierModel.js';
import bcrypt from "bcrypt";
import {AssetTypeSchema} from "../models/assetType.js";

dotenv.config();

const User = mongoose.model('Users', UserSchema);
const Asset = mongoose.model('Assets', AssetSchema);
const Supplier = mongoose.model('Supplier', SupplierSchema);
const AssetType = mongoose.model('AssetType', AssetTypeSchema);

const seedBaseTables = async () => {
    try {

        await mongoose.connect("mongodb://127.0.0.1:27017/waresy");
        console.log('Connected to database');

        // Clear collections
        await User.deleteMany();
        await Asset.deleteMany();
        await Supplier.deleteMany();

        // Add users
        const users = await User.insertMany([
            {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                hashPassword: bcrypt.hashSync('12345', 10),
                role: 'Admin'
            },
            {
                firstName: 'Alice',
                lastName: 'Smith',
                email: 'alice.smith@example.com',
                hashPassword: bcrypt.hashSync('12345', 10),
                role: 'User'
            },
            {
                firstName: 'Bob',
                lastName: 'Johnson',
                email: 'bob.johnson@example.com',
                hashPassword: bcrypt.hashSync('12345', 10),
                role: 'User'
            },
            {
                firstName: 'Eve',
                lastName: 'Taylor',
                email: 'eve.taylor@example.com',
                hashPassword: bcrypt.hashSync('12345', 10),
                role: 'User'
            }
        ]);

        // Add suppliers
        const suppliers = await Supplier.insertMany([
            {
                name: 'Acme Corp',
                contactEmail: 'support@acme.com',
                phone: '1234567890',
                website: 'https://acme.com'
            },
            {
                name: 'Globex Industries',
                contactEmail: 'contact@globex.com',
                phone: '+1-800-555-4567',
                website: 'https://globex.com'
            },
            {
                name: 'Initech Solutions',
                contactEmail: 'service@initech.io',
                phone: '+44 20 7946 0958',
                website: 'https://initech.io'
            },
            {
                name: 'Stark Technologies',
                contactEmail: 'helpdesk@starktech.com',
                phone: '+1-888-947-8675',
                website: 'https://starktech.com'
            },
            {
                name: 'Wayne Enterprises',
                contactEmail: 'support@wayneenterprises.com',
                phone: '+1-212-555-6789',
                website: 'https://wayneenterprises.com'
            }
        ]);

        const assetTypes = await AssetType.insertMany([
            {
                name: 'Forklift'
            },
            {
                name: 'Pallet Jack'
            },
            {
                name: 'Conveyor Belt'
            },
            {
                name: 'Warehouse Scanner'
            },
            {
                name: 'Storage Rack'
            }
        ]);

        console.log('Database seeded successfully');

        await createAssets();

        process.exit();
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

const createAssets = async () => {
    const assetTypes = await AssetType.find({});
    const suppliers = await Supplier.find({});

    if (!assetTypes.length || !suppliers.length) {
        console.log('⚠️ Asset types or suppliers not found. Please seed them first.');
        return;
    }

    const assets = assetTypes.flatMap((type, typeIndex) => {
        const assetNameMap = {
            'Forklift': 'Toyota Electric Forklift 8FBE20',
            'Pallet Jack': 'Crown PTH 50',
            'Conveyor Belt': 'Interroll Roller Conveyor',
            'Warehouse Scanner': 'Zebra MC3300 Handheld',
            'Storage Rack': 'Steel Shelving Unit 2000x1000'
        };

        return Array.from({ length: 5 }, (_, i) => {
            const randomSupplier = suppliers[Math.floor(Math.random() * suppliers.length)];
            const serialBase = type.name.toUpperCase().replace(/\s/g, '-').slice(0, 10);

            return {
                name: `${assetNameMap[type.name] || `${type.name} Unit`} #${i + 1}`,
                assetType: {
                    assetTypeID: type._id.toString(),
                    name: type.name
                },
                location: {
                    locationID: `loc-${typeIndex + 1}-${i + 1}`,
                    name: `Zone ${String.fromCharCode(65 + typeIndex)}-${i + 1}`
                },
                serialNumber: `${serialBase}-${typeIndex + 1}${i + 1}`,
                status: 'Active',
                supplier: {
                    supplierID: randomSupplier._id.toString(),
                    name: randomSupplier.name,
                    contactEmail: randomSupplier.contactEmail,
                    phone: randomSupplier.phone,
                    website: randomSupplier.website
                }
            };
        });
    });

    await Asset.insertMany(assets);
    console.log(`✅ ${assets.length} warehouse assets seeded (${assetTypes.length} types x 5 each)`);
};


await seedBaseTables();