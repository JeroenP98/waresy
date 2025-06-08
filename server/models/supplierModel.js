import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export const SupplierSchema = new Schema({
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
})