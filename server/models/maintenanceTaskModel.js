import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export const MaintenanceTaskSchema = new Schema({
    taskName: {
        type: String,
        unique: true
    },
    description: {
        type: String
    },
    status: {
        type: String,
        required: 'Enter a status for the maintenance task',
        enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    assignedTo: {
        userID: {
            type: String,
            required: 'Enter a user ID for the assigned user'
        },
        firstName: {
            type: String,
            required: 'Enter a first name for the assigned user'
        },
        lastName: {
            type: String,
            required: 'Enter a last name for the assigned user'
        },
        email: {
            type: String,
            required: 'Enter an email for the assigned user',
            validate: {
                validator: function(v) {
                    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
                },
                message: props => `${props.value} is not a valid email address`
            }
        }
    },
    contractor: {
        supplierID: {
            type: String,
            required: 'Enter a supplier ID for the maintenance task'
        },
        name: {
            type: String,
            required: 'Enter a name for the supplier'
        },
        contactEmail: {
            type: String,
            validate: {
                validator: function(v) {
                    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
                },
                message: props => `${props.value} is not a valid email address`
            }
        }
    },
    plannedDate: {
        type: Date,
        required: 'Enter a planned date for the maintenance task'
    },
    performedDate: {
        type: Date,
        validate: {
            validator: function(v) {
                return !v || (this.plannedDate && v >= this.plannedDate);
            },
            message: props => `Performed date ${props.value} must be after planned date`
        }
    },
    assets: [{
        assetID: {
            type: String,
            required: 'Enter an asset ID for the maintenance task'
        },
        assetName: {
            type: String,
            required: 'Enter an asset name for the maintenance task'
        },
        assetType: {
            assetTypeID: {
              type: String,
            required: 'Enter an asset type ID for the maintenance task'
            },
            name: {
                type: String,
                required: 'Enter an asset type name for the maintenance task'
            }
        }
    }],
    statusHistory: [{
        status: String,
        updatedAt: Date,
        updatedBy: {
            userID: {
                type: String,
                required: 'Enter a user ID for the status update'
            },
            fullName: {
                type: String,
                //required: 'Enter a full name for the status update'
            },
            email: {
                type: String,
                validate: {
                    validator: function(v) {
                        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
                    },
                    message: props => `${props.value} is not a valid email address`
                }
            }
        }
    }]
}, {
    timestamps: true,
})

// Auto-generate taskName like "T-001"
// Add status history on save
MaintenanceTaskSchema.pre('save', async function (next) {
    const Model = mongoose.model('MaintenanceTask', MaintenanceTaskSchema);

    if (!this.taskName) {
        const count = await Model.countDocuments();
        this.taskName = `T-${(count + 1).toString().padStart(3, '0')}`;
    }

    if (this.isNew) {
        this.statusHistory.push({
            status: this.status,
            updatedAt: new Date(),
            updatedBy: {
                userID: this.assignedTo?.userID || 'system',
                firstName: this.assignedTo?.firstName || 'System',
                lastName: this.assignedTo?.lastName || '',
            }
        });
    }

    next();
});
