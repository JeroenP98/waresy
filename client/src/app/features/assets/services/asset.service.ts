import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {map, Observable} from 'rxjs';
import {Asset} from '../../../shared/models/asset';
import {AssetApiResponse} from '../../../shared/models/asset-api-response';
import {CreateAssetDto} from '../../../shared/models/create-asset-dto';

@Injectable({
  providedIn: 'root'
})
export class AssetService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getAssets(): Observable<Asset[]> {
    return this.http
      .get<AssetApiResponse>(`${this.apiUrl}/assets`)
      .pipe(map(response => response.data))
  }

  postAsset(asset: CreateAssetDto): Observable<Asset> {
    return this.http
      .post<{ success: boolean; message: string; data?: Asset }>(
        `${this.apiUrl}/assets`,
        asset
      )
      .pipe(
        map(response => {
          if (!response.success) {
            // throw a friendly error that you can show in the toast
            throw new Error(response.message || 'Asset creation failed.');
          }
          return response.data!;
        })
      );
  }



  deleteAsset(_id: string): Observable<Asset> {
    return this.http
      .delete<{ success: boolean; message: string; data: Asset }>(`${this.apiUrl}/assets/${_id}`)
      .pipe(map(res => res.data));
  }

  updateAssetStatus(assetId: string, status: string): Observable<{ message: string; asset: Asset }> {
    return this.http
      .patch<{ success: boolean; message: string; data: Asset }>(
        `${this.apiUrl}/assets/${assetId}`,
        { status }
      )
      .pipe(
        map(res => {
          if (!res.success) throw new Error(res.message);
          return { message: res.message, asset: res.data };
        })
      );
  }

}
