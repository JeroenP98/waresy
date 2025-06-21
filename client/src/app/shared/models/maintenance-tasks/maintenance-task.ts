export interface MaintenanceTask {
  _id: string,
  taskName: string,
  description: string,
  status: string,
  assignedTo: {
    userID: string,
    firstName: string,
    lastName: string,
    email: string
  },
  contractor: {
    supplierID: string,
    name: string,
    contactEmail: string,
  }
  plannedDate: Date,
  performedDate: Date,
  assets: [{
    assetID: string,
    assetName: string
    assetType: {
      assetTypeID: string,
      name: string
    }
  }],
  statusHistory: [{
    status: string,
    updatedAt: Date,
    updatedBy: {
      userID: string,
      fullName: string,
      email: string
    }
  }]
}
