export interface CreateMaintenanceTaskDto {
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
  assets: {
    assetID: string;
    assetName: string;
    assetType: {
      assetTypeID: string;
      name: string;
    };
  }[]
}
