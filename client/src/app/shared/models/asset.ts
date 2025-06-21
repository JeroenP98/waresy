import {AssetType} from './asset-type';
import {Supplier} from './supplier';

export interface Asset {
  _id: string,
  name: string,
  serialNumber: string,
  status: string,
  assetType: {
    assetTypeID: string,
    name: string,
  },
  location: {
    locationID: string,
    name: string,
  }
  supplier: {
    supplierID: string,
    name: string,
    contactEmail: string,
    phone: string,
    website: string,
  }
  createdAt: Date,
  updatedAt: Date,
}
