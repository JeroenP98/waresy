import mongoose from 'mongoose';

const Schema = mongoose.Schema;

// Define the Asset schema
export const AssetSchema = new Schema({
    name: {
        type: String,
        required: 'Enter a name for the asset'
    },
    // embedded asset type information
    assetType: {
        assetTypeID: {
            type: String,
            required: 'Enter an asset type ID'
        },
        name: {
            type: String,
            required: 'Enter a type for the asset'
        }
    },
    // embedded location information
    location: {
        locationID: {
            type: String,
            required: 'Enter a location ID'
        },
        name: {
            type: String,
            required: 'Enter a location name for the asset'
        }
    },
    serialNumber: {
        type: String,
        required: 'Enter a serial number for the asset',
        unique: true
    },
    status: {
        type: String,
        required: 'Enter a status for the asset',
        enum: ['Active', 'Inactive', 'Maintenance', 'Retired'],
        default: 'Active'
    },
    // embedded supplier information
    supplier: {
        supplierID: {
            type: String,
            required: 'Enter a supplier ID'
        },
        name: {
            type: String,
            required: 'Enter a name for the supplier'
        },
        contactEmail: {
            type: String,
            required: 'Enter a contact email for the asset',
            validate: {
                validator: function(v) {
                    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
                },
                message: props => `${props.value} is not a valid email address`
            }
        },
        phone: {
            type: String
        },
        website: {
            type: String
        }
    }
}, {
    // Add created and updated timestamps
    timestamps: true
});

// Create an index on the serialNumber field for faster lookups and uniqueness
AssetSchema.index({ serialNumber: 1 });

