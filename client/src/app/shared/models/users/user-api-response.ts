import {User} from './user';

export interface UserApiResponse {
  success: boolean;
  message: string;
  data: User[];
}
