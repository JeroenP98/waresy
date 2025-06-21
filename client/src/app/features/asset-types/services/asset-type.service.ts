import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {AssetType} from '../../../shared/models/asset-types/asset-type';
import {map, Observable} from 'rxjs';
import {AssetTypeApiResponse} from '../../../shared/models/asset-types/asset-type-api-response';
import {CreateAssetTypeDto} from '../../../shared/models/asset-types/create-asset-type-dto';
import {Supplier} from '../../../shared/models/suppliers/supplier';

@Injectable({
  providedIn: 'root'
})
export class AssetTypeService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getAssetTypes(): Observable<AssetType[]> {
    return this.http
      .get<AssetTypeApiResponse>(`${this.apiUrl}/asset-types`)
      .pipe(map(response => response.data));
  }

  postAssetType(assetType: CreateAssetTypeDto): Observable<AssetType> {
    return this.http.post<{ success: boolean; message: string; data: AssetType }>(
      `${this.apiUrl}/asset-types`,
      assetType
    ).pipe(
      map(response => response.data)
    )
  }

  deleteAssetType(_id: string): Observable<AssetType> {
    return this.http
      .delete<{ success: boolean; message: string; data: AssetType }>(`${this.apiUrl}/asset-types/${_id}`)
      .pipe(map(res => res.data));
  }
}
