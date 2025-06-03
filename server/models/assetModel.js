import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export const AssetSchema = new Schema({
    Name: {
        type: String,
        required: 'Enter a name for the asset'
    },
    AssetType: {
        AssetTypeID: {
            type: String,
            required: 'Enter an asset type ID'
        },
        Name: {
            type: String,
            required: 'Enter a type for the asset'
        }
    },
    Location: {
        LocationID: {
            type: String,
            required: 'Enter a location ID'
        },
        Name: {
            type: String,
            required: 'Enter a location name for the asset'
        }
    },
    SerialNumber: {
        type: String,
        required: 'Enter a serial number for the asset',
        unique: true
    },
    Status: {
        type: String,
        required: 'Enter a status for the asset',
        enum: ['Active', 'Inactive', 'Maintenance', 'Retired'],
        default: 'Active'
    },
    Supplier: {
        SupplierID: {
            type: String,
            required: 'Enter a supplier ID'
        },
        Name: {
            type: String,
            required: 'Enter a name for the supplier'
        },
        ContactEmail: {
            type: String,
            required: 'Enter a contact email for the asset'
        },
        Phone: {
            type: String
        },
        Website: {
            type: String
        }
    }
}, {
    timestamps: true
});

AssetSchema.index({ SerialNumber: 1 });

