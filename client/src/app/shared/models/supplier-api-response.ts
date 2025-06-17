import {Supplier} from './supplier';

export interface SupplierApiResponse {
  success: boolean;
  message: string;
  data: Supplier[];
}
