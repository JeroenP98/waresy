import {AssetType} from './asset-type';

export interface AssetTypeApiResponse {
  success: boolean;
  message: string;
  data: AssetType[];
}
