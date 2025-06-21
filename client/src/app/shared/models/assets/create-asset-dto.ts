import {AssetType} from '../asset-types/asset-type';
import {Supplier} from '../suppliers/supplier';

export interface CreateAssetDto {
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
}
