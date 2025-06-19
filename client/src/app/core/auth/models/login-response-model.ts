export interface LoginResponseModel {
  success: boolean;
  message: string;
  data: {
    token: string;
  }
}
