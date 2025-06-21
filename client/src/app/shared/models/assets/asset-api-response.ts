import {Asset} from './asset';

export interface AssetApiResponse {
  success: boolean;
  message: string;
  data: Asset[];
}
