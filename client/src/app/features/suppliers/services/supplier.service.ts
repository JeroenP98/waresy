import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {map, Observable} from 'rxjs';
import { Supplier } from '../../../shared/models/supplier';
import {SupplierApiResponse} from '../../../shared/models/supplier-api-response';
import {CreateSupplierDto} from '../../../shared/models/create-supplier-dto';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;



  getSuppliers(): Observable<Supplier[]> {
    return this.http
      .get<SupplierApiResponse>(`${this.apiUrl}/suppliers`)
      .pipe(map(response => response.data));
  }

  postSupplier(supplier: CreateSupplierDto): Observable<Supplier> {
    return this.http.post<{ success: boolean; message: string; data: Supplier }>(
      `${this.apiUrl}/suppliers`,
      supplier
    ).pipe(
      map(response => response.data)
    );
  }

  deleteSupplier(_id: string): Observable<Supplier> {
    return this.http
      .delete<{ success: boolean; message: string; data: Supplier }>(`${this.apiUrl}/suppliers/${_id}`)
      .pipe(map(res => res.data));
  }
}
